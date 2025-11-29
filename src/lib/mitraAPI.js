import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseMitra = createClient(supabaseUrl, supabaseKey);

export async function updateMitraLocation(mitraId, latitude, longitude) {
  return supabaseMitra
    .from("mitra_location")
    .upsert({
      mitra_id: mitraId,
      latitude,
      longitude,
      updated_at: new Date().toISOString()
    });
}

export async function updateOrderStatus(orderId, status) {
  return supabaseMitra
    .from("orders")
    .update({ status })
    .eq("id", orderId);
}
