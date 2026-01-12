import { comments, setComments } from "./data.js";
import { showError } from "./validation.js";
import { fetchComments, postComment } from "./api.js";
import { delay } from "./utils.js";

let replyingTo = null;
let localLikes = {};
let loadingLikes = {};
let formData = {
  name: "",
  text: "",
};

function renderCommentsWithLikes(
  comments,
  ulEL,
  replyingTo,
  localLikes,
  loadingLikes = {}
) {
  const commentHTML = comments
    .map((comment, index) => {
      const isLikeLoading = loadingLikes[comment.id] || false;
      const hasLocalLike = localLikes[comment.id] || false;
      const replyClass = replyingTo === index ? "comment-replying" : "";

      const likeButtonClass = isLikeLoading
        ? "like-button -loading-like"
        : hasLocalLike
          ? "like-button -active-like"
          : "like-button";

      const disabledAttr = isLikeLoading ? "disabled" : "";
      const totalLikes = comment.likes + (hasLocalLike ? 1 : 0);

      const displayName = comment.name || "";
      const displayText = comment.text || "";

      return `<li class="comment ${replyClass}" data-index="${index}" data-id="${comment.id}">
                <div class="comment-header">
                    <div>${displayName}</div>
                    <div>${comment.date || ""}</div>
                </div>
                <div class="comment-body">
                    <div class="comment-text">${displayText}</div>
                </div>
                <div class="comment-footer">
                    <div class="likes">
                        <span class="likes-counter">${totalLikes}</span>
                        <button class="${likeButtonClass}" 
                                data-index="${index}" 
                                ${disabledAttr}></button>
                    </div>
                </div>
            </li>`;
    })
    .join("");

  ulEL.innerHTML = commentHTML;
}

// Загрузка комментариев из API с лоадером
function loadCommentsWithLoader(commentsLoadingEL, ulEL) {
  if (!commentsLoadingEL) {
    console.error("❌ commentsLoadingEL не найден");
    return Promise.resolve();
  }

  console.log("⏳ Показываю лоадер загрузки...");
  commentsLoadingEL.style.display = "block";

  return fetchComments()
    .then((apiComments) => {
      console.log("✅ Комментарии получены, скрываю лоадер");
      commentsLoadingEL.style.display = "none";

      if (apiComments && apiComments.length > 0) {
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

        setComments(formattedComments);
        renderCommentsWithLikes(
          comments,
          ulEL,
          replyingTo,
          localLikes,
          loadingLikes
        );
        console.log("✨ Комментарии загружены");
      } else {
        console.log("⚠️ Нет комментариев");
      }
    })
    .catch((error) => {
      console.log("❌ Ошибка, скрываю лоадер");
      commentsLoadingEL.style.display = "none";

      // Показываем ошибку пользователю
      let userMessage = error.message;

      if (error.message.includes("Проблемы с интернетом")) {
        userMessage =
          "Не удалось загрузить комментарии. Проверьте интернет-соединение.";
      } else if (error.message.includes("Ошибка сервера")) {
        userMessage = "Сервер временно недоступен. Попробуйте позже.";
      }

      console.error("❌ Ошибка загрузки:", error);

      // Показываем alert в режиме отладки
      if (window.DEBUG) {
        alert(`Ошибка загрузки: ${userMessage}`);
      }
    });
}

