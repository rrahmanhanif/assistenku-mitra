import { getAccessToken } from "../../auth/session";

export async function getToken() {
  return getAccessToken();
}
