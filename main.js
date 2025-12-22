import { comments } from "./modules/data.js";
import { getCurrentDateTime, escapeHtml } from "./modules/utils.js";
import { showError, hideError, validateAll } from "./modules/validation.js";
import { renderComments } from "./modules/render.js";

// DOM элементы
const nameEL = document.getElementById("name");
const commentsEL = document.getElementById("comments");
const ulEL = document.getElementById("ul");
const massageEL = document.getElementById("massage");
const errorMessage = document.getElementById("errorMessage");

let replyingTo = null;

// Функция addComment
function addComment() {
  console.log("addComment called"); // Для отладки

  if (
    !validateAll(
      nameEL,
      commentsEL,
      massageEL,
      errorMessage,
      showError,
      hideError
    )
  ) {
    console.log("Validation failed");
    return;
  }

  const nameText = escapeHtml(nameEL.value.trim());
  const commentText = escapeHtml(commentsEL.value.trim());
  const currentDateTime = getCurrentDateTime();

  let finalCommentText = commentText;

  if (replyingTo !== null && comments[replyingTo]) {
    const parentComment = comments[replyingTo];
    finalCommentText = `> ${parentComment.name}: ${parentComment.text}\n\n${commentText}`;
  }

  comments.push({
    name: nameText,
    date: currentDateTime,
    text: finalCommentText,
    likes: 0,
    isLiked: false,
  });

  replyingTo = null;
  commentsEL.placeholder = "Введите ваш комментарий";

  renderComments(comments, ulEL, replyingTo);

  nameEL.value = "";
  commentsEL.value = "";
  massageEL.disabled = true;
  hideError(errorMessage, nameEL);

  console.log("Comment added:", comments[comments.length - 1]);
}

// Обработчики событий
function initLikeHandlers() {
  ulEL.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("like-button")) {
      const index = parseInt(target.getAttribute("data-index"));

      if (
        typeof index === "number" &&
        !isNaN(index) &&
        index >= 0 &&
        index < comments.length
      ) {
        comments[index].isLiked = !comments[index].isLiked;
        comments[index].likes += comments[index].isLiked ? 1 : -1;
        renderComments(comments, ulEL, replyingTo);
      }
      return;
    }

    const commentElement = target.closest(".comment");
    if (commentElement && !target.closest(".likes")) {
      const index = parseInt(commentElement.getAttribute("data-index"));

      if (!isNaN(index) && comments[index]) {
        const comment = comments[index];

        if (replyingTo === index) {
          replyingTo = null;
          commentsEL.placeholder = "Введите ваш комментарий";
        } else {
          replyingTo = index;
          commentsEL.placeholder = `Ответ на комментарий ${comment.name}`;
        }

        commentsEL.focus();
        renderComments(comments, ulEL, replyingTo);
      }
    }
  });
}

function initFormHandlers() {
  console.log("initFormHandlers called"); // Для отладки

  nameEL.addEventListener("input", () => {
    validateAll(
      nameEL,
      commentsEL,
      massageEL,
      errorMessage,
      showError,
      hideError
    );
  });

  commentsEL.addEventListener("input", () => {
    validateAll(
      nameEL,
      commentsEL,
      massageEL,
      errorMessage,
      showError,
      hideError
    );
  });

  commentsEL.addEventListener("input", function () {
    if (this.value.trim() === "" && replyingTo !== null) {
      replyingTo = null;
      commentsEL.placeholder = "Введите ваш комментарий";
      renderComments(comments, ulEL, replyingTo);
    }
  });

  massageEL.addEventListener("click", addComment);

  commentsEL.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (
        validateAll(
          nameEL,
          commentsEL,
          massageEL,
          errorMessage,
          showError,
          hideError
        )
      ) {
        addComment();
      }
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && replyingTo !== null) {
      replyingTo = null;
      commentsEL.placeholder = "Введите ваш комментарий";
      renderComments(comments, ulEL, replyingTo);
    }
  });
}

// Инициализация
function init() {
  console.log("init called"); // Для отладки
  console.log("DOM elements:", {
    nameEL,
    commentsEL,
    ulEL,
    massageEL,
    errorMessage,
  });

  // Очистите ul перед рендерингом
  ulEL.innerHTML = "";

  renderComments(comments, ulEL, replyingTo);
  initLikeHandlers();
  initFormHandlers();
  massageEL.disabled = true;

  console.log("Initial comments:", comments);
}

// Запуск приложения когда DOM загружен
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

console.log("main.js loaded");
