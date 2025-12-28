import supabase from "../lib/supabaseClient";
import { logError } from "./logger";
import { maskSensitiveData } from "./sensitive";

export async function recordAuditEvent({
  action,
  actorId = "unknown",
  entityId = null,
  metadata = {},
}) {
  const payload = {
    action,
    actor_id: actorId,
    entity_id: entityId,
    metadata: maskSensitiveData(metadata),
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("audit_trails")
    .insert(payload);

  if (error) {
    logError(error, "auditTrail.record", {
      action,
      actorId,
      entityId,
    });
  }
}
