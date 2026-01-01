import { Link } from "react-router-dom";
import { StatusChip } from "./StatusChip";

export function JobCard({ order }) {
  return (
    <Link
      to={`/order/${order.id}`}
      className="block border rounded-lg p-4 shadow-sm hover:shadow transition bg-white"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{order.service_type || order.layanan}</div>
        <StatusChip status={order.status} />
      </div>
      <div className="mt-2 font-semibold text-gray-800">{order.address || order.lokasi_jemput}</div>
      <div className="text-xs text-gray-500">
        Jadwal:{" "}
        {order.schedule_time ? new Date(order.schedule_time).toLocaleString("id-ID") : "-"}
      </div>
      <div className="text-sm text-gray-700 mt-1">SLA: {order.sla || order.catatan || "-"}</div>
    </Link>
  );
}
