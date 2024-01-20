import { SensorTypeEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

jest.mock('../../../src/utils/token');
jest.mock('../../../src/providers/mqtt');

describe('Queries > Sensor', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        query Sensor($sensorId: ObjectID!) {
            sensor(id: $sensorId) {
                id
                type
                frequency
                validRange {
                    min
                    max
                }
            }
        }
    `;

    beforeAll(async () => {
        const app = await main();
        request = supertest(app);
    });

    test('should get sensor by id - SUCCESS', async () => {
        const queryData = {
            query,
            variables: { sensorId: '654d3e91d427763a100eda43' }
        };

        const response = await request
            .post('/api/v1')
            .set({ origin: 'http://localhost' })
            .set({
                Authorization: 'Bearer token'
            })
            .send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            sensor: {
                id: '654d3e91d427763a100eda43',
                type: SensorTypeEnum.Humidity,
                frequency: 10,
                validRange: {
                    min: 0,
                    max: 100
                }
            }
        });
    });

    test('should get sensor by id - UNAUTHORIZED', async () => {
        const queryData = {
            query,
            variables: { sensorId: '654d3e91d427763a100eda43' }
        };

        const response = await request
            .post('/api/v1')
            .set({ origin: 'http://localhost' })
            .send(queryData);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            errors: [
                {
                    message: 'Not Authorised!',
                    locations: expect.any(Array),
                    path: expect.any(Array),
                    extensions: expect.any(Object)
                }
            ],
            data: null
        });
    });

    test('should get sensor by id - NOT FOUND ERROR', async () => {
        const queryData = {
            query,
            variables: { sensorId: '654d3e91d427763a100eda99' }
        };

        const response = await request
            .post('/api/v1')
            .set({
                Authorization: 'Bearer token'
            })
            .send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.errors).toHaveLength(1);
        expect(response.body?.data).toBeNull();
    });

    test('should get sensor by id - INVALID INPUT ERROR', async () => {
        const queryData = {
            query,
            variables: { sensorId: 'f2e6d8c1-9b3a-4e5f-a1d0-c7b9e8f2a6d' }
        };

        const response = await request
            .post('/api/v1')
            .set({
                Authorization: 'Bearer token'
            })
            .send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.errors).toHaveLength(1);
        expect(response.body?.data).toBeUndefined();
    });

    test('should get sensor by id with data - SUCCESS', async () => {
        const queryData = {
            query: `
                query Sensor($sensorId: ObjectID!) {
                    sensor(id: $sensorId) {
                        id
                        type
                        frequency
                        validRange {
                            min
                            max
                        }
                        data {
                            edges {
                              node {
                                id
                                dateTime
                                timestamp
                                numericValue
                                rawValue
                              }
                              cursor
                            }
                            pageInfo {
                              hasNextPage
                              hasPreviousPage
                              startCursor
                              endCursor
                            }
                        }
                    }
                }
            `,
            variables: { sensorId: '654d3e91d427763a100eda43' }
        };

        const response = await request
            .post('/api/v1')
            .set({ origin: 'http://localhost' })
            .set({
                Authorization: 'Bearer token'
            })
            .send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            sensor: {
                id: '654d3e91d427763a100eda43',
                type: SensorTypeEnum.Humidity,
                frequency: 10,
                validRange: {
                    min: 0,
                    max: 100
                },
                data: {
                    edges: Array.from({ length: 100 }, () => ({
                        node: {
                            id: expect.any(String),
                            dateTime: expect.any(String),
                            timestamp: expect.any(Number),
                            numericValue: expect.any(Number),
                            rawValue: expect.any(String)
                        },
                        cursor: expect.any(String)
                    })),
                    pageInfo: {
                        hasNextPage: false,
                        hasPreviousPage: false,
                        startCursor: expect.any(String),
                        endCursor: expect.any(String)
                    }
                }
            }
        });
    });
});
