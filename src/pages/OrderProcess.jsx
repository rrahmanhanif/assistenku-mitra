import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function OrderProcess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil UID mitra dari localStorage
  const mitra_id = localStorage.getItem("mitra_uid");

  // =============================
  // 1. Ambil data pesanan
  // =============================
  const loadOrder = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    setOrder(data);
    setLoading(false);
  };

  // =============================
  // 2. Update status: diterima → menjemput
  // =============================
  const mulaiJemput = async () => {
    await supabase
      .from("orders")
      .update({ status: "menjemput" })
      .eq("id", id);

    loadOrder();
  };

  // =============================
  // 3. Update status: menjemput → sedang_jalan
  // =============================
  const mulaiPerjalanan = async () => {
    await supabase
      .from("orders")
      .update({ status: "sedang_jalan" })
      .eq("id", id);

    loadOrder();
  };

  // =============================
  // ⭐ 4. Selesaikan pesanan + tambah saldo
  // =============================
  const selesaiPesanan = async () => {
    // Hitung pendapatan mitra 75%
    const pendapatan = Number(order.harga) * 0.75;

    // Masukkan pendapatan mitra ke wallet
    await supabase.from("wallet_transactions").insert([
      {
        mitra_id: mitra_id,
        tipe: "pemasukan",
        jumlah: pendapatan,
        keterangan: `Pendapatan Order #${order.id}`,
      },
    ]);

    // Update status order selesai
    await supabase
      .from("orders")
      .update({ status: "selesai" })
      .eq("id", id);

    alert("Pesanan selesai! Pendapatan sudah masuk ke saldo.");

    window.location.href = "/wallet";
  };

  // =============================
  // Load awal
  // =============================
  useEffect(() => {
    loadOrder();
  }, []);

  if (loading) return <div className="p-5">Memuat pesanan...</div>;
  if (!order) return <div className="p-5">Pesanan tidak ditemukan.</div>;

  // =============================
  // UI
  // =============================
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Proses Pesanan
      </h1>

      <div className="bg-white p-4 rounded-lg shadow mb-5">
        <p><b>ID Order:</b> {order.id}</p>
        <p><b>Lokasi Jemput:</b> {order.lokasi_jemput}</p>
        <p><b>Lokasi Tujuan:</b> {order.lokasi_tujuan}</p>
        <p><b>Layanan:</b> {order.layanan}</p>
        <p><b>Catatan:</b> {order.catatan || "-"}</p>
        <p><b>Harga:</b> Rp {Number(order.harga).toLocaleString("id-ID")}</p>

        <p className="mt-3">
          <b>Status:</b>{" "}
          <span className="text-blue-600 font-semibold">
            {order.status}
          </span>
        </p>
      </div>

      {/* =============================
          TOMBOL AKSI SESUAI STATUS
         ============================= */}

      {order.status === "diterima" && (
        <button
          onClick={mulaiJemput}
          className="bg-orange-600 text-white w-full py-3 rounded-lg"
        >
          Mulai Jemput
        </button>
      )}

      {order.status === "menjemput" && (
        <button
          onClick={mulaiPerjalanan}
          className="bg-blue-600 text-white w-full py-3 rounded-lg"
        >
          Mulai Perjalanan
        </button>
      )}

      {order.status === "sedang_jalan" && (
        <button
          onClick={selesaiPesanan}
          className="bg-green-600 text-white w-full py-3 rounded-lg"
        >
          Selesaikan Pesanan
        </button>
      )}

      {/* GOOGLE MAPS */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          order.lokasi_jemput
        )}`}
        target="_blank"
        className="block bg-gray-700 text-white w-full py-3 rounded-lg text-center mt-4"
      >
        Buka Google Maps
      </a>
    </div>
  );
}
