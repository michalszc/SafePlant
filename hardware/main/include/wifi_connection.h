#pragma once

#include "esp_wifi.h"
#include "esp_log.h"
#include "esp_err.h"

#include <string>

namespace wifi {
    esp_netif_t* wifi_start();
    esp_err_t wifi_do_connect(wifi_config_t wifi_config, bool wait, void* connected);
    esp_err_t wifi_connect();

    struct Config {
        std::string ssid;
        std::string pass;
        int counter{};

        static Config& get() {
            static Config cfg;
            return cfg;
        }
    };
}
