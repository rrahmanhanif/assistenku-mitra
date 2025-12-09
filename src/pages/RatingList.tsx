import React, { useEffect, useState } from "react";
import { getMitraRatings } from "../features/ratings/getMitraRatings";
import toast from "react-hot-toast";

interface RatingEntry {
  id: string;
  order_id: string;
  rating: number;
  review: string | null;
}

export default function RatingList() {
  const [ratings, setRatings] = useState<RatingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMitraRatings();
        setRatings(data);
      } catch (e) {
        toast.error("Gagal memuat rating");
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="p-6 text-gray-600">Memuat rating...</p>;
  if (ratings.length === 0)
    return <p className="p-6 text-gray-600">Belum ada rating.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">Rating Pelanggan</h1>

      {ratings.map((r) => (
        <div
          key={r.id}
          className="bg-white p-4 rounded-xl shadow mb-4 border border-gray-200"
        >
          <p className="font-semibold">Order ID: {r.order_id}</p>

          <p className="text-yellow-500 text-xl mt-2">
            {"★".repeat(r.rating)}
            {"☆".repeat(5 - r.rating)}
          </p>

          <p className="mt-2 text-gray-700">
            {r.review || "Tidak ada review"}
          </p>

          <p className="text-gray-400 text-xs mt-2">ID Rating: {r.id}</p>
        </div>
      ))}
    </div>
  );
}
