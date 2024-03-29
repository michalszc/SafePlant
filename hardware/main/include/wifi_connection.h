#pragma once

#include "esp_wifi.h"
#include "esp_log.h"
#include "esp_err.h"

#include <string>

namespace wifi {
    esp_err_t init_sta();
    void init();

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
