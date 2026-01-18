import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export async function getServices() {
  const res = await httpClient.get(endpoints.services.list);
  if (!res) return [];
  return res.services || res.data || res.items || [];
}
