import { createClient } from "@supabase/supabase-js";

// Buat Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON
);

export async function updateMitraLocation(mitraId, lat, lng) {
  return await supabase
    .from("mitra_location")
    .upsert({
      mitra_id: mitraId,
      latitude: lat,
      longitude: lng,
      updated_at: new Date().toISOString(),
    });
}

export async function updateOrderStatus(orderId, status) {
  return await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
}
