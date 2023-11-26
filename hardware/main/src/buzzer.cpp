#include "buzzer.h"
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

#define BLINK_GPIO 19

namespace buzz {
    void buzz(void* connected) {
        bool should_peeb{true};
        gpio_reset_pin((gpio_num_t)BLINK_GPIO);
        gpio_set_direction((gpio_num_t)BLINK_GPIO, GPIO_MODE_OUTPUT);
        while (true) {
            if (should_peeb)
                gpio_set_level((gpio_num_t)BLINK_GPIO, 1);
            vTaskDelay(pdMS_TO_TICKS(100));
            gpio_set_level((gpio_num_t)BLINK_GPIO, 0);
            vTaskDelay(pdMS_TO_TICKS(2000));
        }
    }
}
