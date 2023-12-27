#pragma once

#include <cstdint>
#include <cstddef>

#include "structs.hpp"
#include "moisture_handler.hpp"
#include "wifi_callbacks.hpp"

namespace ble {
    constexpr size_t PROFILE_NUM = 4;
    constexpr uint16_t MOISTURE_APP_ID = 0;
    constexpr uint16_t SSID_APP_ID = 1;
    constexpr uint16_t PASS_APP_ID = 2;
    constexpr uint16_t USERID_APP_ID = 3;

    constexpr uint16_t MOISTURE_UUID = 0x00ee;
    constexpr uint16_t MOISTURE_CHAR_UUID = 0xee01;
    constexpr uint16_t MOISTURE_HANDLE = 4;

    constexpr uint16_t SSID_UUID = 0x00fe;
    constexpr uint16_t SSID_CHAR_UUID = 0xff00;
    constexpr uint16_t SSID_HANDLE = 4;

    constexpr uint16_t PASS_UUID = 0x00ce;
    constexpr uint16_t PASS_CHAR_UUID = 0xce01;
    constexpr uint16_t PASS_HANDLE = 4;

    constexpr uint16_t USERID_UUID = 0x00de;
    constexpr uint16_t USERID_CHAR_UUID = 0xde01;
    constexpr uint16_t USERID_HANDLE = 4;

    static gatts_profile_inst gl_profile_tab[PROFILE_NUM] = {
        [MOISTURE_APP_ID] = {
            .gatts_cb = gatts_moisture_event_handler,
            .gatts_if = ESP_GATT_IF_NONE
        },
        [SSID_APP_ID] = {
            .gatts_cb = ssid_event_handler,
            .gatts_if = ESP_GATT_IF_NONE
        },
        [PASS_APP_ID] = {
            .gatts_cb = pass_event_handler,
            .gatts_if = ESP_GATT_IF_NONE
        },
        [USERID_APP_ID] = {
            .gatts_cb = userid_event_handler,
            .gatts_if = ESP_GATT_IF_NONE
        }
    };
}
