#ifndef PCF8574_ab_h
#define PCF8574_ab_h

#include <string>

#include "driver/i2c_master.h"
#include "rom/ets_sys.h"

class LCDDisplay
{
public:
    LCDDisplay(uint8_t colCount, uint8_t rowCount, i2c_master_dev_handle_t handle);
	void begin();
    void clear();
    void home();
    bool set_cursor(uint8_t col, uint8_t row);
    size_t write(char c);
    size_t print(const char* str);
    size_t print(const std::string& str);
    bool set_backlight_enabled(bool isTrue = true);
    bool set_display_enabled(bool isTrue = true);
    bool set_cursor_visible(bool isTrue = true);
    bool set_cursor_blink(bool isTrue = true);

protected:
    size_t send_byte(uint8_t byte);
    void delay_us(int nanoseconds);

    enum SendMode
    {
        DATA    = 0,
        COMMAND = 1
    };
    
    // default pin mapping below
    uint8_t rsPinMask_ = 0b00000001;
    uint8_t rwPinMask_ = 0b00000010;
    uint8_t enPinMask_ = 0b00000100;
    uint8_t blPinMask_ = 0b00001000;
    uint8_t d4PinMask_ = 0b00010000;
    uint8_t d5PinMask_ = 0b00100000;
    uint8_t d6PinMask_ = 0b01000000;
    uint8_t d7PinMask_ = 0b10000000;

    uint8_t colCount_;  /// number of columns
    uint8_t rowCount_;  /// number of rows
    i2c_master_dev_handle_t handle_;

    struct {
        bool display_enabled     : 1;
        bool backlight_enabled   : 1;
        bool cursor_visible      : 1;
        bool cursor_blink        : 1;
        bool increment_mode      : 1;
        bool shift_display       : 1;
    } state_;

    bool update_entry_mode();
    bool update_display_control();
    bool send(SendMode mode, uint8_t data);
    bool send_nibble(SendMode mode, uint8_t data);

};

#endif
