import { ValidRange } from './../__generated__/resolvers-types';
/* eslint-disable max-len */
import {
    MutationRefreshArgs, AuthResult, FlowerResult,
    MutationAddFlowerArgs, MutationLoginArgs, MutationRemoveFlowerArgs,
    MutationResolvers, MutationSignUpArgs, MutationUpdateFlowerArgs,
    SensorTypeEnum, StatusEnum, User
} from '../__generated__/resolvers-types';
import { Flower, Sensor, SensorData, User as UserModel } from '../providers';
import { Context, logger } from '../utils';
import { generateAccessToken, generateRefreshToken, refreshAccessToken } from '../utils/token';

const mutations: MutationResolvers = {
    addFlower: (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { input: { name, humidity, temperature } }: MutationAddFlowerArgs,
        { user, mqtt, pubsub }: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {
        const humiditySensor = new Sensor({
            user: user.id,
            type: SensorTypeEnum.Humidity,
            ...humidity
        });

        const temperatureSensor = new Sensor({
            user: user.id,
            type: SensorTypeEnum.Temperature,
            ...temperature
        });

        return Promise.all([
            humiditySensor.save(),
            temperatureSensor.save()
        ]).then(async ([humiditySensor, temperatureSensor]) => {
            const flower = await new Flower({
                user: user.id,
                name,
                humidity: humiditySensor._id,
                temperature: temperatureSensor._id
            }).save();

            for (const id of [humiditySensor._id.toString(), temperatureSensor._id.toString()]) {
                // Subscribe to MQTT topic to receive data from ESP32
                mqtt.subscribe(`DATA/${id}`, async (topic, message) => {
                    logger.info(`${topic} ${message.toString()}`);
                    const data: {
                        timestamp: number;
                        value: number;
                    } = JSON.parse(message.toString());

                    if (!('timestamp' in data) || !('value' in data)) {
                        logger.error(`Invalid topic ${topic} message: ${message.toString()}`);

                        return;
                    }

                    const sensorData = await SensorData.addData(id, data.timestamp, data.value);
                    pubsub.publish(`DATA/${id}`, sensorData);
                });
            }

            // Publish message new device to MQTT broker to notify ESP32
            mqtt.publish(`NEW_DEVICE/${user.id}`, Buffer.from(JSON.stringify({
                humidity: {
                    id: humiditySensor._id.toString(),
                    validRange: humiditySensor.validRange,
                    frequency: humiditySensor.frequency
                },
                temperature: {
                    id: temperatureSensor._id.toString(),
                    validRange: temperatureSensor.validRange,
                    frequency: temperatureSensor.frequency
                }
            })));

            return {
                status: StatusEnum.Ok,
                data: {
                    id: flower._id.toString(),
                    name,
                    humidity: {
                        id: humiditySensor._id.toString(),
                        type: SensorTypeEnum.Humidity,
                        ...humidity,
                        data: null
                    },
                    temperature: {
                        id: temperatureSensor._id.toString(),
                        type: SensorTypeEnum.Temperature,
                        ...temperature,
                        data: null
                    }
                }
            };
        }).catch(err => {
            logger.error(err.message);

            return {
                status: StatusEnum.Error,
                data: null
            };
        });
    },
    updateFlower: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id, input }: MutationUpdateFlowerArgs,
        { user, mqtt }: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {
        const mqttUpdate: Record<string, {
            validRange: ValidRange;
            frequency: number;
        }> = {};

        const flower = await Flower
            .findOne({
                _id: id, user: user.id
            })
            .populate('humidity')
            .populate('temperature');

        if (!flower) {
            throw Error(`Cannot find flower with id ${id}`);
        }

        const updates = [];

        if ('humidity' in input) {
            updates.push(
                Sensor.updateOne(
                    { _id: flower.humidity._id },
                    { $set: { ...input.humidity } }
                )
            );
            mqttUpdate.humidity = {
                ...input.humidity
            };
        }

        if ('temperature' in input) {
            updates.push(
                Sensor.updateOne(
                    { _id: flower.temperature._id },
                    { $set: { ...input.temperature } }
                )
            );
            mqttUpdate.temperature = {
                ...input.temperature
            };
        }

        if ('name' in input) {
            updates.push(
                Flower.updateOne(
                    { _id: id },
                    { $set: { name: input.name } }
                )
            );
        }

        return Promise.all(updates).then(() => {
            if (Object.keys(mqttUpdate).length > 0) {
                // Publish message update device to MQTT broker to notify ESP32
                mqtt.publish(`UPDATE_DEVICE/${user.id}`, Buffer.from(JSON.stringify(mqttUpdate)));
            }

            return ({
                status: StatusEnum.Ok,
                data: {
                    id,
                    name: input.name,
                    humidity: {
                        id: flower.humidity._id.toString(),
                        type: SensorTypeEnum.Humidity,
                        frequency: flower.humidity.frequency,
                        validRange: flower.humidity.validRange,
                        ...input?.humidity,
                        data: null
                    },
                    temperature: {
                        id: flower.temperature._id.toString(),
                        type: SensorTypeEnum.Temperature,
                        frequency: flower.temperature.frequency,
                        validRange: flower.temperature.validRange,
                        ...input?.temperature,
                        data: null
                    }
                }
            });
        }).catch(err => {
            logger.error(err.message);

            return {
                status: StatusEnum.Error,
                data: null
            };
        });
    },
    removeFlower: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id }: MutationRemoveFlowerArgs,
        { user, mqtt }: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {
        const flower = await Flower
            .findOne({
                _id: id, user: user.id
            })
            .populate('humidity')
            .populate('temperature');

        if (!flower) {
            throw Error(`Cannot find flower with id ${id}`);
        }

        return Flower.removeOne(id).then(() => {
            // Publish message remove device to MQTT broker to notify ESP32
            mqtt.publish(`REMOVE_DEVICE/${user.id}`, 'REMOVE_DEVICE');

            return ({
                status: StatusEnum.Ok,
                data: {
                    id,
                    name: flower.name,
                    humidity: {
                        id: flower.humidity._id.toString(),
                        type: SensorTypeEnum.Humidity,
                        frequency: flower.humidity.frequency,
                        validRange: flower.humidity.validRange,
                        data: null
                    },
                    temperature: {
                        id: flower.temperature._id.toString(),
                        type: SensorTypeEnum.Temperature,
                        frequency: flower.temperature.frequency,
                        validRange: flower.temperature.validRange,
                        data: null
                    }
                }
            });
        }).catch(err => {
            logger.error(err.message);

            return {
                status: StatusEnum.Error,
                data: null
            };
        });
    },
    login: (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { email, password }: MutationLoginArgs,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<AuthResult> => {
        return UserModel.findByLoginAndPassword(email, password)
            .then(async (user) => {
                if (!user) {
                    return {
                        status: StatusEnum.Error,
                        data: null
                    };
                } else {
                    const loggedUser: User = {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email
                    };

                    const accessToken = generateAccessToken(loggedUser);
                    const refreshToken = generateRefreshToken(loggedUser);

                    // Update user with tokens
                    await user.updateOne({
                        accessToken,
                        refreshToken
                    });

                    return {
                        status: StatusEnum.Ok,
                        data: {
                            accessToken,
                            refreshToken,
                            user: loggedUser
                        }
                    };
                }
            })
            .catch(err => {
                logger.error(err.message);

                return {
                    status: StatusEnum.Error,
                    data: null
                };
            });
    },
    signUp: (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { email, password, name }: MutationSignUpArgs,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<AuthResult> => {
        return new UserModel({
            name,
            password,
            email
        }).save().then(async user => {
            const loggedUser: User = {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            };

            const accessToken = generateAccessToken(loggedUser);
            const refreshToken = generateRefreshToken(loggedUser);

            // Update user with tokens
            await user.updateOne({
                accessToken,
                refreshToken
            });

            return {
                status: StatusEnum.Ok,
                data: {
                    accessToken,
                    refreshToken,
                    user: loggedUser
                }
            };
        }).catch(err => {
            logger.error(err.message);

            return {
                status: StatusEnum.Error,
                data: null
            };
        });
    },
    refresh: (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { token }: MutationRefreshArgs,
        { user }: Context
    ): Promise<AuthResult> => {
        try {
            const accessToken = refreshAccessToken(token);

            return Promise.resolve({
                status: StatusEnum.Ok,
                data: {
                    accessToken,
                    refreshToken: token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                }
            });
        } catch (err) {
            logger.error(err.message);

            return Promise.resolve({
                status: StatusEnum.Error,
                data: null
            });
        }
    }
};

export default mutations;
