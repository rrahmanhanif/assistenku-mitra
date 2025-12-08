// src/lib/ordersRealtime.js
import { supabase } from "./supabase";

/**
 * Subscribe order masuk (status: "pending")
 * Digunakan untuk MITRA melihat order baru realtime
 */
export function subscribeNewOrders(callback) {
  return supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: 'status=eq.pending'
      },
      (payload) => {
        console.log("ORDER MASUK REALTIME:", payload.new);
        callback(payload.new);
      }
    )
    .subscribe();
}
