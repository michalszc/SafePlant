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

export interface Context {
    pubsub: PubSub;
}

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });
const schema = makeExecutableSchema({
    typeDefs: [
        ...scalarTypeDefs,
        typeDefs
    ],
    resolvers: {
        ...scalarResolvers,
        ...resolvers
    }
});

export const createApolloServer = (
    httpServer: http.Server,
    serverCleanup: ReturnType<typeof useServer>
) => new ApolloServer<Context>({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        // loggerPlugin,
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

    const pubsub = new PubSub();
    const context: Context = {
        pubsub
    };

    const serverCleanup = useServer({
        schema,
        context
    }, wsServer);

    const server = createApolloServer(httpServer, serverCleanup);
    await server.start();

    app.use(
        path,
        cors<cors.CorsRequest>(),
        bodyParser.json(),
        expressMiddleware(server, { // eslint-disable-next-line require-await
            context: async () => context
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
    //     pubsub.publish('DATA.7fc990e2-463e-45a0-939f-1414206ff1de', {
    //         id: '7fc990e2-463e-45a0-939f-1414206ff1de',
    //         dateTime: '2007-12-03T10:15:30Z',
    //         timestamp: new Date().getTime(),
    //         numericValue: 45.2,
    //         rawValue: '45.2'
    //     });
    //     setTimeout(publishMessage, 1000);
    // })();

    return app;
}
