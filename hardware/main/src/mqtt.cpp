#include "mqtt.hpp"
#include "json.hpp"

#include "esp_log.h"
#include "esp_event.h"
#include <string>
#include <fstream>
#include "esp_spiffs.h"

namespace mqtt {

    void recive_msg(const char* msg, size_t msg_len, const char* topic, size_t topic_len, esp_mqtt_client_handle_t client) {
        std::string data(msg, msg_len);
        std::string crop_topic(topic, topic_len);
        ESP_LOGI("MQTT", "Topic: %s", crop_topic.c_str());
        ESP_LOGI("MQTT", "Data: %s", data.c_str());
        std::string uid;
        std::ifstream* file = new std::ifstream("/storage/uid.txt");
        std::getline(*file, uid);
        file->close();
        delete file;
        if (data == "REMOVE_DEVICE") {
            esp_spiffs_format(nullptr);
            esp_mqtt_client_subscribe(client, ("NEW_DEVICE/"+uid).c_str(), 0);
            esp_mqtt_client_subscribe(client, ("UPDATE_DEVICE/"+uid).c_str(), 0);
            esp_mqtt_client_subscribe(client, ("REMOVE_DEVICE/"+uid).c_str(), 0);
            MqttClient::getClient().connected = false;
            return;
        }
        if (crop_topic == "NEW_DEVICE/"+uid) {
            ESP_LOGI("MQTT", "Jestem w new_device");
            using json = nlohmann::json;
            json device = json::parse(data);
            json humidity = device["humidity"];
            json temperature = device["temperature"];
            MqttClient::getClient().connected = true;
            MqttClient::getClient().humidity = humidity;
            MqttClient::getClient().temperature = temperature;

            std::ofstream* file = new std::ofstream("/storage/moisture.json");
            *file << humidity;
            file->close();
            file->open("/storage/temperature.json");
            *file << temperature;
            file->close();
            delete file;
        }
    }

    static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
        auto event = reinterpret_cast<esp_mqtt_event_handle_t>(event_data);
        esp_mqtt_client_handle_t client = event->client;

        switch (static_cast<esp_mqtt_event_id_t>(event_id)) {   
        case MQTT_EVENT_CONNECTED: {
            std::string uid;
            std::ifstream* file = new std::ifstream("/storage/uid.txt");
            std::getline(*file, uid);
            file->close();
            delete file;
            ESP_LOGI("MQTT", "Topic: %s", uid.c_str());
            esp_mqtt_client_subscribe(client, ("NEW_DEVICE/"+uid).c_str(), 0);
            esp_mqtt_client_subscribe(client, ("UPDATE_DEVICE/"+uid).c_str(), 0);
            esp_mqtt_client_subscribe(client, ("REMOVE_DEVICE/"+uid).c_str(), 0);
        }
            break;
        
        case MQTT_EVENT_DISCONNECTED:
            MqttClient::getClient().connected = false;
            break;
        
        case MQTT_EVENT_SUBSCRIBED:
            // esp_mqtt_client_publish(client, "iot", "subscribed", 0, 1, 0);
            break;

        case MQTT_EVENT_DATA: 
            ESP_LOGI("MQTT", "MQTT_EVENT_DATA");
            // printf("TOPIC=%.*s\r\n", event->topic_len, event->topic);
            // printf("DATA=%.*s\r\n", event->data_len, event->data);
            ESP_LOGI("MQTT", "Reciving data");
            recive_msg(event->data, event->data_len, event->topic, event->topic_len, client);
            break;

        case MQTT_EVENT_ERROR:
            ESP_LOGI("MQTT", "ERROR OCCURED");
            break;
        case MQTT_EVENT_PUBLISHED:
            ESP_LOGI("MQTT", "Sent data");
            break;
        default:
            ESP_LOGI("MQTT", "I don't know what happened, event: %d", int(event_id));
        }
    }

    void start_mqtt() {
        esp_mqtt_client_config_t cfg{};
        cfg.broker.address.uri = "";
        cfg.broker.address.port = 8883;
        cfg.broker.verification.certificate = "";
        cfg.broker.verification.certificate_len = sizeof("");
        cfg.credentials.username = "esp";
        cfg.credentials.authentication.password = "";
        cfg.credentials.authentication.certificate = ""; 
        cfg.credentials.authentication.certificate_len = sizeof("CERT");
        cfg.credentials.authentication.key = "";
        cfg.credentials.authentication.key_len = sizeof("");

        MqttClient::getClient().client = esp_mqtt_client_init(&cfg);
        auto client = MqttClient::getClient().client;
        esp_mqtt_client_register_event(client, (esp_mqtt_event_id_t)ESP_EVENT_ANY_ID, mqtt_event_handler, nullptr);
        esp_mqtt_client_start(client);
    }
}
