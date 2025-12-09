// src/lib/orderAction.js
import { supabase } from "./supabase";
import { addIncome } from "./income";

// ==========================
// 1. MITRA MENERIMA PESANAN
// ==========================
export async function acceptOrder(orderId) {
  return await supabase
    .from("orders")
    .update({ status: "mitra_accepted" })
    .eq("id", orderId);
}

// ==========================
// 2. MENUJU LOKASI CUSTOMER
// ==========================
export async function goingToCustomer(orderId) {
  return await supabase
    .from("orders")
    .update({ status: "on_the_way" })
    .eq("id", orderId);
}

// ==========================
// 3. MULAI PEKERJAAN
// ==========================
export async function startWork(orderId) {
  return await supabase
    .from("orders")
    .update({ status: "working" })
    .eq("id", orderId);
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

  const komisiMitra = price * 0.80;  // Mitra 80%
  const komisiAdmin = price * 0.20;  // Admin 20%
  const pajakUMKM = price * 0.005;   // Pajak 0.5% (customer bayar)

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

  return true;
}
