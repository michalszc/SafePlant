#include "ota.hpp"
#include "wifi_connection.h"
#include "variables.hpp"

#include <string>

#include "esp_http_client.h"
#include "esp_ota_ops.h"
#include "esp_https_ota.h"
#include "json.hpp"
#include "esp_system.h"
#include "esp_log.h"
#include <freertos/task.h>

namespace ota {
    constexpr char* url = "http://iotstorage2137.file.core.windows.net/ota/info.json";
    constexpr char* url_params = "?sv=2022-11-02&ss=f&srt=o&sp=r&se=2024-02-25T03:53:52Z&st=2024-01-24T19:53:52Z&spr=https,http&sig=PlSwKhkm67fvXq6AVF7764yvHbjgXJjZs%2BsOKRzQg9w%3D";

    void perform_update(esp_http_client_event_t *evt) {
        ESP_LOGI("HTTP", "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);
        if (!esp_http_client_is_chunked_response(evt->client)) {
            std::string data(reinterpret_cast<char*>(evt->data), evt->data_len);
            using json = nlohmann::json;
            json cfg = json::parse(data);
            // Process the data received from the server
            if (cfg["version"].get<std::string>() <= "0.0.3") {
                ESP_LOGI("HTTP", "Not a newer version");
                return;
            }
            std::string url = cfg["url"].get<std::string>() + url_params; 
            esp_http_client_config_t config = {
                .url = url.c_str()
            };

            esp_https_ota_config_t ota_config = {
                .http_config = &config,
            };

            esp_err_t ret = esp_https_ota(&ota_config);
            if (ret == ESP_OK) {
                ESP_LOGI("HTTP", "Firmware update downloaded, restarting...");
                esp_restart();
            } else {
                ESP_LOGE("HTTP", "OTA failed");
            }
        }
    }

    esp_err_t _http_event_handler(esp_http_client_event_t *evt) {
        switch (evt->event_id) {
            case HTTP_EVENT_ERROR:
                ESP_LOGI("HTTP", "HTTP_EVENT_ERROR");
                break;
            case HTTP_EVENT_ON_CONNECTED:
                ESP_LOGI("HTTP", "HTTP_EVENT_ON_CONNECTED");
                break;
            case HTTP_EVENT_HEADER_SENT:
                ESP_LOGI("HTTP", "HTTP_EVENT_HEADER_SENT");
                break;
            case HTTP_EVENT_ON_HEADER:
                ESP_LOGI("HTTP", "HTTP_EVENT_ON_HEADER, key=%s, value=%s", evt->header_key, evt->header_value);
                break;
            case HTTP_EVENT_ON_DATA: 
                perform_update(evt);
                break;
            case HTTP_EVENT_ON_FINISH:
                ESP_LOGI("HTTP", "HTTP_EVENT_ON_FINISH");
                break;
            case HTTP_EVENT_DISCONNECTED:
                ESP_LOGI("HTTP", "HTTP_EVENT_DISCONNECTED");
                break;
            default:
                break;
        }
        return ESP_OK;
    }

    void task(void* params) {
        while (true) {
                if (conn) {
                std::string url_str = std::string(url) + url_params;
                esp_http_client_config_t config = {
                    .url = url_str.c_str(),
                    .event_handler = _http_event_handler,
                };

                esp_http_client_handle_t client = esp_http_client_init(&config);
                esp_err_t err = esp_http_client_perform(client);

                esp_http_client_cleanup(client);
            }
            vTaskDelay(pdMS_TO_TICKS(10000));
        }
    }
}
