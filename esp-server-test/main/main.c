#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_wifi.h"
#include "esp_event_loop.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_http_client.h"
#include "driver/adc.h"

#define WIFI_SSID "Pandora_2G"
#define WIFI_PASS "sol2609!"

static const char *TAG = "wifi_station";

/* FreeRTOS event group to signal when we are connected */
static EventGroupHandle_t wifi_event_group;

/* The event group allows multiple bits for each event, but we only care about one event:
 * - we are connected to the AP with an IP */
const int CONNECTED_BIT = BIT0;

// Função para enviar POST
void send_humidity_post(float humidity) {
    int humidity_int = (int)(humidity * 10); // Multiplique por 10 para manter uma casa decimal

    ESP_LOGI(TAG, "Valor de humidity antes do JSON: %.1f", humidity);

    char post_data[256]; // Buffer suficiente para o JSON
    int json_length = snprintf(post_data, sizeof(post_data), "{\"humidity\": %d.%d}", humidity_int / 10, humidity_int % 10);

    if (json_length < 0 || json_length >= sizeof(post_data)) {
        ESP_LOGE(TAG, "Erro ao construir JSON, tamanho excedido ou inválido.");
        return;
    }
    ESP_LOGI(TAG, "JSON construído: %s", post_data);

    esp_http_client_config_t config = {
        .url = "http://192.168.0.99:3000/api/humidity",
        .method = HTTP_METHOD_POST,
    };
    esp_http_client_handle_t client = esp_http_client_init(&config);

    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, post_data, strlen(post_data));

    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        int status_code = esp_http_client_get_status_code(client);
        ESP_LOGI(TAG, "POST enviado com sucesso. Status: %d", status_code);
    } else {
        ESP_LOGE(TAG, "Falha ao enviar POST: %s", esp_err_to_name(err));
    }

    esp_http_client_cleanup(client);
}

// Tarefa para ler o ADC e enviar POST periodicamente
void adc_task(void *pvParameters) {
    while (1) {
        uint16_t adc_value = 0;
        // Leia o valor do ADC
        esp_err_t adc_read_status = adc_read(&adc_value);
        if (adc_read_status == ESP_OK) {
            // Mapeie o valor do ADC para 0-100%
            float humidity = (adc_value / 1023.0) * 100.0;
            ESP_LOGI(TAG, "Valor do ADC: %d, Humidity: %.2f%%", adc_value, humidity);
            send_humidity_post(humidity);
        } else {
            ESP_LOGE(TAG, "Erro ao ler o ADC: %s", esp_err_to_name(adc_read_status));
        }
        vTaskDelay(pdMS_TO_TICKS(120000)); // Aguarde 120 segundos
    }
}

// Função para inicializar o ADC
void init_adc() {
    adc_config_t adc_config = {
        .mode = ADC_READ_TOUT_MODE,
        .clk_div = 8
    };
    esp_err_t ret = adc_init(&adc_config);
    if (ret == ESP_OK) {
        ESP_LOGI(TAG, "ADC inicializado com sucesso.");
    } else {
        ESP_LOGE(TAG, "Falha ao inicializar o ADC: %s", esp_err_to_name(ret));
    }
}

// Manipulador de eventos Wi-Fi
static esp_err_t event_handler(void *ctx, system_event_t *event) {
    switch (event->event_id) {
    case SYSTEM_EVENT_STA_START:
        esp_wifi_connect();
        break;
    case SYSTEM_EVENT_STA_GOT_IP:
        ESP_LOGI(TAG, "Conectado! IP: %s",
                 ip4addr_ntoa(&event->event_info.got_ip.ip_info.ip));
        xEventGroupSetBits(wifi_event_group, CONNECTED_BIT);

        // Inicia a tarefa de leitura do ADC após conexão
        xTaskCreate(adc_task, "adc_task", 4096, NULL, 5, NULL);
        break;
    case SYSTEM_EVENT_STA_DISCONNECTED:
        ESP_LOGI(TAG, "Desconectado. Reconectando...");
        esp_wifi_connect();
        xEventGroupClearBits(wifi_event_group, CONNECTED_BIT);
        break;
    default:
        break;
    }
    return ESP_OK;
}

// Inicializa Wi-Fi no modo Station
void wifi_init_sta() {
    wifi_event_group = xEventGroupCreate();

    tcpip_adapter_init();
    ESP_ERROR_CHECK(esp_event_loop_init(event_handler, NULL));

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASS,
        },
    };

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_LOGI(TAG, "wifi_init_sta finalizada.");
}

void app_main() {
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_LOGI(TAG, "ESP_WIFI_MODE_STA");
    init_adc();
    wifi_init_sta();
}
