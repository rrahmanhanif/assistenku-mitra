// src/lib/chat.js
import { request } from "../shared/httpClient";

// ------------------------------
// SEND CHAT MESSAGE
// ------------------------------
export async function sendChatMessage(payload) {
  try {
    const response = await request("/api/mitra/chat/messages", {
      method: "POST",
      body: {
        order_id: payload.order_id,
        sender_type: payload.sender_type, // "customer" / "mitra"
        sender_id: payload.sender_id,
        message: payload.message,
      },
    });

    return response?.data ?? null;
  } catch (error) {
    console.error("Send chat error:", error);
    return null;
  }
}

// ------------------------------
// GET CHAT HISTORY
// ------------------------------
export async function getChat(orderId) {
  try {
    const response = await request(`/api/mitra/chat/${orderId}`);
    const data = response?.data?.messages ?? response?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Get chat error:", error);
    return [];
  }
}

// ------------------------------
// REALTIME CHAT LISTENER (DISABLED)
// ------------------------------
export function subscribeChat(orderId, callback) {
  console.warn("Realtime chat disabled. Polling should be used instead.");

  return {
    unsubscribe: () => {},
  };
}
