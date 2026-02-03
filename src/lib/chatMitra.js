import { request } from "../shared/httpClient";

export async function sendMessage(orderId, sender, message) {
  return request("/api/mitra/chat/messages", {
    method: "POST",
    body: {
      order_id: orderId,
      sender,
      message,
    },
  });
}

export function subscribeChat(orderId, callback) {
  console.warn("Realtime chat disabled. Polling should be used instead.");

  return {
    unsubscribe: () => {},
  };
}
