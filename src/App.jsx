// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import OrderDetail from "./pages/OrderDetail"; // ✅ halaman baru untuk detail pesanan

function App() {
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

        {/* Halaman rating */}
        <Route path="/rating" element={<Rating />} />
      </Routes>
    </Router>
  );
}

export default App;
