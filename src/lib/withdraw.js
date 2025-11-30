import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON
);

export async function requestWithdraw(mitraId, amount, bankName, bankNumber) {
  return await supabase.from("withdraw_requests").insert([
    {
      mitra_id: mitraId,
      amount,
      bank_name: bankName,
      bank_number: bankNumber,
      status: "pending"
    }
  ]);
}
