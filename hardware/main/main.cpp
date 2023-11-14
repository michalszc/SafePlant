#include "include/dht_handler.h"
#include "wifi_connection.h"
#include "dioda.h"
#include "http_request.h"
#include "nvs_flash.h"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

extern "C" void app_main() {
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    bool* connected = new bool{false};
    xTaskCreate(diode::blink_wifi, "blink_connection", configMINIMAL_STACK_SIZE * 3, connected, 5, nullptr);
    xTaskCreate(http::rq::get_task, "http_request", configMINIMAL_STACK_SIZE * 3, connected, 5, nullptr);
    ESP_ERROR_CHECK(wifi::wifi_connect(connected));
    // xTaskCreate(dht::dht_test, "dht_test", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
}
