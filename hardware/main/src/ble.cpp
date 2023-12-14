#include "ble.hpp"
#include "moisture_sensor.h"

#include "esp_bt.h"
#include "esp_gatt_common_api.h"
#include "esp_bt_main.h"
#include "esp_log.h"


#include <cstring>

namespace ble {
    constexpr uint16_t MOISTURE_APP_ID = 0;
    constexpr char* GATTS_TAG = "GATTS SERVER";
    constexpr char* GATTC_TAG = "GATTC Client";
    constexpr char* remote_device_name = "iTAG"; 
    constexpr size_t PROFILE_NUM = 1;
    constexpr size_t CLIENT_APP_ID = 0;
    constexpr size_t GC_PROFILE_NUM = 1;
    constexpr uint16_t MOISTURE_UUID = 0x00ff;
    constexpr uint16_t MOISTURE_CHAR_UUID = 0xff01;
    constexpr uint16_t MOISTURE_HANDLE = 4;
    constexpr uint16_t VAL_LEN_MAX = 0x40;
    constexpr uint16_t INVALID_HANDLE = 0;
    constexpr uint16_t REMOTE_NOTIFY_CHAR_UUID = 0xffe1;
    constexpr uint16_t REMOTE_SERVICE_UUID = 0xffe0;

    static bool connect = false;
    static bool get_server = false;
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


    static esp_ble_scan_params_t ble_scan_params = {
        .scan_type              = BLE_SCAN_TYPE_ACTIVE,
        .own_addr_type          = BLE_ADDR_TYPE_PUBLIC,
        .scan_filter_policy     = BLE_SCAN_FILTER_ALLOW_ALL,
        .scan_interval          = 0x50,
        .scan_window            = 0x30,
        .scan_duplicate         = BLE_SCAN_DUPLICATE_DISABLE
    };
    static void gattc_profile_event_handler(esp_gattc_cb_event_t event, 
        esp_gatt_if_t gattc_if, 
        esp_ble_gattc_cb_param_t *param);
    static struct gattc_profile_inst gatcc_profiles[GC_PROFILE_NUM] = {
        {
            .gattc_cb = gattc_profile_event_handler,
            .gattc_if = ESP_GATT_IF_NONE,      
        }
    };

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
        // if (esp_ble_gatts_register_callback(gatts_event_handler) != ESP_OK) return;
        if (esp_ble_gap_register_callback(gap_event_handler) != ESP_OK) return;
        if (esp_ble_gattc_register_callback(esp_gattc_cb) != ESP_OK) return;
        if (esp_ble_gattc_app_register(CLIENT_APP_ID) != ESP_OK) return;
        // if (esp_ble_gatts_app_register(MOISTURE_APP_ID) != ESP_OK) return;

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
                if (gattc_if == ESP_GATT_IF_NONE || /* ESP_GATT_IF_NONE, not specify a certain gatt_if, need to call every profile cb function */
                        gattc_if == gatcc_profiles[CLIENT_APP_ID].gattc_if) {
                    if (gatcc_profiles[CLIENT_APP_ID].gattc_cb) {
                        gatcc_profiles[CLIENT_APP_ID].gattc_cb(event, gattc_if, param);
                    }
                }
            }
        } while (0);
    }

    static void gattc_profile_event_handler(esp_gattc_cb_event_t event, 
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
