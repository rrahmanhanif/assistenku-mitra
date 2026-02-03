import { request } from "../../shared/httpClient";

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
  await request("/api/ratings", {
    method: "POST",
    body: {
      order_id: orderId,
      mitra_id: mitraId,
      rating,
      review,
    },
  });
}
