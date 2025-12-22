export function initLikeHandlers(ulEL, comments, renderComments) {
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
        renderComments(comments, ulEL, window.replyingTo);
      }
      return;
    }

    const commentElement = target.closest(".comment");
    if (commentElement && !target.closest(".likes")) {
      const index = parseInt(commentElement.getAttribute("data-index"));

      if (!isNaN(index) && comments[index]) {
        const comment = comments[index];

        if (window.replyingTo === index) {
          window.replyingTo = null;
          window.commentsEL.placeholder = "Введите ваш комментарий";
        } else {
          window.replyingTo = index;
          window.commentsEL.placeholder = `Ответ на комментарий ${comment.name}`;
        }

        window.commentsEL.focus();
        renderComments(comments, ulEL, window.replyingTo);
      }
    }
  });
}

export function initFormHandlers(
  nameEL,
  commentsEL,
  massageEL,
  addComment,
  validateAll,
  errorMessage,
  showError,
  hideError
) {
  nameEL.addEventListener("input", () =>
    validateAll(
      nameEL,
      commentsEL,
      massageEL,
      errorMessage,
      showError,
      hideError
    )
  );
  commentsEL.addEventListener("input", () =>
    validateAll(
      nameEL,
      commentsEL,
      massageEL,
      errorMessage,
      showError,
      hideError
    )
  );

  commentsEL.addEventListener("input", function () {
    if (this.value.trim() === "" && window.replyingTo !== null) {
      window.replyingTo = null;
      commentsEL.placeholder = "Введите ваш комментарий";
      window.renderComments();
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
    if (event.key === "Escape" && window.replyingTo !== null) {
      window.replyingTo = null;
      commentsEL.placeholder = "Введите ваш комментарий";
      window.renderComments();
    }
  });
}
