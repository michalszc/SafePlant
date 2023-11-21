#include "wifi_connection.h"
#include "variables.hpp"

namespace wifi {
    static SemaphoreHandle_t ip_adrr_sph;

    esp_netif_t* wifi_start(void* connected) {
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

        std::cout << "Trying to reconnect!\n";
        esp_err_t err = esp_wifi_connect();
        if (err != ESP_ERR_WIFI_NOT_STARTED)
            return;
        ESP_ERROR_CHECK(err);
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

    esp_err_t wifi_do_connect(wifi_config_t wifi_config, bool wait, void* connected) {
        if (wait) {
            ip_adrr_sph = xSemaphoreCreateBinary();
            if (!ip_adrr_sph) {
                return ESP_ERR_NO_MEM;
            }
        }
        
        ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_DISCONNECTED, &disconnected_handler, connected));
        ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &got_ip_handler, nullptr));
        ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_CONNECTED, &connected_handler, connected));

        std::cout << "Connecting to internet...\n";

        esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
        esp_err_t ret = esp_wifi_connect();
        if (ret != ESP_OK) {
            std::cout << "Failed to connect!\n";
            return ret;
        }
        
        if (wait)
        {
            std::cout << "Waiting for IP!\n";
            xSemaphoreTake(ip_adrr_sph, portMAX_DELAY);
        }
        
        return ESP_OK;
    }

    esp_err_t wifi_connect(void* connected) {
        std::cout << "Started connection\n";

        auto netif = wifi_start(connected);

        wifi_scan_threshold_t threshold = {
            .rssi = -127,
            .authmode = WIFI_AUTH_OPEN
        };

        wifi_config_t wifi_config = {
            .sta = {
                .ssid = "Orange_Swiatlowod_7F90",
                .password = "qnHvc4ZnkvDuqpH6hh",
                .scan_method = WIFI_ALL_CHANNEL_SCAN,
                .sort_method = WIFI_CONNECT_AP_BY_SIGNAL
            }
        };

        wifi_config.sta.threshold = threshold;
        return wifi_do_connect(wifi_config, true, connected);
    }
}
