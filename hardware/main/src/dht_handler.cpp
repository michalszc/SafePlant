#include "dht_handler.h"
#include "lcd.hpp"

#include <dht.h>
#include <string>

#include "esp_timer.h"
#include "esp_wifi.h"
#include "rom/ets_sys.h"
#include "mqtt.hpp"

namespace dht {
    #define SENSOR_TYPE DHT_TYPE_DHT11
    #define CONFIG_EXAMPLE_DATA_GPIO GPIO_NUM_18

    void dht_test(void *pvParameters)
    {
        float temperature, humidity;

        while (true) {
            if (dht_read_float_data(SENSOR_TYPE, CONFIG_EXAMPLE_DATA_GPIO, &humidity, &temperature) == ESP_OK) {
                auto time_str = std::to_string(esp_timer_get_time() / 1000);
                auto value = std::to_string(static_cast<int>(temperature));
                lcd::Display::get_display().print("Temp: " + value + "\337C", 0, 0);
                if (mqtt::MqttClient::getClient().connected) {
                    auto client = mqtt::MqttClient::getClient().client;
                    std::string info = "{ \"timestamp\":" + time_str + ",\"value\": " + value + "}";
                    auto topic = "DATA/"+mqtt::MqttClient::getClient().temperature["id"].get<std::string>();
                    esp_mqtt_client_publish(client, topic.c_str(), info.c_str(), 0, 1, 0);
                }
            }

            vTaskDelay(pdMS_TO_TICKS(2000));
        }
    }
}
