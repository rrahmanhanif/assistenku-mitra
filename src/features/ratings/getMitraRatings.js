import { request } from "../../shared/httpClient";

export async function getMitraRatings() {
  const whoami = await request("/api/auth/whoami");
  const mitraId =
    whoami?.data?.id || whoami?.data?.user_id || whoami?.data?.mitra_id;

  if (!mitraId) {
    throw new Error("Mitra ID tidak ditemukan. Silakan login ulang.");
  }

  const response = await request(`/api/mitra/ratings?mitra_id=${mitraId}`);
  const data = response?.data?.ratings ?? response?.data ?? [];
  return Array.isArray(data) ? data : [];
}
