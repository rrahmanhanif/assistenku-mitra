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
import { fetchWhoami } from "../api/auth";
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
          fetchWhoami(),
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

  // Catatan: bagian-bagian lain (upload evidence, commit, complete, render UI, dsb.)
  // biarkan sama seperti file Anda sekarang.
  // Jika Anda kirim sisa diff-nya, saya bisa bersihkan full 100% sampai akhir file.
}
