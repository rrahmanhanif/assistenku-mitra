import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat/:orderId" element={<Chat />} />
        <Route path="/history" element={<History />} />
        <Route path="/rating" element={<Rating />} />
      </Routes>
    </Router>
  );
}

export default App;
