import { supabase } from "../../lib/supabase";

export async function getMitraRatings() {
  const { data: userData } = await supabase.auth.getUser();
  const mitraId = userData.user.id;

  const { data, error } = await supabase
    .from("ratings")
    .select(`
      id,
      rating,
      review,
      order_id
    `)
    .eq("mitra_id", mitraId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
