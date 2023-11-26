# Hardware ⚙️

[![Espressif](https://img.shields.io/badge/espressif-E7352C.svg?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)

Introducing our advanced hardware solution designed to collect data from sensors and transmit it securely to a server using MQTT. With built-in Wi-Fi and Bluetooth connectivity, it provides seamless communication for easy setup and management. It visualises your sensor data at a glance with the LCD screen, putting real-time information at your fingertips. You can also stay informed of the device's status with the RGB LED, which provides intuitive indicators of the device's current status.

## Folder structure
```bash
├── .devcontainer           # Directory with docker-related things
├── .vscode                 # Directory with VS-Code settings
├── main                    # Code directory 
│   └── include             # Header files
│   └── src                 # Source files
│   └── CMakeLists.txt      # CMake file for module
│   └── main.cpp            # Main application entry point
├── .gitignore              # A list of files to ignore when pushing to Github
├── CMakeLists.txt          # Project CMake config
├── README.md               # The readme for the backend
├── script                  # Command to start idf
```