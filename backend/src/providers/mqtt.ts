import { MqttClient, connect } from "mqtt";
import { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } from "../constants";
import { logger } from "../utils";

export interface IMqtt {
    subscribe(topic: string, fn: (topic: string, message: Buffer) => void): void;
    publish(topic: string, message: string): void;
    listen(): void;
}

export class Mqtt {
    client: MqttClient;
    subscribedTopics: Record<string, (topic: string, message: Buffer) => void> = {};
    constructor() {
        this.client  = connect({
            host: MQTT_HOST,
            port: MQTT_PORT,
            protocol: 'mqtt',
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
        });
        this.subscribedTopics = {};
    }

    subscribe(topic: string, fn: (topic: string, message: Buffer) => void): void {
        if (this.subscribedTopics[topic]) {
            logger.warn(`Already subscribed to topic ${topic}`);
        } else {
            this.subscribedTopics[topic] = fn;
            this.client.subscribe(topic);
        }
    }

    publish(topic: string, message: string): void {
        this.client.publish(topic, message);
    }

    listen(): void {
        this.client.on('message', (topic, message) => {
            if (this.subscribedTopics[topic]) {
                this.subscribedTopics[topic](topic, message);
            } else {
                logger.warn(`No callback for topic ${topic}`);
            }
        });
    }
}
