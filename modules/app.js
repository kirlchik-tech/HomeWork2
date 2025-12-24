import { comments } from "./data.js";
import { getCurrentDateTime, escapeHtml } from "./utils.js";
import { showError, hideError, validateAll } from "./validation.js";
import { renderComments } from "./render.js";

let replyingTo = null;

export function initApp(nameEL, commentsEL, ulEL, massageEL, errorMessage) {
  // Очищаем ul перед рендерингом
  ulEL.innerHTML = "";

  // Рендерим комментарии
  renderComments(comments, ulEL, replyingTo);

  // Устанавливаем начальное состояние
  massageEL.disabled = true;

  return {
    getComments: () => comments,
    getReplyingTo: () => replyingTo,
    setReplyingTo: (value) => {
      replyingTo = value;
    },
    render: () => renderComments(comments, ulEL, replyingTo),
    addComment: (nameText, commentText) => {
      const currentDateTime = getCurrentDateTime();
      let finalCommentText = commentText;

      if (replyingTo !== null && comments[replyingTo]) {
        const parentComment = comments[replyingTo];
        finalCommentText = `> ${parentComment.name}: ${parentComment.text}\n\n${commentText}`;
      }

      comments.push({
        name: escapeHtml(nameText),
        date: currentDateTime,
        text: escapeHtml(finalCommentText),
        likes: 0,
        isLiked: false,
      });

      replyingTo = null;
      commentsEL.placeholder = "Введите ваш комментарий";
      renderComments(comments, ulEL, replyingTo);
    },
    updateCommentLike: (index) => {
      if (index >= 0 && index < comments.length) {
        comments[index].isLiked = !comments[index].isLiked;
        comments[index].likes += comments[index].isLiked ? 1 : -1;
        renderComments(comments, ulEL, replyingTo);
      }
    },
    validateForm: () =>
      validateAll(
        nameEL,
        commentsEL,
        massageEL,
        errorMessage,
        showError,
        hideError
      ),
    hideFormError: () => hideError(errorMessage, nameEL),
    escapeHtml,
  };
}
