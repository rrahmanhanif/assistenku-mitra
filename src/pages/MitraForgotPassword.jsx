import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function MitraForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSend() {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (!error) setSent(true);
  }

  return (
    <div className="flex h-screen justify-center items-center bg-green-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="text-2xl text-green-600 mb-4 text-center">
          Reset Password
        </h2>

        <input
          type="email"
          placeholder="Email Mitra"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          onClick={handleSend}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Kirim Link Reset
        </button>

        {sent && (
          <p className="text-green-600 mt-4 text-center">
            Link reset telah dikirim!
          </p>
        )}
      </div>
    </div>
  );
}
