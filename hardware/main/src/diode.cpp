#include "diode.h"
#include "variables.hpp"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

#define BLINK_GPIO 2

namespace diode {
    void blink_wifi(void* connected) {
        gpio_reset_pin((gpio_num_t)BLINK_GPIO);
        gpio_set_direction((gpio_num_t)BLINK_GPIO, GPIO_MODE_OUTPUT);

        while (true) {
            if (!conn) {
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
