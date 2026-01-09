import { comments, setComments } from "./data.js";
import { showError } from "./validation.js";
import { fetchComments, postComment } from "./api.js";
import { delay } from "./utils.js";

let replyingTo = null;
let localLikes = {};
let loadingLikes = {};

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

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Загрузка комментариев из API с лоадером
function loadCommentsWithLoader(commentsLoadingEL, ulEL) {
  // Проверяем, что элемент существует
  if (!commentsLoadingEL) {
    console.error("❌ commentsLoadingEL не найден");
    return Promise.resolve();
  }

  console.log("⏳ Показываю лоадер загрузки...");

  // Гарантированно показываем лоадер
  commentsLoadingEL.style.display = "block";
  commentsLoadingEL.classList.add("active");

  return fetchComments()
    .then((apiComments) => {
      console.log("✅ Комментарии получены, скрываю лоадер");

      // Гарантированно скрываем лоадер
      commentsLoadingEL.style.display = "none";
      commentsLoadingEL.classList.remove("active");

      // Также скрываем лоадер добавления на всякий случай
      const addLoadingEL = document.getElementById("add-loading");
      if (addLoadingEL) {
        addLoadingEL.style.display = "none";
        addLoadingEL.classList.remove("active");
      }

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

      // Гарантированно скрываем при ошибке
      if (commentsLoadingEL) {
        commentsLoadingEL.style.display = "none";
        commentsLoadingEL.classList.remove("active");
      }

      console.error("❌ Ошибка загрузки:", error);
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

      formEL.style.display = "none";
      addLoadingEL.style.display = "block";
      addLoadingEL.classList.add("active");

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

          formEL.style.display = "block";
          addLoadingEL.style.display = "none";
          addLoadingEL.classList.remove("active");

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
          if (formEL && addLoadingEL) {
            formEL.style.display = "block";
            addLoadingEL.style.display = "none";
            addLoadingEL.classList.remove("active");
          }

          showError(errorMessage, null, "Не удалось добавить комментарий");
          console.error("❌ Ошибка:", error);

          throw error;
        });
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
