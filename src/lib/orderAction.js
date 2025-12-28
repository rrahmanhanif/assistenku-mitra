// src/lib/orderAction.js
import supabase from "./supabaseClient";
import { addIncome } from "./income";
import {
  logMatchTime,
  logOrderFunnelStage,
  logTechnicalMetric,
} from "./observability";

// ==========================
// 1. MITRA MENERIMA PESANAN
// ==========================
// mitraId bersifat opsional untuk backward-compatibility
export async function acceptOrder(orderId, mitraId) {
  const acceptedAt = new Date().toISOString();

  // Ambil created_at dan mitra_id (jika sudah terisi) untuk metrik match time
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("created_at, mitra_id")
    .eq("id", orderId)
    .single();

  if (orderError) {
    console.error("acceptOrder: failed to load order", orderError);
  }

  const response = await supabase
    .from("orders")
    .update({ status: "mitra_accepted", accepted_at: acceptedAt })
    .eq("id", orderId);

  const resolvedMitraId = mitraId || order?.mitra_id;

  await logOrderFunnelStage({
    orderId,
    stage: "mitra_accepted",
    mitraId: resolvedMitraId,
    metadata: { source: "mitra_app" },
  });

  if (order?.created_at) {
    await logMatchTime({
      orderId,
      mitraId: resolvedMitraId,
      createdAt: order.created_at,
      matchedAt: acceptedAt,
    });
  }

  return response;
}

// ==========================
// 2. MENUJU LOKASI CUSTOMER
// ==========================
export async function goingToCustomer(orderId, mitraId) {
  const response = await supabase
    .from("orders")
    .update({ status: "on_the_way" })
    .eq("id", orderId);

  await logOrderFunnelStage({
    orderId,
    stage: "on_the_way",
    mitraId,
    metadata: { source: "mitra_app" },
  });

  return response;
}

// ==========================
// 3. MULAI PEKERJAAN
// ==========================
export async function startWork(orderId, mitraId) {
  const response = await supabase
    .from("orders")
    .update({ status: "working", started_at: new Date().toISOString() })
    .eq("id", orderId);

  await logOrderFunnelStage({
    orderId,
    stage: "working",
    mitraId,
    metadata: { source: "mitra_app" },
  });

  return response;
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
    console.error("FinishOrder error load:", error);
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
  await supabase
    .from("orders")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
      mitra_commission: komisiMitra,
      admin_commission: komisiAdmin,
      tax_fee: pajakUMKM,
    })
    .eq("id", orderId);

  await logOrderFunnelStage({
    orderId,
    stage: "completed",
    mitraId,
    metadata: { source: "mitra_app" },
  });

  await logTechnicalMetric("payout.calculated", komisiMitra, {
    orderId,
    adminCommission: komisiAdmin,
    taxFee: pajakUMKM,
  });

  return true;
}
