// src/pages/Chat.jsx (MITRA)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sendMessage, subscribeChat } from "../lib/chat";
import { supabase } from "../lib/supabase";

export default function Chat() {
  const { orderId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const mitraName = localStorage.getItem("mitra_name");

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  }

  useEffect(() => {
    loadMessages();

    const channel = subscribeChat(orderId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => supabase.removeChannel(channel);
  }, []);

  async function handleSend() {
    if (!input.trim()) return;

    await sendMessage(orderId, mitraName, input);
    setInput("");
  }

  return (
    <div style={{ padding: "15px" }}>
      <h3>Chat Customer</h3>

      <div
        style={{
          height: "60vh",
          overflowY: "scroll",
          padding: "10px",
          border: "1px solid #ddd",
          marginBottom: "10px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <b>{m.sender}</b> <br />
            {m.message}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Tulis pesan..."
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />

      <button
        onClick={handleSend}
        style={{
          marginTop: "10px",
          padding: "12px",
          background: "#28a745",
          color: "white",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        Kirim
      </button>
    </div>
  );
}
