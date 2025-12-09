// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  acceptOrder,
  goingToCustomer,
  startWork,
  finishOrder,
} from "../lib/orderAction";

import { subscribeOvertime } from "../lib/overtimeRealtime";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  // ============================
  // LOAD ORDER DETAIL
  // ============================
  async function loadOrder() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) console.log("Error load order:", error);
    setOrder(data);
  }

  useEffect(() => {
    loadOrder();

    // ============================
    // REALTIME OVERTIME FEEDBACK
    // ============================
    const subOT = subscribeOvertime(id, (req) => {
      if (req.status === "ACCEPTED") {
        alert(
          `Customer menyetujui overtime ${req.requested_minutes} menit.\nBiaya tambahan: Rp ${req.total_price}`
        );
      }

      if (req.status === "REJECTED") {
        alert("Customer menolak overtime.");
      }
    });

    return () => supabase.removeChannel(subOT);
  }, []);

  if (!order) return <p style={{ padding: 20 }}>Memuat data...</p>;

  // ============================
  // FINISH ORDER DENGAN KOMISI 80/20
  // ============================
  async function handleFinish() {
    const mitraId = localStorage.getItem("mitra_id");
    const ok = await finishOrder(order.id, mitraId);

    if (!ok) {
      alert("Gagal menyelesaikan order.");
      return;
    }

    alert("Pesanan selesai! Komisi masuk.");
    window.location.href = "/";
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Detail Pesanan #{order.id}</h2>
      <p>Status: <b>{order.status}</b></p>
      <p>Layanan: <b>{order.service_name}</b></p>
      <p>Total Harga: <b>Rp {order.total_price?.toLocaleString("id-ID")}</b></p>

      {/* Jika overtime sudah diterapkan */}
      {order.overtime_minutes > 0 && (
        <p style={{ marginTop: 10 }}>
          <b>Overtime:</b> {order.overtime_minutes} menit  
          <br />
          <b>Biaya tambahan:</b> Rp {order.overtime_price}
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        {order.status === "MENUNGGU_KONFIRMASI" && (
          <button onClick={() => acceptOrder(order.id)} style={btn}>
            Terima Pesanan
          </button>
        )}

        {order.status === "mitra_accepted" && (
          <button onClick={() => goingToCustomer(order.id)} style={btn}>
            Menuju Customer
          </button>
        )}

        {order.status === "on_the_way" && (
          <button onClick={() => startWork(order.id)} style={btn}>
            Mulai Pekerjaan
          </button>
        )}

        {order.status === "working" && (
          <button
            onClick={handleFinish}
            style={{ ...btn, background: "green" }}
          >
            Selesaikan Pesanan
          </button>
        )}
      </div>
    </div>
  );
}

// Styling button
const btn = {
  padding: "12px 15px",
  marginBottom: "10px",
  width: "100%",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: "16px",
};
