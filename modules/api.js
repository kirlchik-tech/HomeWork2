const API_URL = "https://wedev-api.sky.pro/api/v1/kirya-solovyev/comments";

// Загрузить список комментариев
export function fetchComments() {
  return fetch(API_URL)
    .then((response) => {
      if (!response.ok) {
        // Обрабатываем разные статусы ошибок
        if (response.status >= 500) {
          throw new Error("Ошибка сервера. Попробуйте позже.");
        } else if (response.status === 400) {
          throw new Error("Неверный запрос. Проверьте данные.");
        } else {
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
      }
      return response.json();
    })
    .then((data) => {
      console.log("✅ Комментарии загружены");
      return data.comments || [];
    })
    .catch((error) => {
      // Обрабатываем сетевые ошибки
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        console.error("❌ Сетевая ошибка:", error.message);
        throw new Error("Проблемы с интернетом. Проверьте соединение.");
      }
      // Пробрасываем другие ошибки дальше
      throw error;
    });
}

// Добавить новый комментарий
export function postComment(commentData, testRetry = false) {
  console.log("📤 Отправляю на сервер:", commentData);

  // Для тестирования повторной отправки
  if (testRetry) {
    return new Promise((resolve, reject) => {
      const random = Math.random();
      setTimeout(() => {
        if (random < 0.7) {
          // 70% chance ошибки сервера для тестирования
          reject(new Error("Ошибка сервера"));
        } else {
          // 30% chance успеха
          const date = new Date();
          const formattedDate =
            String(date.getDate()).padStart(2, "0") +
            "." +
            String(date.getMonth() + 1).padStart(2, "0") +
            "." +
            String(date.getFullYear()).slice(-2);

          resolve({
            id: Date.now(),
            text: commentData.text,
            name: commentData.name,
            author: { name: commentData.name },
            date: formattedDate,
            likes: 0,
            isLiked: false,
          });
        }
      }, 1000);
    });
  }

  // Реальный запрос
  const requestData = {
    ...commentData,
    forceError: true, // ВОТ ЭТУ ШТУКУ МЕНЯТЬ КОГДА ТЕСТИРУЮ ОШИБКИ
  };

  return fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(
            "Имя или комментарий слишком короткие. Минимум 3 символа."
          );
        } else if (response.status >= 500) {
          throw new Error("Ошибка сервера");
        } else {
          throw new Error(`Ошибка отправки: ${response.status}`);
        }
      }
      return response.json();
    })
    .then((responseData) => {
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
        throw new Error(responseData.error || "Неизвестная ошибка сервера");
      }
    })
    .catch((error) => {
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        throw new Error("Проблемы с интернетом. Проверьте соединение.");
      }
      throw error;
    });
}
