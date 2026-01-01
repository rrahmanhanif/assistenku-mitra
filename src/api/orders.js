import { apiClient } from "./apiClient";

export async function listAssignedOrders() {
  return apiClient.get("/api/orders/list?scope=assigned");
}

export async function fetchOrderDetail(orderId) {
  return apiClient.get(`/api/orders/${orderId}`);
}

export async function checkinOrder({ orderId, gps_event }) {
  return apiClient.post("/api/orders/checkin", { order_id: orderId, gps_event });
}

export async function completeOrder({ orderId, evidencePointers, notes }) {
  return apiClient.post("/api/orders/complete", {
    order_id: orderId,
    evidence_pointers: evidencePointers,
    notes,
  });
}

export async function fetchOrderEvents(orderId) {
  return apiClient.get(`/api/orders/${orderId}/events`);
}

export async function initEvidenceUpload({ orderId, file }) {
  const body = {
    order_id: orderId,
    mime: file.type,
    size: file.size,
    filename: file.name,
  };
  return apiClient.post("/api/evidence/upload", body);
}

export async function commitEvidence({ orderId, pointer, hash, type, metadata }) {
  return apiClient.post(`/api/orders/${orderId}/evidence/commit`, {
    pointer,
    hash,
    type,
    metadata,
  });
}

export async function fetchEvidenceList(orderId) {
  return apiClient.get(`/api/orders/${orderId}/evidence`);
}
