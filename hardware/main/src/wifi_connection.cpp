#include "wifi_connection.h"
#include "variables.hpp"

#include <fstream>
#include "esp_log.h"
#include <cstring>

namespace wifi {
    static SemaphoreHandle_t ip_adrr_sph;
    constexpr size_t MAX_RECONNECT = 5;

    esp_netif_t* wifi_start() {
        wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
        ESP_ERROR_CHECK(esp_wifi_init(&cfg));

        esp_netif_inherent_config_t netif_cfg = ESP_NETIF_INHERENT_DEFAULT_WIFI_STA();
        netif_cfg.if_desc = "wifi station";
        netif_cfg.route_prio = 128;
        esp_netif_t* netif = esp_netif_create_wifi(WIFI_IF_STA, &netif_cfg);
        esp_wifi_set_default_wifi_sta_handlers();

        ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
        ESP_ERROR_CHECK(esp_wifi_start());

        return netif;
    }

    static void disconnected_handler(void* connected, esp_event_base_t event_base, int32_t event_id, void* event_data) {
        conn = false;
        if (Config::get().counter < MAX_RECONNECT) {
            ESP_LOGI("WIFI", "%d", Config::get().counter);
            ++Config::get().counter;
            esp_err_t err = esp_wifi_connect();
            if (err != ESP_ERR_WIFI_NOT_STARTED)
                return;
            ESP_ERROR_CHECK(err);
        } else {
            xEventGroupSetBits(s_wifi_event_group, WIFI_FAIL_BIT);
        }
    }

    static void connected_handler(void* connected, esp_event_base_t event_base, int32_t event_id, void* event_data) {
        conn = true;
    }

    static void got_ip_handler(void* connected, esp_event_base_t event_base, int32_t event_id, void* event_data) {
        ip_event_got_ip_t* event = reinterpret_cast<ip_event_got_ip_t*>(event_data);
        printf("IPv4 address: " IPSTR "\n", IP2STR(&event->ip_info.ip));
        if (ip_adrr_sph)
            xSemaphoreGive(ip_adrr_sph);
    }

    esp_err_t wifi_do_connect(wifi_config_t wifi_config, bool wait) {
        if (wait) {
            ip_adrr_sph = xSemaphoreCreateBinary();
            if (!ip_adrr_sph) {
                return ESP_ERR_NO_MEM;
            }
        }
        
        ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_DISCONNECTED, &disconnected_handler, nullptr));
        ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &got_ip_handler, nullptr));
        ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_CONNECTED, &connected_handler, nullptr));

        esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
        esp_err_t ret = esp_wifi_connect();
        if (ret != ESP_OK) {
            return ret;
        }
        
        if (wait) {
            xSemaphoreTake(ip_adrr_sph, portMAX_DELAY);
        }
        
        return ESP_OK;
    }

    esp_err_t wifi_connect() {

        auto netif = wifi_start();

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
        return wifi_do_connect(wifi_config, true);
    }
}
