#pragma once 

#include "esp_gatts_api.h"

namespace ble {
    void gatts_moisture_event_handler(
        esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param);
    void read_moisture_event(esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param);
    void create_event(esp_ble_gatts_cb_param_t *param);
    void add_characteristic_event(esp_ble_gatts_cb_param_t *param);
    void connect_event(esp_ble_gatts_cb_param_t* param);
}
