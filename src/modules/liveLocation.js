// src/modules/liveLocation.js
import supabase from "../lib/supabaseClient";
import { detectMockLocation, reportFraudSignal } from "../lib/fraudSignals";

let lastLocation = null;
let lastFraudReport = 0;

// Fungsi mengambil lokasi GPS dari HP mitra
export function startMitraGPS(mitraId) {
  if (!("geolocation" in navigator)) {
    console.warn("GPS tidak didukung perangkat");
    return;
  }

  setInterval(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      await supabase.from("mitra_location").upsert({
        mitra_id: mitraId,
        lat: latitude,
        lng: longitude,
        updated_at: new Date().toISOString(),
      });

      const mockSignal = detectMockLocation(pos, lastLocation);
      lastLocation = pos;

      // Throttle laporan fraud: maks 1x per 60 detik
      if (mockSignal?.suspicious && Date.now() - lastFraudReport > 60_000) {
        await reportFraudSignal(mitraId, "mock_location", mockSignal);
        lastFraudReport = Date.now();
      }
    });
  }, 4000); // update setiap 4 detik
}
