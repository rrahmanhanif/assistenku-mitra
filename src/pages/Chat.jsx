// src/pages/Chat.jsx (MITRA)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChat, sendChatMessage, subscribeChat } from "../lib/chat";
import { supabase } from "../lib/supabase";

export default function Chat() {
  const { orderId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const mitraId = localStorage.getItem("mitra_id");

  // Load history + realtime listener
  useEffect(() => {
    async function loadHistory() {
      const data = await getChat(orderId);
      setMessages(data);
    }

    loadHistory();

    // Realtime subscribe
    const channel = subscribeChat(orderId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // SEND MESSAGE
  async function handleSend() {
    if (!text.trim()) return;

    await sendChatMessage({
      order_id: orderId,
      sender_type: "mitra",
      sender_id: mitraId,
      message: text,
    });

    setText("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat dengan Customer</h2>

      <div
        style={{
          height: "70vh",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10,
          marginTop: 15,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: 10,
              textAlign: m.sender_type === "mitra" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: 10,
                background: m.sender_type === "mitra" ? "#007bff" : "#666",
                color: "white",
                borderRadius: 8,
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {m.message}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: "25%",
            padding: 10,
            background: "#28a745",
            color: "white",
            borderRadius: 8,
            fontWeight: "bold",
          }}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
