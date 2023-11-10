import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Flower, Sensor, SensorData, User } from "../src/providers";
import { SensorTypeEnum } from "../src/__generated__/resolvers-types";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);


    const user = await User.create({
        _id: '654e97e38835ad080eb81c58',
        email: 'xyz@mail.to',
        name: 'xyz',
        password: '1234'
    });

    const humiditySensor = await Sensor.create({
        _id: '654d3e91d427763a100eda43',
        user: user._id.toString(),
        type: SensorTypeEnum.Humidity,
        frequency: 10,
        validRange: {
            min: 0,
            max: 100
        }
    });

    const temperatureSensor = await Sensor.create({
        _id: '654d3e91d427763a100eda44',
        user: user._id.toString(),
        type: SensorTypeEnum.Temperature,
        frequency: 10,
        validRange: {
            min: 0,
            max: 100
        }
    });

    await Flower.create({
        _id: '654e93357cdc6705e7ad22b1',
        user: user._id.toString(),
        name: 'flower 1',
        humidity: humiditySensor._id.toString(),
        temperature: temperatureSensor._id.toString()
    });

    await Flower.create({
        _id: '654e93357cdc6705e7ad22b2',
        user: user._id.toString(),
        name: 'flower 2',
        humidity: humiditySensor._id.toString(),
        temperature: temperatureSensor._id.toString()
    });

    let timestamp = 1196676930000;
    for (let i = 0; i < 100; i++) {

        const value = Math.random() * 100;

        await SensorData.create({
            user: user._id.toString(),
            sensor: humiditySensor._id.toString(),
            numericValue: value,
            rawValue: value.toString(),
            timestamp,
            dateTime: new Date(timestamp).toISOString()
        });

        await SensorData.create({
            user: user._id.toString(),
            sensor: temperatureSensor._id.toString(),
            numericValue: value,
            rawValue: value.toString(),
            timestamp,
            dateTime: new Date(timestamp).toISOString()
        });

        timestamp += 1000;
    }

});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

