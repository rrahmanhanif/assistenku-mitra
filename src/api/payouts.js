import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export async function fetchPayoutSummary() {
  return httpClient.get(endpoints.payouts.summary);
}

export async function requestPayout({ amount, destination }) {
  return httpClient.post(endpoints.payouts.request, {
    amount,
    destination_bank_ref: destination,
  });
}

export async function listPayouts() {
  return httpClient.get(endpoints.payouts.list);
}
