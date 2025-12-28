import { maskSensitiveData } from "./sensitive";

export function logError(error, location = "unknown", context = {}) {
  const safePayload = {
    message: maskSensitiveData(error?.message || "No message"),
    location,
    context: maskSensitiveData(context),
    time: new Date().toISOString(),
  };

  fetch("https://assistenku-core.vercel.app/api/log-error", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(safePayload),
  }).catch(() => {});
}
