#include "mqtt.hpp"
#include "json.hpp"

#include "esp_log.h"
#include "diode.hpp"
#include "esp_event.h"
#include "esp_system.h"
#include <string>
#include "esp_spiffs.h"
#include "sys/stat.h"

namespace mqtt {
    

    void send_old_data() {
        ESP_LOGI("MQTT", "bout to send old data");
        if (mqtt::MqttClient::getClient().temperature.empty() || mqtt::MqttClient::getClient().humidity.empty()) {
            return;
        }
        ESP_LOGI("MQTT", "sendin old data");
        auto client = mqtt::MqttClient::getClient().client;
        auto topic = "DATA/"+mqtt::MqttClient::getClient().temperature["id"].get<std::string>();
        std::ifstream file;
        std::string info;
        struct stat st;
        if (stat("/storage/temperature_data.txt", &st) == 0) {
            file.open("/storage/temperature_data.txt");
            while (!file.eof()) {
                std::getline(file, info);
                if (!info.empty()) {
                    esp_mqtt_client_publish(client, topic.c_str(), info.c_str(), 0, 1, 0);
                }
            }
        }
        file.close();
        std::ofstream p("storage/moisture_data.txt");
        p.close();

        topic = "DATA/"+mqtt::MqttClient::getClient().humidity["id"].get<std::string>();
        if (stat("/storage/moisture_data.txt", &st) == 0) {
            file.open("/storage/moisture_data.txt");
            while (!file.eof()) {
                std::getline(file, info);
                if (!info.empty()) {
                    esp_mqtt_client_publish(client, topic.c_str(), info.c_str(), 0, 1, 0);
                }
            }
        }
        file.close();
        p.open("/storage/moisture_data.txt");
        p.close();
    }

    void update_device(std::string data) {
        using json = nlohmann::json;
        json device = json::parse(data);
        if (device.find("humidity") != device.end()) {
            if (device["humidity"].find("frequency") != device["humidity"].end()) {
                MqttClient::getClient().humidity["frequency"] = device["humidity"]["frequency"]; 
            }

            if (device["humidity"].find("validRange") != device["humidity"].end()) {
                MqttClient::getClient().humidity["validRange"] = device["humidity"]["validRange"]; 
            }
        }

        if (device.find("temperature") != device.end()) {
            if (device["temperature"].find("frequency") != device["temperature"].end()) {
                MqttClient::getClient().temperature["frequency"] = device["temperature"]["frequency"]; 
            }

            if (device["temperature"].find("validRange") != device["temperature"].end()) {
                MqttClient::getClient().temperature["validRange"] = device["temperature"]["validRange"]; 
            }
        }

        std::ofstream* file = new std::ofstream("/storage/moisture.json");
        *file << MqttClient::getClient().humidity;
        file->close();
        file->open("/storage/temperature.json");
        *file << MqttClient::getClient().temperature;
        file->close();
        delete file;
    }

    void recive_msg(const char* msg, size_t msg_len, const char* topic, size_t topic_len, esp_mqtt_client_handle_t client) {
        std::string data(msg, msg_len);
        std::string crop_topic(topic, topic_len);
        ESP_LOGI("MQTT", "Topic: %s", crop_topic.c_str());
        ESP_LOGI("MQTT", "Data: %s", data.c_str());
        std::string uid = mqtt::MqttClient::getClient().uid;
        // std::ifstream* file = new std::ifstream("/storage/uid.txt");
        // std::getline(*file, uid);
        // file->close();
        // delete file;
        if (crop_topic == "REMOVE_DEVICE/"+uid && data == "REMOVE_DEVICE") {
            esp_spiffs_format(nullptr);
            esp_restart();
            return;
        }
        if (crop_topic == "NEW_DEVICE/"+uid) {
            ESP_LOGI("Mqtt", "New device");
            using json = nlohmann::json;
            if (json::accept(data)) {
                ESP_LOGI("Mqtt", "Accpeted");
                json device = json::parse(data);
                json humidity = device["humidity"];
                json temperature = device["temperature"];
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
        if (crop_topic == "UPDATE_DEVICE/"+uid) {
            update_device(data);
        }
    }

    static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
        auto event = reinterpret_cast<esp_mqtt_event_handle_t>(event_data);
        esp_mqtt_client_handle_t client = event->client;

        switch (static_cast<esp_mqtt_event_id_t>(event_id)) {   
        case MQTT_EVENT_CONNECTED: {
            auto uid = MqttClient::getClient().uid;
            ESP_LOGI("MQTT", "Topic: %s", uid.c_str());
            esp_mqtt_client_subscribe(client, ("NEW_DEVICE/"+uid).c_str(), 0);
            esp_mqtt_client_subscribe(client, ("UPDATE_DEVICE/"+uid).c_str(), 0);
            esp_mqtt_client_subscribe(client, ("REMOVE_DEVICE/"+uid).c_str(), 0);
            MqttClient::getClient().connected = true;
            diode::set_state(diode::State::WORKING);
            send_old_data();
        }
            break;
        
        case MQTT_EVENT_DISCONNECTED:
            MqttClient::getClient().connected = false;
            diode::set_state(diode::State::ERROR);
            
            break;
        
        case MQTT_EVENT_SUBSCRIBED:
            // esp_mqtt_client_publish(client, "iot", "subscribed", 0, 1, 0);
            break;

        case MQTT_EVENT_DATA: 
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
        cfg.broker.address.uri = "mqtts://dsz0ispzqb.polandcentral.azurecontainer.io";
        cfg.broker.address.port = 8883;
        cfg.broker.verification.certificate = CA2;
        cfg.broker.verification.certificate_len = sizeof(CA2);
        cfg.credentials.username = "esp";
        cfg.credentials.authentication.password = "";
        cfg.credentials.authentication.certificate = CERT2; 
        cfg.credentials.authentication.certificate_len = sizeof(CERT2);
        cfg.credentials.authentication.key = KEY2;
        cfg.credentials.authentication.key_len = sizeof(KEY2);

        MqttClient::getClient().client = esp_mqtt_client_init(&cfg);
        auto client = MqttClient::getClient().client;
        esp_mqtt_client_register_event(client, (esp_mqtt_event_id_t)ESP_EVENT_ANY_ID, mqtt_event_handler, nullptr);
        esp_mqtt_client_start(client);
    }
}
