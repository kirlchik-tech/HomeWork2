const API_URL = "https://webdev-hw-api.vercel.app/api/todos";

// 1. загрузка комментариев
export async function fetchComments() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.todos || [];
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    throw error;
  }
}

// 2. отправка комментария
export async function postComment(commentData) {
  try {
    // Отправляем только текст
    const apiData = {
      text: commentData.text,
    };

    console.log("Отправляю на сервер:", apiData);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiData),
    });

    // Если сервер ответил ошибкой - просто бросаем исключение
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    // Если успешно - парсим ответ
    const data = await response.json();
    const newTodo = data.todos[data.todos.length - 1];

    // Возвращаем структуру для приложения
    return {
      id: newTodo.id,
      text: newTodo.text,
      name: commentData.name || "Аноним",
      date: commentData.date || new Date().toLocaleDateString(),
      likes: 0,
      isLiked: false,
    };
  } catch (error) {
    console.error("Ошибка отправки:", error.message);
    throw error;
  }
}
