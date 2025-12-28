// src/lib/withdraw.js
import { supabase } from "./supabase";
import { logError } from "../core/logger";
import { recordAuditEvent } from "../core/auditTrail";

// ===================================================
// 1. GET RIWAYAT WITHDRAW MITRA
// ===================================================
export async function getMyWithdraws(mitraId) {
  const { data, error } = await supabase
    .from("withdraw_requests")
    .select("*")
    .eq("mitra_id", mitraId)
    .order("created_at", { ascending: false });

  if (error) {
    logError(error, "withdraw.fetch_history", { mitraId });
    return [];
  }

  return data || [];
}

// ===================================================
// 2. AJUKAN WITHDRAW + KUNCI SALDO (LOCKED)
// ===================================================
export async function requestWithdraw(payload) {
  // -----------------------------
  // A. INSERT ke withdraw_requests
  // -----------------------------
  const { data, error } = await supabase
    .from("withdraw_requests")
    .insert([
      {
        mitra_id: payload.mitra_id,
        mitra_name: payload.mitra_name,
        amount: payload.amount,
        method: payload.method,
        account_number: payload.account_number,
        status: "PENDING",
      },
    ])
    .select()
    .single();

  if (error) {
    logError(error, "withdraw.insert", { mitra_id: payload.mitra_id });
    return null;
  }

  // -----------------------------
  // B. KUNCI SALDO (wallet_transactions)
  // -----------------------------
  const { error: walletErr } = await supabase
    .from("wallet_transactions")
    .insert([
      {
        mitra_id: payload.mitra_id,
        jumlah: payload.amount,
        tipe: "WITHDRAW",
        description: "Pending withdraw",
        locked: true, // saldo dikunci sampai admin approve
        order_id: null, // opsional
      },
    ]);

  if (walletErr) {
    logError(walletErr, "withdraw.wallet_lock", { mitra_id: payload.mitra_id });
    return null;
  }

  await recordAuditEvent({
    action: "withdraw.requested",
    actorId: payload.mitra_id,
    entityId: data?.id,
    metadata: {
      amount: payload.amount,
      method: payload.method,
    },
  });

  return data;
}

// ===================================================
// 3. REALTIME LISTENER UNTUK WITHDRAW INSERT
// ===================================================
export function subscribeWithdraw(mitraId, callback) {
  return supabase
    .channel(`withdraw_${mitraId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "withdraw_requests",
        filter: `mitra_id=eq.${mitraId}`,
      },
      (payload) => {
        if (payload?.new) callback(payload.new);
      }
    )
    .subscribe();
}
