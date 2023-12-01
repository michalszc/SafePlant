#pragma once

#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_oneshot.h"

namespace moisture {
    bool init_adc_calibration(adc_unit_t unit,
                            adc_channel_t channel,
                            adc_atten_t atten,
                            adc_cali_handle_t* out_handle);

    void measure_moisture_task(void* params);
    void measure_moisture(adc_oneshot_unit_handle_t handle);
    uint8_t get_moisture();
}
