import { StatusChip } from "./StatusChip";

const ACTION_LABELS = {
  accept: "Accept",
  start: "Start",
  finish: "Finish",
};

function normalizeStatus(status) {
  return (status || "").toUpperCase();
}

function canAccept(status) {
  return ["PAID", "READY", "ASSIGNED", "PENDING"].includes(status);
}

function canStart(status) {
  return ["ACCEPTED", "MITRA_ON_ROUTE", "ON_ROUTE", "READY_TO_START"].includes(status);
}

function canFinish(status) {
  return ["IN_PROGRESS", "STARTED", "ONGOING", "ON_SITE"].includes(status);
}

export function MitraOrderCard({
  order,
  onAccept,
  onStart,
  onFinish,
  loadingAction,
  formattedSchedule = "-",
  formattedAmount = "-",
  payoutStatus = "-",
}) {
  const safeOrder = order || {};
  const status = normalizeStatus(safeOrder.status);
  const isCompleted = status.includes("COMPLETED") || status.includes("FINISH");
  const allowAccept = canAccept(status) || (!isCompleted && !status);
  const allowStart = canStart(status);
  const allowFinish = canFinish(status);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {safeOrder.service_name || safeOrder.service_type || safeOrder.layanan || "-"}
        </div>
        <StatusChip status={safeOrder.status} />
      </div>

      <div className="space-y-1">
        <div className="font-semibold text-gray-800">
          {safeOrder.address_short ||
            safeOrder.address ||
            safeOrder.alamat ||
            safeOrder.lokasi_jemput ||
            "-"}
        </div>
        <div className="text-xs text-gray-500">Jadwal: {formattedSchedule}</div>
        <div className="text-xs text-gray-500">
          Mitra Amount (90%): <span className="font-semibold">{formattedAmount}</span>
        </div>
        <div className="text-xs text-gray-500">
          Payout Status: <span className="font-semibold">{payoutStatus}</span>
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
