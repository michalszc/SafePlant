#include "diode.h"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <iostream>

#define BLINK_GPIO 2

namespace diode {
    void blink_wifi(void* connected) {
        auto connect = reinterpret_cast<bool*>(connected);
        gpio_reset_pin((gpio_num_t)BLINK_GPIO);
        gpio_set_direction((gpio_num_t)BLINK_GPIO, GPIO_MODE_OUTPUT);

        while (true) {
            if (!*connect) {
                bool led_state = true;
                gpio_set_level((gpio_num_t)BLINK_GPIO, led_state);
                vTaskDelay(100 / portTICK_PERIOD_MS);
                led_state = !led_state;
                gpio_set_level((gpio_num_t)BLINK_GPIO, led_state);
                vTaskDelay(100 / portTICK_PERIOD_MS);
            }
            vTaskDelay(100 / portTICK_PERIOD_MS);
        }
    }
}
