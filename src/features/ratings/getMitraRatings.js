import { request } from "../../shared/httpClient";

export async function getMitraRatings() {
  const response = await request("/api/mitra/ratings");
  const data = response?.data?.ratings ?? response?.data ?? [];
  return Array.isArray(data) ? data : [];
}
