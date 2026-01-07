const API_URL = "https://wedev-api.sky.pro/api/v1/kirya-solovyev/comments";

// Загрузить список комментариев
export async function fetchComments() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    console.error("❌ Ошибка загрузки:", response.status);
    return [];
  }

  const data = await response.json();
  console.log("✅ Комментарии загружены");
  return data.comments || [];
}

// Добавить новый комментарий
export async function postComment(commentData) {
  console.log("📤 Исходные данные:", {
    name: commentData.name,
    text: commentData.text,
  });

  // Очищаем текст (c проверкой)
  const cleanText = removeHtmlTags(commentData.text || "");
  const cleanName = removeHtmlTags(commentData.name || "");

  console.log("📤 После очистки:", {
    name: cleanName,
    text: cleanText,
    originalTextLength: commentData.text?.length,
    cleanedTextLength: cleanText.length,
  });

  const apiData = {
    text: cleanText,
    name: cleanName,
  };

  console.log("📤 Отправляю на сервер:", apiData);

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(apiData),
  });

  const responseData = await response.json();
  console.log("📤 Ответ сервера:", responseData);

  if (!response.ok) {
    console.error("❌ Ошибка сервера:", responseData.error || response.status);
    return null;
  }

  const date = new Date();
  const formattedDate =
    String(date.getDate()).padStart(2, "0") +
    "." +
    String(date.getMonth() + 1).padStart(2, "0") +
    "." +
    String(date.getFullYear()).slice(-2);

  return {
    id: Date.now(),
    text: cleanText,
    name: cleanName,
    author: { name: cleanName },
    date: formattedDate,
    likes: 0,
    isLiked: false,
  };
}

// Функция удаления HTML-тегов
function removeHtmlTags(text) {
  if (!text) return "";

  console.log("🧹 Очищаю текст:", text.substring(0, 50) + "...");

  const result = text
    .toString()
    .replace("<[^>]*", "")
    .replace("&lt", "<")
    .replace("&gt", ">")
    .replace("&amp", "&")
    .replace("&quot", '"')
    .replace("&lsquo", "'")
    .trim();

  console.log("🧹 Результат очистки:", result.substring(0, 50) + "...");
  return result;
}
