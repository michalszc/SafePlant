import { SensorTypeEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

jest.mock('../../../src/utils/token');

describe('Queries > Flowers', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        query Flowers {
            flowers {
                edges {
                    node {
                        id
                        name
                        humidity {
                            id
                            type
                            frequency
                            validRange {
                                min
                                max
                            }
                        }
                        temperature {
                            id
                            type
                            frequency
                            validRange {
                                min
                                max
                            }
                        }
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
    `;

    beforeAll(async () => {
        const app = await main();
        request = supertest(app);
    });

    test('should get all flowers - SUCCESS', async () => {
        const queryData = {
            query,
            variables: { flowerId: '654e93357cdc6705e7ad22b1' }
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
            flowers: {
                edges: [
                    {
                        node: {
                            id: '654e93357cdc6705e7ad22b1',
                            name: 'flower 1',
                            humidity: {
                                id: '654d3e91d427763a100eda43',
                                type: SensorTypeEnum.Humidity,
                                frequency: 10,
                                validRange: {
                                    min: 0,
                                    max: 100
                                }
                            },
                            temperature: {
                                id: '654d3e91d427763a100eda44',
                                type: SensorTypeEnum.Temperature,
                                frequency: 10,
                                validRange: {
                                    min: 0,
                                    max: 100
                                }
                            }
                        },
                        cursor: Buffer.from('654e93357cdc6705e7ad22b1').toString('base64')
                    },
                    {
                        node: {
                            id: '654e93357cdc6705e7ad22b2',
                            name: 'flower 2',
                            humidity: {
                                id: '654d3e91d427763a100eda43',
                                type: SensorTypeEnum.Humidity,
                                frequency: 10,
                                validRange: {
                                    min: 0,
                                    max: 100
                                }
                            },
                            temperature: {
                                id: '654d3e91d427763a100eda44',
                                type: SensorTypeEnum.Temperature,
                                frequency: 10,
                                validRange: {
                                    min: 0,
                                    max: 100
                                }
                            }
                        },
                        cursor: Buffer.from('654e93357cdc6705e7ad22b2').toString('base64')
                    }
                ],
                pageInfo: {
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: Buffer.from('654e93357cdc6705e7ad22b1').toString('base64'),
                    endCursor: Buffer.from('654e93357cdc6705e7ad22b2').toString('base64')
                }
            }
        });
    });
    test('should get all flowers - UNAUTHORIZED', async () => {
        const queryData = {
            query,
            variables: { flowerId: '654e93357cdc6705e7ad22b1' }
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
});
