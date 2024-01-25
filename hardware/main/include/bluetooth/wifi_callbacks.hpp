#pragma once

#include "esp_gatts_api.h"

namespace ble {
    void ssid_event_handler(esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param);

    void pass_event_handler(esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param);

    void userid_event_handler(esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param);

    void activate_wifi();
    void deactivate_wifi();
    
    void activate_new();
    void deactivate_new();

    void activate_uid();
    void deactivate_uid();
}
