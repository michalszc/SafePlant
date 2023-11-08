#include <iostream>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <dht.h>
#include <chrono>
#include "esp_wifi.h"

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
        }
        else
            std::cout << "Could not read data from sensor!\n";

        vTaskDelay(pdMS_TO_TICKS(2000));
    }
}


extern "C" void app_main() {
    // xTaskCreate(dht_test, "dht_test", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
}
