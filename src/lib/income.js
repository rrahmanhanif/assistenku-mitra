// src/lib/income.js
import { request } from "../shared/httpClient";

// Tambah pemasukan setelah order SELESAI
export async function addIncome(mitraId, orderId, amount, description) {
  try {
    const response = await request("/api/wallet/transactions", {
      method: "POST",
      body: {
        mitra_id: mitraId,
        order_id: orderId,
        jumlah: amount,
        tipe: "INCOME",
        description: description || "Pemasukan pesanan",
      },
    });

    return response?.data ?? null;
  } catch (error) {
    console.error("Error addIncome:", error);
    return null;
  }
}
