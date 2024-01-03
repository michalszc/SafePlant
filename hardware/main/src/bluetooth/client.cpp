#include "bluetooth/ble.hpp"
#include "moisture_sensor.h"

#include "esp_log.h"
#include <cstring>

namespace ble {
    void gattc_profile_event_handler(esp_gattc_cb_event_t event, 
        esp_gatt_if_t gattc_if, 
        esp_ble_gattc_cb_param_t *param
    ) {
        esp_ble_gattc_cb_param_t *p_data = (esp_ble_gattc_cb_param_t *)param;

        switch (event) {
            case ESP_GATTC_REG_EVT:
                ESP_ERROR_CHECK(esp_ble_gap_set_scan_params(&ble_scan_params));
                break;
            case ESP_GATTC_CONNECT_EVT:{
                ESP_LOGI(GATTC_TAG, "ESP_GATTC_CONNECT_EVT conn_id %d, if %d", p_data->connect.conn_id, gattc_if);
                gatcc_profiles[CLIENT_APP_ID].conn_id = p_data->connect.conn_id;
                memcpy(gatcc_profiles[CLIENT_APP_ID].remote_bda, p_data->connect.remote_bda, sizeof(esp_bd_addr_t));
                ESP_LOGI(GATTC_TAG, "REMOTE BDA:");
                esp_log_buffer_hex(GATTC_TAG, gatcc_profiles[CLIENT_APP_ID].remote_bda, sizeof(esp_bd_addr_t));
                ESP_ERROR_CHECK(esp_ble_gattc_send_mtu_req (gattc_if, p_data->connect.conn_id));
                break;
            }
            case ESP_GATTC_OPEN_EVT:
                if (param->open.status != ESP_GATT_OK) break;
                ESP_LOGI(GATTC_TAG, "open success");
                break;
            case ESP_GATTC_DIS_SRVC_CMPL_EVT:
                if (param->dis_srvc_cmpl.status != ESP_GATT_OK) break;
                ESP_LOGI(GATTC_TAG, "discover service complete conn_id %d", param->dis_srvc_cmpl.conn_id);
                esp_ble_gattc_search_service(gattc_if, param->cfg_mtu.conn_id, &remote_filter_service_uuid);
                break;
            case ESP_GATTC_CFG_MTU_EVT:
                ESP_LOGI(GATTC_TAG, "ESP_GATTC_CFG_MTU_EVT, Status %d, MTU %d, conn_id %d", param->cfg_mtu.status, param->cfg_mtu.mtu, param->cfg_mtu.conn_id);
                break;
            case ESP_GATTC_SEARCH_RES_EVT: {
                if (p_data->search_res.srvc_id.uuid.len == ESP_UUID_LEN_16 && p_data->search_res.srvc_id.uuid.uuid.uuid16 == REMOTE_SERVICE_UUID) {
                    ESP_LOGI(GATTC_TAG, "service found");
                    get_server = true;
                    gatcc_profiles[CLIENT_APP_ID].service_start_handle = p_data->search_res.start_handle;
                    gatcc_profiles[CLIENT_APP_ID].service_end_handle = p_data->search_res.end_handle;
                    ESP_LOGI(GATTC_TAG, "UUID16: %x", p_data->search_res.srvc_id.uuid.uuid.uuid16);
                }
                break;
            }
            case ESP_GATTC_SEARCH_CMPL_EVT:
                if (p_data->search_cmpl.status != ESP_GATT_OK){
                    ESP_LOGE(GATTC_TAG, "search service failed, error status = %x", p_data->search_cmpl.status);
                    break;
                }
                
                ESP_LOGI(GATTC_TAG, "ESP_GATTC_SEARCH_CMPL_EVT");
                if (get_server){
                    uint16_t count = 0;
                    ESP_ERROR_CHECK(esp_ble_gattc_get_attr_count(gattc_if,
                                                                p_data->search_cmpl.conn_id,
                                                                ESP_GATT_DB_CHARACTERISTIC,
                                                                gatcc_profiles[CLIENT_APP_ID].service_start_handle,
                                                                gatcc_profiles[CLIENT_APP_ID].service_end_handle,
                                                                INVALID_HANDLE,
                                                                &count));

                    if (count > 0){
                        char_elem_result = (esp_gattc_char_elem_t *)malloc(sizeof(esp_gattc_char_elem_t) * count);
                        if (char_elem_result) {
                            ESP_ERROR_CHECK(esp_ble_gattc_get_char_by_uuid( gattc_if,
                                                                    p_data->search_cmpl.conn_id,
                                                                    gatcc_profiles[CLIENT_APP_ID].service_start_handle,
                                                                    gatcc_profiles[CLIENT_APP_ID].service_end_handle,
                                                                    remote_filter_char_uuid,
                                                                    char_elem_result,
                                                                    &count));

                            /*  Every service have only one char in our 'ESP_GATTS_DEMO' demo, so we used first 'char_elem_result' */
                            if (count > 0 && (char_elem_result[0].properties & ESP_GATT_CHAR_PROP_BIT_NOTIFY)){
                                gatcc_profiles[CLIENT_APP_ID].char_handle = char_elem_result[0].char_handle;
                                esp_ble_gattc_register_for_notify (gattc_if, gatcc_profiles[CLIENT_APP_ID].remote_bda, char_elem_result[0].char_handle);
                            }
                        }
                        /* free char_elem_result */
                        free(char_elem_result);
                    }else{
                        ESP_LOGE(GATTC_TAG, "no char found");
                    }
                }
                break;
            case ESP_GATTC_REG_FOR_NOTIFY_EVT: {
                ESP_LOGI(GATTC_TAG, "ESP_GATTC_REG_FOR_NOTIFY_EVT");
                if (p_data->reg_for_notify.status == ESP_GATT_OK) {
                    uint16_t count = 0;
                    uint16_t notify_en = 1;
                    esp_gatt_status_t ret_status = esp_ble_gattc_get_attr_count( gattc_if,
                                                                                gatcc_profiles[CLIENT_APP_ID].conn_id,
                                                                                ESP_GATT_DB_DESCRIPTOR,
                                                                                gatcc_profiles[CLIENT_APP_ID].service_start_handle,
                                                                                gatcc_profiles[CLIENT_APP_ID].service_end_handle,
                                                                                gatcc_profiles[CLIENT_APP_ID].char_handle,
                                                                                &count);
                    if (ret_status != ESP_GATT_OK){
                        ESP_LOGE(GATTC_TAG, "esp_ble_gattc_get_attr_count error");
                    }
                    if (count > 0){
                        descr_elem_result = new esp_gattc_descr_elem_t[count];
                        if (!descr_elem_result){
                            ESP_LOGE(GATTC_TAG, "malloc error, gattc no mem");
                        }else{
                            ESP_ERROR_CHECK(esp_ble_gattc_get_descr_by_char_handle( gattc_if,
                                                                                gatcc_profiles[CLIENT_APP_ID].conn_id,
                                                                                p_data->reg_for_notify.handle,
                                                                                notify_descr_uuid,
                                                                                descr_elem_result,
                                                                                &count));
                            /* Every char has only one descriptor in our 'ESP_GATTS_DEMO' demo, so we used first 'descr_elem_result' */
                            if (count > 0 && descr_elem_result[0].uuid.len == ESP_UUID_LEN_16 && descr_elem_result[0].uuid.uuid.uuid16 == ESP_GATT_UUID_CHAR_CLIENT_CONFIG){
                                ESP_ERROR_CHECK(esp_ble_gattc_write_char_descr( gattc_if,
                                                                            gatcc_profiles[CLIENT_APP_ID].conn_id,
                                                                            descr_elem_result[0].handle,
                                                                            sizeof(notify_en),
                                                                            (uint8_t *)&notify_en,
                                                                            ESP_GATT_WRITE_TYPE_RSP,
                                                                            ESP_GATT_AUTH_REQ_NONE));
                            }
                            /* free descr_elem_result */
                            delete[] descr_elem_result;
                        }
                    }
                    else{
                        ESP_LOGE(GATTC_TAG, "decsr not found");
                    }

                }
                break;
            }
            case ESP_GATTC_NOTIFY_EVT:
                moisture::no_beep();
                break;
            case ESP_GATTC_SRVC_CHG_EVT: {
                esp_bd_addr_t bda;
                memcpy(bda, p_data->srvc_chg.remote_bda, sizeof(esp_bd_addr_t));
                ESP_LOGI(GATTC_TAG, "ESP_GATTC_SRVC_CHG_EVT, bd_addr:");
                esp_log_buffer_hex(GATTC_TAG, bda, sizeof(esp_bd_addr_t));
                break;
            }
            case ESP_GATTC_WRITE_CHAR_EVT:
                if (p_data->write.status != ESP_GATT_OK){
                    ESP_LOGE(GATTC_TAG, "write char failed, error status = %x", p_data->write.status);
                    break;
                }
                ESP_LOGI(GATTC_TAG, "write char success ");
                break;
            case ESP_GATTC_DISCONNECT_EVT: {
                connect = false;
                get_server = false;

                uint32_t duration = 30;
                esp_ble_gap_start_scanning(duration);

                break;
            }
            default:
                break;
        }
    }
} 

