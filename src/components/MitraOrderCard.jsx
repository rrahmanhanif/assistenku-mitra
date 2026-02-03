import { StatusChip } from "./StatusChip";

const ACTION_LABELS = {
  accept: "Accept",
  start: "Start",
  finish: "Finish",
};

function formatCurrency(amount, currency = "IDR") {
  if (amount == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function normalizeStatus(status) {
  return (status || "").toUpperCase();
}

export function MitraOrderCard({
  order,
  onAccept,
  onStart,
  onFinish,
  loadingAction,
}) {
  const safeOrder = order || {};
  const status = normalizeStatus(safeOrder.status_order || safeOrder.status);
  const payoutStatus = safeOrder.payout_status || "-";

  const isCompleted = status.includes("COMPLETED") || status.includes("FINISH");

  // State machine (strict)
  const allowAccept = status === "PAID";
  const allowStart = status === "ASSIGNED";
  const allowFinish = status === "ONGOING";

  const money = safeOrder.money || {};
  const totalGross = money.total_gross_amount ?? 0;
  const mitraShare = money.mitra_share_amount ?? 0;
  const currency = money.currency || "IDR";

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-gray-700 font-semibold">
          {safeOrder.service?.name || safeOrder.service_name || "-"} · Qty{" "}
          {safeOrder.qty ?? "-"}
        </div>

        <div className="flex gap-2">
          <StatusChip status={safeOrder.status_order || safeOrder.status} />
          <StatusChip status={payoutStatus} />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">
          Customer: {safeOrder.customer?.name || "-"}
        </div>

        <div className="text-xs text-gray-500">
          Total:{" "}
          <span className="font-semibold">
            {formatCurrency(totalGross, currency)}
          </span>
        </div>

        <div className="text-xs text-gray-500">
          Mitra:{" "}
          <span className="font-semibold">
            {formatCurrency(mitraShare, currency)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAccept}
          disabled={isCompleted || !allowAccept || !!loadingAction}
          className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:bg-gray-300"
        >
          {loadingAction === "accept" ? "Memproses..." : ACTION_LABELS.accept}
        </button>

        <button
          type="button"
          onClick={onStart}
          disabled={isCompleted || !allowStart || !!loadingAction}
          className="px-3 py-2 text-sm rounded bg-indigo-600 text-white disabled:bg-gray-300"
        >
          {loadingAction === "start" ? "Memproses..." : ACTION_LABELS.start}
        </button>

        <button
          type="button"
          onClick={onFinish}
          disabled={isCompleted || !allowFinish || !!loadingAction}
          className="px-3 py-2 text-sm rounded bg-green-600 text-white disabled:bg-gray-300"
        >
          {loadingAction === "finish" ? "Memproses..." : ACTION_LABELS.finish}
        </button>
      </div>
    </div>
  );
}
