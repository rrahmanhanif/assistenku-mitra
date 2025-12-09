import { supabase } from "../../lib/supabase";

export async function getMitraRatings() {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
