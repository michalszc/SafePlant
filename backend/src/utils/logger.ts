import winston from 'winston';
import { Environment, LOGS, NODE_ENV } from '../constants';
import { ApolloServerPlugin } from '@apollo/server';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${log.timestamp} ${log.level}: ${log.message} `
//
if (LOGS) {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.printf(
                (log: { timestamp: string; level: string; message: string; }) => `${log.timestamp} ${log.level}: ${log.message}`
            )
        )
    }));
}

export default logger;

export const loggerPlugin: ApolloServerPlugin = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(requestContext) { // eslint-disable-line require-await
        if (NODE_ENV === Environment.PRODUCTION) {
            logger.info(`Request started! Query:\n ${requestContext.request.query}`);

            return {
                // Fires whenever Apollo Server will parse a GraphQL
                // request to create its associated document AST.
                async parsingDidStart() { // eslint-disable-line require-await
                    logger.info('Parsing started!');
                },

                // Fires whenever Apollo Server will validate a
                // request's document AST against your GraphQL schema.
                async validationDidStart() { // eslint-disable-line require-await
                    logger.info('Validation started!');
                }
            };
        }
    }
};
