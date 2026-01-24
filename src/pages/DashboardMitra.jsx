import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWhoami } from "../api/auth";
import {
  acceptMitraOrder,
  finishMitraOrder,
  listMitraOrders,
  startMitraOrder,
} from "../api/mitraOrders";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { MitraOrderCard } from "../components/MitraOrderCard";

export default function DashboardMitra() {
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [whoamiError, setWhoamiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const loadOrders = useCallback(async () => {
    const result = await listMitraOrders();
    setOrders(Array.isArray(result) ? result : []);
  }, []);

  const loadWhoami = useCallback(async () => {
    const who = await fetchWhoami();
    setProfile(who);

    const roles = who?.roles || who?.role || who?.user?.roles;
    const hasMitraRole = Array.isArray(roles) ? roles.includes("MITRA") : roles === "MITRA";
    if (!hasMitraRole) setWhoamiError("Akses ditolak: akun bukan MITRA.");
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        setWhoamiError("");

        const [whoRes, orderRes] = await Promise.allSettled([loadWhoami(), loadOrders()]);
        if (!alive) return;

        if (whoRes.status !== "fulfilled") {
          setWhoamiError(whoRes.reason?.message || "Gagal memuat profil.");
        }
        if (orderRes.status !== "fulfilled") {
          setError(orderRes.reason?.message || "Gagal memuat order.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [loadOrders, loadWhoami]);

  const paidOrders = useMemo(() => {
    return orders.filter((order) => {
      const paymentStatus =
        order.payment_status || order.status_payment || order.payment?.status;
      const normalized = paymentStatus ? String(paymentStatus).toUpperCase() : "";
      const isPaid =
        order.is_paid === true ||
        order.paid === true ||
        ["PAID", "SETTLED"].includes(normalized);
      return isPaid;
    });
  }, [orders]);

  const formatSchedule = (order) => {
    const raw =
      order.schedule_time ||
      order.scheduled_at ||
      order.schedule_at ||
      order.pickup_time;
    if (!raw) return "-";
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleString("id-ID");
  };

  const getTotalAmount = (order) =>
    Number(
      order.total_amount ||
        order.amount ||
        order.total_price ||
        order.harga ||
        order.total ||
        0
    );

  const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

  const getMitraAmount = (order) => Number(order.mitra_amount || getTotalAmount(order) * 0.9);

  const getPayoutStatus = (order) =>
    order.payout_status || order.payout?.status || order.payoutStatus || "-";

  const handleAction = async (orderId, action, handler) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: action }));
    setError("");
    try {
      await handler(orderId);
      await loadOrders();
    } catch (err) {
      setError(err?.message || "Gagal memproses order.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: "" }));
    }
  };

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-3xl font-bold text-blue-600">Dashboard Mitra</h1>
      <ErrorBanner message={error} />

      {profile && profile.status === "suspended" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
          Akun Anda sedang ditangguhkan. Alasan: {profile.reason || "Hubungi CS"}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h2 className="text-xl font-semibold">Profil Mitra</h2>

        {whoamiError ? (
          <p className="text-sm text-red-600">{whoamiError}</p>
        ) : profile ? (
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-semibold">Role:</span>{" "}
              {profile.role || profile.roles?.[0] || "-"}
            </div>
            <div>
              <span className="font-semibold">ID:</span>{" "}
              {profile.id || profile.user_id || profile.mitra_id || "-"}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Memuat profil...</p>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Order PAID</h2>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : paidOrders.length === 0 ? (
          <p className="text-gray-500">Belum ada order PAID.</p>
        ) : (
          <div className="space-y-3">
            {paidOrders.map((order) => (
              <MitraOrderCard
                key={order.id}
                order={order}
                formattedSchedule={formatSchedule(order)}
                formattedAmount={formatCurrency(getMitraAmount(order))}
                payoutStatus={getPayoutStatus(order)}
                loadingAction={actionLoading[order.id]}
                onAccept={() => handleAction(order.id, "accept", acceptMitraOrder)}
                onStart={() => handleAction(order.id, "start", startMitraOrder)}
                onFinish={() => handleAction(order.id, "finish", finishMitraOrder)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
