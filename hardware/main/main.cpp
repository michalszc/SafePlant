#include "dht_handler.h"
#include "wifi_connection.h"
#include "diode.hpp"
#include "nvs_flash.h"
#include "moisture_sensor.h"
#include "buzzer.h"
#include "lcd.hpp"
#include "mqtt.hpp"
#include "bluetooth/ble.hpp"
#include "json.hpp"

#include "esp_spiffs.h"
#include "sys/stat.h"
#include <freertos/task.h>
#include <fstream>

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

    // diode::init_rgb();
    // while(true) {
    //     diode::set_color(0,255,0);
    //     vTaskDelay(300 / portTICK_PERIOD_MS);

    //     diode::set_color(0,0,255);
    //     vTaskDelay(300 / portTICK_PERIOD_MS);

    //     diode::set_color(255,0,0);
    //     vTaskDelay(300 / portTICK_PERIOD_MS);

    //     diode::set_color(255,255,0);
    //     vTaskDelay(300 / portTICK_PERIOD_MS);

    //     diode::set_color(255,140,0);
    //     vTaskDelay(300 / portTICK_PERIOD_MS);

    //     diode::set_color(255,20,147);
    //     vTaskDelay(300 / portTICK_PERIOD_MS);

    //     diode::set_color(138,43,226);
    //     vTaskDelay(300 / portTICK_PERIOD_MS);
    // }

    // buzz::prepare();
    xTaskCreate(diode::status_diode, "status", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    xTaskCreate(diode::blink_wifi, "blink_connection", configMINIMAL_STACK_SIZE * 3, nullptr, 5, nullptr);

    struct stat st;
    if (stat("/storage/uid.txt", &st) != 0) {
        // when no user id 

        // run ble service
        diode::set_state(diode::State::PARING);
        wifi::Config::get().sould_connect = wifi::Config::ShouldConnect::FULL;
        ble::start_ble_server();
    } else {
        // when config file

        // read data to configs
        std::ifstream* file = new std::ifstream("/storage/uid.txt");
        std::getline(*file, mqtt::MqttClient::getClient().uid);
        file->close();
        delete file;

        ESP_LOGI("UID", "%s", mqtt::MqttClient::getClient().uid.c_str());

        file = new std::ifstream("/storage/ssid.txt");
        std::getline(*file, wifi::Config::get().ssid);
        file->close();
        delete file;

        file = new std::ifstream("/storage/pass.txt");
        std::getline(*file, wifi::Config::get().pass);
        file->close();
        delete file;

        // connect to wifi
        if (wifi::init_sta() == ESP_OK) {
            // if connection successful run mqtt
            mqtt::MqttClient::getClient().read_cfg();
            mqtt::start_mqtt();
        } else {
            // in other way run ble
            wifi::Config::get().ssid.clear();
            wifi::Config::get().pass.clear();

            diode::set_state(diode::State::PARING);
            wifi::Config::get().sould_connect = wifi::Config::ShouldConnect::PARTIALLY;
            ble::start_ble_server();
        }
    }
    xTaskCreate(dht::dht_test, "dht_test", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    xTaskCreate(moisture::measure_moisture_task, "moisture", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    // buzz::prepare();
    // ESP_ERROR_CHECK(wifi::wifi_connect());
    // xTaskCreate(dht::dht_test, "dht_test", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    // xTaskCreate(moisture::measure_moisture_task, "moisture", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    // ble::start_ble_server();
    // mqtt::start_mqtt();
}
