const AUTH_BASE_URL = "https://wedev-api.sky.pro/api";
const COMMENTS_BASE_URL = "https://wedev-api.sky.pro/api/v2";
const PERSONAL_KEY = "kirya-solovyev";
const REGISTER_URL = `${AUTH_BASE_URL}/user`;
const LOGIN_URL = `${AUTH_BASE_URL}/user/login`;
const COMMENTS_URL = `${COMMENTS_BASE_URL}/${PERSONAL_KEY}/comments`;

export function registerUser({ login, password, name }) {
  console.log("📤 Регистрация:", { login, name });
  console.log("Отправляемый JSON:", JSON.stringify({ login, password, name }));

  return fetch("https://wedev-api.sky.pro/api/user", {
    method: "POST",
    // Пробуем отправлять БЕЗ заголовка Content-Type, так как сервер ранее на него ругался
    body: JSON.stringify({ login, password, name }),
  })
    .then((response) => {
      console.log("📥 Ответ сервера:", response.status);

      // Всегда пытаемся прочитать и вывести ответ сервера для отладки
      return response.text().then((text) => {
        console.log("📝 Текст ответа сервера:", text);

        if (response.ok) {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("❌ Ошибка парсинга JSON ответа:", e);
            return { user: { login, name, token: "error_parsing" } }; // fallback
          }
        } else {
          // Пробуем распарсить ошибку
          let errorMessage = `Ошибка ${response.status}`;
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Если не JSON, используем текст как есть
            if (text) errorMessage = text;
          }
          throw new Error(errorMessage);
        }
      });
    })
    .catch((error) => {
      console.error("❌ Ошибка в registerUser:", error);
      throw error;
    });
}

export function loginUser({ login, password }) {
  console.log("📤 Вход:", { login });

  return fetch(LOGIN_URL, {
    method: "POST",
    // УБИРАЕМ заголовок Content-Type!
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    console.log("📥 Ответ сервера на вход:", response.status);

    if (response.status === 400) {
      return response.json().then((err) => {
        throw new Error(err.error || "Неверный логин или пароль");
      });
    }
    if (response.status !== 201) {
      throw new Error("Ошибка сервера при входе");
    }
    return response.json();
  });
}

// Получить комментарии (не требует авторизации)
export function fetchComments() {
  console.log("📥 Загружаю комментарии с сервера...");

  return fetch(COMMENTS_URL, {
    method: "GET",
  })
    .then((response) => {
      console.log("📥 Статус загрузки комментариев:", response.status);

      if (!response.ok) {
        console.error("❌ Ошибка загрузки комментариев:", response.status);
        return { comments: [] };
      }

      return response.json();
    })
    .then((data) => {
      console.log(
        "✅ Комментарии загружены с сервера:",
        data.comments?.length || 0,
        "шт.",
      );
      return data.comments || [];
    })
    .catch((error) => {
      console.error("❌ Ошибка сети при загрузке комментариев:", error);
      return [];
    });
}

// Добавить комментарий (требует авторизации)
export function postComment(text, token) {
  console.log("📤 Отправка комментария:", { text });

  return fetch(COMMENTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text: text }),
  })
    .then((response) => {
      console.log("📥 Ответ на добавление комментария:", response.status);

      if (response.status === 401) {
        throw new Error("Требуется авторизация");
      }
      if (response.status === 400) {
        return response.text().then((text) => {
          let errorMessage = "Ошибка при добавлении комментария";
          try {
            const err = JSON.parse(text);
            errorMessage = err.error || errorMessage;
          } catch {
            if (text) errorMessage = text;
          }
          throw new Error(errorMessage);
        });
      }
      if (!response.ok) {
        throw new Error("Ошибка сервера");
      }
      return response.json();
    })
    .then((data) => {
      console.log("✅ Комментарий отправлен, результат:", data);
      return data; // { result: "ok" }
    });
}

// Переключить лайк (требует авторизации)
export function toggleLike(commentId, token) {
  console.log(`❤️ Переключаю лайк для комментария ${commentId}`);

  return fetch(`${COMMENTS_URL}/${commentId}/toggle-like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка при изменении лайка");
      }
      return response.json();
    })
    .then((data) => {
      console.log(`✅ Ответ сервера на лайк:`, data.result);
      return data.result;
    });
}
