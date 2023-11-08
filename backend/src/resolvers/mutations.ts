/* eslint-disable max-len */
import {
    MutationRefreshArgs, AuthResult, FlowerResult,
    MutationAddFlowerArgs, MutationLoginArgs, MutationRemoveFlowerArgs,
    MutationResolvers, MutationSignUpArgs, MutationUpdateFlowerArgs,
    SensorTypeEnum, StatusEnum
} from '../__generated__/resolvers-types';
import { Flower, Sensor } from '../providers';
import { Context, logger } from '../utils';

const mutations: MutationResolvers = {
    addFlower: (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { input: { name, humidity, temperature } }: MutationAddFlowerArgs,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {

        const humiditySensor = new Sensor({
            user: '65494a083b1744f88c2622bf', // temporary
            type: SensorTypeEnum.Humidity,
            ...humidity
        });

        const temperatureSensor = new Sensor({
            user: '65494a083b1744f88c2622bf', // temporary
            type: SensorTypeEnum.Temperature,
            ...temperature
        });
        
        return Promise.all([
            humiditySensor.save(),
            temperatureSensor.save()
        ]).then(async ([humiditySensor, temperatureSensor]) => {
            const flower = await new Flower({
                user: '65494a083b1744f88c2622bf', // temporary
                name,
                humidity: humiditySensor._id,
                temperature: temperatureSensor._id
            }).save();

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
            logger.error(err);

            return {
                status: StatusEnum.Error,
                data: null
            };
        });
    },
    updateFlower: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id, input }: MutationUpdateFlowerArgs,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {

        const flower = await Flower
            .findById(id)
            .populate('humidity')
            .populate('temperature');

        if (!flower) {
            logger.error(`Cannot find flower with id ${id}`);

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
        }

        if ('temperature' in input) {
            updates.push(
                Sensor.updateOne(
                    { _id: flower.temperature._id },
                    { $set: { ...input.temperature } }
                )
            );
        }

        if ('name' in input) {
            updates.push(
                Flower.updateOne(
                    { _id: id },
                    { $set: { name: input.name } }  
                )
            );
        }

        return Promise.all(updates).then(() => ({
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
        })).catch(err => {
            logger.error(err);

            return {
                status: StatusEnum.Error,
                data: null
            };
        });
    },
    removeFlower: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id }: MutationRemoveFlowerArgs,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {

        const flower = await Flower
            .findById(id)
            .populate('humidity')
            .populate('temperature');

        if (!flower) {
            logger.error(`Cannot find flower with id ${id}`);

            throw Error(`Cannot find flower with id ${id}`);
        }

        return Flower.removeOne(id).then(() => ({
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
        })).catch(err => {
            logger.error(err);

            return {
                status: StatusEnum.Error,
                data: null
            };
        });
    },
    // eslint-disable-next-line require-await
    login: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { email, password }: MutationLoginArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<AuthResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                user: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    name: 'name',
                    email: 'mail@mail.to'
                }
            }
        });
    },
    // eslint-disable-next-line require-await
    signUp: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { email, password, name }: MutationSignUpArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<AuthResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                user: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    name: 'name',
                    email: 'mail@mail.to'
                }
            }
        });
    },
    // eslint-disable-next-line require-await
    refresh: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { token }: MutationRefreshArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<AuthResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                user: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    name: 'name',
                    email: 'mail@mail.to'
                }
            }
        });
    }
};

export default mutations;
