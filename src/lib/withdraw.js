// src/lib/withdraw.js
import { supabase } from "./supabase";

// Ambil semua request withdraw milik mitra
export async function getMyWithdraws(mitraId) {
  const { data } = await supabase
    .from("withdraw_requests")
    .select("*")
    .eq("mitra_id", mitraId)
    .order("created_at", { ascending: false });
  return data || [];
}

// Ajukan withdraw
export async function requestWithdraw(payload) {
  const { data, error } = await supabase
    .from("withdraw_requests")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Withdraw error:", error);
    return null;
  }

  return data;
}

// Listen realtime withdraw update
export function subscribeWithdraw(mitraId, callback) {
  return supabase
    .channel(`withdraw-${mitraId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "withdraw_requests",
        filter: `mitra_id=eq.${mitraId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
