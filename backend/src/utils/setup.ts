import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import { Environment, NODE_ENV } from '../constants';
import { resolvers } from '../resolvers';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import logger, { loggerPlugin } from './logger';
import express from 'express';
import cors from 'cors';
import http from 'http';

export interface Context {

}

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

export const createApolloServer = (httpServer: http.Server) => new ApolloServer<Context>({
    typeDefs: [
        typeDefs
    ],
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), loggerPlugin]
});

export async function main() {
    const app = express();
    const httpServer = http.createServer(app);

    const server = createApolloServer(httpServer);
    await server.start();

    app.use(
        '/api/v1',
        cors<cors.CorsRequest>(),
        bodyParser.json(),
        expressMiddleware(server, {
            context: async () => ({ // eslint-disable-line require-await
                // NOT YET IMPLEMENTED
            })
        })
    );

    if (NODE_ENV !== Environment.TEST) {
        // Modified server startup
        await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
        logger.info('🚀 Server ready at http://localhost:4000/');
    }

    return app;
}
