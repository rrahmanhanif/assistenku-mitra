import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Wallet from './pages/Wallet'
import Withdraw from './pages/Withdraw'   // <-- TAMBAH INI

export default function App() {
  
  // Cek apakah mitra sudah login
  const isLoggedIn = localStorage.getItem('mitra_session')

  return (
    <Routes>

      {/* Dashboard */}
      <Route
        path="/"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Register */}
      <Route path="/register" element={<Register />} />

      {/* Dompet Mitra */}
      <Route
        path="/wallet"
        element={isLoggedIn ? <Wallet /> : <Navigate to="/login" />}
      />

      {/* Withdraw */}
      <Route
        path="/withdraw"
        element={isLoggedIn ? <Withdraw /> : <Navigate to="/login" />}
      />

      {/* Profil */}
      <Route
        path="/profile"
        element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
      />

    </Routes>
  )
}
