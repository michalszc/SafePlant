#include "dht_handler.hpp"
#include "lcd.hpp"
#include "buzzer.h"

#include <dht.h>
#include <string>

#include "esp_timer.h"
#include "esp_wifi.h"
#include "rom/ets_sys.h"
#include "mqtt.hpp"

namespace dht {
    #define SENSOR_TYPE DHT_TYPE_DHT11
    #define CONFIG_EXAMPLE_DATA_GPIO GPIO_NUM_18
    inline bool should_peeb = true;

    void dht_test(void *pvParameters)
    {
        uint8_t temp;

        while (true) {
            int delay = 1000;
            if (!mqtt::MqttClient::getClient().temperature.empty()) {
                uint8_t min = mqtt::MqttClient::getClient().min_temp();
                uint8_t max = mqtt::MqttClient::getClient().max_temp();
                delay = mqtt::MqttClient::getClient().temperature["frequency"].get<int>() * 1000;
                temp = read_temp();
                if (temp) {
                    timeval tv_now;
                    gettimeofday(&tv_now, nullptr);
                    auto time = static_cast<long long>(tv_now.tv_sec * 1000 + tv_now.tv_usec / 1000);
                    if (time < mqtt::MqttClient::getClient().time) {
                        time += mqtt::MqttClient::getClient().time;
                    }
                    auto time_str = std::to_string(time);
                    auto value = std::to_string(static_cast<int>(temp));
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
                    if ((temp < min || temp > max) && should_peeb) {
                        buzz::buzz();
                    } else if (!should_peeb && !(temp < min || temp > max)) {
                        should_peeb = true;
                    }
                }
            }

            vTaskDelay(pdMS_TO_TICKS(delay));
        }
    }

    uint8_t read_temp() {
        float temperature, humidity;

        if (dht_read_float_data(SENSOR_TYPE, CONFIG_EXAMPLE_DATA_GPIO, &humidity, &temperature) == ESP_OK) {
            return static_cast<uint8_t>(temperature);
        }

        return 0;
    }

    void no_beep() {
        should_peeb = false;
    }
}
