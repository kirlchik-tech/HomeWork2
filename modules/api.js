const API_URL = "http://localhost:3000/api/comments";

// Функция для загрузки комментариев с сервера
export async function fetchComments() {
  console.log("📡 fetchComments: начинаю запрос к", API_URL);

  try {
    const response = await fetch(API_URL);
    console.log("📡 fetchComments: получил ответ", response.status);

    if (!response.ok) {
      console.error("📡 fetchComments: ошибка HTTP", response.status);
      return [];
    }

    const data = await response.json();
    console.log("📡 fetchComments: успешно, данных:", data.length);
    return data;
  } catch (error) {
    console.error("📡 fetchComments: ошибка сети", error.message);
    return [];
  }
}

// Функция для отправки комментария на сервер
export async function postComment(commentData) {
  console.log("📤 postComment: отправляю", commentData);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("📤 postComment: ошибка", error);

    return {
      id: Date.now(),
      ...commentData,
      likes: 0,
      isLiked: false,
    };
  }
}
