import { appendOrderEvent } from "./orderEvents";
import { request } from "../shared/httpClient";

export const ORDER_STATUS = {
  ORDER_CREATED: "ORDER_CREATED",
  WAITING_ASSIGNMENT: "WAITING_ASSIGNMENT",
  ASSIGNED: "ASSIGNED",
  MITRA_ACCEPTED: "MITRA_ACCEPTED",
  MITRA_DECLINED: "MITRA_DECLINED",
  MITRA_ON_ROUTE: "MITRA_ON_ROUTE",
  IN_PROGRESS: "IN_PROGRESS",
  EVIDENCE_SUBMITTED: "EVIDENCE_SUBMITTED",
  LOCKED_BY_SYSTEM: "LOCKED_BY_SYSTEM",
  WAITING_CUSTOMER_APPROVAL: "WAITING_CUSTOMER_APPROVAL",
  COMPLETED: "COMPLETED",
  CLOSED: "CLOSED",
  DISPUTED: "DISPUTED",
};

const LEGACY_STATUS_MAP = {
  diterima: ORDER_STATUS.MITRA_ACCEPTED,
  menjemput: ORDER_STATUS.MITRA_ON_ROUTE,
  sedang_jalan: ORDER_STATUS.IN_PROGRESS,
  selesai: ORDER_STATUS.COMPLETED,
};

const MITRA_TRANSITIONS = {
  [ORDER_STATUS.WAITING_ASSIGNMENT]: [ORDER_STATUS.ASSIGNED],
  [ORDER_STATUS.ASSIGNED]: [ORDER_STATUS.MITRA_ACCEPTED, ORDER_STATUS.MITRA_DECLINED],
  [ORDER_STATUS.MITRA_ACCEPTED]: [ORDER_STATUS.MITRA_ON_ROUTE],
  [ORDER_STATUS.MITRA_ON_ROUTE]: [ORDER_STATUS.IN_PROGRESS],
  [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.EVIDENCE_SUBMITTED],
  [ORDER_STATUS.EVIDENCE_SUBMITTED]: [ORDER_STATUS.LOCKED_BY_SYSTEM],
};

export const STATUS_LABEL = {
  [ORDER_STATUS.ORDER_CREATED]: "Order Dibuat",
  [ORDER_STATUS.WAITING_ASSIGNMENT]: "Menunggu Mitra",
  [ORDER_STATUS.ASSIGNED]: "Mitra Ditugaskan",
  [ORDER_STATUS.MITRA_ACCEPTED]: "Diterima Mitra",
  [ORDER_STATUS.MITRA_DECLINED]: "Ditolak Mitra",
  [ORDER_STATUS.MITRA_ON_ROUTE]: "Menuju Lokasi",
  [ORDER_STATUS.IN_PROGRESS]: "Sedang Dikerjakan",
  [ORDER_STATUS.EVIDENCE_SUBMITTED]: "Bukti Dikirim",
  [ORDER_STATUS.LOCKED_BY_SYSTEM]: "Dikunci Sistem",
  [ORDER_STATUS.WAITING_CUSTOMER_APPROVAL]: "Menunggu Persetujuan",
  [ORDER_STATUS.COMPLETED]: "Selesai",
  [ORDER_STATUS.CLOSED]: "Ditutup",
  [ORDER_STATUS.DISPUTED]: "Disengketakan",
};

export function normalizeStatus(rawStatus) {
  if (!rawStatus) return ORDER_STATUS.ORDER_CREATED;
  const lowered = String(rawStatus).toLowerCase();
  if (LEGACY_STATUS_MAP[lowered]) return LEGACY_STATUS_MAP[lowered];

  const upper = String(rawStatus).toUpperCase();
  return ORDER_STATUS[upper] ? ORDER_STATUS[upper] : upper;
}

export function allowedNextStatuses(currentStatus, role = "MITRA") {
  if (role !== "MITRA") return [];
  const normalized = normalizeStatus(currentStatus);
  return MITRA_TRANSITIONS[normalized] || [];
}

function assertActorScope(orderRow, actorId, actorRole) {
  if (
    actorRole === "MITRA" &&
    orderRow?.mitra_id &&
    orderRow.mitra_id !== actorId
  ) {
    throw new Error("Anda tidak berwenang mengakses order ini");
  }

  if (
    actorRole === "CUSTOMER" &&
    orderRow?.customer_id &&
    orderRow.customer_id !== actorId
  ) {
    throw new Error("Order tidak termasuk ke akun customer Anda");
  }
}

export async function fetchScopedOrder({
  orderId,
  actorId,
  actorRole = "MITRA",
}) {
  const response = await request(`/api/orders/${orderId}`);
  const data = response?.data?.order ?? response?.data ?? response;

  if (!data) {
    throw new Error(`Order ${orderId} tidak ditemukan.`);
  }

  assertActorScope(data, actorId, actorRole);

  return {
    ...data,
    status: normalizeStatus(data.status),
  };
}

export async function transitionOrderStatus({
  orderId,
  toStatus,
  actorId,
  actorRole = "MITRA",
}) {
  const existingResponse = await request(`/api/orders/${orderId}`);
  const existingOrder =
    existingResponse?.data?.order ??
    existingResponse?.data ??
    existingResponse;

  assertActorScope(existingOrder, actorId, actorRole);

  const currentStatus = normalizeStatus(existingOrder?.status);
  const validNextStatuses = allowedNextStatuses(currentStatus, actorRole);

  if (!validNextStatuses.includes(toStatus)) {
    throw new Error(
      `Transisi status tidak valid dari ${currentStatus} ke ${toStatus}`
    );
  }

  const updateResponse = await request(`/api/orders/${orderId}`, {
    method: "PUT",
    body: {
      status: toStatus,
      updated_at: new Date().toISOString(),
    },
  });

  const updatedOrder =
    updateResponse?.data?.order ??
    updateResponse?.data ??
    updateResponse;

  await appendOrderEvent({
    orderId,
    actorId,
    actorRole,
    eventType: "STATUS_CHANGED",
    payload: {
      from: currentStatus,
      to: toStatus,
    },
  });

  return {
    ...updatedOrder,
    status: normalizeStatus(updatedOrder?.status),
  };
}
