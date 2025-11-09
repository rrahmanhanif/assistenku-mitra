import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    mitra: "",
    amount: "",
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "transactions"), (snapshot) => {
      setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const total = parseFloat(form.amount);
    const feeGateway = total * 0.02; // simulasi 2%
    const feeBank = feeGateway > total * 0.02 ? feeGateway : 0; // >2% dibebankan ke customer
    const mitraShare = total * 0.75;
    const coreShare = total * 0.25 - (feeBank <= total * 0.02 ? feeGateway : 0);

    await addDoc(collection(db, "transactions"), {
      customer: form.customer,
      mitra: form.mitra,
      total,
      mitraShare,
      coreShare,
      feeBank,
      status: "Selesai",
      timestamp: serverTimestamp(),
    });

    setForm({ customer: "", mitra: "", amount: "" });
    setLoading(false);
    alert("Transaksi berhasil ditambahkan dan hasil dibagi otomatis!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">💰 Transaksi & Pembagian Hasil</h1>

      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg shadow mb-6">
        <input
          type="text"
          placeholder="Nama Customer"
          value={form.customer}
          onChange={(e) => setForm({ ...form, customer: e.target.value })}
          required
          className="block w-full mb-3 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Nama Mitra"
          value={form.mitra}
          onChange={(e) => setForm({ ...form, mitra: e.target.value })}
          required
          className="block w-full mb-3 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Total Pembayaran"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
          className="block w-full mb-3 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Memproses..." : "Tambah Transaksi"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Daftar Transaksi</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-200">
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Mitra</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">75% Mitra</th>
            <th className="p-2 border">25% Core</th>
            <th className="p-2 border">Fee Bank</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((trx) => (
            <tr key={trx.id} className="text-center hover:bg-gray-50">
              <td className="border p-2">{trx.customer}</td>
              <td className="border p-2">{trx.mitra}</td>
              <td className="border p-2">Rp {trx.total?.toLocaleString()}</td>
              <td className="border p-2 text-green-600">Rp {trx.mitraShare?.toLocaleString()}</td>
              <td className="border p-2 text-blue-600">Rp {trx.coreShare?.toLocaleString()}</td>
              <td className="border p-2 text-red-500">Rp {trx.feeBank?.toLocaleString()}</td>
              <td className="border p-2">{trx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
