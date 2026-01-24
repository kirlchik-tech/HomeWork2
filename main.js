import { initApp } from "./modules/app.js";
import { initLikeHandlers, initFormHandlers } from "./modules/handlers.js";
import { isAuthenticated, getUser, logout } from "./modules/auth.js";

async function init() {
  console.log("🚀 Запуск приложения...");

  console.log("🚀 Запуск приложения...");
  console.log("1. Токен в localStorage:", localStorage.getItem("commentToken"));
  console.log("2. isAuthenticated():", isAuthenticated());

  // Проверяем авторизацию
  if (isAuthenticated()) {
    console.log("✅ Пользователь авторизован (данные из localStorage)");
    setupAuthenticatedUI();
  } else {
    console.log("⚠️ Пользователь не авторизован");
    setupUnauthenticatedUI();
  }

  // Загружаем и отображаем комментарии
  await loadAndDisplayComments();

  console.log("✅ Приложение инициализировано");
}

function setupAuthenticatedUI() {
  const nameEL = document.getElementById("name");
  const formEL = document.getElementById("comment-form");
  const loginPrompt = document.getElementById("login-prompt");
  const addLoadingEL = document.getElementById("add-loading");
  const user = getUser();

  // Заполняем поле имени
  if (nameEL && user) {
    nameEL.style.display = "none";
    nameEL.value = user.name || "";
    nameEL.readOnly = true;
  }

  // Показываем форму, скрываем ссылку на авторизацию
  if (formEL) formEL.style.display = "block";
  if (loginPrompt) loginPrompt.style.display = "none";

  // = Скрываем лоадер добавления комментария
  if (addLoadingEL) addLoadingEL.style.display = "none";

  // Добавляем кнопку выхода
  addLogoutButton();

  // Добавляем информацию о пользователе
  addUserInfo(user);
}

function setupUnauthenticatedUI() {
  const formEL = document.getElementById("comment-form");
  const loginPrompt = document.getElementById("login-prompt");
  const addLoadingEL = document.getElementById("add-loading");

  if (formEL) formEL.style.display = "none";
  if (loginPrompt) loginPrompt.style.display = "block";
  if (addLoadingEL) addLoadingEL.style.display = "none";
}

async function loadAndDisplayComments() {
  const nameEL = document.getElementById("name");
  const commentsEL = document.getElementById("comments");
  const ulEL = document.getElementById("ul");
  const massageEL = document.getElementById("massage");
  const errorMessage = document.getElementById("errorMessage");
  const commentsLoadingEL = document.getElementById("comments-loading");
  const addLoadingEL = document.getElementById("add-loading");
  const formEL = document.getElementById("comment-form");

  const app = await initApp(
    nameEL,
    commentsEL,
    ulEL,
    massageEL,
    errorMessage,
    commentsLoadingEL,
    addLoadingEL,
    formEL,
  );

  initLikeHandlers(ulEL, app);

  // Инициализируем обработчики формы только если авторизованы
  if (isAuthenticated()) {
    initFormHandlers(nameEL, commentsEL, massageEL, app);
  }
}

function addLogoutButton() {
  const addFormRow = document.querySelector(".add-form-row");
  if (!addFormRow) return;

  // Проверяем, не добавлена ли уже кнопка
  if (addFormRow.querySelector(".logout-button")) return;

  const logoutButton = document.createElement("button");
  logoutButton.textContent = "Выйти";
  logoutButton.className = "add-form-button logout-button";
  logoutButton.style.marginLeft = "10px";
  logoutButton.style.backgroundColor = "#ff6b6b";

  logoutButton.addEventListener("click", () => {
    if (confirm("Вы уверены, что хотите выйти?")) {
      logout();
    }
  });

  addFormRow.appendChild(logoutButton);
}

function addUserInfo(user) {
  if (!user) return;

  const container = document.querySelector(".container");
  if (!container) return;

  // Создаем элемент с информацией о пользователе
  const userInfo = document.createElement("div");
  userInfo.className = "user-info";
  userInfo.style.cssText = `
        color: #bcec30;
        text-align: center;
        margin: 10px 0;
        font-size: 14px;
    `;
  userInfo.textContent = `Вы вошли как: ${user.name}`;

  // Добавляем в начало контейнера
  container.insertBefore(userInfo, container.firstChild);
}

// Запуск приложения
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
