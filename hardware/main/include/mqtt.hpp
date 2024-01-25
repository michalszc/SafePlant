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
            std::string str((std::istreambuf_iterator<char>(*file)),
                 std::istreambuf_iterator<char>());
            ESP_LOGI("CONFIG", "%s", str.c_str());
            if (json::accept(str)) {
                MqttClient::getClient().humidity = json::parse(str);
            }
            delete file;

            file = new std::ifstream("/storage/temperature.json");
            str = std::string((std::istreambuf_iterator<char>(*file)),
                 std::istreambuf_iterator<char>());
            ESP_LOGI("CONFIG", "%s", str.c_str());
            if (json::accept(str)) {
                MqttClient::getClient().temperature = json::parse(str);
            }
            delete file;
        }

        static uint8_t min_moisture() {
            return static_cast<uint8_t>(MqttClient::getClient().humidity["validRange"]["min"].get<int>());
        }

        static uint8_t max_moisture() {
            return static_cast<uint8_t>(MqttClient::getClient().humidity["validRange"]["max"].get<int>());
        }
    };

    void start_mqtt();
}
