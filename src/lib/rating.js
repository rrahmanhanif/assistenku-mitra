// src/lib/rating.js
import { supabase } from "./supabase";

// Kirim rating
export async function sendRating(orderId, mitraId, customerId, rating, review) {
  const { error } = await supabase.from("ratings").insert([
    {
      order_id: orderId,
      mitra_id: mitraId,
      customer_id: customerId,
      rating,
      review,
    },
  ]);

  return !error;
}

// Ambil semua rating milik mitra
export async function getMitraRatings(mitraId) {
  const { data } = await supabase
    .from("ratings")
    .select("*")
    .eq("mitra_id", mitraId)
    .order("created_at", { ascending: false });

  return data;
}

// Subscribe rating realtime
export function subscribeRating(mitraId, callback) {
  return supabase
    .channel(`rating-${mitraId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ratings",
        filter: `mitra_id=eq.${mitraId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
