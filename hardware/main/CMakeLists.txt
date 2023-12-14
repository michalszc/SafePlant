idf_component_register(SRCS "main.cpp" 
                            "src/dht_handler.cpp"
                            "src/wifi_connection.cpp"
                            "src/diode.cpp" 
                            "src/http_request.cpp"
                            "src/moisture_sensor.cpp"
                            "src/buzzer.cpp"
                            "src/LCD_PCF8574_abstraction.cpp"
                            "src/lcd.cpp"
                            "src/mqtt.cpp"
                            "src/ble.cpp"
                        REQUIRES driver esp_adc dht esp_wifi
                        PRIV_REQUIRES nvs_flash mqtt bt
                    INCLUDE_DIRS "./include")
