"use client";

import { useState, useEffect } from "react";
import { startMitraTracking, stopMitraTracking } from "@/modules/gpsTrackerMitra";
import { updateMitraLocation, updateOrderStatus } from "@/lib/mitraAPI";

export default function OrderMitra({ params }) {
  const orderId = params.id;
  const mitraId = params.id; // bisa diubah sesuai struktur data

  const [trackingId, setTrackingId] = useState(null);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    // Mulai tracking GPS Mitra saat halaman dibuka
    const watchId = startMitraTracking(mitraId, (location) => {
      updateMitraLocation(location.mitraId, location.lat, location.lng);
    });

    setTrackingId(watchId);

    return () => {
      stopMitraTracking(watchId);
    };
  }, [mitraId]);

  async function handleStatusChange(newStatus) {
    setStatus(newStatus);
    await updateOrderStatus(orderId, newStatus);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Mitra Pesanan #{orderId}</h1>

      <div>
        <p>Status saat ini: <strong>{status}</strong></p>

        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => handleStatusChange("picked_up")}
        >
          Ambil Pesanan
        </button>

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ml-2"
          onClick={() => handleStatusChange("delivering")}
        >
          Dalam Pengantaran
        </button>

        <button
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded ml-2"
          onClick={() => handleStatusChange("completed")}
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
