// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { subscribeNewOrders } from "../lib/ordersRealtime";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  // Load order pending saat halaman dibuka
  async function loadPendingOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data);
  }

  useEffect(() => {
    loadPendingOrders();

    // Realtime order masuk
    const channel = subscribeNewOrders((newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Order Masuk</h2>

      {orders.length === 0 && <p>Tidak ada order saat ini</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            padding: 12,
            border: "1px solid #ccc",
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <p><b>Order ID:</b> {order.id}</p>
          <p><b>Layanan:</b> {order.service_name}</p>
          <p><b>Customer:</b> {order.customer_name}</p>
          <p><b>Total Harga:</b> Rp {order.total_price}</p>

          <button
            style={{
              padding: 10,
              width: "100%",
              marginTop: 10,
              background: "#28a745",
              color: "white",
              borderRadius: 6,
            }}
            onClick={() =>
              (window.location.href = `/order/${order.id}`)
            }
          >
            Lihat Detail
          </button>
        </div>
      ))}
    </div>
  );
                }
