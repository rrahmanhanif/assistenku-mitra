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

import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function App() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data.filter((o) => o.mitraId === "mitra001"));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "orders", id), { status: newStatus });
  };

  return (
    <div>
      <h2>Mitra App</h2>
      {orders.map((o) => (
        <div key={o.id}>
          <p>Order: {o.orderId} — {o.status}</p>
          {o.status === "Menunggu" && (
            <button onClick={() => updateStatus(o.id, "Diterima")}>Terima</button>
          )}
          {o.status === "Diterima" && (
            <button onClick={() => updateStatus(o.id, "Dalam Proses")}>Mulai</button>
          )}
          {o.status === "Dalam Proses" && (
            <button onClick={() => updateStatus(o.id, "Selesai")}>Selesai</button>
          )}
        </div>
      ))}
    </div>
  );
}

import Transactions from "./pages/Transactions";

<Route path="/transactions" element={<Transactions />} />
