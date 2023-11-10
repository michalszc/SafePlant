import { SensorTypeEnum, StatusEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

describe('Queries > Add Flower', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        mutation addFlower($input: AddFlowerInput!) {
            addFlower(input: $input) {
                data {
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
                status
            }
        }
    `;
    
    beforeAll(async () => {
        const app = await main();
        request = supertest(app);
    });

    test('should add flower - SUCCESS', async () => {
        const queryData = {
            query,
            variables: {
                input: {
                    name: "new flower",
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
            addFlower: {
                status: StatusEnum.Ok,
                data: {
                    id: expect.any(String),
                    name: 'new flower',
                    humidity: {
                        id: expect.any(String),
                        type: SensorTypeEnum.Humidity,
                        frequency: 123,
                        validRange: {
                            max: 2,
                            min: 5
                        }
                    },
                    temperature: {
                        id: expect.any(String),
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