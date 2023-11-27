#pragma once 
#include "mqtt_client.h"

namespace mqtt {
    struct MqttClient {
        static MqttClient& getClient() {
            static MqttClient mqtt_client;

            return mqtt_client;
        }
    
        esp_mqtt_client_handle_t client;
        bool connected{};
    };

    void start_mqtt();
}
