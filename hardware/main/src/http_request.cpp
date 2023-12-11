#include "http_request.h"
#include "variables.hpp"

#include "esp_system.h"
#include "lwip/sockets.h"
#include "lwip/netdb.h"
#include "lwip/dns.h"
#include "lwip/sys.h"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <iostream>

namespace http::rq {
    void get_task(void* connected) {
        while (true) {
            if (conn) {
                std::cout << get("example.com", "/", "80") << std::endl;
            }
            vTaskDelay(10000 / portTICK_PERIOD_MS);
        }
    }

    std::string get(std::string server, std::string path, std::string port) {
        std::string rq = "GET " + path + " HTTP/1.0\r\n";
        rq += "Host: " + server + "\r\n\r\n"; 

        int sock = setup_socket(server, port);
        if (sock < 0) {
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            return "Filed to establish a socket";
        }

        if (!set_timeout(sock, 5)) {
            return "Filed to set timeout!";
        }

        if (write(sock, rq.c_str(), rq.size()) < 0) {
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            return "Filed to send request";
        }

        std::string result;
        char buf[64];
        int resp_len;
        do {
            bzero(buf, sizeof(buf));
            resp_len = read(sock, buf, sizeof(buf)-1);
            for (int i = 0; i < resp_len; ++i) {
                result += buf[i];
            } 
        } while(resp_len > 0);

        close(sock);

        return result;
    }

    int setup_socket(std::string const& server, std::string const& port) {
        constexpr addrinfo hints ={
            .ai_family = AF_INET,
            .ai_socktype = SOCK_STREAM
        };
        addrinfo* res;

        int error = getaddrinfo(server.c_str(), port.c_str(), &hints, &res);
        if(error || !res) {
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            return -1;
        } 

        int sock = socket(res->ai_family, res->ai_socktype, 0);
        if (sock < 0) {
            freeaddrinfo(res);
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            return -1;
        }

        if (connect(sock, res->ai_addr, res->ai_addrlen)) {
            close(sock);
            freeaddrinfo(res);
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            return -1;
        }
        freeaddrinfo(res);

        return sock;
    }

    int set_timeout(int sock, int sec) {
        timeval timeout;
        timeout.tv_sec = sec;
        timeout.tv_usec = 0;
        if (setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) < 0) {
            close(sock);
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            return 0;
        }
        return 1;
    }
}
