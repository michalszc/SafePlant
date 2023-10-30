import {
    Flower, Flowers, QueryFlowerArgs, QueryFlowersArgs,
    QueryResolvers, QuerySensorArgs, RequireFields, Sensor,
    SensorTypeEnum, User
} from '../__generated__/resolvers-types';
import { Context } from '../utils';

const queries: QueryResolvers = {
    // eslint-disable-next-line require-await
    flowers: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        _queryFlowersArgs: Partial<QueryFlowersArgs>, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Flowers> => {
        return Promise.resolve({
            edges: [
                {
                    node: {
                        id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                        name: 'flower',
                        humidity: {
                            id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                            type: SensorTypeEnum.Humidity,
                            frequency: 123,
                            validRange: {
                                min: 12.4,
                                max: 45.3
                            },
                            data: null // pass null to resolve this value in Sensor
                        },
                        temperature: {
                            id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                            type: SensorTypeEnum.Temperature,
                            frequency: 123,
                            validRange: {
                                min: 12.4,
                                max: 45.3
                            },
                            data: null // pass null to resolve this value in Sensor
                        }
                    },
                    cursor: 'ZHVtbXk='
                }
            ],
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null
            }
        });
    },
    // eslint-disable-next-line require-await
    flower: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id }: RequireFields<QueryFlowerArgs, 'id'>, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Flower> => {
        return Promise.resolve({
            id: '7fc990e2-463e-45a0-939f-1414206ff1de',
            name: 'flower',
            humidity: {
                id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                type: SensorTypeEnum.Humidity,
                frequency: 123,
                validRange: {
                    min: 12.4,
                    max: 45.3
                },
                data: null // pass null to resolve this value in Sensor
            },
            temperature: {
                id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                type: SensorTypeEnum.Temperature,
                frequency: 123,
                validRange: {
                    min: 12.4,
                    max: 45.3
                },
                data: null // pass null to resolve this value in Sensor
            }
        });
    },
    // eslint-disable-next-line require-await
    sensor: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id }: RequireFields<QuerySensorArgs, 'id'>, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Sensor> => {
        return Promise.resolve({
            id: '7fc990e2-463e-45a0-939f-1414206ff1de',
            type: SensorTypeEnum.Humidity,
            frequency: 123,
            validRange: {
                min: 12.4,
                max: 45.3
            },
            data: null // pass null to resolve this value in Sensor
        });
    },
    // eslint-disable-next-line require-await
    user: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        __: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<User> => {
        return Promise.resolve({
            id: '7fc990e2-463e-45a0-939f-1414206ff1de',
            name: 'name',
            email: 'mail@mail.to'
        });
    }
};

export default queries;
