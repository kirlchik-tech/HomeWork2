export function initLikeHandlers(ulEL, app) {
  ulEL.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("like-button")) {
      const index = parseInt(target.getAttribute("data-index"));

      if (typeof app.updateCommentLike === "function") {
        app.updateCommentLike(index);
      } else {
        console.error("updateCommentLike не найден в app");
      }
      return;
    }

    const commentElement = target.closest(".comment");
    if (commentElement && !target.closest(".likes")) {
      const index = parseInt(commentElement.getAttribute("data-index"));
      const comments = app.getComments ? app.getComments() : [];

      if (index >= 0 && index < comments.length) {
        const comment = comments[index];
        const currentReplyingTo = app.getReplyingTo
          ? app.getReplyingTo()
          : null;

        if (currentReplyingTo === index) {
          app.setReplyingTo && app.setReplyingTo(null);
          window.commentsEL.placeholder = "Введите ваш комментарий";
        } else {
          app.setReplyingTo && app.setReplyingTo(index);
          window.commentsEL.placeholder = `Ответ на комментарий ${comment.name}`;
        }

        window.commentsEL.focus();
        app.render && app.render();
      }
    }
  });
}

export function initFormHandlers(nameEL, commentsEL, massageEL, app) {
  const validate = () => {
    if (typeof app.validateForm === "function") {
      return app.validateForm();
    } else {
      console.error("validateForm не найден в app");
      return false;
    }
  };

  nameEL.addEventListener("input", validate);
  commentsEL.addEventListener("input", validate);

  commentsEL.addEventListener("input", function () {
    const replyingTo = app.getReplyingTo ? app.getReplyingTo() : null;
    if (this.value.trim() === "" && replyingTo !== null) {
      app.setReplyingTo && app.setReplyingTo(null);
      commentsEL.placeholder = "Введите ваш комментарий";
      app.render && app.render();
    }
  });

  massageEL.addEventListener("click", () => {
    if (validate()) {
      const nameText = nameEL.value.trim();
      const commentText = commentsEL.value.trim();

      if (nameText && commentText) {
        // addComment теперь async, ждем его завершения
        const result = app.addComment(nameText, commentText);
        if (result && typeof result.then === "function") {
          result
            .then(() => {
              nameEL.value = "";
              commentsEL.value = "";
              massageEL.disabled = true;
              app.hideFormError && app.hideFormError();
            })
            .catch((error) => {
              console.error("Ошибка при добавлении:", error);
            });
        } else {
          // Для совместимости, если addComment не async
          nameEL.value = "";
          commentsEL.value = "";
          massageEL.disabled = true;
          app.hideFormError && app.hideFormError();
        }
      }
    }
  });

  commentsEL.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (validate()) {
        const nameText = nameEL.value.trim();
        const commentText = commentsEL.value.trim();

        if (nameText && commentText) {
          const result = app.addComment(nameText, commentText);
          if (result && typeof result.then === "function") {
            result
              .then(() => {
                nameEL.value = "";
                commentsEL.value = "";
                massageEL.disabled = true;
                app.hideFormError && app.hideFormError();
              })
              .catch((error) => {
                console.error("Ошибка при добавлении:", error);
              });
          } else {
            nameEL.value = "";
            commentsEL.value = "";
            massageEL.disabled = true;
            app.hideFormError && app.hideFormError();
          }
        }
      }
    }
  });

  document.addEventListener("keydown", function (event) {
    const replyingTo = app.getReplyingTo ? app.getReplyingTo() : null;
    if (event.key === "Escape" && replyingTo !== null) {
      app.setReplyingTo && app.setReplyingTo(null);
      commentsEL.placeholder = "Введите ваш комментарий";
      app.render && app.render();
    }
  });
}
