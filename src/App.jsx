import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

export default function App() {

  // Ambil token login Mitra
  const isLoggedIn = localStorage.getItem('mitra_session')

  return (
    <Routes>

      {/* Dashboard (halaman utama) */}
      <Route
        path="/"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Register */}
      <Route path="/register" element={<Register />} />

      {/* Profil mitra */}
      <Route
        path="/profile"
        element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
      />

    </Routes>
  )
}
