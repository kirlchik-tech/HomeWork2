const AUTH_BASE_URL = "https://wedev-api.sky.pro/api";
const COMMENTS_BASE_URL = "https://wedev-api.sky.pro/api/v2";
const PERSONAL_KEY = "kirya-solovyev";
const REGISTER_URL = `${AUTH_BASE_URL}/user`;
const LOGIN_URL = `${AUTH_BASE_URL}/user/login`;
const COMMENTS_URL = `${COMMENTS_BASE_URL}/${PERSONAL_KEY}/comments`;

export function registerUser({ login, password, name }) {
  console.log("⚠️ API нестабильно. Использую ЗАГЛУШКУ для регистрации:", login);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (login.includes("admin")) {
        reject(new Error("Пользователь с таким логином уже существует"));
        return;
      }

      const mockUser = {
        user: {
          id: Date.now(),
          login: login,
          name: name,
          token: "mock-token-reg-" + Date.now(),
        },
      };

      console.log("✅ Заглушка: успешная регистрация", mockUser);
      resolve(mockUser);
    }, 500);
  });
}

export function loginUser({ login, password }) {
  console.log("⚠️ API нестабильно. Использую ЗАГЛУШКУ для входа:", login);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (login === "admin" && password === "admin") {
        resolve({
          user: {
            id: 1,
            login: "admin",
            name: "Админ Глеб",
            token: "mock-admin-token",
          },
        });
        return;
      }

      if (!password || password.length < 3) {
        reject(new Error("Неверный логин или пароль"));
        return;
      }

      resolve({
        user: {
          id: Date.now(),
          login: login,
          name: login === "kirya" ? "Кирилл" : "Пользователь",
          token: "mock-token-" + Date.now(),
        },
      });
    }, 500);
  });
}

// Получить комментарии (не требует авторизации)
export function fetchComments() {
  console.log("⚠️ Используется ЗАГЛУШКА fetchComments (мок)");

  // Имитируем задержку сети и возвращаем тестовые данные
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        comments: [
          {
            id: 1,
            author: { name: "Тестовый Пользователь" },
            text: "Это тестовый комментарий. API временно недоступно.",
            date: new Date().toISOString(),
            likes: 3,
            isLiked: false,
          },
          {
            id: 2,
            author: { name: "Еще Один" },
            text: "Работа фронтенда проверяется на моковых данных.",
            date: new Date(Date.now() - 86400000).toISOString(), // Вчера
            likes: 10,
            isLiked: true,
          },
        ],
      });
    }, 300);
  }).then((data) => {
    console.log("✅ Моковые данные загружены");
    return data.comments || [];
  });
}

// Добавить комментарий (требует авторизации)
export function postComment(text, token) {
  return fetch(COMMENTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: new URLSearchParams({ text }),
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Требуется авторизация");
    }
    if (response.status === 400) {
      return response.json().then((err) => {
        throw new Error(err.error || "Ошибка при добавлении комментария");
      });
    }
    if (!response.ok) {
      throw new Error("Ошибка сервера");
    }
    return response.json();
  });
} // ЕСЛИ СЕРВАК НЕ ОТВЕЧАЕТ ИСПОЛЬЗОВАТЬ ФУНКЦИЮ НИЖЕ

// export function postComment(text, token) {
//   console.log("⚠️ Сеть нестабильна. Использую ЗАГЛУШКУ postComment:", text.substring(0, 50) + "...");

//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       // Имитируем успешный ответ от сервера
//       resolve({
//         result: "ok",
//         comment: {
//           id: Date.now(),
//           text: text,
//           date: new Date().toISOString()
//         }
//       });
//       console.log("✅ Заглушка: комментарий успешно 'отправлен'");
//     }, 500); // Имитируем задержку сети
//   });
// } ----- ИСПОЛЬЗОВАТЬ ДЛЯ ПРОВЕРКИ НА ЛОКАЛЬНОМ ХРАНИЛИЩЕ

// Переключить лайк (требует авторизации)
export function toggleLike(commentId, token) {
  return fetch(`${COMMENTS_URL}/${commentId}/toggle-like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Ошибка при изменении лайка");
    }
    return response.json();
  });
}
