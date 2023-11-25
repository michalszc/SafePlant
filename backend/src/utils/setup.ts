import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { resolvers as scalarResolvers, typeDefs as scalarTypeDefs } from 'graphql-scalars';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { expressMiddleware } from '@apollo/server/express4';
import { Environment, NODE_ENV, PORT } from '../constants';
import { useServer } from 'graphql-ws/lib/use/ws';
import { resolvers } from '../resolvers';
import bodyParser from 'body-parser';
import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import logger, { loggerPlugin } from './logger';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { PubSub } from 'graphql-subscriptions';
import { connectMongoDB } from './mongodb';
import { applyMiddleware } from 'graphql-middleware';
import { permissions } from './shield';
import { Maybe, User } from '../__generated__/resolvers-types';
import { getUser } from './token';
import { Mqtt, IMqtt } from '../providers';

export interface Context {
    pubsub: PubSub;
    user: Maybe<User>;
    mqtt: IMqtt;
}

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });
const schema = applyMiddleware(makeExecutableSchema({
    typeDefs: [
        ...scalarTypeDefs,
        typeDefs
    ],
    resolvers: {
        ...scalarResolvers,
        ...resolvers
    }
}), permissions);

export const createApolloServer = (
    httpServer: http.Server,
    serverCleanup: ReturnType<typeof useServer>
) => new ApolloServer<Context>({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        loggerPlugin,
        { // eslint-disable-next-line require-await
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    }
                };
            }
        }
    ]
});

export async function main() {
    const path = '/api/v1';
    const app = express();
    const httpServer = http.createServer(app);
    const wsServer = new WebSocketServer({
        server: httpServer,
        path
    });

    const mqtt = new Mqtt();
    mqtt.subscribe('test', (topic, message) => {
        console.log(topic, JSON.parse(message.toString())); // eslint-disable-line no-console
    });
    mqtt.listen();

    const pubsub = new PubSub();

    const serverCleanup = useServer({
        schema,
        context: async (ctx, _msg, _args) => { // eslint-disable-line require-await, @typescript-eslint/no-unused-vars
            const token = (ctx.connectionParams?.authorization as string) ?? '';
            const user = token ? getUser(token) : null;

            return {
                user,
                pubsub,
                mqtt
            };
        }
    }, wsServer);

    const server = createApolloServer(httpServer, serverCleanup);
    await server.start();

    app.use(
        path,
        cors<cors.CorsRequest>(),
        bodyParser.json(),
        expressMiddleware(server, { // eslint-disable-next-line require-await
            context: async ({ req }) => {
                const token = req.headers?.authorization?.split(' ')?.at(1) ?? '';
                const user = token ? getUser(token) : null;

                return {
                    user,
                    pubsub,
                    mqtt
                };
            }
        })
    );

    if (NODE_ENV !== Environment.TEST) {
        await connectMongoDB();
        httpServer.listen(PORT, () => {
            logger.info(`🚀 Query endpoint ready at http://localhost:${PORT}/api/v1`);
            logger.info(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/api/v1`);
        });
    }

    // Temporary
    // (function publishMessage() {
    //     pubsub.publish('DATA.654d40cf3128e7fc4d6a30e4', {
    //         id: '654d40cf3128e7fc4d6a30e4',
    //         dateTime: '2007-12-03T10:15:30Z',
    //         timestamp: new Date().getTime(),
    //         numericValue: 45.2,
    //         rawValue: '45.2'
    //     });
    //     setTimeout(publishMessage, 1000);
    // })();

    return app;
}
