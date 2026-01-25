export let comments = [];

// Функция для установки комментариев из API
export function setComments(apiComments) {
  comments = apiComments;
}

// Функция для добавления нового комментария
export function addComment(newComment) {
  comments.push(newComment);
}
