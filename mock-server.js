const http = require("http");

let todos = [
  {
    id: 1,
    text: "Сделать чаю",
    created_at: new Date().toISOString(),
    user: null,
  },
  {
    id: 2,
    text: "Выпить чаю",
    created_at: new Date().toISOString(),
    user: null,
  },
  {
    id: 3,
    text: "Отдохнуть",
    created_at: new Date().toISOString(),
    user: null,
  },
];

const server = http.createServer((req, res) => {
  // Настройка CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/api/todos") {
    res.writeHead(200);
    res.end(JSON.stringify({ todos }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/todos") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        if (!data.text || data.text.trim() === "") {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Текст задачи обязателен" }));
          return;
        }

        const newTodo = {
          id: todos.length + 1,
          text: data.text,
          created_at: new Date().toISOString(),
          user: null,
        };

        todos.push(newTodo);

        res.writeHead(201);
        res.end(JSON.stringify({ todos }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Неверный формат данных" }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not Found" }));
});

const PORT = 3001; // Другой порт, чтобы не конфликтовать
server.listen(PORT, () => {
  console.log(`✅ Mock-сервер запущен на http://localhost:${PORT}/api/todos`);
});
