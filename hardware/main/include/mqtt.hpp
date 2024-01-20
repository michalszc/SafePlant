#pragma once 
#include "mqtt_client.h"

#include "json.hpp"

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
        bool connected{};

        void read_cfg() {
            using json = nlohmann::json;
            
            std::ifstream* file = new std::ifstream("/storage/moisture.json");
            MqttClient::getClient().humidity = json::parse(*file);
            delete file;

            file = new std::ifstream("/storage/temperature.json");
            MqttClient::getClient().humidity = json::parse(*file);
            delete file;
        }
    };

    void start_mqtt();
}
