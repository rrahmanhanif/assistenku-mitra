import { supabase } from "../lib/supabaseClient";
import { appendOrderEvent } from "./orderEvents";

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
  [ORDER_STATUS.ASSIGNED]: [ORDER_STATUS.MITRA_ACCEPTED, ORDER_STATUS.MITRA_DECLINED],
  [ORDER_STATUS.MITRA_ACCEPTED]: [ORDER_STATUS.MITRA_ON_ROUTE],
  [ORDER_STATUS.MITRA_ON_ROUTE]: [ORDER_STATUS.IN_PROGRESS],
  [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.EVIDENCE_SUBMITTED],
  [ORDER_STATUS.EVIDENCE_SUBMITTED]: [ORDER_STATUS.LOCKED_BY_SYSTEM],
  [ORDER_STATUS.LOCKED_BY_SYSTEM]: [
    ORDER_STATUS.WAITING_CUSTOMER_APPROVAL,
    ORDER_STATUS.COMPLETED,
  ],
  [ORDER_STATUS.WAITING_CUSTOMER_APPROVAL]: [ORDER_STATUS.COMPLETED],
};

export const STATUS_LABEL = {
  [ORDER_STATUS.MITRA_ACCEPTED]: "Terima Job",
  [ORDER_STATUS.MITRA_DECLINED]: "Tolak Job",
  [ORDER_STATUS.MITRA_ON_ROUTE]: "Berangkat",
  [ORDER_STATUS.IN_PROGRESS]: "Mulai",
  [ORDER_STATUS.EVIDENCE_SUBMITTED]: "Kirim Evidence",
  [ORDER_STATUS.LOCKED_BY_SYSTEM]: "Kunci Evidence",
  [ORDER_STATUS.WAITING_CUSTOMER_APPROVAL]: "Menunggu Persetujuan Customer",
  [ORDER_STATUS.COMPLETED]: "Tandai Selesai",
};

export function normalizeStatus(rawStatus) {
  if (!rawStatus) return ORDER_STATUS.ORDER_CREATED;
  const lowered = rawStatus.toLowerCase();
  if (LEGACY_STATUS_MAP[lowered]) return LEGACY_STATUS_MAP[lowered];
  const upper = rawStatus.toUpperCase();
  return ORDER_STATUS[upper] ? ORDER_STATUS[upper] : upper;
}

export function allowedNextStatuses(currentStatus, role = "MITRA") {
  if (role !== "MITRA") return [];
  const normalized = normalizeStatus(currentStatus);
  return MITRA_TRANSITIONS[normalized] || [];
}

function assertActorScope(orderRow, actorId, actorRole) {
  if (actorRole === "MITRA" && orderRow?.mitra_id && orderRow.mitra_id !== actorId) {
    throw new Error("Anda tidak berwenang mengakses order ini");
  }
  if (actorRole === "CUSTOMER" && orderRow?.customer_id && orderRow.customer_id !== actorId) {
    throw new Error("Order tidak termasuk ke akun customer Anda");
  }
}

export async function fetchScopedOrder({ orderId, actorId, actorRole = "MITRA" }) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      [
        "id",
        "status",
        "mitra_id",
        "customer_id",
        "service_type",
        "address",
        "lokasi_jemput",
        "lokasi_tujuan",
        "layanan",
        "harga",
        "catatan",
        "pricing_breakdown",
        "created_at",
        "updated_at",
      ].join(",")
    )
    .eq("id", orderId)
    .single();

  if (error || !data) {
    throw new Error(`Order ${orderId} tidak ditemukan: ${error?.message || ""}`.trim());
  }

  assertActorScope(data, actorId, actorRole);

  return { ...data, status: normalizeStatus(data.status) };
}

export async function transitionOrderStatus({ orderId, toStatus, actorId, actorRole = "MITRA" }) {
  const { data: existingOrder, error: fetchError } = await supabase
    .from("orders")
    .select("id,status,mitra_id,customer_id")
    .eq("id", orderId)
    .single();

  if (fetchError) {
    throw new Error(`Gagal mengambil data order ${orderId}: ${fetchError.message}`);
  }

  assertActorScope(existingOrder, actorId, actorRole);

  const currentStatus = normalizeStatus(existingOrder?.status);
  const validNextStatuses = allowedNextStatuses(currentStatus, actorRole);
  if (!validNextStatuses.includes(toStatus)) {
    throw new Error(`Transisi status tidak valid dari ${currentStatus} ke ${toStatus}`);
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({ status: toStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Gagal memperbarui status order: ${updateError.message}`);
  }

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
