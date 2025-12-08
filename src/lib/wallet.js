// src/lib/wallet.js
import { supabase } from "./supabase";

// -----------------------------
// Hitung saldo mitra
// -----------------------------
export async function getMitraBalance(mitraId) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("tipe, jumlah")
    .eq("mitra_id", mitraId);

  if (error) {
    console.error("Error getMitraBalance:", error);
    return 0;
  }

  let pemasukan = 0;
  let penarikan = 0;

  data.forEach((t) => {
    if (t.tipe === "INCOME") pemasukan += Number(t.jumlah);
    if (t.tipe === "WITHDRAW") penarikan += Number(t.jumlah);
  });

  return pemasukan - penarikan;
}
