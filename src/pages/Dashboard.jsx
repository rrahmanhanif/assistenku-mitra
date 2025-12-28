// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

import { subscribeNewOrders } from "../lib/orderRealtime";
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
  }, [mitraId]);

  // ==========================================
  // LOAD ORDER MENUNGGU (PENDING)
  // ==========================================
  async function loadPendingOrders() {
    if (!mitraId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load pending orders:", error);
      return;
    }

    setOrders(data || []);
  }

  // ==========================================
  // REALTIME ORDER MASUK
  // ==========================================
  useEffect(() => {
    loadPendingOrders();

    const unsubscribe = subscribeNewOrders((newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [mitraId]);

  return (
    <div className="dashboard">
      <h2>Dashboard Mitra</h2>

      <div className="saldo-box">
        <strong>Saldo:</strong> Rp {saldo.toLocaleString("id-ID")}
      </div>

      <div className="order-list">
        {orders.length === 0 && <p>Tidak ada pesanan menunggu.</p>}

        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <p>
              <strong>Order #{order.id}</strong>
            </p>
            <p>Total: Rp {Number(order.total_price).toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
