import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWhoami } from "../api/auth";
import { fetchMitraWorklogs } from "../api/mitra";
import { listAssignedOrders } from "../api/orders";
import { JobCard } from "../components/JobCard";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export default function DashboardMitra() {
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [worklogs, setWorklogs] = useState([]);
  const [error, setError] = useState("");
  const [whoamiError, setWhoamiError] = useState("");
  const [worklogsError, setWorklogsError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        setWhoamiError("");
        setWorklogsError("");

        const [whoamiResult, ordersResult, worklogsResult] = await Promise.allSettled([
          fetchWhoami(),
          listAssignedOrders(),
          fetchMitraWorklogs(),
        ]);

        if (whoamiResult.status === "fulfilled") {
          setProfile(whoamiResult.value);
        } else {
          setWhoamiError(
            `FEATURE NOT READY: ${whoamiResult.reason?.message || "Error"}`
          );
        }

        if (ordersResult.status === "fulfilled") {
          setOrders(ordersResult.value || []);
        } else {
          setError(ordersResult.reason?.message || "Gagal memuat order.");
        }

        if (worklogsResult.status === "fulfilled") {
          setWorklogs(worklogsResult.value || []);
        } else {
          setWorklogsError(
            `FEATURE NOT READY: ${worklogsResult.reason?.message || "Error"}`
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const activeOrders = orders.filter((order) =>
    ["ASSIGNED", "IN_PROGRESS", "MITRA_ON_ROUTE"].includes(order.status)
  );
  const completedOrders = orders.filter((order) => order.status === "COMPLETED");

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Job Aktif</h2>
          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : activeOrders.length === 0 ? (
            <p className="text-gray-500">Tidak ada job aktif.</p>
          ) : (
            <div className="space-y-2">
              {activeOrders.map((order) => (
                <JobCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Job Selesai</h2>
          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : completedOrders.length === 0 ? (
            <p className="text-gray-500">Belum ada job selesai.</p>
          ) : (
            <div className="space-y-2">
              {completedOrders.map((order) => (
                <JobCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/earnings" className="border rounded-lg p-3 text-center hover:shadow">
            Earnings
          </Link>
          <Link to="/withdraw" className="border rounded-lg p-3 text-center hover:shadow">
            Withdraw
          </Link>
          <Link to="/help" className="border rounded-lg p-3 text-center hover:shadow">
            Help
          </Link>
          <Link to="/order" className="border rounded-lg p-3 text-center hover:shadow">
            Lihat Job
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Worklogs Mitra</h2>

        {worklogsError ? (
          <p className="text-sm text-red-600">{worklogsError}</p>
        ) : loading ? (
          <LoadingSkeleton rows={3} />
        ) : worklogs.length === 0 ? (
          <p className="text-gray-500">Belum ada worklog.</p>
        ) : (
          <ul className="space-y-2 text-sm text-gray-700">
            {worklogs.map((log, index) => (
              <li key={log.id || log.uuid || `${log.created_at}-${index}`}>
                <div className="font-semibold">
                  {log.title || log.activity || "Worklog"}
                </div>
                <div className="text-xs text-gray-500">
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString("id-ID")
                    : "Waktu tidak tersedia"}
                </div>
                {log.notes && <div className="text-xs text-gray-600">{log.notes}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
