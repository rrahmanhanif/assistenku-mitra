// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";

// Pages
import Dashboard from "./pages/Dashboard";
import OrderDetail from "./pages/OrderDetail";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import Withdraw from "./pages/Withdraw"; // <- dipindah ke posisi rapi

// Modules
import { startMitraGPS } from "./modules/liveLocation";

export default function App() {
  useEffect(() => {
    const mitraId = localStorage.getItem("mitra_id");
    if (!mitraId) return;

    // Kirim lokasi setiap 4 detik
    startMitraGPS(mitraId);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Dashboard utama */}
        <Route path="/" element={<Dashboard />} />

        {/* Detail order */}
        <Route path="/order/:id" element={<OrderDetail />} />

        {/* Chat antar mitra-customer */}
        <Route path="/chat/:orderId" element={<Chat />} />

        {/* Riwayat pekerjaan */}
        <Route path="/history" element={<History />} />

        {/* Rating */}
        <Route path="/rating" element={<Rating />} />

        {/* Withdrawal */}
        <Route path="/withdraw" element={<Withdraw />} />
      </Routes>
    </Router>
  );
}
