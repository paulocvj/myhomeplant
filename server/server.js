const http = require("http");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { StringDecoder } = require("string_decoder");
const WebSocket = require("ws"); // Importar WebSocket
const logger = require("./logger"); // Importar o logger

// Banco de dados SQLite
const db = new sqlite3.Database("./humidity.db", (err) => {
  if (err) {
    logger.error(`Erro ao conectar ao banco de dados: ${err.message}`);
  } else {
    logger.info("Conectado ao banco de dados SQLite.");
    db.run(
      `CREATE TABLE IF NOT EXISTS humidity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        humidity REAL NOT NULL,
        timestamp DATETIME DEFAULT (DATETIME('now', '-3 hours'))
      )`,
      (err) => {
        if (err) {
          logger.error(`Erro ao criar tabela no banco de dados: ${err.message}`);
        } else {
          logger.info("Tabela 'humidity_logs' verificada/criada com sucesso.");
        }
      }
    );
  }
});

// Configuração do servidor HTTP
const PORT = 3000;
const HOST = "100.68.242.18";

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (chunk) => {
    buffer += decoder.write(chunk);
  });

  req.on("end", () => {
    buffer += decoder.end();

    if (url === "/api/humidity" && method === "POST") {
      // Parse o corpo da requisição
      let body;
      try {
        body = JSON.parse(buffer);
      } catch (err) {
        logger.error(`Erro ao processar JSON: ${err.message}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      const { humidity } = body;

      if (typeof humidity !== "number") {
        logger.warn("Requisição POST com valor inválido para umidade.");
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "humidity must be a number" }));
        return;
      }

      // Inserir no banco de dados
      db.run(
        `INSERT INTO humidity_logs (humidity) VALUES (?)`,
        [humidity],
        function (err) {
          if (err) {
            logger.error(`Erro ao inserir no banco de dados: ${err.message}`);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Database error" }));
          } else {
            logger.info(`Dados inseridos no banco com ID: ${this.lastID}`);
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, id: this.lastID }));

            // Notificar todos os clientes WebSocket
            const lastData = {
              id: this.lastID,
              humidity,
              timestamp: new Date().toISOString(),
            };
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(lastData));
              }
            });
          }
        }
      );
    } else if (url === "/api/humidity" && method === "GET") {
      logger.info("Requisição GET para /api/humidity recebida.");
      db.all(
        `SELECT id, humidity, timestamp FROM humidity_logs ORDER BY timestamp DESC, id DESC`,
        (err, rows) => {
          if (err) {
            logger.error(`Erro ao buscar no banco de dados: ${err.message}`);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Database error" }));
          } else {
//            logger.info(`Consulta realizada com sucesso. Retornando ${rows.length} registros.`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(rows));
          }
        }
      );
    } else {
      // Servir arquivos estáticos
      const filePath =
        url === "/" ? path.join(__dirname, "frontend", "index.html") : path.join(__dirname, "frontend", url);
      fs.readFile(filePath, (err, content) => {
        if (err) {
          logger.warn(`Arquivo não encontrado: ${filePath}`);
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Arquivo não encontrado");
        } else {
          const ext = path.extname(filePath);
          const mimeType = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
          };
          logger.info(`Arquivo servido: ${filePath}`);
          res.writeHead(200, { "Content-Type": mimeType[ext] || "text/plain" });
          res.end(content);
        }
      });
    }
  });
});

server.on('request', (req) => {
  logger.info(`Requisição HTTP recebida: ${req.method} ${req.url} de ${req.socket.remoteAddress}`);
});

// Configuração do servidor WebSocket
//const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  logger.info("Novo cliente conectado via WebSocket.");
  ws.on("close", () => logger.info("Cliente WebSocket desconectado."));
});

// Iniciar o servidor HTTP e WebSocket
server.listen(PORT, HOST, () => {
  logger.info(`Servidor rodando em http://${HOST}:${PORT}`);
});
