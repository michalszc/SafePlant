#pragma once 
#include "mqtt_client.h"

#include "json.hpp"

#include "esp_log.h"
#include <string>
#include <fstream>

namespace mqtt {
    using json = nlohmann::json;

    struct MqttClient {
        static MqttClient& getClient() {
            static MqttClient mqtt_client;

            return mqtt_client;
        }

        esp_mqtt_client_handle_t client;
        std::string uid;
        json humidity;
        json temperature;
        long long time;
        bool connected{};

        void read_cfg() {
            using json = nlohmann::json;
            
            std::ifstream* file = new std::ifstream("/storage/moisture.json");
            MqttClient::getClient().humidity = json::parse(*file);
            delete file;

            file = new std::ifstream("/storage/temperature.json");
            MqttClient::getClient().temperature = json::parse(*file);
            delete file;
        }

        static uint8_t min_moisture() {
            return static_cast<uint8_t>(MqttClient::getClient().humidity["validRange"]["min"].get<float>());
        }

        static uint8_t max_moisture() {
            return static_cast<uint8_t>(MqttClient::getClient().humidity["validRange"]["min"].get<float>());
        }
    };

    void start_mqtt();
}
