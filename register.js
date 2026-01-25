// register.js
import { registerUser } from "./modules/api.js";
import { saveUserData } from "./modules/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const nameInput = document.getElementById("name");
  const loginInput = document.getElementById("login");
  const passwordInput = document.getElementById("password");
  const registerButton = document.getElementById("registerButton");
  const errorMessage = document.getElementById("errorMessage");

  // Если уже авторизован, перенаправляем на главную
  if (localStorage.getItem("commentToken")) {
    window.location.href = "index.html";
  }

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    // Валидация
    if (!name || !login || !password) {
      showError("Заполните все поля");
      return;
    }

    if (password.length < 6) {
      showError("Пароль должен содержать минимум 6 символов");
      return;
    }

    // Показываем загрузку
    registerButton.disabled = true;
    registerButton.textContent = "Регистрация...";
    errorMessage.style.display = "none";

    try {
      // Регистрируем пользователя
      const data = await registerUser({ login, password, name });

      // Сохраняем данные пользователя (API возвращает тот же формат, что и login)
      saveUserData(data.user);

      // Перенаправляем на главную страницу
      window.location.href = "index.html";
    } catch (error) {
      // Показываем ошибку
      showError(error.message || "Ошибка регистрации");

      // Возвращаем кнопку в исходное состояние
      registerButton.disabled = false;
      registerButton.textContent = "Зарегистрироваться";
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
});
