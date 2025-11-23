import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { startSendingLocation } from "../modules/gps";

export default function DashboardMitra() {
  const [mitra, setMitra] = useState(null);
  const [orders, setOrders] = useState([]);

  // Ambil profil mitra
  const loadMitra = async () => {
    const id = localStorage.getItem("mitra_id");
    const { data } = await supabase.from("mitra").select("*").eq("id", id).single();
    setMitra(data);

    // Mulai kirim GPS
    startSendingLocation(data.id);
  };

  // Ambil order milik mitra
  const loadOrders = async () => {
    const id = localStorage.getItem("mitra_id");
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("mitra_id", id)
      .order("created_at", { ascending: false });

    setOrders(data);
  };

  // Realtime order baru
  const listenOrderRealtime = () => {
    const id = localStorage.getItem("mitra_id");

    supabase
      .channel("orders-mitra")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `mitra_id=eq.${id}`,
        },
        (payload) => {
          loadOrders();
        }
      )
      .subscribe();
  };

  useEffect(() => {
    loadMitra();
    loadOrders();
    listenOrderRealtime();
  }, []);

  if (!mitra) return <div>Memuat...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-blue-600">Dashboard Mitra</h1>

      <h2 className="mt-4 font-semibold">Order Aktif:</h2>

      {orders.length === 0 ? (
        <p>Belum ada order</p>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="p-3 border rounded mt-2">
            <p><b>Order ID:</b> {o.id}</p>
            <p><b>Status:</b> {o.status}</p>
            <a
              className="text-blue-500 underline"
              href={`/order/${o.id}`}
            >
              Lihat Detail
            </a>
          </div>
        ))
      )}
    </div>
  );
}
