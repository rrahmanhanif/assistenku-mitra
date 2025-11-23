import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// ======================================
//  ICON / AUDIO
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
  // 2. GPS Realtime 5 Detik
  // ======================================
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      console.warn("GPS tidak tersedia");
      return;
    }

    const interval = setInterval(() => {
      if (!onDuty || !mitra) return;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          await supabase
            .from("mitra")
            .update({ lat: lat, lng: lon })
            .eq("id", mitra.id);
        },
        () => {
          console.warn("GPS ditolak");
        }
      );
    }, 5000);

    return () => clearInterval(interval);
  };

  // ======================================
  // 3. Listener Pesanan Realtime
  // ======================================
  const listenOrders = () => {
    return supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const order = payload.new;

          // Filter: hanya pesanan sesuai layanan mitra
          if (order.layanan === mitra?.layanan) {
            notifSound.play();
            setOrders((prev) => [order, ...prev]);
          }
        }
      )
      .subscribe();
  };

  // ======================================
  // 4. Online / Offline
  // ======================================
  const toggleDuty = async () => {
    const newStatus = !onDuty;
    setOnDuty(newStatus);

    if (mitra) {
      await supabase
        .from("mitra")
        .update({ on_duty: newStatus })
        .eq("id", mitra.id);
    }
  };

  // ======================================
  // 5. Terima Order → Auto Redirect
  // ======================================
  const terimaOrder = async (orderId) => {
    if (!mitra) return;

    await supabase
      .from("orders")
      .update({
        status: "diterima",
        mitra_id: mitra.id,
      })
      .eq("id", orderId);

    window.location.href = `/order/${orderId}`;
  };

  // ======================================
  // 6. Tolak order
  // ======================================
  const tolakOrder = async (orderId) => {
    await supabase
      .from("orders")
      .update({ status: "ditolak" })
      .eq("id", orderId);

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // ======================================
  // Lifecycle
  // ======================================
  useEffect(() => {
    loadMitra();
  }, []);

  useEffect(() => {
    if (mitra) {
      const channel = listenOrders();
      return () => supabase.removeChannel(channel);
    }
  }, [mitra]);

  useEffect(() => {
    const stop = startGpsTracking();
    return stop;
  }, [mitra, onDuty]);

  // ======================================
  // UI
  // ======================================
  if (!mitra) {
    return <div className="p-5">Memuat data mitra...</div>;
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-blue-600">Dashboard Mitra</h2>

      {/* Status Online / Offline */}
      <div className="mt-4 p-4 bg-white shadow rounded-lg flex justify-between">
        <div>
          <p className="text-lg font-semibold">{mitra.nama}</p>
          <p className="text-gray-600">Layanan: {mitra.layanan}</p>
        </div>

        <button
          onClick={toggleDuty}
          className={`px-4 py-2 rounded text-white ${
            onDuty ? "bg-green-600" : "bg-gray-600"
          }`}
        >
          {onDuty ? "Online" : "Offline"}
        </button>
      </div>

      {/* Pesanan Masuk */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Pesanan Masuk</h3>

        {orders.length === 0 ? (
          <p className="text-gray-500">Belum ada pesanan</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="p-4 bg-white shadow rounded-lg mb-3">
              <p><b>Pemesan:</b> {o.customer_nama}</p>
              <p><b>Dari:</b> {o.alamat}</p>
              <p><b>Tujuan:</b> {o.tujuan}</p>
              <p><b>Layanan:</b> {o.layanan}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => terimaOrder(o.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Terima
                </button>

                <button
                  onClick={() => tolakOrder(o.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
