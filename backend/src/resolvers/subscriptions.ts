import { Context } from '../utils';
import { SensorData, SubscriptionLatestSensorDataArgs, SubscriptionResolvers } from './../__generated__/resolvers-types';

const subscriptions: SubscriptionResolvers = {
    latestSensorData: {
        subscribe: (
            _: unknown,
            { id }: SubscriptionLatestSensorDataArgs,
            { pubsub }: Context
        ): AsyncIterable<SensorData> => {
            return {
                [Symbol.asyncIterator]: () => pubsub.asyncIterator(`DATA.${id}`)
            };
        },
        resolve: (payload: SensorData) => payload
    }

};

export default subscriptions;
