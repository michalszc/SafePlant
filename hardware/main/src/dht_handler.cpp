#include "dht_handler.h"
#include "lcd.hpp"

#include <iostream>
#include <dht.h>
#include <chrono>
#include <string>

#include "esp_wifi.h"
#include "rom/ets_sys.h"

namespace dht {
    #define SENSOR_TYPE DHT_TYPE_DHT11
    #define CONFIG_EXAMPLE_DATA_GPIO GPIO_NUM_18

    void dht_test(void *pvParameters)
    {
        float temperature, humidity;

        while (1)
        {
            if (dht_read_float_data(SENSOR_TYPE, CONFIG_EXAMPLE_DATA_GPIO, &humidity, &temperature) == ESP_OK) {
                const auto p1 = std::chrono::system_clock::now();
                std::cout << "Timestamp: " << std::chrono::duration_cast<std::chrono::milliseconds>(p1.time_since_epoch()).count()  << "Humidity: " << humidity << " Temperature: " << temperature << std::endl;
                lcd::Display::get_display().print("Temp: " + std::to_string(static_cast<int>(temperature)) + "\337C", 0, 0);
            }
            else
                std::cout << "Could not read data from sensor!\n";

            vTaskDelay(pdMS_TO_TICKS(2000));
        }
    }
}
