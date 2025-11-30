import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Rating() {
  const mitraId = localStorage.getItem("mitra_id");
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    supabase
      .from("ratings")
      .select("*")
      .eq("mitra_id", mitraId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRatings(data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Rating Saya</h2>
      {ratings.length === 0 && <p>Belum ada rating.</p>}
      <ul>
        {ratings.map((r) => (
          <li key={r.id}>
            Order #{r.order_id} — ⭐ {r.rating} — "{r.review}"
          </li>
        ))}
      </ul>
    </div>
  );
}
