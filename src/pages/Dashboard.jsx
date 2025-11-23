import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [mitra, setMitra] = useState(null);
  const [orders, setOrders] = useState([]);
  const [onDuty, setOnDuty] = useState(false);

  const token = localStorage.getItem("mitra_session");

  // =============================
  // 1. Ambil data profil mitra
  // =============================
  const loadMitra = async () => {
    const { data } = await supabase
      .from("mitra")
      .select("*")
      .eq("access_token", token)
      .single();

    if (data) {
      setMitra(data);
      setOnDuty(data.on_duty);
    }
  };

  // =============================
  // 2. GPS Tracking (tiap 5 detik)
  // =============================
  const startGpsTracking = () => {
    if (!navigator.geolocation) return;

    const interval = setInterval(() => {
      if (!onDuty || !mitra) return;

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        await supabase
          .from("mitra")
          .update({ latitude: lat, longitude: lon })
          .eq("id", mitra.id);
      });
    }, 5000);

    return () => clearInterval(interval);
  };

  // =============================
  // 3. Listener pesanan realtime
  // =============================
  const listenOrders = () => {
    supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new;

          if (order.layanan === mitra?.layanan) {
            new Audio("/notif.mp3").play();
            setOrders((prev) => [order, ...prev]);
          }
        }
      )
      .subscribe();
  };

  // =============================
  // 4. Toggle Online ↔ Offline
  // =============================
  const toggleDuty = async () => {
    const newStatus = !onDuty;
    setOnDuty(newStatus);

    await supabase
      .from("mitra")
      .update({ on_duty: newStatus })
      .eq("id", mitra.id);
  };

  // =============================
  // ⭐ 5. Terima Order → Auto Redirect
  // =============================
  const terimaOrder = async (orderId) => {
    await supabase
      .from("orders")
      .update({
        status: "diterima",
        mitra_id: mitra.id,
      })
      .eq("id", orderId);

    // Auto pindah ke halaman proses order
    window.location.href = `/order/${orderId}`;
  };

  // =============================
  // 6. Tolak order
  // =============================
  const tolakOrder = async (orderId) => {
    await supabase
      .from("orders")
      .update({ status: "ditolak" })
      .eq("id", orderId);

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // =============================
  // Lifecycle
  // =============================
  useEffect(() => {
    loadMitra();
  }, []);

  useEffect(() => {
    if (mitra) listenOrders();
  }, [mitra]);

  useEffect(() => {
    const stop = startGpsTracking();
    return stop;
  }, [mitra, onDuty]);

  if (!mitra) return <div className="p-5">Memuat data...</div>;

  // =============================
  // UI
  // =============================
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-blue-600">
        Dashboard Mitra
      </h2>

      {/* ONLINE / OFFLINE */}
      <div className="mt-4 p-4 bg-white shadow rounded-lg flex justify-between">
        <div>
          <p className="text-lg font-semibold">{mitra.nama}</p>
          <p className="text-gray-600">Layanan: {mitra.layanan}</p>
        </div>

        <button
          onClick={toggleDuty}
          className={`px-4 py-2 rounded text-white ${
            onDuty ? "bg-green-600" : "bg-gray-500"
          }`}
        >
          {onDuty ? "Online" : "Offline"}
        </button>
      </div>

      {/* PESANAN MASUK */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Pesanan Masuk</h3>

        {orders.length === 0 ? (
          <p className="text-gray-500">Belum ada pesanan masuk</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="p-4 bg-white shadow rounded-lg mb-3">
              <p><b>Pemesan:</b> {o.customer_nama}</p>
              <p><b>Dari:</b> {o.alamat}</p>
              <p><b>Tujuan:</b> {o.tujuan}</p>
              <p><b>Layanan:</b> {o.layanan}</p>
              <p><b>Catatan:</b> {o.catatan}</p>

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
