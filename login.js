import { loginUser } from "./modules/api.js";
import { saveUserData } from "./modules/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginInput = document.getElementById("login");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("loginButton");
  const errorMessage = document.getElementById("errorMessage");

  // Если уже авторизован, перенаправляем на главную
  if (localStorage.getItem("commentToken")) {
    window.location.href = "index.html";
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (!login || !password) {
      showError("Введите логин и пароль");
      return;
    }

    // Показываем загрузку
    loginButton.disabled = true;
    loginButton.textContent = "Вход...";
    errorMessage.style.display = "none";

    try {
      // Пытаемся авторизоваться
      const data = await loginUser({ login, password });

      // Сохраняем данные пользователя
      saveUserData(data.user);

      // Перенаправляем на главную страницу
      window.location.href = "index.html";
    } catch (error) {
      // Показываем ошибку
      showError(error.message || "Ошибка авторизации");

      // Возвращаем кнопку в исходное состояние
      loginButton.disabled = false;
      loginButton.textContent = "Войти";
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
});
