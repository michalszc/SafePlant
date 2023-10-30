/* eslint-disable max-len */
import {
    MutationRefreshArgs, AuthResult, FlowerResult,
    MutationAddFlowerArgs, MutationLoginArgs, MutationRemoveFlowerArgs,
    MutationResolvers, MutationSignUpArgs, MutationUpdateFlowerArgs,
    SensorTypeEnum, StatusEnum
} from '../__generated__/resolvers-types';
import { Context } from '../utils';

const mutations: MutationResolvers = {
    // eslint-disable-next-line require-await
    addFlower: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { input }: MutationAddFlowerArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                name: 'flower',
                humidity: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    type: SensorTypeEnum.Humidity,
                    frequency: 123,
                    validRange: {
                        min: 12.4,
                        max: 45.3
                    },
                    data: null // pass null to resolve this value in Sensor
                },
                temperature: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    type: SensorTypeEnum.Temperature,
                    frequency: 123,
                    validRange: {
                        min: 12.4,
                        max: 45.3
                    },
                    data: null // pass null to resolve this value in Sensor
                }
            }
        });
    },
    // eslint-disable-next-line require-await
    updateFlower: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id, input }: MutationUpdateFlowerArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                name: 'flower',
                humidity: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    type: SensorTypeEnum.Humidity,
                    frequency: 123,
                    validRange: {
                        min: 12.4,
                        max: 45.3
                    },
                    data: null // pass null to resolve this value in Sensor
                },
                temperature: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    type: SensorTypeEnum.Temperature,
                    frequency: 123,
                    validRange: {
                        min: 12.4,
                        max: 45.3
                    },
                    data: null // pass null to resolve this value in Sensor
                }
            }
        });
    },
    // eslint-disable-next-line require-await
    removeFlower: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id }: MutationRemoveFlowerArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<FlowerResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                name: 'flower',
                humidity: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    type: SensorTypeEnum.Humidity,
                    frequency: 123,
                    validRange: {
                        min: 12.4,
                        max: 45.3
                    },
                    data: null // pass null to resolve this value in Sensor
                },
                temperature: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    type: SensorTypeEnum.Temperature,
                    frequency: 123,
                    validRange: {
                        min: 12.4,
                        max: 45.3
                    },
                    data: null // pass null to resolve this value in Sensor
                }
            }
        });
    },
    // eslint-disable-next-line require-await
    login: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { email, password }: MutationLoginArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<AuthResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                user: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    name: 'name',
                    email: 'mail@mail.to'
                }
            }
        });
    },
    // eslint-disable-next-line require-await
    signUp: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { email, password, name }: MutationSignUpArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<AuthResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                user: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    name: 'name',
                    email: 'mail@mail.to'
                }
            }
        });
    },
    // eslint-disable-next-line require-await
    refresh: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { token }: MutationRefreshArgs, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<AuthResult> => {
        return Promise.resolve({
            status: StatusEnum.Ok,
            data: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJtb2NrVXNlciJ9.Vx5tLrlOooukPM0h6tZGQ0MfjhkjOLqCE_AxlM9Yt94',
                user: {
                    id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                    name: 'name',
                    email: 'mail@mail.to'
                }
            }
        });
    }
};

export default mutations;
