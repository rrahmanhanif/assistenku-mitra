import { supabase } from "../lib/supabaseClient";

export async function appendOrderEvent({
  orderId,
  actorId,
  actorRole,
  eventType,
  payload,
}) {
  const { error } = await supabase.from("order_events").insert([
    {
      order_id: orderId,
      actor_id: actorId,
      actor_role: actorRole,
      event_type: eventType,
      payload_json: payload,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    throw new Error(`Gagal menulis audit event: ${error.message}`);
  }
}

export async function fetchOrderEvents(orderId) {
  const { data, error } = await supabase
    .from("order_events")
    .select("id, event_type, actor_role, actor_id, payload_json, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat timeline order: ${error.message}`);
  }

  return data || [];
}
