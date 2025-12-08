// src/pages/Rating.jsx
import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Rating() {
  const mitraId = localStorage.getItem("mitra_id");
  const [ratings, setRatings] = useState([]);

  // Load awal
  async function loadRatings() {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("mitra_id", mitraId)
      .order("created_at", { ascending: false });

    if (!error) setRatings(data || []);
  }

  // Subscribe realtime rating baru
  function subscribeRating() {
    return supabase
      .channel("mitra-rating-" + mitraId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ratings",
          filter: `mitra_id=eq.${mitraId}`,
        },
        (payload) => {
          const newRating = payload.new;
          setRatings((prev) => [newRating, ...prev]);
        }
      )
      .subscribe();
  }

  useEffect(() => {
    if (!mitraId) return;

    loadRatings();

    const channel = subscribeRating();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Rating & Ulasan Customer</h2>

      {ratings.length === 0 && <p>Belum ada ulasan.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {ratings.map((r) => (
          <li
            key={r.id}
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "5px" }}>
              {"★".repeat(r.rating)}
            </div>

            <p style={{ margin: 0 }}>{r.review}</p>

            <small style={{ color: "#666" }}>
              {new Date(r.created_at).toLocaleString()}
            </small>

            <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
              Order #{r.order_id}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
