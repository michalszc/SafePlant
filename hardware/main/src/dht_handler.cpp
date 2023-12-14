#include "dht_handler.h"
#include "lcd.hpp"

#include <dht.h>
#include <chrono>
#include <string>

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
                const auto p1 = std::chrono::system_clock::now();
                auto value = std::to_string(static_cast<int>(temperature));
                lcd::Display::get_display().print("Temp: " + value + "\337C", 0, 0);
                if (mqtt::MqttClient::getClient().connected) {
                    auto client = mqtt::MqttClient::getClient().client;
                    std::string info = R"({ "Temperature": )" + value + " }"; 
                    esp_mqtt_client_publish(client, "DATA/321", info.c_str(), 0, 1, 0);
                }
            }

            vTaskDelay(pdMS_TO_TICKS(2000));
        }
    }
}
