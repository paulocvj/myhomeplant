# ---------------------------------------------------
#                     WIP
# ---------------------------------------------------

SERVER_DIR := server
SERVER_MAIN := server.js
SENDER := client/humidity_handler/scripts/humidity_sender.sh
PORT=3000
# SERVER_SCRIPT=server.js
# FRONTEND_DIR=frontend
# CRONJOB="@reboot node $(INSTALL_DIR)/$(SERVER_SCRIPT) &"

# Default target
all: config install start

# Alvo de instalação
config:
	@echo "Atualizando sistema..."
	sudo apt update
	sudo apt install -y curl sqlite3 nodejs npm build-essential

	# @echo "Configurando crontab para iniciar o servidor no boot..."
	# (crontab -l 2>/dev/null; echo "$(CRONJOB)") | crontab -

	@echo "Instalação concluída com sucesso!"

# Comando para instalar as dependências
install:
	@echo "Instalando dependências..."
	npm install

# Comando para iniciar o servidor
start:
	@echo "Iniciando o servidor..."
	node $(SERVER_DIR)/$(SERVER_MAIN)

# Testar envio de dados
test-curl:
	@echo "Testando envio de dados para o servidor..."
	curl -X POST http://localhost:$(PORT)/api/humidity \
	     -H "Content-Type: application/json" \
	     -d '{"humidity": 47.5}'

# Testar script de envio contínuo
test-sender:
	@echo "Testando script de envio de umidade..."
	bash $(SENDER)

# Comando para instalar dependências e iniciar o servidor
run: install start

.PHONY: config install start
