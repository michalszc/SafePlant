#include "buzzer.h"
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

namespace buzz {
    constexpr auto BUZZER_GPIO = static_cast<gpio_num_t>(19); 

    void prepare() {
        gpio_reset_pin(BUZZER_GPIO);
        gpio_set_direction(BUZZER_GPIO, GPIO_MODE_OUTPUT);
    }

    void buzz() {
        gpio_set_level(BUZZER_GPIO, 1);
        vTaskDelay(pdMS_TO_TICKS(100));
        gpio_set_level(BUZZER_GPIO, 0);
    }
}
