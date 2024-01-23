#pragma once

#include "client.hpp"
#include "services.hpp"
#include "esp_gatts_api.h"
#include "esp_gattc_api.h"
#include "esp_gap_ble_api.h"

namespace ble {
    void start_ble_server();

    void register_app_event(
            esp_gatt_if_t gatts_if, 
            esp_ble_gatts_cb_param_t *param, 
            size_t app_id,
            uint16_t uuid,
            uint16_t handle);

    void log_conn_params_update(esp_ble_gap_cb_param_t *param);
    void show_scann_result(esp_ble_gap_cb_param_t *param, uint8_t *adv_name, uint8_t& adv_name_len);

    constexpr char* GATTS_TAG = "GATTS SERVER";
    constexpr char* GATTC_TAG = "GATTC Client";
    
    constexpr char* remote_device_name = "iTAG"; 
    
    constexpr size_t CLIENT_APP_ID = 0;
    constexpr size_t GC_PROFILE_NUM = 1;
    
    constexpr uint16_t VAL_LEN_MAX = 0x40;
    constexpr uint16_t INVALID_HANDLE = 0;
    
    constexpr uint16_t REMOTE_NOTIFY_CHAR_UUID = 0xffe1;
    constexpr uint16_t REMOTE_SERVICE_UUID = 0xffe0;

    constexpr uint8_t ADV_CONFIG_FLAG = 1;
    constexpr uint8_t SCAN_RSP_CONFIG_FLAG = 2;

    inline bool connect = false;
    inline bool get_server = false;
    static esp_gattc_char_elem_t *char_elem_result = nullptr;
    static esp_gattc_descr_elem_t *descr_elem_result = nullptr;
    static uint8_t char1_str[] = {0x11,0x22,0x33};
    static esp_attr_value_t char1_val = {
        .attr_max_len = VAL_LEN_MAX,
        .attr_len     = sizeof(char1_str),
        .attr_value   = char1_str,
    };
    static esp_bt_uuid_t notify_descr_uuid = {
        .len = ESP_UUID_LEN_16,
        .uuid = {.uuid16 = ESP_GATT_UUID_CHAR_CLIENT_CONFIG,},
    };
    static esp_bt_uuid_t remote_filter_service_uuid = {
        .len = ESP_UUID_LEN_16,
        .uuid = {.uuid16 = REMOTE_SERVICE_UUID,},
    };
    static esp_bt_uuid_t remote_filter_char_uuid = {
        .len = ESP_UUID_LEN_16,
        .uuid = {.uuid16 = REMOTE_NOTIFY_CHAR_UUID,},
    };

    static uint8_t adv_config_done = 0;
    static esp_gatt_char_prop_t moisture_property = 0;

    static uint8_t adv_service_uuid128[32] = {
        //first uuid
        0xfb, 0x34, 0x9b, 0x5f, 0x80, 0x00, 0x00, 0x80, 0x00, 0x10, 0x00, 0x00, 0xEE, 0x00, 0x00, 0x00,
        //second uuid
        0xfb, 0x34, 0x9b, 0x5f, 0x80, 0x00, 0x00, 0x80, 0x00, 0x10, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00,
    };
    static esp_ble_adv_data_t adv_data = {
        .set_scan_rsp = false,
        .include_name = true,
        .include_txpower = false,
        .min_interval = 0x0006, 
        .max_interval = 0x0010, 
        .appearance = 0x00,
        .manufacturer_len = 0, 
        .p_manufacturer_data =  nullptr,
        .service_data_len = 0,
        .p_service_data = nullptr,
        .service_uuid_len = sizeof(adv_service_uuid128),
        .p_service_uuid = adv_service_uuid128,
        .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
    };

    static esp_ble_adv_data_t scan_rsp_data = {
        .set_scan_rsp = true,
        .include_name = true,
        .include_txpower = true,
        .appearance = 0x00,
        .manufacturer_len = 0, 
        .p_manufacturer_data =  nullptr, 
        .service_data_len = 0,
        .p_service_data = nullptr,
        .service_uuid_len = sizeof(adv_service_uuid128),
        .p_service_uuid = adv_service_uuid128,
        .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
    };

    static esp_ble_adv_params_t adv_params = {
        .adv_int_min        = 0x20,
        .adv_int_max        = 0x40,
        .adv_type           = ADV_TYPE_IND,
        .own_addr_type      = BLE_ADDR_TYPE_PUBLIC,
        .channel_map        = ADV_CHNL_ALL,
        .adv_filter_policy = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY,
    };


    static esp_ble_scan_params_t ble_scan_params = {
        .scan_type              = BLE_SCAN_TYPE_ACTIVE,
        .own_addr_type          = BLE_ADDR_TYPE_PUBLIC,
        .scan_filter_policy     = BLE_SCAN_FILTER_ALLOW_ALL,
        .scan_interval          = 0x50,
        .scan_window            = 0x30,
        .scan_duplicate         = BLE_SCAN_DUPLICATE_DISABLE
    };
    
    static struct gattc_profile_inst gatcc_profiles[GC_PROFILE_NUM] = {
        {
            .gattc_cb = gattc_profile_event_handler,
            .gattc_if = ESP_GATT_IF_NONE,      
        }
    };
}
