import { SensorTypeEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

describe('Queries > Flower', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        query Flower($flowerId: ObjectID!) {
            flower(id: $flowerId) {
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
        }
    `;
    
    beforeAll(async () => {
        const app = await main();
        request = supertest(app);
    });

    test('should get flower by id - SUCCESS', async () => {
        const queryData = {
            query,
            variables: { flowerId: '654e93357cdc6705e7ad22b1' }
        };

        const response = await request.post('/api/v1').set({ origin: 'http://localhost' }).send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            flower: {
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
            }
        });
    });

    test('should get flower by id - NOT FOUND ERROR', async () => {
        const queryData = {
            query,
            variables: { flowerId: '654e93357cdc6705e7ad2299' }
        };

        const response = await request.post('/api/v1').send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.errors).toHaveLength(1);
        expect(response.body?.data).toBeNull();
    });

    test('should get flower by id - INVALID INPUT ERROR', async () => {
        const queryData = {
            query,
            variables: { flowerId: 'f2e6d8c1-9b3a-4e5f-a1d0-c7b9e8f2a6d' }
        };

        const response = await request.post('/api/v1').send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.errors).toHaveLength(1);
        expect(response.body?.data).toBeUndefined();
    });
});