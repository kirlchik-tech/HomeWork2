import { comments, setComments } from "./data.js";
import { showError } from "./validation.js";
import { fetchComments, postComment, toggleLike } from "./api.js";
import { delay } from "./utils.js";
import { getToken, getUser } from "./auth.js";

let replyingTo = null;
let localLikes = {};
let loadingLikes = {};
let formData = {
  name: "",
  text: "",
};

// Функция для безопасного отображения HTML
function escapeHtml(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}

function renderCommentsWithLikes(
  comments,
  ulEL,
  replyingTo,
  localLikes, // Этот параметр больше не нужен, но оставим для совместимости
  loadingLikes = {},
) {
  const commentHTML = comments
    .map((comment, index) => {
      const isLikeLoading = loadingLikes[comment.id] || false;

      const hasLikeFromServer = comment.isLiked || false;

      const replyClass = replyingTo === index ? "comment-replying" : "";

      const likeButtonClass = isLikeLoading
        ? "like-button -loading-like"
        : hasLikeFromServer
          ? "like-button -active-like"
          : "like-button";

      const disabledAttr = isLikeLoading ? "disabled" : "";

      // Используем likes из комментария (с сервера)
      const totalLikes = comment.likes || 0;

      // Безопасное отображение с помощью escapeHtml
      const displayName = escapeHtml(comment.name || "");
      const displayText = escapeHtml(comment.text || "");

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
          loadingLikes,
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
  formEL,
) {
  console.log("🎬 Начинаю инициализацию...");

  window.nameEL = nameEL;
  window.commentsEL = commentsEL;

  if (nameEL) {
    nameEL.value = formData.name;
  }
  commentsEL.value = formData.text;

  if (nameEL) {
    nameEL.addEventListener("input", () => {
      formData.name = nameEL.value;
    });
  }

  commentsEL.addEventListener("input", () => {
    formData.text = commentsEL.value;
  });

  renderCommentsWithLikes(comments, ulEL, replyingTo, {}, loadingLikes);
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
        loadingLikes,
      ),

    addComment: (nameText, commentText) => {
      console.log("➕ Добавляю комментарий от", nameText);

      const userName = nameText;

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

      // Функция для повторной попытки отправки
      const retryPost = (attempt = 1, maxAttempts = 3) => {
        // Получаем токен авторизации
        const token = getToken();

        // Отправляем запрос с токеном
        return postComment(finalCommentText, token)
          .then((response) => {
            console.log("✅ Ответ сервера:", response);

            // 1. Показываем форму обратно
            formEL.style.display = "block";
            addLoadingEL.style.display = "none";

            // 2. Очищаем поле комментария
            commentsEL.value = "";
            formData.text = "";
            replyingTo = null;
            commentsEL.placeholder = "Введите ваш комментарий";

            return loadCommentsWithLoader(commentsLoadingEL, ulEL).then(() => {
              console.log(
                "✅ Комментарии перезагружены после добавления нового",
              );
              return "success";
            });
          })
          .catch((error) => {
            // Показываем форму обратно при ошибке
            formEL.style.display = "block";
            addLoadingEL.style.display = "none";

            // Восстанавливаем данные формы
            if (nameEL) nameEL.value = formData.name;
            commentsEL.value = formData.text;

            // Проверяем тип ошибки
            if (error.message.includes("Требуется авторизация")) {
              alert("Сессия истекла. Пожалуйста, войдите снова.");
              window.location.href = "login.html";
              return Promise.reject(error);
            }

            if (
              error.message.includes("Ошибка сервера") &&
              attempt < maxAttempts
            ) {
              console.log(
                `🔄 Повторная попытка ${attempt + 1}/${maxAttempts}...`,
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
                error.message.includes("должен содержать хотя бы 3 символа")
              ) {
                userMessage = "Комментарий должен содержать хотя бы 3 символа.";
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
        const token = getToken();

        if (!token) {
          alert("Чтобы ставить лайки, нужно авторизоваться!");
          return Promise.reject("Нет токена");
        }

        // 1. Показываем состояние загрузки
        loadingLikes[comment.id] = true;
        renderCommentsWithLikes(
          comments,
          ulEL,
          replyingTo,
          localLikes,
          loadingLikes,
        );

        // 2. Отправляем запрос на сервер
        return toggleLike(comment.id, token)
          .then((result) => {
            // 3. Убираем локальную логику! Используем только данные с сервера
            loadingLikes[comment.id] = false;

            // 4. Обновляем комментарий в массиве comments данными с сервера
            const commentIndex = comments.findIndex((c) => c.id === comment.id);
            if (commentIndex !== -1) {
              comments[commentIndex].likes = result.likes;
              comments[commentIndex].isLiked = result.isLiked;
            }

            renderCommentsWithLikes(
              comments,
              ulEL,
              replyingTo,
              {},
              loadingLikes,
            );

            console.log(
              `✅ Лайк обновлен: likes=${result.likes}, isLiked=${result.isLiked}`,
            );
          })
          .catch((error) => {
            loadingLikes[comment.id] = false;
            renderCommentsWithLikes(
              comments,
              ulEL,
              replyingTo,
              localLikes,
              loadingLikes,
            );
            console.error("❌ Ошибка при лайке:", error);
            alert(error.message || "Ошибка при установке лайка");
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
            validation.hideError,
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
