import { request } from "../shared/httpClient";

export async function appendOrderEvent({
  orderId,
  actorId,
  actorRole,
  eventType,
  payload,
}) {
  await request(`/api/orders/${orderId}/events`, {
    method: "POST",
    body: {
      order_id: orderId,
      actor_id: actorId,
      actor_role: actorRole,
      event_type: eventType,
      payload_json: payload,
      created_at: new Date().toISOString(),
    },
  });
}

export async function fetchOrderEvents(orderId) {
  const response = await request(`/api/orders/${orderId}/events`);
  const data = response?.data?.events ?? response?.data ?? response;
  return Array.isArray(data) ? data : [];
}
