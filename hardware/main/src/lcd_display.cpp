#include "lcd_display.h"

namespace {
    constexpr uint8_t INIT_CODE1        = 0b00000011;
    constexpr uint8_t INIT_CODE2        = 0b00000010;

    // Commands
    constexpr uint8_t NO_COMMAND        = 0;
    constexpr uint8_t CLEAR             = 0b00000001;
    constexpr uint8_t HOME              = 0b00000010;
    constexpr uint8_t ENTRY_MODE_SET    = 0b00000100;
    constexpr uint8_t DISPLAY_CONTROL   = 0b00001000;
    constexpr uint8_t CURSOR_SHIFT      = 0b00010000;
    constexpr uint8_t FUNCTION_SET      = 0b00100000;   // Function set command. Pin config is 0 0 1 DL N F - - with DL, N and F set by flags below

    // Bit masks for setting flags in commands
    constexpr uint8_t ENTRY_MODE_SET_ID = 0b00000010;   // Bit high for increment mode, low for decrement mode (left-to-right or right-to-left)
    constexpr uint8_t ENTRY_MODE_SET_S  = 0b00000001;   // Bit high for shift display, low for shift cursor

    constexpr uint8_t DISPLAY_CONTROL_D = 0b00000100;   // Bit high for display on, low for display off
    constexpr uint8_t DISPLAY_CONTROL_C = 0b00000010;   // Bit high for cursor on, low for cursor off
    constexpr uint8_t DISPLAY_CONTROL_B = 0b00000001;   // Bit high for cursor blink on, low for cursor blink off

    constexpr uint8_t FUNCTION_SET_DL   = 0b00010000;   // Bit high for 8-bit mode, low for 4-bit mode
    constexpr uint8_t FUNCTION_SET_N    = 0b00001000;   // Bit high for 2-line mode, low for 1-line mode
    constexpr uint8_t FUNCTION_SET_F    = 0b00000100;   // Bit high for 5x10 font, low for 5x8 font
}


/*** public ***/

LCDDisplay::LCDDisplay(uint8_t colCount, uint8_t rowCount, i2c_master_dev_handle_t handle) 
    : colCount_(colCount), rowCount_(rowCount), handle_(handle)
{
    state_ = {
        .display_enabled     = true,
        .backlight_enabled   = true,
        .cursor_visible      = false,
        .cursor_blink        = false,
        .increment_mode      = true,
        .shift_display       = false
    };
}

void LCDDisplay::begin() {
    // Set all PCF8574 pins to LOW
    send_byte(0x00);
    delay_us(50000);

    /*** Initialization sequence - order specified by HD44780 documentation ***/
    send_nibble(COMMAND, INIT_CODE1);
    delay_us(5000);
    send_nibble(COMMAND, INIT_CODE1);
    delay_us(500);
    send_nibble(COMMAND, INIT_CODE1);
    delay_us(500);
    send_nibble(COMMAND, INIT_CODE2);
    delay_us(500);

    // Set 4-bit mode, 1 or 2-line mode, 5x8 font
    send(COMMAND, FUNCTION_SET | (rowCount_ > 1 ? FUNCTION_SET_N : 0));
    delay_us(250);

    // Set display mode to default values
    update_display_control();
    delay_us(250);

    // Clear display
    send(COMMAND, CLEAR); 
    delay_us(2000);

    // Set entry mode to default values
    update_entry_mode();
    delay_us(250);
}

void LCDDisplay::clear() {
    send(COMMAND, CLEAR); 
    delay_us(2000);
}

void LCDDisplay::home() {
    send(COMMAND, HOME); 
    delay_us(37);
}

bool LCDDisplay::set_cursor(uint8_t col, uint8_t row) {
    switch (row) {
        case 0:
            col |= 0x80;
            break;
        case 1:
            col |= 0xC0;
            break;
    }
    return send(COMMAND, col);
}

size_t LCDDisplay::write(char c) {
	return send(DATA, c);
}

size_t LCDDisplay::print(const char* str) {
    const char* iter;
    for(iter = str; *iter; iter++)
    {
        bool success = write(*iter);
        if(!success)
        {
            break;
        }
    }
    return iter - str;
}

size_t LCDDisplay::print(const std::string& str) {
    return print(str.c_str());
}

bool LCDDisplay::set_backlight_enabled(bool isTrue) {
    state_.backlight_enabled = isTrue;
    return send_nibble(COMMAND, NO_COMMAND);
}

bool LCDDisplay::set_display_enabled(bool isTrue) {
    state_.display_enabled = isTrue;
    return update_display_control();
}

bool LCDDisplay::set_cursor_visible(bool isTrue) {
    state_.cursor_visible = isTrue;
    return update_display_control();
}

bool LCDDisplay::set_cursor_blink(bool isTrue) {
    state_.cursor_blink = isTrue;
    return update_display_control();
}


/*** private ***/

size_t LCDDisplay::send_byte(uint8_t byte) {
    ESP_ERROR_CHECK(i2c_master_transmit(handle_, &byte, sizeof(byte), -1));
    return 1;
}

void LCDDisplay::delay_us(int nanoseconds) {
    ets_delay_us(nanoseconds);
}

bool LCDDisplay::update_entry_mode() {
    uint8_t toSend = ENTRY_MODE_SET 
        | (state_.increment_mode ? ENTRY_MODE_SET_ID : 0) 
        | (state_.shift_display ? ENTRY_MODE_SET_S : 0);
    return send(COMMAND, toSend);
}

bool LCDDisplay::update_display_control() {
    uint8_t toSend = DISPLAY_CONTROL 
        | (state_.display_enabled ? DISPLAY_CONTROL_D : 0) 
        | (state_.cursor_visible ? DISPLAY_CONTROL_C : 0) 
        | (state_.cursor_blink ? DISPLAY_CONTROL_B : 0);
    return send(COMMAND, toSend);
}

bool LCDDisplay::send(SendMode mode, uint8_t data) {
    bool success = send_nibble(mode, (data & 0b11110000) >> 4);
    success = send_nibble(mode, (data & 0b00001111)) && success;
    return success;
}

bool LCDDisplay::send_nibble(SendMode mode, uint8_t data) {
    uint8_t toSend = 0;

    toSend |= (mode == DATA ? rsPinMask_ : 0);
    toSend |= (state_.backlight_enabled ? blPinMask_ : 0);
    

    toSend |= ((data & 0b0001) ? d4PinMask_ : 0);
    toSend |= ((data & 0b0010) ? d5PinMask_ : 0);
    toSend |= ((data & 0b0100) ? d6PinMask_ : 0);
    toSend |= ((data & 0b1000) ? d7PinMask_ : 0);

    send_byte(toSend | enPinMask_);     //send enable pulse
    delay_us(1);                        //enable pulse must be >450ns
    send_byte(toSend);
    return 1;
}
