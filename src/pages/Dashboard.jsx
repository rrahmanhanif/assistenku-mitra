import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [mitra, setMitra] = useState(null);
  const [orders, setOrders] = useState([]);
  const [onDuty, setOnDuty] = useState(false);

  // Ambil session
  const token = localStorage.getItem("mitra_session");

  // 1. Ambil profil mitra dari Supabase
  const loadMitra = async () => {
    const { data, error } = await supabase
      .from("mitra")
      .select("*")
      .eq("access_token", token)
      .single();

    if (data) {
      setMitra(data);
      setOnDuty(data.on_duty);
    }
  };

  // 2. Realtime listener untuk order masuk
  const listenOrders = async () => {
    supabase
      .channel("orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new;

          // hanya order sesuai layanan mitra
          if (order.layanan === mitra?.layanan) {
            setOrders((prev) => [order, ...prev]);
            new Audio("/notif.mp3").play();
          }
        }
      )
      .subscribe();
  };

  // 3. Update status On/Off Duty
  const toggleDuty = async () => {
    const newStatus = !onDuty;
    setOnDuty(newStatus);

    await supabase
      .from("mitra")
      .update({ on_duty: newStatus })
      .eq("uid", mitra.uid);
  };

  // 4. Terima order
  const terimaOrder = async (id) => {
    await supabase.from("orders").update({ status: "diterima", mitra_id: mitra.uid }).eq("id", id);

    alert("Order diterima");
  };

  // 5. Tolak order
  const tolakOrder = async (id) => {
    await supabase.from("orders").update({ status: "ditolak" }).eq("id", id);

    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  useEffect(() => {
    loadMitra();
  }, []);

  useEffect(() => {
    if (mitra) listenOrders();
  }, [mitra]);

  if (!mitra) return <div className="p-5">Memuat data...</div>;

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-blue-600">Dashboard Mitra</h2>

      {/* Status Online / Offline */}
      <div className="mt-4 p-4 bg-white shadow rounded-lg flex justify-between items-center">
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

      {/* Pesanan masuk */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Pesanan Masuk</h3>

        {orders.length === 0 ? (
          <p className="text-gray-500">Belum ada pesanan masuk</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="p-4 bg-white shadow rounded-lg mb-3">
              <p><b>Pemesan:</b> {o.nama_customer}</p>
              <p><b>Alamat:</b> {o.alamat}</p>
              <p><b>Catatan:</b> {o.catatan}</p>
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
