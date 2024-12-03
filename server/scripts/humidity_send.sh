#!/bin/bash

# URL do endpoint da API
API_URL="http://100.68.242.18:3000/api/humidity"

# Loop de 100 a 1
for i in $(seq 80 -1 60); do
  echo "Enviando umidade: $i%"
  # Envia a requisição POST com o valor atual de umidade
  curl -X POST -H "Content-Type: application/json" -d "{\"humidity\": $i}" "$API_URL"
  
  # Aguarda 0.1 segundo para evitar sobrecarga do servidor
  sleep 0.1
done

echo "Todos os valores foram enviados com sucesso!"
