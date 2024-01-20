import 'dotenv/config'; // Load environment variables
import { Environment } from './environment';

export const NODE_ENV = process.env.NODE_ENV ?? Environment.DEVELOPMENT;

export const LOGS = NODE_ENV === Environment.DEVELOPMENT;

export const PORT = Number(process.env.PORT) ?? 4000;

export const MONGODB_URI = process.env.MONGODB_URI;

export const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

export const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY;

export const MQTT_HOST = process.env.MQTT_HOST ?? 'localhost';
export const MQTT_PORT = Number(process.env.MQTT_PORT) ?? 1883;
export const MQTT_USERNAME = process.env.MQTT_USERNAME;
export const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
export const MQTT_CA = process.env.MQTT_CA;
export const MQTT_CERT = process.env.MQTT_CERT;
export const MQTT_KEY = process.env.MQTT_KEY;
