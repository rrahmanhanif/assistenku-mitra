// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import { subscribeNewOrders } from "../lib/ordersRealtime";
import { getMitraBalance } from "../lib/wallet";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [saldo, setSaldo] = useState(0);

  const mitraId = localStorage.getItem("mitra_id");

  // ==========================================
  // LOAD SALDO MITRA
  // ==========================================
  useEffect(() => {
    async function loadSaldo() {
      if (!mitraId) return;
      const s = await getMitraBalance(mitraId);
      setSaldo(s || 0);
    }
    loadSaldo();
  }, []);

  // ==========================================
  // LOAD ORDER MENUNGGU (PENDING)
  // ==========================================
  async function loadPendingOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "MENUNGGU_KONFIRMASI")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  }

  // ==========================================
  // REALTIME ORDER MASUK
  // ==========================================
  useEffect(() => {
    loadPendingOrders();

    const channel = subscribeNewOrders((newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => supabase.removeChannel(channel);
  }, []);

  // ==========================================
  // UI
  // ==========================================
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard Mitra</h2>

      {/* SALDO MITRA */}
      <div
        style={{
          marginTop: 15,
          marginBottom: 25,
          padding: 15,
          background: "#f5f5f5",
          borderRadius: 10,
        }}
      >
        <p style={{ margin: 0, color: "#777" }}>Saldo Anda</p>
        <h2 style={{ margin: 0, color: "#28a745" }}>
          Rp {saldo.toLocaleString("id-ID")}
        </h2>
      </div>

      <h3>Order Masuk</h3>

      {orders.length === 0 && (
        <p>Tidak ada order baru untuk saat ini.</p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 12,
            background: "#fff",
          }}
        >
          <p><b>ID Pesanan:</b> {order.id}</p>
          <p><b>Layanan:</b> {order.service_name}</p>
          <p><b>Customer:</b> {order.customer_name}</p>
          <p>
            <b>Total:</b> Rp {order.total_price.toLocaleString("id-ID")}
          </p>

          <button
            style={{
              marginTop: 10,
              padding: 10,
              width: "100%",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
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
