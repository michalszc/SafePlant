#pragma once

#include <memory>

#include "driver/i2c_master.h"
#include "LCD_PCF8574_abstraction.h"
#include "rom/ets_sys.h"

namespace lcd {
    LCD_PCF8574 create();
    i2c_master_dev_handle_t init_handle();

    class Display {
    protected:
        Display() : _lcd(create()) {}
        LCD_PCF8574 _lcd;

    public:
        Display(Display&) = delete;
        Display(Display&&) = delete;
        
        static Display& get_display() {
            static Display _display;
            
            return _display;
        }

        void print(std::string data, int row, int col);
    };
}
