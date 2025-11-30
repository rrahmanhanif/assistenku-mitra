import { supabase } from "./supabaseClient";

export async function fetchMitraIncome(mitraId) {
  return supabase
    .from("orders")
    .select("id, amount, mitra_receive, status, created_at")
    .eq("mitra_id", mitraId)
    .eq("status", "done")
    .order("created_at", { ascending: false });
}
