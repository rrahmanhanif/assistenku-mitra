// src/pages/Withdraw.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; 
import { getMyWithdraws, requestWithdraw, subscribeWithdraw } from "../lib/withdraw";

export default function Withdraw() {
  const mitraId = localStorage.getItem("mitra_id");
  const mitraName = localStorage.getItem("mitra_name");

  const [withdraws, setWithdraws] = useState([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // ===========================
  // LOAD DATA + SUBSCRIBE
  // ===========================
  useEffect(() => {
    async function loadData() {
      const data = await getMyWithdraws(mitraId);
      setWithdraws(data || []);
    }
    loadData();

    const channel = subscribeWithdraw(mitraId, (newReq) => {
      setWithdraws((prev) => [newReq, ...prev]);
    });

    return () => supabase.removeChannel(channel);
  }, []);

  // ===========================
  // HANDLE SUBMIT
  // ===========================
  async function handleSubmit() {
    if (!amount || !accountNumber) {
      alert("Mohon lengkapi semua data.");
      return;
    }

    setLoading(true);

    const success = await requestWithdraw({
      mitra_id: mitraId,
      mitra_name: mitraName,
      amount: Number(amount),
      method,
      account_number: accountNumber,
    });

    setLoading(false);

    if (!success) {
      alert("Gagal mengajukan withdraw.");
      return;
    }

    alert("Withdraw berhasil diajukan!");
    setAmount("");
    setAccountNumber("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Withdraw Saldo</h2>

      {/* FORM INPUT */}
      <div style={{ marginBottom: 20 }}>
        <label>Jumlah (Rp)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Contoh: 50000"
          style={{ width: "100%", padding: 10 }}
        />

        <label>Metode</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{ width: "100%", padding: 10 }}
        >
          <option value="BANK">Transfer Bank</option>
          <option value="EWALLET">E-Wallet</option>
        </select>

        <label>No Rekening / E-Wallet</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Contoh: 08123456789"
          style={{ width: "100%", padding: 10 }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 12,
            background: "#007bff",
            color: "white",
            borderRadius: 6,
          }}
        >
          {loading ? "Mengirim..." : "Ajukan Withdraw"}
        </button>
      </div>

      {/* RIWAYAT */}
      <h3>Riwayat Pengajuan</h3>

      {withdraws.length === 0 && <p>Belum ada riwayat.</p>}

      {withdraws.map((w) => (
        <div
          key={w.id}
          style={{
            padding: 12,
            marginBottom: 10,
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        >
          <p><b>Rp {w.amount.toLocaleString("id-ID")}</b></p>
          <p>Metode: {w.method}</p>
          <p>No: {w.account_number}</p>
          <p>Status: <b>{w.status}</b></p>
          <small>{new Date(w.created_at).toLocaleString("id-ID")}</small>
        </div>
      ))}
    </div>
  );
}
