import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Withdraw() {
  const [saldo, setSaldo] = useState(0);
  const [jumlah, setJumlah] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("mitra_session");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: session } = await supabase.auth.getUser(token);
    if (!session?.user?.id) return;

    const uid = session.user.id;

    // Ambil seluruh transaksi mitra untuk hitung saldo
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("mitra_id", uid);

    if (data) {
      const pemasukan = data
        .filter((t) => t.tipe === "pemasukan")
        .reduce((s, t) => s + Number(t.jumlah), 0);

      const penarikan = data
        .filter((t) => t.tipe === "penarikan")
        .reduce((s, t) => s + Number(t.jumlah), 0);

      setSaldo(pemasukan - penarikan);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);

    const jumlahInt = Number(jumlah);

    const biayaGateway = 2500; // biaya admin
    const totalPotong = jumlahInt + biayaGateway;

    // VALIDASI
    if (jumlahInt < 20000) {
      alert("Minimal penarikan adalah Rp 20.000");
      setLoading(false);
      return;
    }

    if (totalPotong > saldo) {
      alert("Saldo tidak mencukupi.");
      setLoading(false);
      return;
    }

    const { data: session } = await supabase.auth.getUser(token);
    const uid = session.user.id;

    // Simpan ke database sebagai penarikan
    const { error } = await supabase.from("wallet_transactions").insert([
      {
        mitra_id: uid,
        tipe: "penarikan",
        jumlah: jumlahInt,
        keterangan: `Penarikan saldo (Biaya Admin Rp ${biayaGateway.toLocaleString(
          "id-ID"
        )})`,
      },
    ]);

    if (error) {
      alert("Gagal melakukan penarikan.");
      setLoading(false);
      return;
    }

    alert("Permintaan penarikan berhasil! Menunggu verifikasi Admin.");
    window.location.href = "/wallet";

    setLoading(false);
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Penarikan Saldo</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <p className="text-gray-500">Saldo Anda</p>
        <p className="text-3xl font-bold text-green-600">
          Rp {saldo.toLocaleString("id-ID")}
        </p>
      </div>

      <form onSubmit={handleWithdraw} className="bg-white p-4 rounded-xl shadow">
        <label className="block mb-2 font-semibold">Jumlah Penarikan</label>
        <input
          type="number"
          className="border p-2 rounded w-full mb-4"
          placeholder="Contoh: 50000"
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Memproses..." : "Ajukan Penarikan"}
        </button>
      </form>
    </div>
  );
}
