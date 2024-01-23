#include "bluetooth/ble.hpp"
#include "esp_log.h"
#include "moisture_sensor.hpp"

#include <cstring>

namespace ble {
    void gatts_moisture_event_handler(
        esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t* param) {
        switch (event) { 
            case ESP_GATTS_REG_EVT:
                register_app_event(
                    gatts_if, 
                    param, 
                    MOISTURE_APP_ID, 
                    MOISTURE_UUID, 
                    MOISTURE_HANDLE);
                break;
            case ESP_GATTS_READ_EVT:
                read_moisture_event(gatts_if, param);
                break;
            case ESP_GATTS_CREATE_EVT:
                create_event(param);
                break;
            case ESP_GATTS_ADD_CHAR_EVT: 
                add_characteristic_event(param);
                break;
            case ESP_GATTS_ADD_CHAR_DESCR_EVT:
                gl_profile_tab[MOISTURE_APP_ID].descr_handle = param->add_char_descr.attr_handle;
                break;
            case ESP_GATTS_CONNECT_EVT: 
                connect_event(param);
                break;
            case ESP_GATTS_DISCONNECT_EVT:
                ESP_LOGI(GATTS_TAG, "ESP_GATTS_DISCONNECT_EVT, disconnect reason 0x%x", param->disconnect.reason);
                esp_ble_gap_start_advertising(&adv_params);
                break;
            case ESP_GATTS_CONF_EVT:
                ESP_LOGI(GATTS_TAG, "ESP_GATTS_CONF_EVT, status %d attr_handle %d", param->conf.status, param->conf.handle);
                if (param->conf.status != ESP_GATT_OK) {
                    esp_log_buffer_hex(GATTS_TAG, param->conf.value, param->conf.len);
                }
                break;
            default:
                break;
        }
    }

    void register_app_event(
        esp_gatt_if_t gatts_if, 
        esp_ble_gatts_cb_param_t *param, 
        size_t app_id,
        uint16_t uuid,
        uint16_t handle) {
        ESP_LOGI(GATTS_TAG, "REGISTER_APP_EVT, status %d, app_id %d\n", param->reg.status, param->reg.app_id);
        gl_profile_tab[app_id].service_id.is_primary = true;
        gl_profile_tab[app_id].service_id.id.inst_id = 0x00;
        gl_profile_tab[app_id].service_id.id.uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[app_id].service_id.id.uuid.uuid.uuid16 = uuid;

        ESP_ERROR_CHECK(esp_ble_gap_set_device_name("SafePlant"));

        ESP_ERROR_CHECK(esp_ble_gap_config_adv_data(&adv_data));
        adv_config_done |= ADV_CONFIG_FLAG;

        ESP_ERROR_CHECK(esp_ble_gap_config_adv_data(&scan_rsp_data));
        adv_config_done |= SCAN_RSP_CONFIG_FLAG;

        esp_ble_gatts_create_service(gatts_if, &gl_profile_tab[app_id].service_id, handle);
    }

