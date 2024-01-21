#pragma once
#include "driver/gpio.h"

namespace button {
    constexpr auto BUTTON = static_cast<gpio_num_t>(32);
    void button_task(void* params);
}
