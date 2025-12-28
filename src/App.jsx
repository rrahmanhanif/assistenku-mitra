// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import supabase from "./lib/supabaseClient";
import { runDeviceFraudChecks } from "./lib/fraudSignals";

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

      if (!user) return;

      // Ambil device_id yang tersimpan untuk user ini
      const { data: rows, error } = await supabase
        .from("user_devices")
        .select("device_id")
        .eq("user_id", user.id)
        .limit(1);

      if (error) {
        console.error("Device check error:", error);
        return;
      }

      const deviceDb = rows?.[0]?.device_id;

      // Jika device mismatch: paksa logout
      if (deviceDb && deviceLocal && deviceDb !== deviceLocal) {
        await supabase.auth.signOut();
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
  // FRAUD SIGNALS — ROOT/JAILBREAK
  // =====================================
  useEffect(() => {
    async function checkFraudSignals() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      runDeviceFraudChecks(user.id);
    }

    checkFraudSignals();
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
