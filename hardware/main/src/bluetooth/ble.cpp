#include "bluetooth/ble.hpp"
#include "moisture_sensor.h"

#include "esp_bt.h"
#include "esp_gatt_common_api.h"
#include "esp_bt_main.h"
#include "esp_log.h"


#include <cstring>

namespace ble {
    static void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param);

    static void gatts_event_handler(
        esp_gatts_cb_event_t event, 
        esp_gatt_if_t gatts_if, 
        esp_ble_gatts_cb_param_t *param);
    static void esp_gattc_cb(esp_gattc_cb_event_t event, esp_gatt_if_t gattc_if, esp_ble_gattc_cb_param_t *param);
    void start_ble_server() {
        ESP_ERROR_CHECK(esp_bt_controller_mem_release(ESP_BT_MODE_CLASSIC_BT));

        esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
        ESP_ERROR_CHECK(esp_bt_controller_init(&bt_cfg));

        if (esp_bt_controller_enable(ESP_BT_MODE_BLE) != ESP_OK) return;
        if (esp_bluedroid_init() != ESP_OK) return;
        if (esp_bluedroid_enable() != ESP_OK) return;
        if (esp_ble_gatts_register_callback(gatts_event_handler) != ESP_OK) return;
        if (esp_ble_gap_register_callback(gap_event_handler) != ESP_OK) return;
        if (esp_ble_gattc_register_callback(esp_gattc_cb) != ESP_OK) return;
        if (esp_ble_gattc_app_register(CLIENT_APP_ID) != ESP_OK) return;
        if (esp_ble_gatts_app_register(MOISTURE_APP_ID) != ESP_OK) return;
        if (esp_ble_gatts_app_register(SSID_APP_ID) != ESP_OK) return;
        if (esp_ble_gatts_app_register(PASS_APP_ID) != ESP_OK) return;
        if (esp_ble_gatts_app_register(USERID_APP_ID) != ESP_OK) return;

        ESP_ERROR_CHECK(esp_ble_gatt_set_local_mtu(500));
    }

    static void gatts_event_handler(
        esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if, 
        esp_ble_gatts_cb_param_t *param) {
        if (event == ESP_GATTS_REG_EVT) {
            if (param->reg.status == ESP_GATT_OK) {
                gl_profile_tab[param->reg.app_id].gatts_if = gatts_if;
            } else {
                ESP_LOGI(GATTS_TAG, "Reg app failed, app_id %04x, status %d\n",
                        param->reg.app_id,
                        param->reg.status);
                return;
            }
        }

        for (int idx = 0; idx < PROFILE_NUM; ++idx) {
            if (gatts_if == ESP_GATT_IF_NONE || gatts_if == gl_profile_tab[idx].gatts_if) {
                if (gl_profile_tab[idx].gatts_cb) {
                    gl_profile_tab[idx].gatts_cb(event, gatts_if, param);
                }
            }
        }
    }

    static void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param) {
        uint8_t *adv_name = nullptr;
        uint8_t adv_name_len = 0;
        switch (event) {
            case ESP_GAP_BLE_ADV_DATA_SET_COMPLETE_EVT:
                adv_config_done &= (~ADV_CONFIG_FLAG);
                if (adv_config_done == 0){
                    esp_ble_gap_start_advertising(&adv_params);
                }
                break;
            case ESP_GAP_BLE_SCAN_RSP_DATA_SET_COMPLETE_EVT:
                adv_config_done &= (~SCAN_RSP_CONFIG_FLAG);
                if (adv_config_done == 0){
                    esp_ble_gap_start_advertising(&adv_params);
                }
                break;
            case ESP_GAP_BLE_ADV_START_COMPLETE_EVT:
                if (param->adv_start_cmpl.status != ESP_BT_STATUS_SUCCESS) {
                    ESP_LOGE(GATTS_TAG, "Advertising start failed\n");
                }
                break;
            case ESP_GAP_BLE_ADV_STOP_COMPLETE_EVT:
                if (param->adv_stop_cmpl.status != ESP_BT_STATUS_SUCCESS) {
                    ESP_LOGE(GATTS_TAG, "Advertising stop failed\n");
                } else {
                    ESP_LOGI(GATTS_TAG, "Stop adv successfully\n");
                }
                break;
            case ESP_GAP_BLE_SCAN_PARAM_SET_COMPLETE_EVT: {
                uint32_t duration = 30;
                esp_ble_gap_start_scanning(duration);
                break;
            }
            case ESP_GAP_BLE_SCAN_START_COMPLETE_EVT:
                if (param->scan_start_cmpl.status != ESP_BT_STATUS_SUCCESS) break;
                ESP_LOGI(GATTC_TAG, "scan start success");
                break;
            case ESP_GAP_BLE_SCAN_RESULT_EVT: 
                show_scann_result(param, adv_name, adv_name_len);
                break; 
            break;
            case ESP_GAP_BLE_UPDATE_CONN_PARAMS_EVT:
                log_conn_params_update(param);
                break;
            default:
                break;
        }
    }

    void log_conn_params_update(esp_ble_gap_cb_param_t *param) {
        ESP_LOGI(GATTS_TAG, "update connection params status = %d, min_int = %d, max_int = %d,conn_int = %d,latency = %d, timeout = %d",
                    param->update_conn_params.status,
                    param->update_conn_params.min_int,
                    param->update_conn_params.max_int,
                    param->update_conn_params.conn_int,
                    param->update_conn_params.latency,
                    param->update_conn_params.timeout);
    }

    void show_scann_result(esp_ble_gap_cb_param_t *param, uint8_t *adv_name, uint8_t& adv_name_len) {
        esp_ble_gap_cb_param_t *scan_result = (esp_ble_gap_cb_param_t *)param;
        switch (scan_result->scan_rst.search_evt) {
            case ESP_GAP_SEARCH_INQ_RES_EVT:
                esp_log_buffer_hex(GATTC_TAG, scan_result->scan_rst.bda, 6);
                ESP_LOGI(GATTC_TAG, "searched Adv Data Len %d, Scan Response Len %d", scan_result->scan_rst.adv_data_len, scan_result->scan_rst.scan_rsp_len);
                adv_name = esp_ble_resolve_adv_data(scan_result->scan_rst.ble_adv,
                                                    ESP_BLE_AD_TYPE_NAME_CMPL, &adv_name_len);
                ESP_LOGI(GATTC_TAG, "searched Device Name Len %d", adv_name_len);
                esp_log_buffer_char(GATTC_TAG, adv_name, adv_name_len);
                ESP_LOGI(GATTC_TAG, "New line:\n");

                if (adv_name) {
                    if (strncmp((char *)adv_name, remote_device_name, sizeof(remote_device_name)-1) == 0) {
                        ESP_LOGI(GATTC_TAG, "searched device %s", remote_device_name);
                        if (!connect) {
                            connect = true;
                            ESP_LOGI(GATTC_TAG, "connect to the remote device.");
                            esp_ble_gap_stop_scanning();
                            esp_ble_gattc_open(gatcc_profiles[CLIENT_APP_ID].gattc_if, scan_result->scan_rst.bda, scan_result->scan_rst.ble_addr_type, true);
                        }
                    }
                }
                break;
            default:
                break;
        }
    }

    static void esp_gattc_cb(esp_gattc_cb_event_t event, 
        esp_gatt_if_t gattc_if, 
        esp_ble_gattc_cb_param_t *param
    ) {
        if (event == ESP_GATTC_REG_EVT) {
            if (param->reg.status == ESP_GATT_OK) {
                gatcc_profiles[param->reg.app_id].gattc_if = gattc_if;
            }
        }

        do {
            int idx;
            for (idx = 0; idx < GC_PROFILE_NUM; idx++) {
                if (gattc_if == ESP_GATT_IF_NONE || 
                        gattc_if == gatcc_profiles[CLIENT_APP_ID].gattc_if) {
                    if (gatcc_profiles[CLIENT_APP_ID].gattc_cb) {
                        gatcc_profiles[CLIENT_APP_ID].gattc_cb(event, gattc_if, param);
                    }
                }
            }
        } while (0);
    }
}
