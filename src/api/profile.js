import { apiClient } from "./apiClient";

export async function fetchProfile() {
  return apiClient.get("/api/me");
}
