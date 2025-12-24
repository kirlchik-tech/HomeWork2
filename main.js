import { initApp } from "./modules/app.js";
import { initLikeHandlers, initFormHandlers } from "./modules/handlers.js";

// Инициализация приложения
function init() {
  // Получаем DOM элементы
  const nameEL = document.getElementById("name");
  const commentsEL = document.getElementById("comments");
  const ulEL = document.getElementById("ul");
  const massageEL = document.getElementById("massage");
  const errorMessage = document.getElementById("errorMessage");

  // Сохраняем ссылки для глобального доступа (если нужно)
  window.commentsEL = commentsEL;

  // Инициализируем приложение
  const app = initApp(nameEL, commentsEL, ulEL, massageEL, errorMessage);

  // Инициализируем обработчики
  initLikeHandlers(ulEL, app);
  initFormHandlers(nameEL, commentsEL, massageEL, app);

  console.log("Приложение инициализировано");
}

// Запуск приложения
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
