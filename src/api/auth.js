import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export async function fetchWhoami() {
  return httpClient.get(endpoints.auth.whoami);
}
