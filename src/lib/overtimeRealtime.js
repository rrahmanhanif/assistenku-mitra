import { supabase } from "./supabase";

export function subscribeOvertime(orderId, onCallback) {
  const channel = supabase
    .channel("overtime_" + orderId)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "overtime_requests",
        filter: "order_id=eq." + orderId,
      },
      (payload) => onCallback(payload.new)
    )
    .subscribe();

  return channel;
}
