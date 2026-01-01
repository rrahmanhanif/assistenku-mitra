import { useEffect, useState } from "react";
import { fetchPayoutSummary, listPayouts, requestPayout } from "../api/payouts";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [sum, payouts] = await Promise.all([fetchPayoutSummary(), listPayouts()]);
        setSummary(sum);
        setHistory(payouts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await requestPayout({ amount: Number(amount), destination });
      const payouts = await listPayouts();
      setHistory(payouts || []);
      setAmount("");
      setDestination("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-2xl font-bold text-blue-600">Withdraw / Payout</h1>
      <ErrorBanner message={error} />

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h2 className="font-semibold">Ringkasan</h2>
        {loading ? (
          <LoadingSkeleton rows={2} />
        ) : (
          <div className="text-sm text-gray-700">
            <div>Saldo dapat ditarik: {summary?.withdrawable ?? "-"}</div>
            <div>Total pending: {summary?.pending ?? "-"}</div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h2 className="font-semibold">Ajukan Withdraw</h2>

        <label className="block text-sm font-semibold">Jumlah (Rp)</label>
        <input
          className="w-full border rounded p-2"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label className="block text-sm font-semibold">Tujuan Bank / Wallet</label>
        <input
          className="w-full border rounded p-2"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="DEST-REF"
        />

        <button
          disabled={!amount || !destination || submitting}
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          Ajukan Withdraw
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h2 className="font-semibold">Riwayat</h2>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : history.length === 0 ? (
          <div className="text-sm text-gray-600">Belum ada riwayat.</div>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="border p-3 rounded">
                <div className="font-semibold">Rp {item.amount}</div>
                <div className="text-xs text-gray-500">
                  {item.method || item.destination_bank_ref}
                </div>
                <div className="text-xs">Status: {item.status}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
