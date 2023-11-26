import { main } from '../../../src/utils';
import supertest from 'supertest';

jest.mock('../../../src/utils/token');
jest.mock('../../../src/providers/mqtt');

describe('Queries > User', () => {
    let request: supertest.SuperTest<supertest.Test>;
    const query = `
        query User {
            user {
                id
                name
                email
            }
        }
    `;

    beforeAll(async () => {
        const app = await main();
        request = supertest(app);
    });

    test('should get user - SUCCESS', async () => {
        const queryData = { query };

        const response = await request
            .post('/api/v1')
            .set({ origin: 'http://localhost' })
            .set({
                Authorization: 'Bearer token'
            })
            .send(queryData);
        expect(response.status).toBe(200);
        expect(response.body?.data).toMatchObject({
            user: {
                id: '654e97e38835ad080eb81c99',
                email: 'xyz@mail.to',
                name: 'xyz'
            }
        });
    });

    test('should get user - UNAUTHORIZED', async () => {
        const queryData = { query };

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
