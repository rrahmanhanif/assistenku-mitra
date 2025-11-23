import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function WithdrawAdmin() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("withdraw_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setList(data || []);
  };

  const approveWithdraw = async (item) => {
    // 1. Update status withdraw
    await supabase
      .from("withdraw_requests")
      .update({ status: "selesai", updated_at: new Date() })
      .eq("id", item.id);

    // 2. Tambahkan transaksi ke wallet
    await supabase.from("wallet_transactions").insert([
      {
        mitra_id: item.mitra_id,
        tipe: "penarikan",
        jumlah: item.jumlah,
        keterangan: `Penarikan saldo (admin ${item.biaya_admin})`,
      },
    ]);

    alert("Penarikan disetujui!");
    fetchRequests();
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Pengajuan Penarikan</h1>

      {list.length === 0 ? (
        <p>Belum ada permintaan penarikan.</p>
      ) : (
        list.map((item) => (
          <div key={item.id} className="p-4 mb-3 bg-white shadow rounded-xl flex justify-between">
            <div>
              <p className="font-bold">Mitra: {item.mitra_id}</p>
              <p>Jumlah: Rp {item.jumlah.toLocaleString("id-ID")}</p>
              <p>Status: {item.status}</p>
              <p className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleString("id-ID")}
              </p>
            </div>

            {item.status === "menunggu" && (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={() => approveWithdraw(item)}
              >
                Setujui
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
