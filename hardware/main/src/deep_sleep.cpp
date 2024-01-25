#include "deep_sleep.hpp"
#include "diode.hpp"
#include "esp_sleep.h"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

namespace dsleep {
    void deep(void* params) {
        vTaskDelay(pdMS_TO_TICKS(30000));
        while (true) {
            vTaskDelay(pdMS_TO_TICKS(30000));
            if (diode::get_state() == diode::State::PARING) {
                esp_sleep_enable_timer_wakeup(60 * 1000 * 1000);
                esp_deep_sleep_start();
            }
        }
        
    }
}
