"use client";
import { useEffect, useState } from "react";
import { startMitraTracking, stopMitraTracking } from "@/modules/gpsTrackerMitra";
import { updateOrderStatus, updateMitraLocation } from "@/lib/mitraAPI";

export default function MitraOrder({ params }) {
  const orderId = params.id;
  const [pos, setPos] = useState(null);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const mitraId = orderId;

    const id = startMitraTracking(mitraId, async (location) => {
      setPos(location);
      await updateMitraLocation(location.mitraId, location.latitude, location.longitude);
    });

    return () => stopMitraTracking(id);
  }, [orderId]);

  async function handleStatusChange(val) {
    setStatus(val);
    await updateOrderStatus(orderId, val);
  }

  return (
    <div>
      <h1 className="font-bold text-xl">Status Mitra Pesanan #{orderId}</h1>

      {pos && (
        <div>
          Lokasi Mitra: {pos.latitude}, {pos.longitude}
        </div>
      )}

      <div>
        <button onClick={() => handleStatusChange("picked_up")} className="btn btn-success">
          Ambil Pesanan
        </button>
        <button onClick={() => handleStatusChange("delivering")} className="btn btn-primary ml-2">
          Dalam Pengantaran
        </button>
        <button onClick={() => handleStatusChange("completed")} className="btn btn-warning ml-2">
          Selesai
        </button>
      </div>

      <p>Status sekarang: <strong>{status}</strong></p>
    </div>
  );
}
