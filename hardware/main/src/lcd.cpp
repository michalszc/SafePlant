#include "lcd.hpp"

namespace lcd {

    // Display* Display::_display = nullptr;

    i2c_master_dev_handle_t init_handle() {
        i2c_master_bus_config_t i2c_mst_config = {
            .i2c_port = I2C_NUM_0,
            .sda_io_num = GPIO_NUM_21,
            .scl_io_num = GPIO_NUM_22,
            .clk_source = I2C_CLK_SRC_DEFAULT,
            .glitch_ignore_cnt = 7,
            .flags = {
                .enable_internal_pullup = false,
            }
        };

        i2c_master_bus_handle_t bus_handle;
        ESP_ERROR_CHECK(i2c_new_master_bus(&i2c_mst_config, &bus_handle));

        i2c_device_config_t dev_cfg = {
            .dev_addr_length = I2C_ADDR_BIT_LEN_7,
            .device_address = 0x27,
            .scl_speed_hz = 100000,
        };

        i2c_master_dev_handle_t dev_handle;
        ESP_ERROR_CHECK(i2c_master_bus_add_device(bus_handle, &dev_cfg, &dev_handle));
        return dev_handle;
    }

    LCD_PCF8574 create() {
        auto handle = init_handle();

        /* Initialize the LCD */
        auto sendByte = [handle](uint8_t data) -> size_t {
            ESP_ERROR_CHECK(i2c_master_transmit(handle, &data, sizeof(data), -1));
            return 1;
        };

        auto delayUs = [](int us) {
            ets_delay_us(us);
        };

        auto lcd = LCD_PCF8574(16, 2, sendByte, delayUs);
        lcd.begin();
        return lcd;
    }

    void Display::print(std::string data, int row, int col) {
        ets_delay_us(100);
        _lcd.setCursor(col, row);
        _lcd.print(data);
        _lcd.setCursorVisible(false);
        _lcd.setCursorBlink(false);
    }

}

