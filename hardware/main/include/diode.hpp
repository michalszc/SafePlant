#pragma once
#include "driver/gpio.h"
#include "driver/ledc.h"

namespace diode {
    constexpr auto RED = static_cast<gpio_num_t>(23);
    constexpr auto GREEN = static_cast<gpio_num_t>(5);
    constexpr auto BLUE = static_cast<gpio_num_t>(17);

    struct lcd_info_t {
        gpio_num_t gpio;
        ledc_channel_t channel;
        ledc_mode_t mode;
        ledc_timer_t timer_index;
    };
    static lcd_info_t led_ch[3];

    void blink_wifi(void* connected);
    void init_rgb();
    void rgb_led_connected();
}
