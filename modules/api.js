const API_URL = "https://wedev-api.sky.pro/api/v1/kirya-solovyev/comments";

// Загрузить список комментариев
export function fetchComments() {
  return fetch(API_URL)
    .then((response) => {
      if (!response.ok) {
        console.error("❌ Ошибка загрузки:", response.status);
        return Promise.reject("Ошибка сети");
      }
      return response.json();
    })
    .then((data) => {
      console.log("✅ Комментарии загружены");
      return data.comments || [];
    });
}

// Добавить новый комментарий
export function postComment(commentData) {
  console.log("📤 Отправляю на сервер:", commentData);

  return fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(commentData),
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log("📤 Ответ сервера:", responseData);

      if (!responseData.error) {
        const date = new Date();
        const formattedDate =
          String(date.getDate()).padStart(2, "0") +
          "." +
          String(date.getMonth() + 1).padStart(2, "0") +
          "." +
          String(date.getFullYear()).slice(-2);

        return {
          id: Date.now(),
          text: commentData.text,
          name: commentData.name,
          author: { name: commentData.name },
          date: formattedDate,
          likes: 0,
          isLiked: false,
        };
      } else {
        return Promise.reject(responseData.error);
      }
    });
}

// Функция удаления HTML-тегов
function escapeHtml(text) {
  if (!text) return "";

  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
