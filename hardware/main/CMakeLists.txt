idf_component_register(SRCS "main.cpp" 
                            "src/dht_handler.cpp"
                            "src/wifi_connection.cpp"
                            "src/diode.cpp" 
                            "src/moisture_sensor.cpp"
                            "src/buzzer.cpp"
                            "src/lcd_display.cpp"
                            "src/lcd.cpp"
                            "src/mqtt.cpp"
                            "src/bluetooth/ble.cpp"
                            "src/bluetooth/wifi_callbacks.cpp"
                            "src/bluetooth/moisture_callback.cpp"
                            "src/bluetooth/client.cpp"
                            "src/button.cpp"
                            "src/ota.cpp"
                            "src/deep_sleep.cpp"
                        REQUIRES driver esp_adc dht esp_wifi lwip esp_netif esp_http_client
                        PRIV_REQUIRES nvs_flash mqtt bt spiffs app_update esp_https_ota
                    INCLUDE_DIRS "./include")
