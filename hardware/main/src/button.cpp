#include "button.hpp"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "moisture_sensor.hpp"
#include "dht_handler.hpp"

namespace button {
    void button_task(void* params) {
        gpio_reset_pin(BUTTON);  
        gpio_set_level(BUTTON, 0);
        gpio_set_direction(BUTTON, GPIO_MODE_INPUT);

        while(1) {       
            if (gpio_get_level(BUTTON) != 1) {  
                moisture::no_beep(); 
                dht::no_beep();       
            } 

            vTaskDelay(10);
        }
    }
}
