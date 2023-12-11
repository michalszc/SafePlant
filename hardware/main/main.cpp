#include "dht_handler.h"
#include "wifi_connection.h"
#include "diode.h"
#include "nvs_flash.h"
#include "moisture_sensor.h"
#include "buzzer.h"
#include "lcd.hpp"
#include "mqtt.hpp"
#include "ble_server.hpp"

#include <freertos/task.h>

extern "C" void app_main() {
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // buzz::buzz(nullptr);
    // xTaskCreate(diode::blink_wifi, "blink_connection", configMINIMAL_STACK_SIZE * 3, nullptr, 5, nullptr);
    // ESP_ERROR_CHECK(wifi::wifi_connect(nullptr));
    // mqtt::start_mqtt();
    xTaskCreate(dht::dht_test, "dht_test", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    xTaskCreate(moisture::measure_moisture_task, "moisture", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    ble::start_ble_server();
}
