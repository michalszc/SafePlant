#include "bluetooth/ble.hpp"
#include "wifi_connection.h"
#include "mqtt.hpp"

#include "esp_log.h"
#include <string>
#include <fstream>
#include "esp_spiffs.h"

namespace ble {
    static bool is_ssid{};
    static bool is_pass{};
    
    void start_service(uint16_t service_id) {
        esp_ble_gatts_start_service(gl_profile_tab[service_id].service_handle);
    }

    void stop_service(uint16_t service_id) {
        esp_ble_gatts_stop_service(gl_profile_tab[service_id].service_handle);
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

                ESP_ERROR_CHECK(esp_ble_gatts_add_char(gl_profile_tab[profile_num].service_handle,
                                                        &gl_profile_tab[profile_num].char_uuid,
                                                        ESP_GATT_PERM_WRITE,
                                                        ESP_GATT_CHAR_PROP_BIT_WRITE, nullptr, nullptr));
                break;
            case ESP_GATTS_ADD_CHAR_EVT:
                gl_profile_tab[profile_num].char_handle = param->add_char.attr_handle;
                break;
            case ESP_GATTS_CONNECT_EVT:
                gl_profile_tab[profile_num].conn_id = param->connect.conn_id;
                break;
            case ESP_GATTS_WRITE_EVT:
                if (is_ssid && is_pass) {
                    esp_ble_gatts_close(gatts_if, param->connect.conn_id);
                }
                function(param->write.value);
                if (param->write.need_rsp){
                    esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
                }    
                break;
            default:
                break;
        }
    }

    void placeholder(uint8_t* value) {
        ESP_LOGI(GATTS_TAG, "%s\n", value);
    }

    void connect_to_wifi() {
        stop_service(SSID_APP_ID);
        stop_service(PASS_APP_ID);
        if (wifi::init_sta() == ESP_OK) {
            mqtt::start_mqtt();
        }
    }

    void write_ssid(uint8_t* value) {
        std::ofstream* file = new std::ofstream("/storage/ssid.txt");
        *file << std::string(reinterpret_cast<char*>(value));
        file->close();
        delete file;

        wifi::Config::get().ssid = reinterpret_cast<char*>(value);
        if (!wifi::Config::get().pass.empty()) {
            connect_to_wifi();
        }
    }

    void write_password(uint8_t* value) {
        std::ofstream* file = new std::ofstream("/storage/pass.txt");
        *file << std::string(reinterpret_cast<char*>(value));
        file->close();
        delete file;

        wifi::Config::get().pass = reinterpret_cast<char*>(value);
        ESP_LOGI("WIFI", "%s %s", wifi::Config::get().ssid.c_str(), wifi::Config::get().pass.c_str());
        if (!wifi::Config::get().ssid.empty() && !mqtt::MqttClient::getClient().uid.empty()) {
            ESP_LOGI("WIFI", "%s %s", wifi::Config::get().ssid.c_str(), wifi::Config::get().pass.c_str());
            connect_to_wifi();
        }
    }

    void write_uid(uint8_t* value) {
        std::ofstream* file = new std::ofstream("/storage/uid.txt");
        *file << std::string(reinterpret_cast<char*>(value));
        file->close();
        delete file;

        mqtt::MqttClient::getClient().uid = reinterpret_cast<char*>(value);

        if (!wifi::Config::get().ssid.empty() && !wifi::Config::get().pass.empty()) {
            stop_service(USERID_APP_ID);
            connect_to_wifi();
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

    void deactivate_wifi() {
        if (gl_profile_tab[SSID_APP_ID].service_handle) {
            esp_ble_gatts_stop_service(gl_profile_tab[SSID_APP_ID].service_handle);
        }

        if (gl_profile_tab[PASS_APP_ID].service_handle) {
            esp_ble_gatts_stop_service(gl_profile_tab[PASS_APP_ID].service_handle);
        }
    }

    void deactivate_uid() {
        if (gl_profile_tab[USERID_APP_ID].service_handle) {
            esp_ble_gatts_stop_service(gl_profile_tab[USERID_APP_ID].service_handle);
        }
    }

    void activate_wifi() {
        if (gl_profile_tab[SSID_APP_ID].service_handle) {
            esp_ble_gatts_start_service(gl_profile_tab[SSID_APP_ID].service_handle);
        }

        if (gl_profile_tab[PASS_APP_ID].service_handle) {
            esp_ble_gatts_start_service(gl_profile_tab[PASS_APP_ID].service_handle);
        }
    }

    void activate_uid() {
        if (gl_profile_tab[USERID_APP_ID].service_handle) {
            esp_ble_gatts_start_service(gl_profile_tab[USERID_APP_ID].service_handle);
        }
    }

    void activate_new() {
        activate_wifi();
        activate_uid();
    }

    void deactivate_new() {
        deactivate_wifi();
        deactivate_wifi();
    }
}
