import { supabase } from "../../lib/supabase";

export async function submitCustomerRating({
  orderId,
  mitraId,
  rating,
  review,
}: {
  orderId: string;
  mitraId: string;
  rating: number;
  review?: string;
}) {
  const { error } = await supabase.from("ratings").insert({
    order_id: orderId,
    mitra_id: mitraId,
    rating,
    review,
  });

  if (error) throw error;
}
