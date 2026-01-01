import { supabase } from "../lib/supabaseClient";

export async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message || "Gagal mengambil sesi");
  const token = data?.session?.access_token;
  if (!token) throw new Error("Sesi tidak ditemukan. Silakan login ulang.");
  return token;
}

export async function requireAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || "Gagal memuat pengguna");
  if (!data?.user) throw new Error("Pengguna belum login.");
  return data.user;
}
