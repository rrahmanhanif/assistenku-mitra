// src/lib/income.js
import { supabase } from "./supabase";

// Tambah pemasukan setelah order SELESAI
export async function addIncome(mitraId, orderId, amount, description) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .insert([
      {
        mitra_id: mitraId,
        order_id: orderId,
        jumlah: amount,
        tipe: "INCOME",
        description: description || "Pemasukan pesanan",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error addIncome:", error);
    return null;
  }

  return data;
}
