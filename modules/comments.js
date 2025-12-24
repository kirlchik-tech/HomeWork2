export function createComment(name, text, date, likes = 0, isLiked = false) {
  return {
    name,
    text,
    date,
    likes,
    isLiked,
  };
}

export function toggleLike(comment) {
  return {
    ...comment,
    isLiked: !comment.isLiked,
    likes: comment.likes + (comment.isLiked ? -1 : 1),
  };
}

export function formatReply(parentComment, replyText) {
  return `> ${parentComment.name}: ${parentComment.text}\n\n${replyText}`;
}
