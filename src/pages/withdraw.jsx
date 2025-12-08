// src/pages/Withdraw.jsx
import React, { useEffect, useState } from "react";
import { getMyWithdraws, requestWithdraw, subscribeWithdraw } from "../lib/withdraw";
import { supabase } from "../lib/supabase";

export default function Withdraw() {
  const mitraId = localStorage.getItem("mitra_id");
  const mitraName = localStorage.getItem("mitra_name");

  const [withdraws, setWithdraws] = useState([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getMyWithdraws(mitraId);
      setWithdraws(data || []);
    }
    load();

    const channel = subscribeWithdraw(mitraId, (newReq) => {
      setWithdraws((prev) => [newReq, ...prev]);
    });

    return () => supabase.removeChannel(channel);
  }, []);

  async function handleSubmit() {
    if (!amount || !accountNumber) {
      alert("Lengkapi semua data!");
      return;
    }

    const res = await requestWithdraw({
      mitra_id: mitraId,
      mitra_name: mitraName,
      amount: Number(amount),
      method,
      account_number: accountNumber,
    });

    if (res) {
      setAmount("");
      setAccountNumber("");
      alert("Withdraw berhasil diajukan!");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Withdraw Saldo</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Jumlah (Rp)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
          style={{ width: "100%", padding: 10 }}
        />

        <button
          onClick={handleSubmit}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 15,
            background: "#007bff",
            color: "white",
            borderRadius: 6,
          }}
        >
          Ajukan Withdraw
        </button>
      </div>

      <h3>Riwayat Pengajuan</h3>
      {withdraws.map((w) => (
        <div
          key={w.id}
          style={{
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        >
          <p><b>Rp {w.amount}</b></p>
          <p>Metode: {w.method}</p>
          <p>Nomor: {w.account_number}</p>
          <p>Status: <b>{w.status}</b></p>
          <small>{new Date(w.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
                                   }
