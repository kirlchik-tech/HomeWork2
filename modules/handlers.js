export function initLikeHandlers(ulEL, app) {
  ulEL.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("like-button")) {
      const index = parseInt(target.getAttribute("data-index"));
      app.updateCommentLike(index);
      return;
    }

    const commentElement = target.closest(".comment");
    if (commentElement && !target.closest(".likes")) {
      const index = parseInt(commentElement.getAttribute("data-index"));
      const comments = app.getComments();

      if (index >= 0 && index < comments.length) {
        const comment = comments[index];
        const currentReplyingTo = app.getReplyingTo();

        if (currentReplyingTo === index) {
          app.setReplyingTo(null);
          window.commentsEL.placeholder = "Введите ваш комментарий";
        } else {
          app.setReplyingTo(index);
          window.commentsEL.placeholder = `Ответ на комментарий ${comment.name}`;
        }

        window.commentsEL.focus();
        app.render();
      }
    }
  });
}

export function initFormHandlers(nameEL, commentsEL, massageEL, app) {
  const validate = () => app.validateForm();

  nameEL.addEventListener("input", validate);
  commentsEL.addEventListener("input", validate);

  commentsEL.addEventListener("input", function () {
    if (this.value.trim() === "" && app.getReplyingTo() !== null) {
      app.setReplyingTo(null);
      commentsEL.placeholder = "Введите ваш комментарий";
      app.render();
    }
  });

  massageEL.addEventListener("click", () => {
    if (app.validateForm()) {
      const nameText = nameEL.value.trim();
      const commentText = commentsEL.value.trim();

      if (nameText && commentText) {
        app.addComment(nameText, commentText);
        nameEL.value = "";
        commentsEL.value = "";
        massageEL.disabled = true;
        app.hideFormError();
      }
    }
  });

  commentsEL.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (app.validateForm()) {
        const nameText = nameEL.value.trim();
        const commentText = commentsEL.value.trim();

        if (nameText && commentText) {
          app.addComment(nameText, commentText);
          nameEL.value = "";
          commentsEL.value = "";
          massageEL.disabled = true;
          app.hideFormError();
        }
      }
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && app.getReplyingTo() !== null) {
      app.setReplyingTo(null);
      commentsEL.placeholder = "Введите ваш комментарий";
      app.render();
    }
  });
}
