import { comments, setComments } from "./data.js";
import { getCurrentDateTime } from "./utils.js";
import { showError, hideError, validateAll } from "./validation.js";
import { fetchComments, postComment } from "./api.js";

let replyingTo = null;
let localLikes = {};

function renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes) {
  const commentHTML = comments
    .map((comment, index) => {
      const hasLocalLike = localLikes[comment.id] || false;
      const likeButtonClass = hasLocalLike
        ? "like-button -active-like"
        : "like-button";
      const replyClass = replyingTo === index ? "comment-replying" : "";
      const totalLikes = comment.likes + (hasLocalLike ? 1 : 0);

      // Безопасное отображение
      const safeName = (comment.name || "")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const safeText = (comment.text || "")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `<li class="comment ${replyClass}" data-index="${index}" data-id="${comment.id}">
                <div class="comment-header">
                    <div>${safeName}</div>
                    <div>${comment.date || ""}</div>
                </div>
                <div class="comment-body">
                    <div class="comment-text">${safeText}</div>
                </div>
                <div class="comment-footer">
                    <div class="likes">
                        <span class="likes-counter">${totalLikes}</span>
                        <button class="${likeButtonClass}" data-index="${index}"></button>
                    </div>
                </div>
            </li>`;
    })
    .join("");

  ulEL.innerHTML = commentHTML;
}

// Загрузка комментариев из API
async function loadCommentsFromAPI() {
  console.log("⏳ Загружаю комментарии...");

  const apiComments = await fetchComments();

  if (!apiComments || apiComments.length === 0) {
    console.log("⚠️ Нет комментариев для загрузки");
    return null;
  }

  // Преобразуем дату из формата API  в дд.мм.гг
  const formattedComments = apiComments.map((comment) => {
    let displayDate = "Дата неизвестна";

    if (comment.date) {
      const date = new Date(comment.date);
      if (!isNaN(date)) {
        displayDate =
          String(date.getDate()).padStart(2, "0") +
          "." +
          String(date.getMonth() + 1).padStart(2, "0") +
          "." +
          String(date.getFullYear()).slice(-2);
      }
    }

    return {
      id: comment.id,
      name: comment.author?.name || "Аноним",
      date: displayDate,
      text: comment.text,
      likes: comment.likes || 0,
      isLiked: comment.isLiked || false,
    };
  });

  console.log("✅ Комментарии преобразованы");
  return formattedComments;
}

export async function initApp(
  nameEL,
  commentsEL,
  ulEL,
  massageEL,
  errorMessage
) {
  console.log("🎬 Начинаю инициализацию...");

  // Показываем то, что есть
  renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);
  massageEL.disabled = true;

  // Загружаем из API в фоне
  loadCommentsFromAPI().then((apiComments) => {
    if (apiComments && apiComments.length > 0) {
      setComments(apiComments);
      renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);
      console.log("✨ Комментарии обновлены");
    }
  });

  console.log("✨ Инициализация завершена");

  return {
    getComments: () => comments,
    getReplyingTo: () => replyingTo,
    setReplyingTo: (value) => {
      replyingTo = value;
    },
    render: () =>
      renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes),

    addComment: async (nameText, commentText) => {
      console.log("➕ Добавляю комментарий от", nameText);

      const date = new Date();
      const formattedDate =
        String(date.getDate()).padStart(2, "0") +
        "." +
        String(date.getMonth() + 1).padStart(2, "0") +
        "." +
        String(date.getFullYear()).slice(-2);

      let finalCommentText = commentText;

      if (replyingTo !== null && comments[replyingTo]) {
        const parentComment = comments[replyingTo];
        finalCommentText = `> ${parentComment.name}: ${parentComment.text}\n\n${commentText}`;
      }

      const commentData = {
        name: nameText,
        text: finalCommentText,
        date: formattedDate,
        likes: 0,
        isLiked: false,
      };

      // Пытаемся отправить на сервер
      const newCommentFromApi = await postComment(commentData);

      // Если сервер не ответил, создаём локальный комментарий
      const commentToAdd = newCommentFromApi || {
        id: Date.now(),
        name: commentData.name,
        text: commentData.text,
        author: { name: commentData.name },
        date: commentData.date,
        likes: 0,
        isLiked: false,
      };

      // Добавляем в массив
      comments.push(commentToAdd);

      // Сбрасываем состояние
      replyingTo = null;
      commentsEL.placeholder = "Введите ваш комментарий";

      // Обновляем интерфейс
      renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);

      console.log("✅ Комментарий добавлен");
      return commentToAdd.id;
    },

    updateCommentLike: (index) => {
      if (index >= 0 && index < comments.length) {
        const comment = comments[index];
        localLikes[comment.id] = !localLikes[comment.id];
        renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);
      }
    },

    validateForm: () => {
      return validateAll(
        nameEL,
        commentsEL,
        massageEL,
        errorMessage,
        showError,
        hideError
      );
    },

    hideFormError: () => hideError(errorMessage, nameEL),
  };
}
