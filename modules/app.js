import { comments, setComments, addComment } from "./data.js";
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

async function loadCommentsFromAPI() {
  try {
    console.log("⏳ Пытаюсь загрузить комментарии с API...");
    const apiTodos = await fetchComments();

    if (!apiTodos || apiTodos.length === 0) {
      return null;
    }

    return apiTodos.map((todo) => ({
      id: todo.id,
      name: "Аноним",
      date: new Date().toLocaleDateString("ru-RU"),
      text: todo.text,
      likes: 0,
      isLiked: false,
    }));
  } catch (error) {
    throw error;
  }
}

export async function initApp(
  nameEL,
  commentsEL,
  ulEL,
  massageEL,
  errorMessage
) {
  console.log("🎬 Начинаю инициализацию...");

  renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);
  massageEL.disabled = true;

  loadCommentsFromAPI()
    .then((apiComments) => {
      if (apiComments && apiComments.length > 0) {
        console.log("✨ Загружены комментарии из API");
        setComments(apiComments);
        renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);
      }
    })
    .catch((error) => {
      console.log("⚠️ API недоступно, используем статические комментарии");
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
      console.log("🔍 DEBUG addComment вызван:");
      console.log("nameText:", nameText);
      console.log("commentText:", commentText);

      const currentDateTime = getCurrentDateTime();
      let finalCommentText = commentText;

      if (replyingTo !== null && comments[replyingTo]) {
        const parentComment = comments[replyingTo];
        finalCommentText = `> ${parentComment.name}: ${parentComment.text}\n\n${commentText}`;
      }

      const commentData = {
        name: escapeHtml(nameText),
        date: currentDateTime,
        text: finalCommentText,
        likes: 0,
        isLiked: false,
      };

      console.log("🔍 commentData.text до отправки:", commentData.text);
      console.log("🔍 Длина текста:", commentData.text.length);
      console.log("🔍 Тип text:", typeof commentData.text);

      try {
        console.log("🔄 Вызываю postComment...");
        const newCommentFromApi = await postComment(commentData);
        console.log("✅ postComment вернул:", newCommentFromApi);

        const commentToAdd = {
          ...newCommentFromApi,
          name: commentData.name,
          date: commentData.date,
          likes: commentData.likes,
          isLiked: commentData.isLiked,
        };

        console.log("🔄 Добавляю в локальный массив:", commentToAdd);
        addComment(commentToAdd);

        replyingTo = null;
        commentsEL.placeholder = "Введите ваш комментарий";
        renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes);

        console.log("✅ Комментарий успешно добавлен");
        return commentToAdd.id;
      } catch (error) {
        console.error("❌ Ошибка добавления:", error.message);
        console.error("❌ Полная ошибка:", error);
        return null;
      }
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
    escapeHtml,
  };
}
