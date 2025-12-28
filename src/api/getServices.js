// src/api/getServices.js
import { gatewayFetch } from "../core/gateway";

export async function getServices(userContext) {
  const endpoint = "/api/services/list";

  const req = await gatewayFetch(endpoint, {
    baseUrl: import.meta.env.VITE_ADMIN_URL,
    userId: userContext?.userId,
  });

  const res = await req.json();

  if (!res.success) return [];

  return res.services;
}
