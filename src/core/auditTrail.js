import { logError } from "./logger";
import { maskSensitiveData } from "./sensitive";
import { request } from "../shared/httpClient";

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

  try {
    await request("/api/audit-trails", {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    logError(error, "auditTrail.record", {
      action,
      actorId,
      entityId,
    });
  }
}
