import { apiClient } from "./apiClient";

export async function fetchPayoutSummary() {
  return apiClient.get("/api/payouts/summary");
}

export async function requestPayout({ amount, destination }) {
  return apiClient.post("/api/payouts/request", {
    amount,
    destination_bank_ref: destination,
  });
}

export async function listPayouts() {
  return apiClient.get("/api/payouts/list");
}
