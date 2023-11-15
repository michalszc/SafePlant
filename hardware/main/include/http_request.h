#pragma once

#include <string>

namespace http::rq {
    void http_get_task(void* pvParameters);
    void get_task(void* connected);
    std::string get(std::string server, std::string path, std::string port);
    int setup_socket(std::string const& server, std::string const& port);
    int set_timeout(int sock, int sec);
}
