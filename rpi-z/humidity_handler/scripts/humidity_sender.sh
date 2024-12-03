#!/bin/bash

# URL do servidor onde os dados serão enviados
SERVER_URL="http://100.68.242.18:3000/api/humidity"

# Função para gerar um valor aleatório entre 50.0 e 45.0
generate_humidity() {
  awk -v min=45 -v max=50 'BEGIN{srand(); printf "%.1f\n", min + (rand() * (max - min))}'
}

# Loop infinito para enviar dados a cada 2 minutos
while true; do
  HUMIDITY=$(generate_humidity)
  echo "Enviando umidade: $HUMIDITY%"

  # Enviar os dados via curl
  curl -X POST "$SERVER_URL" \
    -H "Content-Type: application/json" \
    -d "{\"humidity\": $HUMIDITY}"

  # Esperar 2 minutos antes de enviar o próximo dado
  sleep 120
done
