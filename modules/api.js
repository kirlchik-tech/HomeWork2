// modules/api.js
const API_URL = "https://wedev-api.sky.pro/api/v1/kirya-solovyev/comments";

// Загрузить список комментариев
export async function fetchComments() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Комментарии загружены:", data);

    return data.comments || [];
  } catch (error) {
    console.error("❌ Ошибка загрузки комментариев:", error.message);
    throw error; // Пробрасываем ошибку дальше в app.js
  }
}

// Добавить новый комментарий
export async function postComment(commentData) {
  try {
    //  API ожидает объект с полями "text" и "name"
    const apiData = {
      text: commentData.text,
      name: commentData.name,
    };

    console.log("📤 Отправляю на сервер:", apiData);

    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(apiData),
    });

    const responseData = await response.json();
    console.log("📤 Ответ сервера:", responseData);

    if (!response.ok) {
      // Сервер вернул ошибку (400, 500 и т.д.)
      const errorMessage =
        responseData.error || `Ошибка сервера ${response.status}`;
      throw new Error(errorMessage);
    }

    // Успешный ответ: { "result": "ok" }
    return {
      id: Date.now(), // Временный ID
      text: commentData.text,
      name: commentData.name,
      // Стурктура сайта
      author: { name: commentData.name },
      date: new Date().toISOString(), // Текущая дата
      likes: 0,
      isLiked: false,
    };
  } catch (error) {
    console.error("❌ Ошибка отправки комментария:", error.message);
    throw error;
  }
}
