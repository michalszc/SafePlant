#include "buzzer.h"

#define BLINK_GPIO 19

namespace buzz {
    void buzz(void* connected) {
        gpio_reset_pin((gpio_num_t)BLINK_GPIO);
        gpio_set_direction((gpio_num_t)BLINK_GPIO, GPIO_MODE_OUTPUT);
        while (true) {
            gpio_set_level((gpio_num_t)BLINK_GPIO, 1);
        }
    }
}
