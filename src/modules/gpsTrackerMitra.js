import supabase from "../lib/supabaseClient";
import { hasLocationConsent } from "./locationConsent";

let lastSend = 0; // anti-spam

export function startMitraGPS(mitraId, mitraName) {
  if (!navigator.geolocation) {
    console.error("GPS not supported");
    return;
  }

  if (!hasLocationConsent()) {
    console.warn(
      "Izin lokasi belum disetujui. Tampilkan rationale terlebih dahulu."
    );
    return;
  }

  navigator.geolocation.watchPosition(
    async (pos) => {
      const now = Date.now();

      // ⛔ Anti-spam: kirim minimal 10 detik sekali
      if (now - lastSend < 10_000) return;
      lastSend = now;

      const { latitude, longitude } = pos.coords;

      await supabase.from("realtime_gps").upsert(
        {
          user_id: mitraId,
          name: mitraName,
          role: "mitra",
          lat: latitude,
          lng: longitude,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    },
    (err) => console.error("GPS error:", err),
    { enableHighAccuracy: true }
  );
}
