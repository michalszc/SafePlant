#include "moisture_sensor.h"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <iostream>
#include <chrono>

#include "esp_log.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"

namespace moisture {
    constexpr auto ATTEN = ADC_ATTEN_DB_11;
    constexpr auto CHANNEL = ADC_CHANNEL_5;

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
        if (ret == ESP_OK) {
            std::cout << "Calibration success!\n";
        } else if (ret == ESP_ERR_NOT_SUPPORTED || !calibrated) {
            std::cout << "eFuse not burnt, skip software calibration!\n";
        } else {
            std::cout << "Invalid arg or no memory!\n";
        }
        
        return calibrated;
    }

    void measure_moisture_task(void* params) {
        constexpr int delay = 1000;
        adc_oneshot_unit_handle_t handle;
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
            measure_moisture(handle);
            vTaskDelay(pdMS_TO_TICKS(delay));
        }
    }

    void measure_moisture(adc_oneshot_unit_handle_t handle) {
        namespace chrono = std::chrono;
        int value;
        const auto p1 = chrono::system_clock::now();
        ESP_ERROR_CHECK(adc_oneshot_read(handle, CHANNEL, &value));
        float moisture = 100.f - (value / 4095.f)*100.f;
        int moisture_percentage = static_cast<int>(moisture);
        std::cout << "Timestamp: " << chrono::duration_cast<chrono::milliseconds>(p1.time_since_epoch()).count();
        std::cout << " Moisture level: " << moisture_percentage << "%\n"; 
    }
}
