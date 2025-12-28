// src/lib/orderAction.js
import { supabase } from "./supabase";
import { addIncome } from "./income";
import { logError } from "../core/logger";
import { recordAuditEvent } from "../core/auditTrail";

// ==========================
// 1. MITRA MENERIMA PESANAN
// ==========================
export async function acceptOrder(orderId, actorId) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "mitra_accepted" })
    .eq("id", orderId);

  if (!error) {
    await recordAuditEvent({
      action: "order.accepted",
      actorId,
      entityId: orderId,
    });
  }

  return { error };
}

// ==========================
// 2. MENUJU LOKASI CUSTOMER
// ==========================
export async function goingToCustomer(orderId, actorId) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "on_the_way" })
    .eq("id", orderId);

  if (!error) {
    await recordAuditEvent({
      action: "order.on_the_way",
      actorId,
      entityId: orderId,
    });
  }

  return { error };
}

// ==========================
// 3. MULAI PEKERJAAN
// ==========================
export async function startWork(orderId, actorId) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "working" })
    .eq("id", orderId);

  if (!error) {
    await recordAuditEvent({
      action: "order.start_work",
      actorId,
      entityId: orderId,
    });
  }

  return { error };
}

// ==========================
// 4. SELESAIKAN PEKERJAAN (FINAL VERSION)
// ==========================
export async function finishOrder(orderId, mitraId) {
  // 1. Ambil detail order
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    logError(error, "finishOrder.load", { orderId });
    return false;
  }

  // 2. Hitung komponen komisi
  const price = Number(order.total_price);

  const komisiMitra = price * 0.8; // Mitra 80%
  const komisiAdmin = price * 0.2; // Admin 20%
  const pajakUMKM = price * 0.005; // Pajak 0.5% (customer bayar)

  // 3. Masukkan ke wallet
  await addIncome(mitraId, komisiMitra, orderId, "Pesanan selesai (Mitra 80%)");
  await addIncome("ADMIN", komisiAdmin, orderId, "Komisi Admin 20%");
  await addIncome("PAJAK", pajakUMKM, orderId, "Pajak UMKM 0.5%");

  // 4. Update status order + log lengkap
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
      mitra_commission: komisiMitra,
      admin_commission: komisiAdmin,
      tax_fee: pajakUMKM,
    })
    .eq("id", orderId);

  if (updateError) {
    logError(updateError, "finishOrder.update", { orderId });
    return false;
  }

  await recordAuditEvent({
    action: "order.completed",
    actorId: mitraId,
    entityId: orderId,
    metadata: {
      total_price: price,
      mitra_commission: komisiMitra,
      admin_commission: komisiAdmin,
      tax_fee: pajakUMKM,
    },
  });

  return true;
}
