import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  checkinOrder,
  commitEvidence,
  completeOrder,
  fetchEvidenceList,
  fetchOrderDetail,
  fetchOrderEvents,
  initEvidenceUpload,
} from "../api/orders";
import { fetchProfile } from "../api/profile";
import { ErrorBanner } from "../components/ErrorBanner";
import { EvidenceList } from "../components/EvidenceList";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { StatusChip } from "../components/StatusChip";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [events, setEvents] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);

  const isLocked = useMemo(
    () => order?.status === "LOCKED_BY_SYSTEM" || order?.status === "COMPLETED",
    [order?.status]
  );

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [detail, timeline, evidenceList, me] = await Promise.all([
          fetchOrderDetail(id),
          fetchOrderEvents(id),
          fetchEvidenceList(id),
          fetchProfile(),
        ]);
        setOrder(detail);
        setEvents(timeline || []);
        setEvidences(evidenceList || []);
        setProfile(me);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [id]);

  const handleCheckin = async () => {
    setSubmitting(true);
    setError("");
    try {
      await checkinOrder({ orderId: id });
      const detail = await fetchOrderDetail(id);
      setOrder(detail);
      const timeline = await fetchOrderEvents(id);
      setEvents(timeline || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadEvidence = async () => {
    if (!file) return;
    setSubmitting(true);
    setError("");
    try {
      const init = await initEvidenceUpload({ orderId: id, file });
      await fetch(init.upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      await commitEvidence({
        orderId: id,
        pointer: init.pointer_url,
        hash: init.hash,
        type: file.type,
        metadata: { name: file.name, size: file.size },
      });
      const list = await fetchEvidenceList(id);
      setEvidences(list || []);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const finishOrder = async () => {
    setSubmitting(true);
    setError("");
    try {
      const pointers = (evidences || []).map((e) => e.pointer || e.file_url);
      await completeOrder({ orderId: id, evidencePointers: pointers, notes });
      const detail = await fetchOrderDetail(id);
      setOrder(detail);
      const timeline = await fetchOrderEvents(id);
      setEvents(timeline || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-5">
        <LoadingSkeleton rows={5} />
      </div>
    );
  if (!order) return <div className="p-5">Pesanan tidak ditemukan</div>;

  const actionDisabled = profile?.status === "suspended" || isLocked;

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-2xl font-bold text-blue-600">Detail Order</h1>
      <ErrorBanner message={error} />

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold">ID Order: {order.id}</div>
          <StatusChip status={order.status} />
        </div>
        <div>Layanan: {order.service_type || order.layanan}</div>
        <div>Alamat: {order.address || order.lokasi_jemput}</div>
        <div>
          Jadwal:{" "}
          {order.schedule_time
            ? new Date(order.schedule_time).toLocaleString("id-ID")
            : "-"}
        </div>
        <div>Catatan: {order.notes || order.catatan || "-"}</div>
        <div>Harga: {order.pricing_breakdown?.total || order.harga || "-"}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h2 className="font-semibold">Aksi</h2>
        <button
          disabled={submitting || actionDisabled}
          onClick={handleCheckin}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
        >
          Mulai (Check-in)
        </button>

        <div className="border-t pt-2">
          <div className="font-semibold mb-2">Upload Evidence</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
            disabled={actionDisabled}
          />
          <button
            disabled={!file || submitting || actionDisabled}
            onClick={uploadEvidence}
            className="mt-2 bg-gray-900 text-white px-4 py-2 rounded w-full disabled:opacity-60"
          >
            Upload & Commit
          </button>
        </div>

        <div className="border-t pt-2">
          <label className="block text-sm font-semibold mb-1">Catatan</label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={actionDisabled}
          />
          <button
            disabled={submitting || actionDisabled}
            onClick={finishOrder}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
          >
            Selesaikan Pekerjaan
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h2 className="font-semibold">Evidence</h2>
        <EvidenceList evidences={evidences} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h2 className="font-semibold">Timeline / Audit</h2>
        {events.length === 0 ? (
          <div className="text-sm text-gray-600">Belum ada event.</div>
        ) : (
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
