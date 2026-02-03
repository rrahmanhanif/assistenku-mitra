export function StatusChip({ status }) {
  const normalized = String(status || "").toUpperCase();

  const color = normalized.includes("COMPLETED")
    ? "bg-green-100 text-green-800"
    : ["PAID", "ASSIGNED", "ONGOING", "IN_PROGRESS", "ON_ROUTE"].includes(
        normalized
      )
    ? "bg-blue-100 text-blue-800"
    : normalized.includes("CANCELLED") || normalized.includes("FAILED")
    ? "bg-red-100 text-red-800"
    : "bg-gray-100 text-gray-800";

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {status || "-"}
    </span>
  );
}
