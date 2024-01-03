#pragma once

#include "esp_gattc_api.h"

namespace ble {
    void gattc_profile_event_handler(esp_gattc_cb_event_t event, 
        esp_gatt_if_t gattc_if, 
        esp_ble_gattc_cb_param_t *param);
}
