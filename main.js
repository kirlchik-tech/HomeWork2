import { initApp } from "./modules/app.js";
import { initLikeHandlers, initFormHandlers } from "./modules/handlers.js";

// Инициализация приложения
async function init() {
  // Получаем DOM элементы
  const nameEL = document.getElementById("name");
  const commentsEL = document.getElementById("comments");
  const ulEL = document.getElementById("ul");
  const massageEL = document.getElementById("massage");
  const errorMessage = document.getElementById("errorMessage");

  window.commentsEL = commentsEL;

  const app = await initApp(nameEL, commentsEL, ulEL, massageEL, errorMessage);

  // Проверяем, что app создан и содержит методы
  console.log("✅ App создан. Методы:", Object.keys(app));
  console.log("✅ addComment есть?", typeof app.addComment);
  console.log("✅ validateForm есть?", typeof app.validateForm);

  // Инициализируем обработчики
  initLikeHandlers(ulEL, app);
  initFormHandlers(nameEL, commentsEL, massageEL, app);

  console.log("✅ Приложение инициализировано");
}

// Запуск приложения
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
