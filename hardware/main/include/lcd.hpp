#pragma once

#include <memory>

#include "lcd_display.h"
#include "rom/ets_sys.h"

namespace lcd {
    LCDDisplay create();
    i2c_master_dev_handle_t init_handle();

    class Display {
    protected:
        Display() : _lcd(create()) {}
        LCDDisplay _lcd;

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
