import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

export default function App() {
  const isLoggedIn = localStorage.getItem('customer_session')

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
    </Routes>
  )
}

import { useEffect } from "react";
import { startMitraGPS } from "./modules/gpsTrackerMitra";

export default function App() {
  useEffect(() => {
    // Misal setelah login
    const mitraId = "mitra001";
    const mitraName = "Budi Mitra";
    startMitraGPS(mitraId, mitraName);
  }, []);

  return <div>Halo Mitra 👋, GPS sedang aktif...</div>;
}
