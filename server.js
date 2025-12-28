const http = require("http");

// Начальные комментарии
let comments = [
  {
    id: 1,
    name: "Глеб Фокин",
    date: "12.02.22 12:18",
    text: "Это будет первый комментарий на этой странице",
    likes: 3,
    isLiked: false,
  },
  {
    id: 2,
    name: "Варвара Н.",
    date: "13.02.22 19:22",
    text: "Мне нравится как оформлена эта страница! ❤",
    likes: 75,
    isLiked: true,
  },
];

// ID для новых комментариев
let nextId =
  comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 3;

function getReqData(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS заголовки
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  // GET /api/comments - получить все комментарии
  if (req.url === "/api/comments" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(comments));
    return;
  }

  // POST /api/comments - добавить новый комментарий
  if (req.url === "/api/comments" && req.method === "POST") {
    try {
      const data = await getReqData(req);

      if (!data.name || !data.text) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Имя и текст обязательны" }));
        return;
      }

      const newComment = {
        id: nextId++,
        name: data.name,
        date: data.date,
        text: data.text,
        likes: 0,
        isLiked: false,
      };

      comments.push(newComment);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newComment));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Неверный формат данных" }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Маршрут не найден" }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Сервер API запущен на http://localhost:${PORT}`);
  console.log(`📝 GET  http://localhost:${PORT}/api/comments`);
  console.log(`📝 POST http://localhost:${PORT}/api/comments`);
});
