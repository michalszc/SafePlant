import { SensorTypeEnum, StatusEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

describe('Queries > Remove Flower', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        mutation RemoveFlower($removeFlowerId: ObjectID!) {
            removeFlower(id: $removeFlowerId) {
                data {
                    id
                    name
                    temperature {
                        frequency
                        id
                        type
                        validRange {
                            min
                            max
                        }
                    }
                    humidity {
                        id
                        type
                        frequency
                        validRange {
                            min
                            max
                        }
                    }
                }
                status
            }
        }
    `;
    
    beforeAll(async () => {
        const app = await main();
        request = supertest(app);
    });

    test('should remove flower - SUCCESS', async () => {
        const queryData = {
            query,
            variables: { removeFlowerId: '654e93357cdc6705e7ad22b2' }
        };

        const response = await request.post('/api/v1').set({ origin: 'http://localhost' }).send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            removeFlower: {
                status: StatusEnum.Ok,
                data: {
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
                }
            }
        });
    });
});