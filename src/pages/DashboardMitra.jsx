import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listAssignedOrders } from "../api/orders";
import { fetchProfile } from "../api/profile";
import { JobCard } from "../components/JobCard";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export default function DashboardMitra() {
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [me, list] = await Promise.all([fetchProfile(), listAssignedOrders()]);
        setProfile(me);
        setOrders(list || []);
      } catch (err) {
        setError(err.message);
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
    </div>
  );
}
