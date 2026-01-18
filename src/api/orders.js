import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export async function listAssignedOrders() {
  return httpClient.get(endpoints.orders.listAssigned);
}

export async function fetchOrderDetail(orderId) {
  return httpClient.get(endpoints.orders.detail(orderId));
}

export async function checkinOrder({ orderId, gps_event }) {
  return httpClient.post(endpoints.orders.checkin, {
    order_id: orderId,
    gps_event,
  });
}

export async function completeOrder({ orderId, evidencePointers, notes }) {
  return httpClient.post(endpoints.orders.complete, {
    order_id: orderId,
    evidence_pointers: evidencePointers,
    notes,
  });
}

export async function fetchOrderEvents(orderId) {
  return httpClient.get(endpoints.orders.events(orderId));
}

export async function initEvidenceUpload({ orderId, file }) {
  const body = {
    order_id: orderId,
    mime: file.type,
    size: file.size,
    filename: file.name,
  };

  return httpClient.post(endpoints.orders.evidenceUpload, body);
}

export async function commitEvidence({ orderId, pointer, hash, type, metadata }) {
  return httpClient.post(endpoints.orders.evidenceCommit(orderId), {
    pointer,
    hash,
    type,
    metadata,
  });
}

export async function fetchEvidenceList(orderId) {
  return httpClient.get(endpoints.orders.evidenceList(orderId));
}
