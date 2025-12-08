// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  acceptOrder,
  goingToCustomer,
  startWork,
  finishWork,
  updateOrder,
} from "../lib/orderAction";

import { addIncome } from "../lib/income";

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
  }, []);

  if (!order) return <p style={{ padding: 20 }}>Memuat data...</p>;

  // ============================
  // HANDLE COMPLETE ORDER
  // ============================
  async function handleComplete() {
    try {
      const feeMitra = Math.floor(order.total_price * 0.80); // 80% bersih
      const mitraId = order.mitra_id;

      // Tambah pemasukan ke dompet mitra
      await addIncome({
        mitra_id: mitraId,
        order_id: order.id,
        amount: feeMitra,
        description: "Pemasukan dari pesanan selesai",
      });

      // Update status order
      await updateOrder(order.id, {
        status: "SELESAI",
        selesai_at: new Date().toISOString(),
      });

      alert("Pesanan selesai & saldo masuk ke dompet mitra!");
      window.location.href = "/";
    } catch (err) {
      console.error("Error finish order:", err);
      alert("Gagal menyelesaikan pesanan.");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Detail Pesanan #{order.id}</h2>
      <p>Status: <b>{order.status}</b></p>
      <p>Layanan: <b>{order.service_name}</b></p>
      <p>Total Harga: <b>Rp {order.total_price?.toLocaleString("id-ID")}</b></p>

      <div style={{ marginTop: 20 }}>
        {order.status === "MENUNGGU_KONFIRMASI" && (
          <button
            onClick={() => acceptOrder(order.id)}
            style={btn}
          >
            Terima Pesanan
          </button>
        )}

        {order.status === "MENUJU_LOKASI" && (
          <button
            onClick={() => goingToCustomer(order.id)}
            style={btn}
          >
            Menuju Customer
          </button>
        )}

        {order.status === "MULAI_PEKERJAAN" && (
          <button
            onClick={() => startWork(order.id)}
            style={btn}
          >
            Mulai Pekerjaan
          </button>
        )}

        {order.status === "DALAM_PEKERJAAN" && (
          <button
            onClick={handleComplete}
            style={{ ...btn, background: "green" }}
          >
            Selesaikan Pesanan
          </button>
        )}
      </div>
    </div>
  );
}

// Styling button biar rapi
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
