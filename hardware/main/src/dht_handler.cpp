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
                timeval tv_now;
                gettimeofday(&tv_now, nullptr);
                auto time_str = std::to_string(tv_now.tv_sec * 1000);
                auto value = std::to_string(static_cast<int>(temperature));
                lcd::Display::get_display().print("Temp: " + value + "\337C", 0, 0);
                std::string info = "{ \"timestamp\":" + time_str + ",\"value\": " + value + "}";
                if (mqtt::MqttClient::getClient().connected) {
                    auto client = mqtt::MqttClient::getClient().client;
                    auto topic = "DATA/"+mqtt::MqttClient::getClient().humidity["id"].get<std::string>();
                    esp_mqtt_client_publish(client, topic.c_str(), info.c_str(), 0, 1, 0);
                } else {
                    std::ofstream file("storage/temperature_data.txt", std::ios::app);
                    file << info << std::endl;
                }
            }

            vTaskDelay(pdMS_TO_TICKS(2000));
        }
    }

    void send_old() {
        auto client = mqtt::MqttClient::getClient().client;
        auto topic = "DATA/"+mqtt::MqttClient::getClient().temperature["id"].get<std::string>();
        std::ifstream file("storage/temperature_data.txt");
        std::string info;
        while (!file.eof()) {
            std::getline(file, info);
            if (!file.empty()) {
                esp_mqtt_client_publish(client, topic.c_str(), info.c_str(), 0, 1, 0);
            }
        }
    }
}
