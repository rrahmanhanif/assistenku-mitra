import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function OrderProcess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const mitra_id = localStorage.getItem("mitra_uid");

  // Ambil data pesanan
  const loadOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    setOrder(data);
    setLoading(false);
  };

  // Mulai perjalanan
  const startTrip = async () => {
    await supabase
      .from("orders")
      .update({ status: "sedang_jalan" })
      .eq("id", id);

    alert("Perjalanan dimulai");
    loadOrder();
  };

  // Selesaikan pesanan
  const finishTrip = async () => {
    await supabase
      .from("orders")
      .update({ status: "selesai" })
      .eq("id", id);

    // Tambah pemasukan ke dompet (pendapatan 75%)
    const pendapatan = order.harga * 0.75;

    await supabase.from("wallet_transactions").insert([
      {
        mitra_id: mitra_id,
        tipe: "pemasukan",
        jumlah: pendapatan,
        keterangan: `Pendapatan Order #${id}`,
      },
    ]);

    alert("Pesanan selesai! Saldo bertambah.");
    window.location.href = "/wallet";
  };

  useEffect(() => {
    loadOrder();
  }, []);

  if (loading) return <div className="p-5">Memuat pesanan...</div>;
  if (!order) return <div className="p-5">Pesanan tidak ditemukan</div>;

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

      {/* Tombol aksi */}
      {order.status === "diterima" && (
        <button
          onClick={startTrip}
          className="bg-green-600 text-white w-full py-3 rounded-lg"
        >
          Mulai Perjalanan
        </button>
      )}

      {order.status === "sedang_jalan" && (
        <button
          onClick={finishTrip}
          className="bg-blue-600 text-white w-full py-3 rounded-lg"
        >
          Selesaikan Pesanan
        </button>
      )}
    </div>
  );
}
