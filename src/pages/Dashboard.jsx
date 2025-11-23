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
  // 2. Listener pesanan masuk (Realtime)
  // =============================
  const listenOrders = () => {
    supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new;

          // Hanya tampilkan order sesuai layanan & mitra sedang ON DUTY
          if (order.layanan === mitra?.layanan && onDuty) {
            new Audio("/notif.mp3").play();
            setOrders((prev) => [order, ...prev]);
          }
        }
      )
      .subscribe();
  };

  // =============================
  // 3. Update status Online/Offline
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
  // 4. Terima Order
  // =============================
  const terimaOrder = async (orderId) => {
    await supabase
      .from("orders")
      .update({
        status: "diterima",
        mitra_id: mitra.id,
      })
      .eq("id", orderId);

    alert("Pesanan diterima!");
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // =============================
  // 5. Tolak Order
  // =============================
  const tolakOrder = async (orderId) => {
    await supabase
      .from("orders")
      .update({ status: "dibatalkan" })
      .eq("id", orderId);

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // =============================
  // Lifecycle Hooks
  // =============================
  useEffect(() => {
    loadMitra();
  }, []);

  useEffect(() => {
    if (mitra) listenOrders();
  }, [mitra, onDuty]); // ikut berubah kalau on/off duty

  if (!mitra) return <div className="p-5">Memuat data...</div>;

  // =============================
  // Render UI Dashboard
  // =============================
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
            onDuty ? "bg-green-600" : "bg-gray-500"
          }`}
        >
          {onDuty ? "Online" : "Offline"}
        </button>
      </div>

      {/* Pesanan Masuk */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Pesanan Masuk</h3>

        {orders.length === 0 ? (
          <p className="text-gray-500">Belum ada pesanan masuk</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="p-4 bg-white shadow rounded-lg mb-3">
              <p><b>Layanan:</b> {o.layanan}</p>
              <p><b>Lokasi Jemput:</b> {o.lokasi_jemput}</p>
              <p><b>Tujuan:</b> {o.lokasi_tujuan}</p>
              <p><b>Catatan:</b> {o.catatan || "-"}</p>
              <p><b>Harga:</b> Rp {Number(o.harga).toLocaleString("id-ID")}</p>

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
