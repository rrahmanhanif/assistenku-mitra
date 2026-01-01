export function StatusChip({ status }) {
  const color = status?.includes("COMPLETED")
    ? "bg-green-100 text-green-800"
    : status?.includes("IN_PROGRESS") || status?.includes("ON_ROUTE")
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {status || "-"}
    </span>
  );
}
