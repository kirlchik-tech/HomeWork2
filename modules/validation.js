export function showError(errorMessage, inputElement, message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
  if (inputElement) {
    inputElement.style.borderColor = "#dc3545";
  }
}

export function hideError(errorMessage, inputElement) {
  if (errorMessage) {
    errorMessage.style.display = "none";
  }
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
  hideError,
) {
  // Проверяем, что commentsEL существует
  if (!commentsEL) {
    console.error("commentsEL не найден в validateAll");
    return false;
  }

  const commentText = commentsEL.value.trim();
  let isValid = true;

  // Сбрасываем ошибки
  hideError(errorMessage, commentsEL);
  if (errorMessage) {
    errorMessage.textContent = "";
  }

  // Проверка комментария (основное требование)
  if (commentText.length === 0) {
    showError(errorMessage, commentsEL, "Напишите комментарий!");
    isValid = false;
  } else if (commentText.length < 3) {
    showError(
      errorMessage,
      commentsEL,
      "Комментарий должен содержать хотя бы 3 символа!",
    );
    isValid = false;
  }

  // Разрешаем кнопку только если проверка пройдена
  if (massageEL) {
    massageEL.disabled = !isValid;
  }

  return isValid;
}
