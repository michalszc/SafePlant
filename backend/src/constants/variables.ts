import 'dotenv/config'; // Load environment variables
import { Environment } from './environment';

export const NODE_ENV = process.env.NODE_ENV ?? Environment.DEVELOPMENT;

export const LOGS = NODE_ENV === Environment.DEVELOPMENT;
