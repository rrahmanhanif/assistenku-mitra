export function setBadgeUnread(orderId) {
  const current = JSON.parse(localStorage.getItem("unread_messages") || "[]");

  if (!current.includes(orderId)) {
    current.push(orderId);
    localStorage.setItem("unread_messages", JSON.stringify(current));
  }
}

export function clearBadgeUnread(orderId) {
  const current = JSON.parse(localStorage.getItem("unread_messages") || "[]");
  const updated = current.filter((id) => id !== orderId);

  localStorage.setItem("unread_messages", JSON.stringify(updated));
}

export function getUnreadCount() {
  const current = JSON.parse(localStorage.getItem("unread_messages") || "[]");
  return current.length;
}
