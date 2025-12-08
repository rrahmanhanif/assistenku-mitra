// src/lib/withdraw.js
import { supabase } from "./supabase";

// ---------------------------
// GET RIWAYAT WITHDRAW MITRA
// ---------------------------
export async function getMyWithdraws(mitraId) {
  const { data, error } = await supabase
    .from("withdraw_requests")
    .select("*")
    .eq("mitra_id", mitraId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getMyWithdraws:", error);
    return [];
  }

  return data || [];
}

// ---------------------------
// AJUKAN WITHDRAW
// ---------------------------
export async function requestWithdraw(payload) {
  const { data, error } = await supabase
    .from("withdraw_requests")
    .insert([
      {
        mitra_id: payload.mitra_id,
        mitra_name: payload.mitra_name,
        amount: payload.amount,
        method: payload.method,
        account_number: payload.account_number,
        status: "PENDING",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error requestWithdraw:", error);
    return null;
  }

  return data;
}

// ---------------------------
// REALTIME LISTENER (INSERT ONLY)
// ---------------------------
export function subscribeWithdraw(mitraId, callback) {
  return supabase
    .channel(`withdraw_${mitraId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "withdraw_requests",
        filter: `mitra_id=eq.${mitraId}`,
      },
      (payload) => {
        if (payload?.new) callback(payload.new);
      }
    )
    .subscribe();
}
