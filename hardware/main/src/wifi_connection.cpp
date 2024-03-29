#include "wifi_connection.h"
#include "variables.hpp"
#include "bluetooth/services.hpp"

#include <fstream>
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include <cstring>
#include "esp_sntp.h"
#include "esp_netif_sntp.h"
#include "esp_netif_types.h"
#include "diode.hpp"

namespace wifi {
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
                ++Config::get().counter;
                esp_wifi_connect();
            } else {
                xEventGroupSetBits(s_wifi_event_group, BIT1);
            }
        } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
            conn = true;
            ble::deactivate_wifi();
            ip_event_got_ip_t* event = (ip_event_got_ip_t*) event_data;
            Config::get().counter = 0;
            xEventGroupSetBits(s_wifi_event_group, BIT0);
        }
    }

    esp_err_t init_sta() {
        s_wifi_event_group = xEventGroupCreate();

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

        wifi_config_t wifi_config = {
            .sta = {
                .ssid = {},
                .password = {},
                .scan_method = WIFI_ALL_CHANNEL_SCAN,
                .sort_method = WIFI_CONNECT_AP_BY_SIGNAL
            }
        };
    
        memcpy(&wifi_config.sta.ssid, Config::get().ssid.c_str(), Config::get().ssid.size());
        memcpy(&wifi_config.sta.password, Config::get().pass.c_str(), Config::get().pass.size());

        wifi_config.sta.threshold = threshold;
        
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA) );
        ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config) );
        diode::set_state(diode::CONNECTING);
        ESP_ERROR_CHECK(esp_wifi_start() );

        EventBits_t bits = xEventGroupWaitBits(s_wifi_event_group,
                BIT0 | BIT1,
                pdFALSE,
                pdFALSE,
                portMAX_DELAY);

        if (bits & BIT0) {
            conn = true;

            // synchronize time
            esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG("pool.ntp.org");
            esp_netif_sntp_init(&config);

            diode::set_state(diode::State::ERROR);
            return ESP_OK;
        }
        diode::set_state(diode::State::PARING);
        ble::activate_wifi();
        return ESP_ERR_WIFI_NOT_CONNECT;
    }

    void init() {
        esp_netif_create_default_wifi_sta();

        wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
        ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    }
}
