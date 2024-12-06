# ---------------------------------------------------
#                     WIP
# ---------------------------------------------------

# Nome do diretório do servidor
SERVER_DIR := server

# Nome do arquivo principal do servidor
SERVER_MAIN := server.js

# Comando para instalar as dependências
install:
	@echo "Instalando dependências..."
	npm install

# Comando para iniciar o servidor
start:
	@echo "Iniciando o servidor..."
	node $(SERVER_DIR)/$(SERVER_MAIN)

# Comando para instalar dependências e iniciar o servidor
run: install start

.PHONY: install start