// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function OrderDetail() {
  const orderId = window.location.pathname.split("/").pop();
  const [order, setOrder] = useState(null);

  async function loadOrder() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!error) setOrder(data);
  }

  async function acceptOrder() {
    await supabase
      .from("orders")
      .update({ status: "accepted" })
      .eq("id", orderId);

    alert("Order diterima!");
    window.location.href = "/dashboard";
  }

  useEffect(() => {
    loadOrder();
  }, []);

  if (!order) return <p>Memuat...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Detail Pesanan</h2>

      <p><b>Customer:</b> {order.customer_name}</p>
      <p><b>Layanan:</b> {order.service_name}</p>
      <p><b>Harga:</b> Rp {order.total_price}</p>
      <p><b>Alamat:</b> {order.customer_address}</p>

      <button
        onClick={acceptOrder}
        style={{
          padding: 12,
          width: "100%",
          background: "#007bff",
          color: "white",
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        Terima Pesanan
      </button>
    </div>
  );
    }
