import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Register from './pages/Register'   // nanti kita buat

export default function App() {
  const isLoggedIn = localStorage.getItem('mitra_session')

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
    </Routes>
  )
}
