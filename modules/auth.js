const TOKEN_KEY = "commentToken";
const USER_KEY = "commentUser";
const EXPIRY_KEY = "commentExpiry";

// Сохранить данные пользователя
export function saveUserData(userData) {
  const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 часа

  localStorage.setItem(TOKEN_KEY, userData.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: userData.id,
      login: userData.login,
      name: userData.name,
    }),
  );
  localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
}

// Получить токен
export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (!token || !expiry) return null;

  // Проверяем, не истек ли токен
  if (Date.now() > parseInt(expiry)) {
    clearUserData();
    return null;
  }

  return token;
}
// Получить данные пользователя
export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    clearUserData();
    return null;
  }
}
// Проверить, авторизован ли пользователь
export function isAuthenticated() {
  return !!getToken();
}

// Очистить данные пользователя
function clearUserData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

// Выйти из системы
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Перенаправляем на главную страницу
  window.location.href = "index.html";
}

// Автоматически удалить устаревшие данные при загрузке
(function checkTokenExpiry() {
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (expiry && Date.now() > parseInt(expiry)) {
    clearUserData();
  }
})();
