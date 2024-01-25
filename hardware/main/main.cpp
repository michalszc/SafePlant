#include "dht_handler.hpp"
#include "wifi_connection.h"
#include "diode.hpp"
#include "nvs_flash.h"
#include "moisture_sensor.hpp"
#include "buzzer.h"
#include "lcd.hpp"
#include "mqtt.hpp"
#include "bluetooth/ble.hpp"
#include "json.hpp"
#include "button.hpp"
#include "ota.hpp"

#include "esp_spiffs.h"
#include "esp_timer.h"
#include "sys/stat.h"
#include <freertos/task.h>
#include <fstream>

void save_time(void* params) {
    while(true) {
        std::ifstream* file = new std::ifstream("/storage/time.txt");
        std::string time;
        std::getline(*file, time);
        delete file;

        timeval tv_now;
        gettimeofday(&tv_now, nullptr);
        auto now = static_cast<long long>(tv_now.tv_sec * 1000); 
        if (time.empty() || now > std::stoll(time)) {
            std::ofstream* file = new std::ofstream("/storage/time.txt");
            *file << now;
            delete file;
            mqtt::MqttClient::getClient().time = now;
        }

        vTaskDelay(60000 / portTICK_PERIOD_MS);
    }
}

void load_time() {
    std::ifstream file("/storage/time.txt");
    std::string time;
    std::getline(file, time);
    if (!time.empty()) {
        mqtt::MqttClient::getClient().time = std::stoll(time);
    }
}

const char* TAG = "HTTP";

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

    // esp_spiffs_format(nullptr);
    // return;

    load_time();
  
    buzz::prepare();
    ble::start_ble_server();
    xTaskCreate(button::button_task, "button", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    xTaskCreate(diode::status_diode, "status", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    xTaskCreate(diode::blink_wifi, "blink_connection", configMINIMAL_STACK_SIZE * 3, nullptr, 5, nullptr);
    xTaskCreate(save_time, "current_time", configMINIMAL_STACK_SIZE * 3, nullptr, 5, nullptr);
    xTaskCreate(ota::task, "ota_update", configMINIMAL_STACK_SIZE * 3, nullptr, 5, nullptr);

    wifi::init();

    struct stat st;
    if (stat("/storage/uid.txt", &st) != 0) {
        // when no user id 

        // run ble service
        diode::set_state(diode::State::PARING);
        ble::start_service(ble::SSID_APP_ID);
        ble::start_service(ble::PASS_APP_ID);
        ble::start_service(ble::USERID_APP_ID);
    } else {
        // when config file

        // read data to configs
        std::ifstream* file = new std::ifstream("/storage/uid.txt");
        std::getline(*file, mqtt::MqttClient::getClient().uid);
        file->close();
        delete file;

        file = new std::ifstream("/storage/ssid.txt");
        std::getline(*file, wifi::Config::get().ssid);
        file->close();
        delete file;

        file = new std::ifstream("/storage/pass.txt");
        std::getline(*file, wifi::Config::get().pass);
        file->close();
        delete file;

        mqtt::MqttClient::getClient().read_cfg();

        // connect to wifi
        if (wifi::init_sta() == ESP_OK) {
            // if connection successful run mqtt
            mqtt::start_mqtt();
        } else {
            // in other way run ble
            wifi::Config::get().ssid.clear();
            wifi::Config::get().pass.clear();

            diode::set_state(diode::State::PARING);
            ble::start_service(ble::SSID_APP_ID);
            ble::start_service(ble::PASS_APP_ID);
        }
    }
    xTaskCreate(dht::dht_test, "dht_test", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
    xTaskCreate(moisture::measure_moisture_task, "moisture", configMINIMAL_STACK_SIZE * 3, NULL, 5, NULL);
}
