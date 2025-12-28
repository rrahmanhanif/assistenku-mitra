// src/lib/observability.js
import supabase from "./supabaseClient";

export async function logOrderFunnelStage({
  orderId,
  stage,
  mitraId,
  metadata = {},
}) {
  try {
    await supabase.from("order_funnel_events").insert({
      order_id: orderId,
      stage,
      mitra_id: mitraId,
      metadata,
      recorded_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log funnel stage", error);
  }
}

export async function logMatchTime({ orderId, mitraId, createdAt, matchedAt }) {
  if (!createdAt || !matchedAt) return;

  const durationMs = Math.max(
    new Date(matchedAt).getTime() - new Date(createdAt).getTime(),
    0
  );

  try {
    await supabase.from("order_match_times").upsert(
      {
        order_id: orderId,
        mitra_id: mitraId,
        created_at: createdAt,
        matched_at: matchedAt,
        duration_ms: durationMs,
      },
      { onConflict: "order_id" }
    );
  } catch (error) {
    console.error("Failed to log match time", error);
  }
}

export async function logTechnicalMetric(name, value, dimensions = {}) {
  try {
    await supabase.from("technical_metrics").insert({
      name,
      value,
      dimensions,
      recorded_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log technical metric", error);
  }
}
