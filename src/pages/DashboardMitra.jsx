import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { hasLocationConsent } from "../modules/locationConsent";

// ======================================
// ICON / AUDIO
// ======================================
const notifSound = new Audio("/notif.mp3");

export default function DashboardMitra() {
  const [mitra, setMitra] = useState(null);
  const [orders, setOrders] = useState([]);
  const [onDuty, setOnDuty] = useState(false);

  const token = localStorage.getItem("mitra_session");

  // ======================================
  // 1. Ambil data MITRA berdasarkan TOKEN
  // ======================================
  const loadMitra = async () => {
    if (!token) return;

    const { data, error } = await supabase
      .from("mitra")
      .select("*")
      .eq("access_token", token)
      .single();

    if (error) {
      console.log("Gagal ambil data mitra:", error);
      return;
    }

    setMitra(data);
    setOnDuty(data.on_duty);
  };

  // ======================================
  // 2. GPS Realtime 5 Detik (dengan consent)
  // ======================================
  const startGpsTracking = () => {
    if (!navigator.geolocation || !hasLocationConsent()) {
      console.warn("GPS tidak tersedia atau izin belum diberikan");
      return;
    }

    const interval = setInterval(() => {
      if (!onDuty || !mitra) return;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          await supabase
            .from("mitra")
            .update({
              lat: latitude,
              lng: longitude,
            })
            .eq("id", mitra.id);
        },
        () => {
          console.warn("GPS ditolak atau gagal dibaca");
        }
      );
    }, 5000);

    return () => clearInterval(interval);
  };

  // ======================================
  // EFFECT
  // ======================================
  useEffect(() => {
    loadMitra();
  }, []);

  useEffect(() => {
    if (!mitra || !onDuty) return;
    const stopGps = startGpsTracking();
    return () => stopGps && stopGps();
  }, [mitra, onDuty]);

  return (
    <div>
      <h1>Dashboard Mitra</h1>

      {mitra && (
        <div>
          <p>Nama: {mitra.name}</p>
          <p>Status: {onDuty ? "On Duty" : "Off Duty"}</p>
        </div>
      )}

      {/* render orders dll di sini */}
    </div>
  );
}
