#include "dht_handler.h"
#include "wifi_connection.h"
#include "diode.h"
#include "nvs_flash.h"
#include "moisture_sensor.h"
#include "buzzer.h"
#include "lcd.hpp"
#include "mqtt.hpp"
#include "bluetooth/ble.hpp"

#include "esp_spiffs.h"
#include <freertos/task.h>

extern "C" void app_main() {
    esp_vfs_spiffs_conf_t cfg = {
        .base_path = "/storage",
        .partition_label = nullptr,
        .max_files = 5,
        .format_if_mount_failed = true
    };

    ESP_ERROR_CHECK(esp_vfs_spiffs_register(&cfg));
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // buzz::prepare();
    xTaskCreate(diode::blink_wifi, "blink_connection", configMINIMAL_STACK_SIZE * 3, nullptr, 5, nullptr);
    // ESP_ERROR_CHECK(wifi::wifi_connect());
    // mqtt::start_mqtt();
    xTaskCreate(dht::dht_test, "dht_test", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    xTaskCreate(moisture::measure_moisture_task, "moisture", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    ble::start_ble_server();
}
