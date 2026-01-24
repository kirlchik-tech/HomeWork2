import { getUser } from "./auth.js";

export function initLikeHandlers(ulEL, app) {
  ulEL.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("like-button")) {
      const index = parseInt(target.getAttribute("data-index"));

      if (app && typeof app.updateCommentLike === "function") {
        app.updateCommentLike(index);
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
  // Безопасная функция валидации
  const validate = () => {
    if (app && typeof app.validateForm === "function") {
      return app.validateForm();
    }
    console.error("validateForm не найден");
    return false;
  };

  // Проверяем, существует ли nameEL, перед добавлением обработчика
  if (nameEL) {
    nameEL.addEventListener("input", validate);
  }

  // commentsEL всегда должен существовать, но проверка не помешает
  if (commentsEL) {
    commentsEL.addEventListener("input", validate);
  }

  // Обработчик для очистки ответа при пустом поле
  if (commentsEL) {
    commentsEL.addEventListener("input", function () {
      const replyingTo = app.getReplyingTo ? app.getReplyingTo() : null;
      if (this.value.trim() === "" && replyingTo !== null) {
        app.setReplyingTo && app.setReplyingTo(null);
        commentsEL.placeholder = "Введите ваш комментарий";
        app.render && app.render();
      }
    });
  }

  // ОДИН обработчик клика для кнопки отправки
  if (massageEL) {
    massageEL.addEventListener("click", () => {
      if (validate()) {
        // Получаем имя пользователя из localStorage
        const user = getUser();
        const userName = user ? user.name : "Аноним";
        const commentText = commentsEL ? commentsEL.value.trim() : "";

        if (commentText) {
          const result = app.addComment(userName, commentText);
          if (result && typeof result.then === "function") {
            result
              .then(() => {
                // Очищаем только поле комментария
                if (nameEL) nameEL.value = "";
                if (commentsEL) commentsEL.value = "";
                massageEL.disabled = true;
                app.hideFormError && app.hideFormError();
              })
              .catch((error) => {
                console.error("Ошибка при добавлении:", error);
              });
          } else {
            // Для совместимости, если addComment не async
            if (nameEL) nameEL.value = "";
            if (commentsEL) commentsEL.value = "";
            massageEL.disabled = true;
            app.hideFormError && app.hideFormError();
          }
        }
      }
    });
  }

  // Обработчик Enter для отправки комментария
  if (commentsEL) {
    commentsEL.addEventListener("keypress", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (validate()) {
          const user = getUser();
          const userName = user ? user.name : "Аноним";
          const commentText = commentsEL.value.trim();

          if (commentText) {
            const result = app.addComment(userName, commentText);
            if (result && typeof result.then === "function") {
              result
                .then(() => {
                  if (nameEL) nameEL.value = "";
                  commentsEL.value = "";
                  massageEL.disabled = true;
                  app.hideFormError && app.hideFormError();
                })
                .catch((error) => {
                  console.error("Ошибка при добавлении:", error);
                });
            } else {
              if (nameEL) nameEL.value = "";
              commentsEL.value = "";
              massageEL.disabled = true;
              app.hideFormError && app.hideFormError();
            }
          }
        }
      }
    });
  }

  // Обработчик Escape для отмены ответа
  document.addEventListener("keydown", function (event) {
    const replyingTo = app.getReplyingTo ? app.getReplyingTo() : null;
    if (event.key === "Escape" && replyingTo !== null) {
      app.setReplyingTo && app.setReplyingTo(null);
      if (commentsEL) commentsEL.placeholder = "Введите ваш комментарий";
      app.render && app.render();
    }
  });
}
