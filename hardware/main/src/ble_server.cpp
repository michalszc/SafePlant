#include "ble_server.hpp"
#include "moisture_sensor.h"

#include "esp_bt.h"
#include "esp_gap_ble_api.h"
#include "esp_gatt_common_api.h"
#include "esp_bt_main.h"
#include "esp_log.h"


#include <cstring>

namespace ble {
    constexpr uint16_t MOISTURE_APP_ID = 0;
    constexpr char* GATTS_TAG = "GATTS SERVER";
    constexpr size_t PROFILE_NUM = 1;
    constexpr uint16_t MOISTURE_UUID = 0x00ff;
    constexpr uint16_t MOISTURE_CHAR_UUID = 0xff01;
    constexpr uint16_t MOISTURE_HANDLE = 4;
    constexpr uint16_t VAL_LEN_MAX = 0x40;

    static uint8_t char1_str[] = {0x11,0x22,0x33};
    static esp_attr_value_t char1_val = {
        .attr_max_len = VAL_LEN_MAX,
        .attr_len     = sizeof(char1_str),
        .attr_value   = char1_str,
    };

    static uint8_t adv_config_done = 0;
    static esp_gatt_char_prop_t moisture_property = 0;
    constexpr uint8_t ADV_CONFIG_FLAG = 1;
    constexpr uint8_t SCAN_RSP_CONFIG_FLAG = 2;

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
        //.min_interval = 0x0006,
        //.max_interval = 0x0010,
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
        //.peer_addr            =
        //.peer_addr_type       =
        .channel_map        = ADV_CHNL_ALL,
        .adv_filter_policy = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY,
    };

    static void gatts_moisture_event_handler(
        esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param);
    static gatts_profile_inst gl_profile_tab[PROFILE_NUM] = {
        {
            .gatts_cb = gatts_moisture_event_handler,
            .gatts_if = ESP_GATT_IF_NONE
        }
    };

    static void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param);

    static void gatts_event_handler(
        esp_gatts_cb_event_t event, 
        esp_gatt_if_t gatts_if, 
        esp_ble_gatts_cb_param_t *param);
    void start_ble_server() {
        ESP_ERROR_CHECK(esp_bt_controller_mem_release(ESP_BT_MODE_CLASSIC_BT));

        esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
        ESP_ERROR_CHECK(esp_bt_controller_init(&bt_cfg));

        if (esp_bt_controller_enable(ESP_BT_MODE_BLE) != ESP_OK)
        return;

        if (esp_bluedroid_init() != ESP_OK) 
            return;
        
        if (esp_bluedroid_enable() != ESP_OK) 
            return;

        if (esp_ble_gatts_register_callback(gatts_event_handler) != ESP_OK)
            return;
        
        if (esp_ble_gap_register_callback(gap_event_handler) != ESP_OK)
            return;

        if (esp_ble_gatts_app_register(MOISTURE_APP_ID) != ESP_OK)
            return;

        if (esp_ble_gatt_set_local_mtu(500) != ESP_OK)
            ESP_LOGE(GATTS_TAG, "set local  MTU failed");
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

    void register_app_event(
        esp_gatt_if_t gatts_if, 
        esp_ble_gatts_cb_param_t *param, 
        size_t app_id,
        uint16_t uuid,
        uint16_t handle);
    void read_moisture_event(esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param);
    void create_event(esp_ble_gatts_cb_param_t *param);
    void add_characteristic_event(esp_ble_gatts_cb_param_t *param);
    void connect_event(esp_ble_gatts_cb_param_t* param);
    static void gatts_moisture_event_handler(
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
        rsp.attr_value.len = sizeof(massage);
        rsp.attr_value.value[0] = massage;
        esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id,
                                        ESP_GATT_OK, &rsp);
    }

    void create_event(esp_ble_gatts_cb_param_t *param) {
        ESP_LOGI(GATTS_TAG, "CREATE_SERVICE_EVT, status %d,  service_handle %d\n", param->create.status, param->create.service_handle);
        gl_profile_tab[MOISTURE_APP_ID].service_handle = param->create.service_handle;
        gl_profile_tab[MOISTURE_APP_ID].char_uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[MOISTURE_APP_ID].char_uuid.uuid.uuid16 = MOISTURE_CHAR_UUID;

        esp_ble_gatts_start_service(gl_profile_tab[MOISTURE_APP_ID].service_handle);
        moisture_property = ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_NOTIFY;
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
        esp_err_t add_descr_ret = esp_ble_gatts_add_char_descr(gl_profile_tab[MOISTURE_APP_ID].service_handle, &gl_profile_tab[MOISTURE_APP_ID].descr_uuid,
                                                                ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE, NULL, NULL);
        if (add_descr_ret){
            ESP_LOGE(GATTS_TAG, "add char descr failed, error code =%x", add_descr_ret);
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

    static void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param) {
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
        case ESP_GAP_BLE_UPDATE_CONN_PARAMS_EVT:
            ESP_LOGI(GATTS_TAG, "update connection params status = %d, min_int = %d, max_int = %d,conn_int = %d,latency = %d, timeout = %d",
                    param->update_conn_params.status,
                    param->update_conn_params.min_int,
                    param->update_conn_params.max_int,
                    param->update_conn_params.conn_int,
                    param->update_conn_params.latency,
                    param->update_conn_params.timeout);
            break;
        default:
            break;
        }
    }
}

