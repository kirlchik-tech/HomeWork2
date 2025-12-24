export function showError(errorMessage, inputElement, message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  if (inputElement) {
    inputElement.style.borderColor = "#dc3545";
  }
}

export function hideError(errorMessage, inputElement) {
  errorMessage.style.display = "none";
  if (inputElement) {
    inputElement.style.borderColor = "#ddd";
  }
}

export function validateAll(
  nameEL,
  commentsEL,
  massageEL,
  errorMessage,
  showError,
  hideError
) {
  const nameText = nameEL.value.trim();
  const commentText = commentsEL.value.trim();
  let isValid = true;

  // Сбрасываем всё
  hideError(errorMessage, nameEL);
  hideError(errorMessage, commentsEL);
  errorMessage.textContent = "";

  // Проверка имени
  if (nameText.length === 0) {
    showError(errorMessage, nameEL, "Напишите своё имя!");
    isValid = false;
  }

  // Проверка комментария
  if (commentText.length === 0) {
    showError(errorMessage, commentsEL, "Напишите комментарий!");
    isValid = false;
  }

  // Если оба поля пустые
  if (nameText.length === 0 && commentText.length === 0) {
    showError(errorMessage, nameEL, "Заполните имя и комментарий!");
  }

  // Разрешаем кнопку только если все проверки пройдены
  massageEL.disabled = !isValid;

  return isValid;
}