    void read_moisture_event(esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
        ESP_LOGI(GATTS_TAG, "GATT_READ_EVT, conn_id %d, trans_id %" PRIu32 ", handle %d\n", param->read.conn_id, param->read.trans_id, param->read.handle);
        esp_gatt_rsp_t rsp{};
        rsp.attr_value.handle = param->read.handle;
        auto massage = moisture::get_moisture();
        auto hundreds = massage / 100;
        auto decims = (massage - hundreds * 100) / 10;
        auto units = massage % 10; 
        rsp.attr_value.len = 4;
        if (hundreds == 0) {
            if (decims == 0){
                rsp.attr_value.len = 2;
                rsp.attr_value.value[0] = units + '0';
                rsp.attr_value.value[1] = '%';
            } else {
                rsp.attr_value.len = 3;
                rsp.attr_value.value[0] = decims + '0';
                rsp.attr_value.value[1] = units + '0';
                rsp.attr_value.value[2] = '%';
            }
        } else {
            rsp.attr_value.value[0] = hundreds + '0';
            rsp.attr_value.value[1] = decims + '0';
            rsp.attr_value.value[2] = units + '0';
            rsp.attr_value.value[3] = '%';
        }
        
        esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id,
                                        ESP_GATT_OK, &rsp);
    }

    void create_event(esp_ble_gatts_cb_param_t *param) {
        ESP_LOGI(GATTS_TAG, "CREATE_SERVICE_EVT, status %d,  service_handle %d\n", param->create.status, param->create.service_handle);
        gl_profile_tab[MOISTURE_APP_ID].service_handle = param->create.service_handle;
        gl_profile_tab[MOISTURE_APP_ID].char_uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[MOISTURE_APP_ID].char_uuid.uuid.uuid16 = MOISTURE_CHAR_UUID;

        esp_ble_gatts_start_service(gl_profile_tab[MOISTURE_APP_ID].service_handle);
        moisture_property = ESP_GATT_CHAR_PROP_BIT_READ;
        ESP_ERROR_CHECK(esp_ble_gatts_add_char(gl_profile_tab[MOISTURE_APP_ID].service_handle, &gl_profile_tab[MOISTURE_APP_ID].char_uuid,
                                                        ESP_GATT_PERM_READ,
                                                        moisture_property,
                                                        &char1_val, NULL));
    }

    void add_characteristic_event(esp_ble_gatts_cb_param_t *param) {
        uint16_t length = 0;
        const uint8_t *prf_char;

        ESP_LOGI(GATTS_TAG, "ADD_CHAR_EVT, status %d,  attr_handle %d, service_handle %d\n",
                param->add_char.status, param->add_char.attr_handle, param->add_char.service_handle);
        gl_profile_tab[MOISTURE_APP_ID].char_handle = param->add_char.attr_handle;
        gl_profile_tab[MOISTURE_APP_ID].descr_uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[MOISTURE_APP_ID].descr_uuid.uuid.uuid16 = ESP_GATT_UUID_CHAR_CLIENT_CONFIG;
        esp_err_t get_attr_ret = esp_ble_gatts_get_attr_value(param->add_char.attr_handle,  &length, &prf_char);
        if (get_attr_ret == ESP_FAIL){
            ESP_LOGE(GATTS_TAG, "ILLEGAL HANDLE");
        }

        ESP_LOGI(GATTS_TAG, "the gatts demo char length = %x\n", length);
        for(int i = 0; i < length; i++){
            ESP_LOGI(GATTS_TAG, "prf_char[%x] =%x\n",i,prf_char[i]);
        }
    }

    void connect_event(esp_ble_gatts_cb_param_t *param) {
        esp_ble_conn_update_params_t conn_params = {0};
        memcpy(conn_params.bda, param->connect.remote_bda, sizeof(esp_bd_addr_t));
        conn_params.latency = 0;
        conn_params.max_int = 0x20;    // max_int = 0x20*1.25ms = 40ms
        conn_params.min_int = 0x10;    // min_int = 0x10*1.25ms = 20ms
        conn_params.timeout = 400;    // timeout = 400*10ms = 4000ms
        ESP_LOGI(GATTS_TAG, "ESP_GATTS_CONNECT_EVT, conn_id %d, remote %02x:%02x:%02x:%02x:%02x:%02x:",
                    param->connect.conn_id,
                    param->connect.remote_bda[0], param->connect.remote_bda[1], param->connect.remote_bda[2],
                    param->connect.remote_bda[3], param->connect.remote_bda[4], param->connect.remote_bda[5]);
        gl_profile_tab[MOISTURE_APP_ID].conn_id = param->connect.conn_id;
        //start sent the update connection parameters to the peer device.
        esp_ble_gap_update_conn_params(&conn_params);
    }
}
