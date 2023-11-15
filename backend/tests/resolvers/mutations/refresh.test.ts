import { StatusEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

jest.mock('../../../src/utils/token');

describe('Mutations > Refresh', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        mutation Refresh($token: JWT!) {
            refresh(token: $token) {
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

    test('should refresh access token - SUCCESS', async () => {
        const queryData = {
            query,
            variables: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94'
            }
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
            refresh: {
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

    test('should refresh access token - UNAUTHORIZED', async () => {
        const queryData = {
            query,
            variables: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94'
            }
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
