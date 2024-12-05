# ---------------------------------------------------
#                     WIP
# ---------------------------------------------------

# Variáveis de configuração
INSTALL_DIR=/home/pi/plant-monitor
SCRIPT_NAME=humidity_sender.sh
SERVER_SCRIPT=server.js
FRONTEND_DIR=frontend
CRONJOB="@reboot node $(INSTALL_DIR)/$(SERVER_SCRIPT) &"

# Porta do servidor
PORT=3000

# Default target
all: install

# Alvo de instalação
install:
	@echo "Atualizando sistema..."
	sudo apt update
	sudo apt install -y curl sqlite3 nodejs npm build-essential

	@echo "Criando diretório para o projeto..."
	mkdir -p $(INSTALL_DIR)

	@echo "Copiando arquivos do projeto..."
	cp -r ./* $(INSTALL_DIR)
	chmod +x $(INSTALL_DIR)/$(SCRIPT_NAME)

	@echo "Inicializando projeto Node.js..."
	cd $(INSTALL_DIR) && npm install

	@echo "Configurando banco de dados SQLite..."
	sqlite3 $(INSTALL_DIR)/humidity.db "CREATE TABLE IF NOT EXISTS humidity_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, humidity REAL NOT NULL, timestamp DATETIME DEFAULT (DATETIME('now', '-3 hours')));"

	@echo "Configurando crontab para iniciar o servidor no boot..."
	(crontab -l 2>/dev/null; echo "$(CRONJOB)") | crontab -

	@echo "Instalação concluída com sucesso!"

# Inicializar o servidor manualmente
start-server:
	@echo "Iniciando servidor manualmente na porta $(PORT)..."
	cd $(INSTALL_DIR) && node $(SERVER_SCRIPT)

# Remover o projeto
uninstall:
	@echo "Removendo projeto..."
	rm -rf $(INSTALL_DIR)

	@echo "Removendo entrada do crontab..."
	crontab -l | grep -v "node $(INSTALL_DIR)/$(SERVER_SCRIPT)" | crontab -

	@echo "Projeto removido com sucesso!"

# Testar envio de dados
test-curl:
	@echo "Testando envio de dados para o servidor..."
	curl -X POST http://localhost:$(PORT)/api/humidity \
	     -H "Content-Type: application/json" \
	     -d '{"humidity": 47.5}'

# Testar script de envio contínuo
test-sender:
	@echo "Testando script de envio de umidade..."
	bash $(INSTALL_DIR)/$(SCRIPT_NAME)
