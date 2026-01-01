import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  STATUS_LABEL,
  allowedNextStatuses,
  fetchScopedOrder,
  normalizeStatus,
  transitionOrderStatus,
} from "../core/orderLifecycle";
import { fetchOrderEvents } from "../core/orderEvents";

export default function OrderProcess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [actorId, setActorId] = useState("");

  const normalizedStatus = useMemo(
    () => normalizeStatus(order?.status),
    [order?.status]
  );

  const loadOrder = async () => {
    if (!actorId) return;
    setLoading(true);
    setError("");
    try {
      const scoped = await fetchScopedOrder({
        orderId: id,
        actorId,
        actorRole: "MITRA",
      });
      setOrder(scoped);
    } catch (err) {
      setError(err.message);
      setOrder(null);
    }
    setLoading(false);
  };

  const loadEvents = async () => {
    try {
      const timeline = await fetchOrderEvents(id);
      setEvents(timeline);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTransition = async (toStatus) => {
    setSubmitting(true);
    setError("");
    try {
      const updated = await transitionOrderStatus({
        orderId: id,
        toStatus,
        actorId,
        actorRole: "MITRA",
      });
      setOrder(updated);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setActorId(data.user.id);
      } else {
        setError("Mitra belum login.");
      }
    });
  }, []);

  useEffect(() => {
    if (!actorId) return;
    loadOrder();
    loadEvents();
  }, [actorId]);

  if (loading) return <div className="p-5">Memuat pesanan...</div>;
  if (!order) return <div className="p-5">Pesanan tidak ditemukan.</div>;

  const nextStatuses = allowedNextStatuses(normalizedStatus, "MITRA");

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-2xl font-bold text-blue-600">Proses Pesanan</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow space-y-1">
        <p>
          <b>ID Order:</b> {order.id}
        </p>
        <p>
          <b>Lokasi Jemput:</b> {order.lokasi_jemput}
        </p>
        <p>
          <b>Lokasi Tujuan:</b> {order.lokasi_tujuan}
        </p>
        <p>
          <b>Layanan:</b> {order.layanan}
        </p>
        <p>
          <b>Catatan:</b> {order.catatan || "-"}
        </p>
        <p>
          <b>Harga:</b> Rp {Number(order.harga).toLocaleString("id-ID")}
        </p>
        <p className="mt-3">
          <b>Status:</b>{" "}
          <span className="text-blue-600 font-semibold">{normalizedStatus}</span>
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Aksi Tersedia</h2>
        {nextStatuses.length === 0 && (
          <div className="text-sm text-gray-600">
            Tidak ada transisi status yang valid untuk peran Anda.
          </div>
        )}
        {nextStatuses.map((status) => (
          <button
            key={status}
            disabled={submitting}
            onClick={() => handleTransition(status)}
            className="bg-blue-600 text-white w-full py-3 rounded-lg disabled:opacity-60"
          >
            {STATUS_LABEL[status] || status}
          </button>
        ))}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            order.lokasi_jemput || ""
          )}`}
          target="_blank"
          rel="noreferrer"
          className="block bg-gray-700 text-white w-full py-3 rounded-lg text-center"
        >
          Buka Google Maps
        </a>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Timeline / Audit Events</h2>
        {events.length === 0 && (
          <div className="text-sm text-gray-600">Belum ada event.</div>
        )}
        <ul className="space-y-2">
          {events.map((evt) => (
            <li key={evt.id} className="border-b pb-2 last:border-b-0">
              <div className="text-xs text-gray-500">
                {new Date(evt.created_at).toLocaleString("id-ID")}
              </div>
              <div className="font-semibold text-sm">{evt.event_type}</div>
              <div className="text-xs text-gray-700">
                {evt.actor_role} • {evt.actor_id}
              </div>
              {evt.payload_json && (
                <pre className="bg-gray-50 text-xs p-2 rounded mt-1 whitespace-pre-wrap">
                  {JSON.stringify(evt.payload_json, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
