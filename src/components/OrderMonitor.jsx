import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../shared/httpClient";

const REFRESH_INTERVAL_MS = 15000;

const statusBadgeClass = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (["PAID", "ASSIGNED", "ONGOING"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["CANCELLED", "FAILED"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const formatCurrency = (amount, currency = "IDR") => {
  if (amount == null) return "-";
  const value = Number(amount) || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const normalizeOrders = (payload) => {
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function OrderMonitor() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const loadOrders = useCallback(async () => {
    const response = await request("/api/mitra/orders");
    const list = normalizeOrders(response?.data ?? response);
    setOrders(list);
  }, []);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        setLoading(true);
        setError("");
        await loadOrders();
      } catch (err) {
        if (active) setError(err?.message || "Gagal memuat order.");
      } finally {
        if (active) setLoading(false);
      }
    };

    init();

    const interval = setInterval(() => {
      loadOrders().catch((err) => {
        if (active) setError(err?.message || "Gagal memuat order.");
      });
    }, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [loadOrders]);

  const handleAction = async (orderId, action) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: action }));
    setError("");

    try {
      await request(`/api/mitra/orders/${orderId}/${action}`, { method: "POST" });
      await loadOrders();
    } catch (err) {
      setError(err?.message || "Gagal memproses order.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: "" }));
    }
  };

  const visibleOrders = useMemo(() => orders, [orders]);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Order Monitor</h2>
        <span className="text-xs text-slate-500">Auto refresh 15s</span>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Memuat order...</div>
      ) : visibleOrders.length === 0 ? (
        <div className="text-sm text-slate-500">Belum ada order aktif.</div>
      ) : (
        <div className="grid gap-3">
          {visibleOrders.map((order) => {
            const money = order.money || {};
            const statusOrder = order.status_order || "-";
            const payoutStatus = order.payout_status || "-";
            const currency = money.currency || "IDR";

            const totalGross = formatCurrency(money.total_gross_amount, currency);
            const mitraShare = formatCurrency(money.mitra_share_amount, currency);

            const normalizedStatus = String(statusOrder).toUpperCase();

            return (
              <div
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {order.service?.name || "-"} · Qty {order.qty ?? "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Customer: {order.customer?.name || "-"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                        statusOrder
                      )}`}
                    >
                      {statusOrder}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                        payoutStatus
                      )}`}
                    >
                      {payoutStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-1 text-sm text-slate-600">
                  <div>Total: {totalGross}</div>
                  <div>Mitra: {mitraShare}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {normalizedStatus === "PAID" && (
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                      disabled={actionLoading[order.id] === "accept"}
                      onClick={() => handleAction(order.id, "accept")}
                    >
                      Accept
                    </button>
                  )}

                  {normalizedStatus === "ASSIGNED" && (
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                      disabled={actionLoading[order.id] === "start"}
                      onClick={() => handleAction(order.id, "start")}
                    >
                      Start
                    </button>
                  )}

                  {normalizedStatus === "ONGOING" && (
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                      disabled={actionLoading[order.id] === "finish"}
                      onClick={() => handleAction(order.id, "finish")}
                    >
                      Finish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
