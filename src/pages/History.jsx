import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function History() {
  const mitraId = localStorage.getItem("mitra_id");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("mitra_id", mitraId)
      .order("updated_at", { ascending: false });

    if (error) console.error(error);
    else setHistory(data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Riwayat Pesanan Mitra</h2>
      {history.length === 0 && <p>Tidak ada riwayat pesanan</p>}
      <ul>
        {history.map((order) => (
          <li key={order.id}>
            Pesanan <b>#{order.id}</b> — Status: <b>{order.status}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
