import { request } from "../shared/httpClient";

export async function getAccessToken() {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("mitra_token");

  if (!token) throw new Error("Sesi tidak ditemukan. Silakan login ulang.");
  return token;
}

export async function requireAuthenticatedUser() {
  const response = await request("/api/auth/whoami");
  const profile = response?.data ?? response;

  if (!profile) throw new Error("Pengguna belum login.");
  return profile;
}
