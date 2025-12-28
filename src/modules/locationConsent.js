const CONSENT_KEY = "assistenku_location_consent";

export function hasLocationConsent() {
  return localStorage.getItem(CONSENT_KEY) === "true";
}

export function recordLocationConsent() {
  localStorage.setItem(CONSENT_KEY, "true");
}

export function revokeLocationConsent() {
  localStorage.removeItem(CONSENT_KEY);
}
