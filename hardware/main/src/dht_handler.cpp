#include "dht_handler.hpp"
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
            int delay = mqtt::MqttClient::getClient().temperature["frequency"].get<int>() * 1000;
            if (dht_read_float_data(SENSOR_TYPE, CONFIG_EXAMPLE_DATA_GPIO, &humidity, &temperature) == ESP_OK) {
                timeval tv_now;
                gettimeofday(&tv_now, nullptr);
                 auto time = static_cast<long long>(tv_now.tv_sec * 1000 + tv_now.tv_usec / 1000);
                if (time < mqtt::MqttClient::getClient().time) {
                    time += mqtt::MqttClient::getClient().time;
                }
                auto time_str = std::to_string(time);
                auto value = std::to_string(static_cast<int>(temperature));
                lcd::Display::get_display().print("Temp: " + value + "\337C", 0, 0);
                std::string info = "{ \"timestamp\":" + time_str + ",\"value\": " + value + "}";
                if (mqtt::MqttClient::getClient().connected) {
                    auto client = mqtt::MqttClient::getClient().client;
                    auto topic = "DATA/"+mqtt::MqttClient::getClient().temperature["id"].get<std::string>();
                    esp_mqtt_client_publish(client, topic.c_str(), info.c_str(), 0, 1, 0);
                } else {
                    std::ofstream file("/storage/temperature_data.txt", std::ios::app);
                    file << info << std::endl;
                }
            }

            vTaskDelay(pdMS_TO_TICKS(delay));
        }
    }
}
