import { API_BASE_URL } from "./baseUrl";
import { getToken } from "./getToken";

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildErrorMessage({ status, statusText, payload, requestId }) {
  if (payload && typeof payload === "object") {
    const detail = payload.message || payload.error || payload.detail;
    if (detail) {
      return `${detail} (HTTP ${status}${
        requestId ? `, request_id: ${requestId}` : ""
      })`;
    }
  }

  if (typeof payload === "string" && payload.trim()) {
    return `${payload} (HTTP ${status}${
      requestId ? `, request_id: ${requestId}` : ""
    })`;
  }

  return `${statusText || "Permintaan gagal"} (HTTP ${status}${
    requestId ? `, request_id: ${requestId}` : ""
  })`;
}

async function request(
  path,
  { method = "GET", headers = {}, body, auth = true } = {}
) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL belum di-set.");
  }

  const finalHeaders = { ...headers };

  if (!(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = await getToken();
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body:
      body instanceof FormData
        ? body
        : body
        ? JSON.stringify(body)
        : undefined,
  });

  const text = await res.text();
  const payload = parseJsonSafely(text);

  if (!res.ok) {
    const requestId =
      (payload &&
        typeof payload === "object" &&
        (payload.request_id || payload.requestId)) ||
      res.headers.get("x-request-id") ||
      res.headers.get("x-requestid") ||
      null;

    throw new Error(
      buildErrorMessage({
        status: res.status,
        statusText: res.statusText,
        payload,
        requestId,
      })
    );
  }

  return payload;
}

export const httpClient = {
  get: (path, options) =>
    request(path, { method: "GET", ...options }),

  post: (path, body, options) =>
    request(path, { method: "POST", body, ...options }),

  put: (path, body, options) =>
    request(path, { method: "PUT", body, ...options }),

  delete: (path, options) =>
    request(path, { method: "DELETE", ...options }),
};
