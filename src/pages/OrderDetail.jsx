// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { acceptOrder, goingToCustomer, startWork, finishWork } from "../lib/orderAction";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  async function loadOrder() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    setOrder(data);
  }

  useEffect(() => {
    loadOrder();
  }, []);

  if (!order) return <p>Memuat...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>ID Pesanan: {order.id}</h2>
      <h3>Status: {order.status}</h3>

      <button onClick={() => acceptOrder(id)}>Terima Pesanan</button>
      <button onClick={() => goingToCustomer(id)}>Menuju Lokasi</button>
      <button onClick={() => startWork(id)}>Mulai Kerja</button>
      <button onClick={() => finishWork(id)}>Selesai</button>
    </div>
  );
}
