// src/modules/liveLocation.js
import { supabase } from "../lib/supabase";

// Fungsi mengambil lokasi GPS dari HP mitra
export function startMitraGPS(mitraId) {
  if (!("geolocation" in navigator)) {
    console.warn("GPS tidak didukung perangkat");
    return;
  }

  setInterval(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      await supabase
        .from("mitra_location")
        .upsert({
          mitra_id: mitraId,
          lat: latitude,
          lng: longitude,
          updated_at: new Date().toISOString(),
        });
    });
  }, 4000); // update setiap 4 detik
}
