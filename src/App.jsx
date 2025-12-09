// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

// Pages
import Dashboard from "./pages/Dashboard";
import OrderDetail from "./pages/OrderDetail";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import Withdraw from "./pages/Withdraw";

// Modules
import { startMitraGPS } from "./modules/liveLocation";

export default function App() {
  // =====================================
  // DEVICE LOCK — MITRA
  // =====================================
  useEffect(() => {
    async function checkDevice() {
      const deviceLocal = localStorage.getItem("device_id");

      // Ambil user aktif dari Supabase Auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return; // belum login

      const mitraId = user.id;

      const { data } = await supabase
        .from("mitra_profiles")
        .select("device_id")
        .eq("id", mitraId)
        .single();

      if (data && data.device_id !== deviceLocal) {
        alert("Akun anda digunakan di perangkat lain!");
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    checkDevice();
  }, []);

  // =====================================
  // AUTO UPDATE GPS MITRA
  // =====================================
  useEffect(() => {
    async function startGPS() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      startMitraGPS(user.id);
    }

    startGPS();
  }, []);

  // =====================================
  // ROUTES MITRA
  // =====================================
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/chat/:orderId" element={<Chat />} />
        <Route path="/history" element={<History />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/withdraw" element={<Withdraw />} />
      </Routes>
    </Router>
  );
}
