import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Withdraw from "./pages/Withdraw";
import OrderProcess from "./pages/OrderProcess"; // WAJIB ADA

export default function App() {
  // Ambil session mitra dari localStorage
  const isLoggedIn = localStorage.getItem("mitra_session");

  return (
    <Routes>
      {/* ============================
          DASHBOARD
      ============================ */}
      <Route
        path="/"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* ============================
          AUTH
      ============================ */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ============================
          DOMPET & WITHDRAW
      ============================ */}
      <Route
        path="/wallet"
        element={isLoggedIn ? <Wallet /> : <Navigate to="/login" />}
      />

      <Route
        path="/withdraw"
        element={isLoggedIn ? <Withdraw /> : <Navigate to="/login" />}
      />

      {/* ============================
          PROSES ORDER (REALTIME)
      ============================ */}
      <Route
        path="/order/:id"
        element={isLoggedIn ? <OrderProcess /> : <Navigate to="/login" />}
      />

      {/* ============================
          PROFIL
      ============================ */}
      <Route
        path="/profile"
        element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
