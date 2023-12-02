import { MqttClient, connect } from 'mqtt';
import { MQTT_CA, MQTT_CERT, MQTT_HOST, MQTT_KEY, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } from '../constants';
import { logger } from '../utils';

export interface IMqtt {
    subscribe(topic: string, fn: (topic: string, message: Buffer) => void): void;
    unsubscribe(topic: string): void;
    publish(topic: string, message: string | Buffer): void;
    listen(): void;
}

export class Mqtt {
    private client: MqttClient;
    private subscribedTopics: Record<string, (topic: string, message: Buffer) => void> = {};

    constructor() {
        this.client = connect({
            host: MQTT_HOST,
            port: MQTT_PORT,
            protocol: 'mqtt',
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
            ca: MQTT_CA,
            cert: MQTT_CERT,
            key: MQTT_KEY,
            rejectUnauthorized: true
        });
        this.client.reconnecting = true;
        this.subscribedTopics = {};
    }

    public unsubscribe(topic: string): void {
        if (this.subscribedTopics[topic]) {
            delete this.subscribedTopics[topic];
            this.client.unsubscribe(topic);
        } else {
            logger.warn(`No callback for topic ${topic}`);
        }
    }

    public subscribe(topic: string, fn: (topic: string, message: Buffer) => void): void {
        if (this.subscribedTopics[topic]) {
            logger.warn(`Already subscribed to topic ${topic}`);
        } else {
            this.subscribedTopics[topic] = fn;
            this.client.subscribe(topic);
        }
    }

    public publish(topic: string, message: string | Buffer): void {
        this.client.publish(topic, message);
    }

    public listen(): void {
        this.client.on('message', (topic, message) => {
            if (this.subscribedTopics[topic]) {
                this.subscribedTopics[topic](topic, message);
            } else {
                logger.warn(`No callback for topic ${topic}`);
            }
        });
        this.client.on('error', (error) => console.error(error)); // eslint-disable-line no-console
        this.client.on('connect', () => logger.info('Connected to MQTT broker'));
        this.client.on('disconnect', () => logger.warn('Disconnected from MQTT broker'));
        this.client.on('reconnect', () => logger.warn('Reconnecting to MQTT broker'));
    }
}
