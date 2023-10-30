import { Resolvers } from '../__generated__/resolvers-types';
import mutations from './mutations';
import queries from './queries';
import sensor from './sensorResolver';
import subscriptions from './subscriptions';

export const resolvers: Resolvers = {
    Query: queries,
    Mutation: mutations,
    Subscription: subscriptions,
    Sensor: sensor
};
