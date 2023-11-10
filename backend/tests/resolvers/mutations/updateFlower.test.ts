import { SensorTypeEnum, StatusEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

describe('Queries > Update Flower', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        mutation UpdateFlower($updateFlowerId: ObjectID!, $input: UpdateFlowerInput!) {
            updateFlower(id: $updateFlowerId, input: $input) {
                data {
                    humidity {
                        frequency
                        id
                        type
                        validRange {
                            max
                            min
                        }
                    }
                    id
                    name
                    temperature {
                        frequency
                        id
                        type
                        validRange {
                            max
                            min
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

    test('should update flower - SUCCESS', async () => {
        const queryData = {
            query,
            variables: {
                updateFlowerId: '654e93357cdc6705e7ad22b1',
                input: {
                    name: 'new flower',
                    humidity: {
                        frequency: 123,
                        validRange: {
                            max: 2,
                            min: 5
                        }
                    },
                    temperature: {
                        frequency: 51,
                        validRange: {
                            max: 123,
                            min: 2
                        }
                    }
                }
            }
        };

        const response = await request.post('/api/v1').set({ origin: 'http://localhost' }).send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            updateFlower: {
                status: StatusEnum.Ok,
                data: {
                    id: '654e93357cdc6705e7ad22b1',
                    name: 'new flower',
                    humidity: {
                        id: '654d3e91d427763a100eda43',
                        type: SensorTypeEnum.Humidity,
                        frequency: 123,
                        validRange: {
                            max: 2,
                            min: 5
                        }
                    },
                    temperature: {
                        id: '654d3e91d427763a100eda44',
                        type: SensorTypeEnum.Temperature,
                        frequency: 51,
                        validRange: {
                            max: 123,
                            min: 2
                        }
                    }
                }
            }
        });
    });
});
