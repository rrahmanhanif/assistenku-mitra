import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export async function fetchMitraWorklogs() {
  const response = await httpClient.get(endpoints.mitra.worklogs);
  const payload =
    response?.data ||
    response?.items ||
    response?.worklogs ||
    response;

  return Array.isArray(payload) ? payload : [];
}
