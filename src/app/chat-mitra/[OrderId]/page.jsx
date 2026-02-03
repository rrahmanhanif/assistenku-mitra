// src/app/chat-mitra/[OrderId]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { sendMessage, subscribeChat } from "@/lib/chatMitra";

export default function MitraChat({ params }) {
  const orderId = params.orderId;
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const sub = subscribeChat(orderId, (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    return () => {
      if (sub?.unsubscribe) sub.unsubscribe();
    };
  }, [orderId]);

  const handleSend = async () => {
    await sendMessage(orderId, "mitra", text);
    setText("");
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Chat Mitra Pesanan #{orderId}</h2>

      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="border rounded px-2 py-1">
            <b>{m.sender}:</b> {m.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={text}
          placeholder="Tulis pesan..."
          className="border px-2 py-1 flex-1"
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={handleSend}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
