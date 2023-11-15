import 'dotenv/config'; // Load environment variables
import { Environment } from './environment';

export const NODE_ENV = process.env.NODE_ENV ?? Environment.DEVELOPMENT;

export const LOGS = NODE_ENV === Environment.DEVELOPMENT;

export const PORT = Number(process.env.PORT) ?? 4000;

export const MONGODB_URI = process.env.MONGODB_URI;

export const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

export const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY;