export function initApp(
  nameEL,
  commentsEL,
  ulEL,
  massageEL,
  errorMessage,
  commentsLoadingEL,
  addLoadingEL,
  formEL
) {
  console.log("🎬 Начинаю инициализацию...");

  // Сохраняем ссылки на элементы формы
  window.nameEL = nameEL;
  window.commentsEL = commentsEL;

  // Восстанавливаем данные формы если они есть
  nameEL.value = formData.name;
  commentsEL.value = formData.text;

  // Слушаем ввод в форму для сохранения данных
  nameEL.addEventListener("input", () => {
    formData.name = nameEL.value;
  });

  commentsEL.addEventListener("input", () => {
    formData.text = commentsEL.value;
  });

  // Проверяем, что все элементы существуют
  if (!commentsLoadingEL) {
    console.error("❌ commentsLoadingEL не передан в initApp");
  } else {
    console.log("✅ commentsLoadingEL найден");
  }
  if (!addLoadingEL) {
    console.error("❌ addLoadingEL не передан в initApp");
  } else {
    console.log("✅ addLoadingEL найден");
  }
  if (!formEL) {
    console.error("❌ formEL не передан в initApp");
  } else {
    console.log("✅ formEL найден");
  }

  // Показываем то, что есть
  renderCommentsWithLikes(comments, ulEL, replyingTo, localLikes, loadingLikes);
  massageEL.disabled = true;

  // Загружаем из API с лоадером
  loadCommentsWithLoader(commentsLoadingEL, ulEL);

  console.log("✨ Инициализация завершена");

  return {
    getComments: () => comments,
    getReplyingTo: () => replyingTo,
    setReplyingTo: (value) => {
      replyingTo = value;
    },
    render: () =>
      renderCommentsWithLikes(
        comments,
        ulEL,
        replyingTo,
        localLikes,
        loadingLikes
      ),

    addComment: (nameText, commentText) => {
      console.log("➕ Добавляю комментарий от", nameText);

      if (!formEL || !addLoadingEL) {
        console.error("❌ Форма или лоадер не найдены");
        return Promise.reject("Форма не найдена");
      }

      // Сохраняем текущие данные
      formData.name = nameText;
      formData.text = commentText;

      // Скрываем форму, показываем лоадер
      formEL.style.display = "none";
      addLoadingEL.style.display = "block";

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
        finalCommentText = `${parentComment.name}: ${parentComment.text}\n\n${commentText}`;
      }

      const commentData = {
        name: nameText,
        text: finalCommentText,
      };

      // Функция для повторной попытки отправки
      const retryPost = (attempt = 1, maxAttempts = 3) => {
        return postComment(commentData)
          .then((newCommentFromApi) => {
            const commentToAdd = newCommentFromApi || {
              id: Date.now(),
              name: commentData.name,
              text: commentData.text,
              author: { name: commentData.name },
              date: formattedDate,
              likes: 0,
              isLiked: false,
            };

            comments.push(commentToAdd);
            replyingTo = null;
            commentsEL.placeholder = "Введите ваш комментарий";

            // Очищаем форму только при успехе
            nameEL.value = "";
            commentsEL.value = "";
            formData.name = "";
            formData.text = "";

            // Показываем форму обратно
            formEL.style.display = "block";
            addLoadingEL.style.display = "none";

            renderCommentsWithLikes(
              comments,
              ulEL,
              replyingTo,
              localLikes,
              loadingLikes
            );

            console.log("✅ Комментарий добавлен");
            return commentToAdd.id;
          })
          .catch((error) => {
            // Показываем форму обратно при ошибке
            formEL.style.display = "block";
            addLoadingEL.style.display = "none";

            // Восстанавливаем данные формы
            nameEL.value = formData.name;
            commentsEL.value = formData.text;

            // Проверяем тип ошибки
            if (
              error.message.includes("Ошибка сервера") &&
              attempt < maxAttempts
            ) {
              console.log(
                `🔄 Повторная попытка ${attempt + 1}/${maxAttempts}...`
              );

              // Ждём 2 секунды перед повторной попыткой
              return delay(2000).then(() => {
                return retryPost(attempt + 1, maxAttempts);
              });
            } else {
              // Показываем пользователю ошибку
              let userMessage = error.message;

              if (error.message.includes("Проблемы с интернетом")) {
                userMessage =
                  "Нет интернета. Проверьте соединение и попробуйте снова.";
              } else if (
                error.message.includes("Имя или комментарий слишком короткие")
              ) {
                userMessage =
                  "Имя и комментарий должны быть не короче 3 символов.";
              }

              // Показываем alert как требует задание
              alert(`Ошибка: ${userMessage}`);

              // Показываем ошибку в форме
              showError(errorMessage, null, userMessage);
              console.error("❌ Ошибка:", error);

              throw error;
            }
          });
      };

      // Начинаем первую попытку
      return retryPost();
    },

    updateCommentLike: (index) => {
      if (index >= 0 && index < comments.length) {
        const comment = comments[index];

        loadingLikes[comment.id] = true;
        renderCommentsWithLikes(
          comments,
          ulEL,
          replyingTo,
          localLikes,
          loadingLikes
        );

        return delay(2000).then(() => {
          localLikes[comment.id] = !localLikes[comment.id];
          loadingLikes[comment.id] = false;

          renderCommentsWithLikes(
            comments,
            ulEL,
            replyingTo,
            localLikes,
            loadingLikes
          );
        });
      }
    },

    validateForm: () => {
      return import("./validation.js")
        .then((validation) => {
          return validation.validateAll(
            nameEL,
            commentsEL,
            massageEL,
            errorMessage,
            validation.showError,
            validation.hideError
          );
        })
        .catch((error) => {
          console.error("❌ Ошибка загрузки validation.js:", error);
          return false;
        });
    },

    hideFormError: () => {
      import("./validation.js")
        .then((validation) => {
          validation.hideError(errorMessage, nameEL);
        })
        .catch((error) => {
          console.error("❌ Ошибка загрузки validation.js:", error);
        });
    },
  };
}
