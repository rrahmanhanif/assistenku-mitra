import supabase from "../lib/supabaseClient";
import { hasLocationConsent } from "./locationConsent";

export function startMitraGPS(mitraId) {
  if (!navigator.geolocation) return;
  if (!hasLocationConsent()) return;

  navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      await supabase.from("mitra_locations").upsert({
        mitra_id: mitraId,
        latitude,
        longitude,
        updated_at: new Date().toISOString(),
      });
    },
    (err) => console.error("GPS error:", err),
    { enableHighAccuracy: true }
  );
}
