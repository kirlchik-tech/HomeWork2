const API_URL = "https://wedev-api.sky.pro/api/v1/kirya-solovyev/comments";

// Загрузить список комментариев
export async function fetchComments() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Комментарии загружены:", data);

    return data.comments || [];
  } catch (error) {
    console.error("❌ Ошибка загрузки комментариев:", error.message);
    throw error; // Пробрасываем ошибку дальше в app.js
  }
}

// Добавить новый комментарий
export async function postComment(commentData) {
  try {
    const cleanText = removeHtmlTags(commentData.text);
    const cleanName = removeHtmlTags(commentData.name);

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
      const errorMessage =
        responseData.error || `Ошибка сервера ${response.status}`;
      throw new Error(errorMessage);
    }

    // Форматируем дату в дд.мм.гг
    const formattedDate = formatDateToDDMMYY(new Date().toISOString());

    return {
      id: Date.now(),
      text: cleanText,
      name: cleanName,
      author: { name: cleanName },
      date: formattedDate, // Дата в формате дд.мм.гг
      likes: 0,
      isLiked: false,
    };
  } catch (error) {
    console.error("❌ Ошибка отправки комментария:", error.message);
    throw error;
  }
}

// Функция для удаления HTML-тегов
function removeHtmlTags(text) {
  if (!text) return "";
  return text
    .toString()
    .replace("<[^>]*>", "")
    .replace("&lt", "<")
    .replace("&gt", ">")
    .replace("&amp", "&")
    .replace("&quot", '"')
    .replace("&lsquo", "'")
    .trim();
}

// Функция форматирования даты (если нет в utils.js)
function formatDateToDDMMYY(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}
