import { StatusEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

jest.mock('../../../src/utils/token');
jest.mock('../../../src/providers/mqtt');

describe('Mutations > Login', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                data {
                    accessToken
                    refreshToken
                    user {
                        id
                        name
                        email
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

    test('should login user - SUCCESS', async () => {
        const queryData = {
            query,
            variables: {
                email: 'xyz@mail.to',
                password: '1234'
            }
        };

        const response = await request.post('/api/v1').set({ origin: 'http://localhost' }).send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            login: {
                status: StatusEnum.Ok,
                data: {
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                    user: {
                        id: '654e97e38835ad080eb81c99',
                        name: 'xyz',
                        email: 'xyz@mail.to'
                    }
                }
            }
        });
    });

    test('should not login user (invalid credentials) - SUCCESS', async () => {
        const queryData = {
            query,
            variables: {
                email: 'xyz@mail.to',
                password: '5678'
            }
        };

        const response = await request.post('/api/v1').set({ origin: 'http://localhost' }).send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            login: {
                status: StatusEnum.Error,
                data: null
            }
        });
    });
});
