#include "moisture_sensor.hpp"
#include "lcd.hpp"
#include "mqtt.hpp"
#include "buzzer.h"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

#include "esp_log.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"
#include "rom/ets_sys.h"
#include "esp_timer.h"

namespace moisture {
    constexpr auto ATTEN = ADC_ATTEN_DB_11;
    constexpr auto CHANNEL = ADC_CHANNEL_5;
    static bool should_peeb = true;

    static adc_oneshot_unit_handle_t handle;

    bool init_adc_calibration(adc_unit_t unit,
                            adc_channel_t channel,
                            adc_atten_t atten,
                            adc_cali_handle_t* out_handle) 
    {
        adc_cali_handle_t handle{};
        esp_err_t ret = ESP_FAIL;
        bool calibrated{};

        if(!calibrated) {
            adc_cali_line_fitting_config_t cfg = {
                .unit_id = unit,
                .atten = atten,
                .bitwidth = ADC_BITWIDTH_DEFAULT
            };
            ret = adc_cali_create_scheme_line_fitting(&cfg, &handle);
            calibrated = (ret == ESP_OK);
        }

        *out_handle = handle;
        
        return calibrated;
    }

    void measure_moisture_task(void* params) {
        adc_oneshot_unit_init_cfg_t init_cfg = {
            .unit_id = ADC_UNIT_1
        };
        ESP_ERROR_CHECK(adc_oneshot_new_unit(&init_cfg, &handle));

        adc_oneshot_chan_cfg_t channel_cfg = {
            .atten = ATTEN,
            .bitwidth = ADC_BITWIDTH_DEFAULT
        };
        ESP_ERROR_CHECK(adc_oneshot_config_channel(handle, CHANNEL, &channel_cfg));

        adc_cali_handle_t channel_handle;
        bool calibrated = init_adc_calibration(ADC_UNIT_1, CHANNEL, ATTEN, &channel_handle);

        while (true) {
            int delay = mqtt::MqttClient::getClient().humidity["frequency"].get<int>() * 1000;
            measure_moisture();
            vTaskDelay(pdMS_TO_TICKS(delay));
        }
    }

    void measure_moisture() {
        uint8_t min = mqtt::MqttClient::getClient().min_moisture();
        uint8_t max = mqtt::MqttClient::getClient().max_moisture();
        timeval tv_now;
        gettimeofday(&tv_now, nullptr);
        auto time = static_cast<long long>(tv_now.tv_sec * 1000 + tv_now.tv_usec / 1000);
        if (time < mqtt::MqttClient::getClient().time) {
            time += mqtt::MqttClient::getClient().time;
        }
        auto time_str = std::to_string(time);
        auto value = get_moisture();
        auto value_str = std::to_string(value);
        lcd::Display::get_display().print("Moisture: " + value_str + "% ", 1, 0);
        std::string info = "{ \"timestamp\":" + time_str + ",\"value\": " + value_str + "}"; 
        if (mqtt::MqttClient::getClient().connected) {
            auto client = mqtt::MqttClient::getClient().client;
            auto topic = "DATA/"+mqtt::MqttClient::getClient().humidity["id"].get<std::string>(); 
            esp_mqtt_client_publish(client, topic.c_str(), info.c_str(), 0, 1, 0);
        } else {
            std::ofstream file("/storage/moisture_data.txt", std::ios::app);
            file << info << std::endl;
        }
        if ((value < min || value > max) && should_peeb) {
            buzz::buzz();
        } else if (!should_peeb && !(value < min || value > max)) {
            should_peeb = true;
        }
        
    }

    uint8_t get_moisture() {
        int value;
        ESP_ERROR_CHECK(adc_oneshot_read(handle, CHANNEL, &value));
        float moisture = 100.f - (value / 4095.f)*100.f;
        return static_cast<uint8_t>(moisture);
    }

    void no_beep() {
        should_peeb = false;
    }
}
