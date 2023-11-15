import { StatusEnum } from '../../../src/__generated__/resolvers-types';
import { main } from '../../../src/utils';
import supertest from 'supertest';

describe('Mutations > Sign Up', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        mutation signUp($email: String!, $password: String!, $name: String!) {
            signUp(email: $email, password: $password, name: $name) {
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

    test('should sign up user - SUCCESS', async () => {
        const queryData = {
            query,
            variables: {
                name: 'test',
                email: 'test@mail.to',
                password: '1234'
            }
        };

        const response = await request.post('/api/v1').set({ origin: 'http://localhost' }).send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            signUp: {
                status: StatusEnum.Ok,
                data: {
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                    user: {
                        id: expect.any(String),
                        name: 'test',
                        email: 'test@mail.to'
                    }
                }
            }
        });
    });
});
