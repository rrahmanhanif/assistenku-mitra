import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Wallet() {
  const [transaksi, setTransaksi] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);

  // Ambil session token
  const token = localStorage.getItem("mitra_session");

  useEffect(() => {
    if (!token) return;

    const loadUser = async () => {
      const { data: sessionData } = await supabase.auth.getUser(token);

      if (sessionData?.user?.id) {
        const uid = sessionData.user.id;
        fetchTransaksi(uid);
      }
    };

    loadUser();
  }, []);

  const fetchTransaksi = async (uid) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("mitra_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setTransaksi(data);

    // Hitung saldo
    const totalMasuk = data
      .filter((x) => x.tipe === "pemasukan")
      .reduce((s, x) => s + Number(x.jumlah), 0);

    const totalKeluar = data
      .filter((x) => x.tipe === "penarikan")
      .reduce((s, x) => s + Number(x.jumlah), 0);

    setSaldo(totalMasuk - totalKeluar);
    setLoading(false);
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Dompet Mitra</h1>

      {/* SALDO */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <p className="text-gray-500">Saldo saat ini</p>
        <p className="text-3xl font-bold text-green-600">
          Rp {saldo.toLocaleString("id-ID")}
        </p>
      </div>

      {/* RIWAYAT */}
      <h2 className="text-xl font-semibold mb-3">Riwayat Transaksi</h2>

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : transaksi.length === 0 ? (
        <p className="text-gray-500 bg-white p-4 rounded-xl shadow text-center">
          Belum ada transaksi.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y">
          {transaksi.map((t) => (
            <div key={t.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {t.tipe === "pemasukan" ? "Pendapatan Order" : "Penarikan"}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(t.created_at).toLocaleString("id-ID")}
                </p>
              </div>

              <p
                className={`font-semibold ${
                  t.tipe === "pemasukan" ? "text-green-600" : "text-red-500"
                }`}
              >
                {t.tipe === "pemasukan" ? "+" : "-"} Rp{" "}
                {Number(t.jumlah).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
