#include "mqtt.hpp"
#include "esp_log.h"
#include "esp_event.h"

namespace mqtt {
    
    static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
        auto event = reinterpret_cast<esp_mqtt_event_handle_t>(event_data);
        esp_mqtt_client_handle_t client = event->client;

        switch (static_cast<esp_mqtt_event_id_t>(event_id)) {   
        case MQTT_EVENT_CONNECTED:
            MqttClient::getClient().connected = true;
            esp_mqtt_client_publish(client, "iotaghziecanto", "ziecanto connected", 0, 1, 0);
            esp_mqtt_client_subscribe(client, "iotaghziecanto", 0);
            break;
        
        case MQTT_EVENT_DISCONNECTED:
            MqttClient::getClient().connected = false;
            break;
        
        case MQTT_EVENT_SUBSCRIBED:
            esp_mqtt_client_publish(client, "iotaghziecanto", "ziecanto subscribed", 0, 1, 0);
            break;

        case MQTT_EVENT_ERROR:
            ESP_LOGI("MQTT", "ERROR OCCURED");
            break;
        default:
            ESP_LOGI("MQTT", "I don't know what happened");
        }
    }

    void start_mqtt() {

        esp_mqtt_client_config_t cfg{};
        cfg.broker.address.uri = "mqtt://test.mosquitto.org";

        MqttClient::getClient().client = esp_mqtt_client_init(&cfg);
        auto client = MqttClient::getClient().client;
        esp_mqtt_client_register_event(client, (esp_mqtt_event_id_t)ESP_EVENT_ANY_ID, mqtt_event_handler, nullptr);
        esp_mqtt_client_start(client);
    }
}
