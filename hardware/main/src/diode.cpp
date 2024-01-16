#include "diode.hpp"
#include "variables.hpp"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include "esp_log.h"

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

    void init_rgb() {
        led_ch[0].channel = LEDC_CHANNEL_0;
        led_ch[0].gpio = RED;
        led_ch[0].mode = LEDC_HIGH_SPEED_MODE;
        led_ch[0].timer_index = LEDC_TIMER_0;

        led_ch[1].channel = LEDC_CHANNEL_1;
        led_ch[1].gpio = GREEN;
        led_ch[1].mode = LEDC_HIGH_SPEED_MODE;
        led_ch[1].timer_index = LEDC_TIMER_0;

        led_ch[2].channel = LEDC_CHANNEL_2;
        led_ch[2].gpio = BLUE;
        led_ch[2].mode = LEDC_HIGH_SPEED_MODE;
        led_ch[2].timer_index = LEDC_TIMER_0;

        ledc_timer_config_t timer_cfg = {
            .speed_mode = LEDC_HIGH_SPEED_MODE,
            .duty_resolution = LEDC_TIMER_8_BIT,
            .timer_num = LEDC_TIMER_0,
            .freq_hz = 5000
        };
        ESP_ERROR_CHECK(ledc_timer_config(&timer_cfg));

        for (int i = 0; i < 3; ++i) {
            ledc_channel_config_t channel_cfg = {
                .gpio_num = led_ch[i].gpio,
                .speed_mode = led_ch[i].mode,
                .channel = led_ch[i].channel,
                .intr_type = LEDC_INTR_DISABLE,
                .timer_sel = led_ch[i].timer_index,
                .duty = 0,
                .hpoint = 0,
            };
            ESP_ERROR_CHECK(ledc_channel_config(&channel_cfg));
        }
    }

    static void set_color(uint8_t red, uint8_t green, uint8_t blue) {
        ESP_ERROR_CHECK(ledc_set_duty(led_ch[0].mode, led_ch[0].channel, red));
        ESP_ERROR_CHECK(ledc_update_duty(led_ch[0].mode, led_ch[0].channel));

        ESP_ERROR_CHECK(ledc_set_duty(led_ch[1].mode, led_ch[1].channel, green));
        ESP_ERROR_CHECK(ledc_update_duty(led_ch[1].mode, led_ch[1].channel));

        ESP_ERROR_CHECK(ledc_set_duty(led_ch[2].mode, led_ch[2].channel, blue));
        ESP_ERROR_CHECK(ledc_update_duty(led_ch[2].mode, led_ch[2].channel));
    }

    void set_state(State state) {
        app_state = state;
    }

    void paring() {
        set_color(0, 0, 255);
        vTaskDelay(300 / portTICK_PERIOD_MS);
        set_color(0, 0, 0);
        vTaskDelay(300 / portTICK_PERIOD_MS);
    }

    void connected() {
        set_color(0, 0, 255);
        vTaskDelay(300 / portTICK_PERIOD_MS);
    }

    void works() {
        set_color(0, 255, 0);
        vTaskDelay(300 / portTICK_PERIOD_MS);
    }

    void error() {
        set_color(255, 0, 0);
        vTaskDelay(300 / portTICK_PERIOD_MS);
    }

    void status_diode(void* params) {
        diode::init_rgb();
        while (true) {
            switch (app_state) {
                case State::PARING:
                    paring();
                    break;

                case State::CONNECTED:
                    connected();
                    break;

                case State::WORKING:
                    works();
                    break;

                case State::ERROR:
                    error();
                    break;
                
                default:
                    break;
            }
        }
    }
}
