import logger from './logger';
import mongoose from 'mongoose';
import { Environment, MONGODB_URI, NODE_ENV } from '../constants';

// Exit application on error
mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
    process.exit(-1);
});

// print mongoose logs in dev env
if (NODE_ENV === Environment.DEVELOPMENT) {
    mongoose.set('debug', true);
}

export const connectMongoDB = (uri: string = MONGODB_URI): Promise<void> => mongoose.connect(uri, {
    dbName: 'iot'
}).then(() => {
    if (NODE_ENV === Environment.DEVELOPMENT) {
        logger.info('Successfully connected to MongoDB');
    }
});
