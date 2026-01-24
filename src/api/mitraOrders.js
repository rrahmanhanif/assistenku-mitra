import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

function normalizeOrderList(response) {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : [];
}

export async function listMitraOrders() {
  const response = await httpClient.get(endpoints.mitra.orders);
  return normalizeOrderList(response);
}

export function acceptMitraOrder(orderId) {
  return httpClient.post(endpoints.mitra.acceptOrder(orderId));
}

export function startMitraOrder(orderId) {
  return httpClient.post(endpoints.mitra.startOrder(orderId));
}

export function finishMitraOrder(orderId) {
  return httpClient.post(endpoints.mitra.finishOrder(orderId));
}
