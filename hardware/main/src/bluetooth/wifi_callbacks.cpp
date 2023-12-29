#include "bluetooth/ble.hpp"
#include "wifi_connection.h"

#include "esp_log.h"
#include <string>
#include <fstream>
#include "esp_spiffs.h"

namespace ble {
    static bool ssid = false;
    static bool pass = false;
    static bool uid = false;

    void default_write_event_handler(esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param, 
        uint16_t profile_num, 
        uint16_t uuid, 
        uint16_t handle,
        uint16_t char_uuid,
        void(*function)(uint8_t*));

    void placeholder(uint8_t* value) {
        ESP_LOGI(GATTS_TAG, "%s\n", value);
    }

    void write_ssid(uint8_t* value) {
        std::string ssid(reinterpret_cast<char*>(value));
        std::ofstream file("/storage/ssid.txt");
        file << ssid;
        file.close();

        ssid = true;
        if (pass && uid) {
            wifi::wifi_connect();
        }
    }

    void write_password(uint8_t* value) {
        std::string pass(reinterpret_cast<char*>(value));
        std::ofstream file("/storage/pass.txt");
        file << pass;
        file.close();

        pass = true;
        if (ssid && uid) {
            wifi::wifi_connect();
        }
    }

    void write_uid(uint8_t* value) {
        std::string uid(reinterpret_cast<char*>(value));
        std::ofstream file("/storage/uid.txt");
        file << uid;
        file.close();

        uid = true;
        if (pass && ssid) {
            wifi::wifi_connect();
        }
    }

    void ssid_event_handler(esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param) 
    {
        default_write_event_handler(event, 
            gatts_if, param, 
            SSID_APP_ID, 
            SSID_UUID, 
            SSID_HANDLE, 
            SSID_CHAR_UUID,
            write_ssid);
    }

    void pass_event_handler(esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param) 
    {
        default_write_event_handler(event, 
            gatts_if, param, 
            PASS_APP_ID, 
            PASS_UUID, 
            PASS_HANDLE, 
            PASS_CHAR_UUID,
            write_password);
    }

    void userid_event_handler(esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param) 
    {
        default_write_event_handler(event, 
            gatts_if, param, 
            USERID_APP_ID, 
            USERID_UUID, 
            USERID_HANDLE, 
            USERID_CHAR_UUID,
            write_uid);
    }

    void default_write_event_handler(esp_gatts_cb_event_t event,
        esp_gatt_if_t gatts_if,
        esp_ble_gatts_cb_param_t *param, 
        uint16_t profile_num, 
        uint16_t uuid, 
        uint16_t handle,
        uint16_t char_uuid,
        void(*function)(uint8_t*)) 
    {
        switch (event)
        {
            case ESP_GATTS_REG_EVT:
                gl_profile_tab[profile_num].service_id.is_primary = true;
                gl_profile_tab[profile_num].service_id.id.inst_id = 0x00;
                gl_profile_tab[profile_num].service_id.id.uuid.len = ESP_UUID_LEN_16;
                gl_profile_tab[profile_num].service_id.id.uuid.uuid.uuid16 = uuid;

                esp_ble_gatts_create_service(gatts_if, &gl_profile_tab[profile_num].service_id, handle);
                break;
            case ESP_GATTS_CREATE_EVT:
                gl_profile_tab[profile_num].service_handle = param->create.service_handle;
                gl_profile_tab[profile_num].char_uuid.len = ESP_UUID_LEN_16;
                gl_profile_tab[profile_num].char_uuid.uuid.uuid16 = char_uuid;

                esp_ble_gatts_start_service(gl_profile_tab[profile_num].service_handle);
                ssid_property = ESP_GATT_CHAR_PROP_BIT_WRITE;
                ESP_ERROR_CHECK(esp_ble_gatts_add_char(gl_profile_tab[profile_num].service_handle,
                                                        &gl_profile_tab[profile_num].char_uuid,
                                                        ESP_GATT_PERM_WRITE,
                                                        ssid_property, nullptr, nullptr));
                break;
            case ESP_GATTS_ADD_CHAR_EVT:
                gl_profile_tab[profile_num].char_handle = param->add_char.attr_handle;
                break;
            case ESP_GATTS_CONNECT_EVT:
                gl_profile_tab[profile_num].conn_id = param->connect.conn_id;
                break;
            case ESP_GATTS_WRITE_EVT:
                function(param->write.value);
                if (param->write.need_rsp){
                    esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
                }    
                break;
            default:
                break;
        }
    }
}
