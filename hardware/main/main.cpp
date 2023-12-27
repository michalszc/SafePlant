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
#include <fstream>
#include <freertos/task.h>

extern "C" void app_main() {
    esp_vfs_spiffs_conf_t cfg = {
        .base_path = "/storage",
        .partition_label = nullptr,
        .max_files = 5,
        .format_if_mount_failed = true
    };

    ESP_ERROR_CHECK(esp_vfs_spiffs_register(&cfg));

    std::fstream file;
    file.open("/storage/test.txt", std::ios::out);
    file << "txt";
    file.close();

    size_t total{}, used{};
    if (esp_spiffs_info(cfg.partition_label, &total, &used) != ESP_OK) {
        ESP_LOGE("tak", "O cholera!");
    } else {
        ESP_LOGI("tak", "%d, %d", total, used);
    }

    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // buzz::prepare();
    // xTaskCreate(diode::blink_wifi, "blink_connection", configMINIMAL_STACK_SIZE * 3, nullptr, 5, nullptr);
    // ESP_ERROR_CHECK(wifi::wifi_connect(nullptr));
    // mqtt::start_mqtt();
    xTaskCreate(dht::dht_test, "dht_test", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    xTaskCreate(moisture::measure_moisture_task, "moisture", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    ble::start_ble_server();
}
