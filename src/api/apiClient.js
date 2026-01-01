import { getAccessToken } from "../auth/session";

const baseUrl = import.meta.env.VITE_CORE_API_BASE;

async function request(path, { method = "GET", headers = {}, body } = {}) {
  if (!baseUrl) throw new Error("VITE_CORE_API_BASE belum di-set.");
  const token = await getAccessToken();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": body instanceof FormData ? undefined : "application/json",
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = json?.message || json?.error || res.statusText;
    throw new Error(message || "Permintaan gagal");
  }
  return json;
}

export const apiClient = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body, headers) => request(path, { method: "POST", body, headers }),
};
