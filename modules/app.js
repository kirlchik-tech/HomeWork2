import { comments, setComments, addComment } from "./data.js";
import { getCurrentDateTime, escapeHtml } from "./utils.js";
import { showError, hideError, validateAll } from "./validation.js";
import { renderComments } from "./render.js";
import { fetchComments, postComment } from "./api.js"; // Импортируем только fetchComments и postComment

let replyingTo = null;
// Храним лайк в памяти
let localLikes = {};

export function initApp(nameEL, commentsEL, ulEL, massageEL, errorMessage) {
  console.log("🎬 initApp: началась инициализация");

  // Сразу показываем fallback данные
  const fallbackComments = [
    {
      id: 1,
      name: "Глеб Фокин",
      date: "12.02.22 12:18",
      text: "Это будет первый комментарий на этой странице",
      likes: 3,
      isLiked: false,
    },
    {
      id: 2,
      name: "Варвара Н.",
      date: "13.02.22 19:22",
      text: "Мне нравится как оформлена эта страница! ❤",
      likes: 75,
      isLiked: true,
    },
  ];

  // Сразу устанавливаем fallback данные и рендерим
  setComments(fallbackComments);
  renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);

  // Устанавливаем начальное состояние
  massageEL.disabled = true;

  // Загружаем данные с API в фоне
  loadCommentsFromAPI().then((apiComments) => {
    if (apiComments && apiComments.length > 0) {
      // Сбрасываем лайки при загрузке новых комментариев
      localLikes = {};

      // Используем данные с сервера
      setComments(apiComments);
      renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);
    }
  });

  console.log("✨ initApp: инициализация завершена");

  return {
    getComments: () => comments,
    getReplyingTo: () => replyingTo,
    setReplyingTo: (value) => {
      replyingTo = value;
    },
    render: () =>
      renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes),
    addComment: async (nameText, commentText) => {
      console.log("➕ addComment: добавляю комментарий от", nameText);
      const currentDateTime = getCurrentDateTime();
      let finalCommentText = commentText;

      if (replyingTo !== null && comments[replyingTo]) {
        const parentComment = comments[replyingTo];
        finalCommentText = `> ${parentComment.name}: ${parentComment.text}\n\n${commentText}`;
      }

      const commentData = {
        name: escapeHtml(nameText),
        date: currentDateTime,
        text: escapeHtml(finalCommentText),
        likes: 0,
        isLiked: false,
      };

      try {
        // 1. Отправляем на сервер
        console.log("📤 addComment: отправляю на сервер");
        const newComment = await postComment(commentData);

        // 2. Добавляем в локальный массив
        addComment({
          ...newComment,
          isLiked: false, // Новые комментарии всегда без лайков
        });

        // 3. Сбрасываем состояние ответа
        replyingTo = null;
        commentsEL.placeholder = "Введите ваш комментарий";

        // 4. Перерисовываем
        renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);

        //5. Если вдруг ошибка:
        return newComment.id;
      } catch (error) {
        console.error("❌ addComment: ошибка", error);
        return null;
      }
    },
    updateCommentLike: (index) => {
      console.log("❤️ updateCommentLike: лайк для комментария", index);
      if (index >= 0 && index < comments.length) {
        const comment = comments[index];
        const commentId = comment.id;

        localLikes[commentId] = !localLikes[commentId];

        // Перерисовываем
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
    escapeHtml,
  };
}

// Отдельная функция для загрузки с API
async function loadCommentsFromAPI() {
  try {
    console.log("⏳ Загружаю комментарии с API...");
    return await fetchComments();
  } catch (error) {
    console.log("⚠️ API недоступно, используем fallback");
    return null;
  }
}

// Новая функция для рендеринга с учетом локальных лайков
function renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes) {
  const commentHTML = comments
    .map((comment, index) => {
      const hasLocalLike = localLikes[comment.id] || false;
      const likeButtonClass = hasLocalLike
        ? "like-button -active-like"
        : "like-button";
      const replyClass = replyingTo === index ? "comment-replying" : "";

      // Считаем общее количество лайков: серверные + локальные
      const totalLikes = comment.likes + (hasLocalLike ? 1 : 0);

      return `<li class="comment ${replyClass}" data-index="${index}" data-id="${comment.id}">
                <div class="comment-header">
                    <div>${comment.name}</div>
                    <div>${comment.date}</div>
                </div>
                <div class="comment-body">
                    <div class="comment-text">
                        ${comment.text}
                    </div>
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
