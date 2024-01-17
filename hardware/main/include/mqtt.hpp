#pragma once 
#include "mqtt_client.h"

#include "json.hpp"

#include <string>

namespace mqtt {
    using json = nlohmann::json;

    struct MqttClient {
        static MqttClient& getClient() {
            static MqttClient mqtt_client;

            return mqtt_client;
        }
    
        esp_mqtt_client_handle_t client;
        json humidity;
        json temperature;
        bool connected{};
    };

    struct Data {
        std::string id;
        int frequency;
        uint8_t min;
        uint8_t max;
    };

    struct Device {
        Data humidity;
        Data temperature;
    };

    void start_mqtt();
}
