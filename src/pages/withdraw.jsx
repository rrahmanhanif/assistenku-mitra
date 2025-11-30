import React, { useState } from "react";
import { requestWithdraw } from "../lib/withdraw";

export default function Withdraw() {
  const mitraId = localStorage.getItem("mitra_id");

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankNumber, setBankNumber] = useState("");

  const submit = async () => {
    if (!amount || !bankName || !bankNumber) {
      alert("Isi semua data");
      return;
    }

    const { error } = await requestWithdraw(
      mitraId,
      Number(amount),
      bankName,
      bankNumber
    );

    if (error) alert("Gagal mengajukan");
    else alert("Pengajuan berhasil");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Penarikan Dana</h2>

      <input
        placeholder="Jumlah penarikan"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <input
        placeholder="Nama Bank"
        value={bankName}
        onChange={e => setBankName(e.target.value)}
      />

      <input
        placeholder="Nomor Rekening"
        value={bankNumber}
        onChange={e => setBankNumber(e.target.value)}
      />

      <button onClick={submit}>Ajukan Penarikan</button>
    </div>
  );
}
