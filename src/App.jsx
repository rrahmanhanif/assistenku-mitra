import React from 'react';
import { listenMitraNotification } from "./modules/notification";

// Perubahan hanya pada ekstensi
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return <Dashboard />;
  <Route path="/chat/:orderId" element={<Chat />} />
  useEffect(() => {
  if (!loggedIn) return;

  const mitraId = localStorage.getItem("mitra_id");

  const unsubNotif = listenMitraNotification(mitraId, (notif) => {
    alert("Pesan baru dari Customer: " + notif.message);
  });

  return () => {
    unsubNotif.unsubscribe();
  };
}, [loggedIn]);
}
