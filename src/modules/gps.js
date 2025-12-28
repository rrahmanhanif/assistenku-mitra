import { supabase } from "../lib/supabaseClient";
import { hasLocationConsent } from "./locationConsent";

export const startSendingLocation = (mitra_id) => {
  if (!navigator.geolocation) {
    alert("GPS tidak tersedia di perangkat");
    return;
  }

  if (!hasLocationConsent()) {
    console.warn(
      "Izin lokasi belum diberikan. Memperlihatkan alasan terlebih dahulu."
    );
    return;
  }

  setInterval(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      await supabase
        .from("mitra")
        .update({
          lat: latitude,
          lng: longitude,
          updated_at: new Date(),
        })
        .eq("id", mitra_id);
    });
  }, 3000); // update setiap 3 detik
};
