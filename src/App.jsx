// src/App.jsx
import React, { useEffect, useState } from "react";
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
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Modules
import { startMitraGPS } from "./modules/liveLocation";
import LocationRationaleDialog from "./components/LocationRationaleDialog";
import { hasLocationConsent, recordLocationConsent } from "./modules/locationConsent";

export default function App() {
  const [locationConsent, setLocationConsent] = useState(hasLocationConsent());
  const [showLocationRationale, setShowLocationRationale] = useState(
    !hasLocationConsent()
  );

  const handleApproveLocation = () => {
    recordLocationConsent();
    setLocationConsent(true);
    setShowLocationRationale(false);
  };

  // =====================================
  // DEVICE LOCK — MITRA
  // =====================================
  useEffect(() => {
    async function checkDevice() {
      const deviceLocal = localStorage.getItem("device_id");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return; // belum login

      const mitraId = user.id;

      const { data, error } = await supabase
        .from("mitra_profiles")
        .select("device_id")
        .eq("id", mitraId)
        .single();

      if (error) {
        console.error("Device check error:", error);
        return;
      }

      if (data && data.device_id && deviceLocal && data.device_id !== deviceLocal) {
        alert("Akun anda digunakan di perangkat lain!");
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    checkDevice();
  }, []);

  // =====================================
  // AUTO UPDATE GPS MITRA (hanya jika consent)
  // =====================================
  useEffect(() => {
    async function startGPS() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !locationConsent) return;

      startMitraGPS(user.id);
    }

    startGPS();
  }, [locationConsent]);

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

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>

      {showLocationRationale && (
        <LocationRationaleDialog
          onAccept={handleApproveLocation}
          onDecline={() => setShowLocationRationale(false)}
        />
      )}
    </Router>
  );
}
