// src/lib/fraudSignals.js
import { request } from "../shared/httpClient";

const ROOT_INDICATORS = [
  "magisk",
  "twrp",
  "superuser",
  "cydia",
  "xposed",
  "rootcloak",
  "jailbroken",
];

function getRootIndicators() {
  const userAgent = navigator.userAgent?.toLowerCase?.() || "";
  const matches = ROOT_INDICATORS.filter((indicator) =>
    userAgent.includes(indicator)
  );

  const isDevMode = !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  return {
    suspicious: matches.length > 0 || isDevMode,
    indicators: matches,
    debugHooks: isDevMode,
  };
}

export async function reportFraudSignal(mitraId, category, detail) {
  try {
    await request("/api/mitra/fraud-signals", {
      method: "POST",
      body: {
        mitra_id: mitraId,
        category,
        detail,
        captured_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to persist fraud signal", error);
  }
}

export async function runDeviceFraudChecks(mitraId) {
  const rootSignal = getRootIndicators();

  if (rootSignal.suspicious) {
    await reportFraudSignal(mitraId, "root_or_jailbreak", rootSignal);
  }

  return rootSignal;
}

export function detectMockLocation(currentPosition, previousPosition) {
  if (!currentPosition?.coords) return { suspicious: false };

  const { accuracy = 0, speed = 0 } = currentPosition.coords;
  const accuracyTooLow = accuracy && accuracy > 100;

  const mockedFlag =
    currentPosition.mocked === true ||
    currentPosition.coords?.mocked === true;

  return {
    suspicious: Boolean(mockedFlag || accuracyTooLow),
    accuracy,
    speed,
    mocked: mockedFlag,
  };
}
