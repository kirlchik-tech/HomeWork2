import { comments, setComments } from "./data.js";
import { getCurrentDateTime, escapeHtml } from "./utils.js";
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

      return `<li class="comment ${replyClass}" data-index="${index}" data-id="${comment.id}">
                <div class="comment-header">
                    <div>${comment.name}</div>
                    <div>${comment.date}</div>
                </div>
                <div class="comment-body">
                    <div class="comment-text">${comment.text}</div>
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

// загрузка без
async function loadCommentsFromAPI() {
  console.log("⏳ Загружаю комментарии...");

  // вызываем fetchComments
  const apiComments = await fetchComments().catch(() => {
    console.log("⚠️ Не удалось загрузить комментарии");
    return null;
  });

  if (!apiComments) return null;

  // Преобразуем структуру API
  return apiComments.map((comment) => ({
    id: comment.id,
    name: comment.author?.name || "Аноним",
    date: comment.date || getCurrentDateTime(),
    text: comment.text,
    likes: comment.likes || 0,
    isLiked: comment.isLiked || false,
  }));
}

export async function initApp(
  nameEL,
  commentsEL,
  ulEL,
  massageEL,
  errorMessage
) {
  console.log("🎬 Начинаю инициализацию...");

  // 1. Сразу показываем статические комментарии
  renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);
  massageEL.disabled = true;

  // 2. Загружаем из API в фоне (без обработки ошибок)
  loadCommentsFromAPI()
    .then((apiComments) => {
      if (apiComments && apiComments.length > 0) {
        setComments(apiComments);
        renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);
        console.log("✨ Комментарии обновлены из API");
      }
    })
    .catch(() => {
      // Игнорируем ошибку
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

    // добавление коммента
    addComment: async (nameText, commentText) => {
      console.log("➕ Добавляю комментарий от", nameText);

      const currentDateTime = getCurrentDateTime();
      let finalCommentText = commentText;

      if (replyingTo !== null && comments[replyingTo]) {
        const parentComment = comments[replyingTo];
        finalCommentText = `> ${parentComment.name}: ${parentComment.text}\n\n${commentText}`;
      }

      const commentData = {
        name: nameText,
        text: finalCommentText,
        date: currentDateTime,
        likes: 0,
        isLiked: false,
      };

      const newCommentFromApi = await postComment(commentData).catch(
        (error) => {
          console.log("⚠️ Не удалось отправить комментарий на сервер");
          // Возвращаем локальную версию комментария
          return {
            id: Date.now(),
            ...commentData,
            author: { name: commentData.name },
          };
        }
      );

      // Создаём комментарий для локального массива
      const commentToAdd = {
        id: newCommentFromApi.id || Date.now(),
        name:
          newCommentFromApi.name || newCommentFromApi.author?.name || "Аноним",
        date: newCommentFromApi.date || currentDateTime,
        text: newCommentFromApi.text,
        likes: newCommentFromApi.likes || 0,
        isLiked: newCommentFromApi.isLiked || false,
      };

      // Добавляем в массив
      comments.push(commentToAdd);

      // Сбрасываем состояние ответа
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
