#include "wifi_connection.h"
#include "variables.hpp"

#include <fstream>
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include <cstring>

namespace wifi {
    static SemaphoreHandle_t ip_adrr_sph;
    static EventGroupHandle_t s_wifi_event_group;
    constexpr size_t MAX_RECONNECT = 3;

    static void event_handler(void* arg, esp_event_base_t event_base,
                                int32_t event_id, void* event_data)
    {
        if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
            esp_wifi_connect();
        } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
            conn = false;
            if (Config::get().counter < MAX_RECONNECT) {
                esp_wifi_connect();
                ++Config::get().counter;
            } else {
                xEventGroupSetBits(s_wifi_event_group, BIT1);
            }
        } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
            ip_event_got_ip_t* event = (ip_event_got_ip_t*) event_data;
            Config::get().counter = 0;
            xEventGroupSetBits(s_wifi_event_group, BIT0);
        }
    }

    esp_err_t init_sta() {
        s_wifi_event_group = xEventGroupCreate();
        esp_netif_create_default_wifi_sta();

        wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
        ESP_ERROR_CHECK(esp_wifi_init(&cfg));

        esp_event_handler_instance_t instance_any_id;
        esp_event_handler_instance_t instance_got_ip;
        ESP_ERROR_CHECK(
            esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &event_handler, NULL, &instance_any_id));
        ESP_ERROR_CHECK(
            esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &event_handler, NULL, &instance_got_ip));

        wifi_scan_threshold_t threshold = {
            .rssi = -127,
            .authmode = WIFI_AUTH_OPEN
        };

        std::string ssid, pass;
        std::ifstream* file = new std::ifstream("/storage/ssid.txt");
        std::getline(*file, ssid);
        file->close();
        file->open("/storage/pass.txt");
        std::getline(*file, pass);
        file->close();
        delete file;

        wifi_config_t wifi_config = {
            .sta = {
                .ssid = {},
                .password = {},
                .scan_method = WIFI_ALL_CHANNEL_SCAN,
                .sort_method = WIFI_CONNECT_AP_BY_SIGNAL
            }
        };

        memcpy(&wifi_config.sta.ssid, Config::get().ssid.c_str(), ssid.size());
        memcpy(&wifi_config.sta.password, Config::get().ssid.c_str(), pass.size());

        wifi_config.sta.threshold = threshold;
        
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA) );
        ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config) );
        ESP_ERROR_CHECK(esp_wifi_start() );

        EventBits_t bits = xEventGroupWaitBits(s_wifi_event_group,
                BIT0 | BIT1,
                pdFALSE,
                pdFALSE,
                portMAX_DELAY);

        if (bits & BIT0) {
            conn = true;
            return ESP_OK;
        }
        return ESP_ERR_WIFI_NOT_CONNECT;
    }
}
