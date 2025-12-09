import React, { useEffect, useState } from "react";
import { getMitraRatings } from "../features/ratings/getMitraRatings";

export default function RatingList() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMitraRatings();
        setRatings(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Memuat rating...</p>;
  if (ratings.length === 0) return <p>Belum ada rating.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Rating Pelanggan</h2>

      {ratings.map((r) => (
        <div
          key={r.id}
          style={{
            padding: 15,
            borderBottom: "1px solid #ccc",
            marginBottom: 10
          }}
        >
          <p><b>Order ID:</b> {r.order_id}</p>

          <p>
            <b>Rating:</b>{" "}
            {"★".repeat(r.rating)}{" "}
            {"☆".repeat(5 - r.rating)}
          </p>

          <p><b>Review:</b> {r.review || "Tidak ada review"}</p>

          <p style={{ color: "#888", fontSize: 12 }}>
            ID Rating: {r.id}
          </p>
        </div>
      ))}
    </div>
  );
}
