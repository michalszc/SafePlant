export const connect = jest.fn(() => ({
    reconnecting: true,
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn(),
    on: jest.fn()
}));

export type MqttClient = ReturnType<typeof connect>;
