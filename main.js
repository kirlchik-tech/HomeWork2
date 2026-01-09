import { initApp } from "./modules/app.js";
import { initLikeHandlers, initFormHandlers } from "./modules/handlers.js";

// Инициализация приложения
async function init() {
  console.log("🚀 Запуск приложения...");

  // Получаем DOM элементы
  const nameEL = document.getElementById("name");
  const commentsEL = document.getElementById("comments");
  const ulEL = document.getElementById("ul");
  const massageEL = document.getElementById("massage");
  const errorMessage = document.getElementById("errorMessage");

  const commentsLoadingEL = document.getElementById("comments-loading");
  const addLoadingEL = document.getElementById("add-loading");
  const formEL = document.getElementById("comment-form");

  if (commentsLoadingEL) {
    commentsLoadingEL.style.display = "none";
    commentsLoadingEL.classList.remove("active");
  }

  if (addLoadingEL) {
    addLoadingEL.style.display = "none";
    addLoadingEL.classList.remove("active");
  }

  // Проверяем, что все элементы найдены
  console.log("🔍 Проверка элементов:");
  console.log("- nameEL:", nameEL ? "✓" : "✗");
  console.log("- commentsEL:", commentsEL ? "✓" : "✗");
  console.log("- ulEL:", ulEL ? "✓" : "✗");
  console.log("- massageEL:", massageEL ? "✓" : "✗");
  console.log("- errorMessage:", errorMessage ? "✓" : "✗");
  console.log("- commentsLoadingEL:", commentsLoadingEL ? "✓" : "✗");
  console.log("- addLoadingEL:", addLoadingEL ? "✓" : "✗");
  console.log("- formEL:", formEL ? "✓" : "✗");
  console.log("🔍 Начальное состояние лоадеров:");
  console.log("- comments-loading display:", commentsLoadingEL.style.display);
  console.log("- add-loading display:", addLoadingEL.style.display);

  if (!commentsLoadingEL) {
    console.error("❌ Не найден элемент с id='comments-loading'");
  }
  if (!addLoadingEL) {
    console.error("❌ Не найден элемент с id='add-loading'");
  }
  if (!formEL) {
    console.error("❌ Не найден элемент с id='comment-form'");
  }

  window.commentsEL = commentsEL;

  const app = await initApp(
    nameEL,
    commentsEL,
    ulEL,
    massageEL,
    errorMessage,
    commentsLoadingEL, // Передаём новые элементы
    addLoadingEL,
    formEL
  );

  // Проверяем, что app создан и содержит методы
  console.log("✅ App создан. Методы:", Object.keys(app));

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
