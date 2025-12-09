import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function MitraResetPassword() {
  const [password, setPassword] = useState("");

  async function handleReset() {
    await supabase.auth.updateUser({ password });
    alert("Password berhasil diubah!");
    window.location.href = "/mitra-login";
  }

  return (
    <div className="flex h-screen justify-center items-center bg-green-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="text-2xl text-green-600 mb-4 text-center">
          Buat Password Baru
        </h2>

        <input
          type="password"
          placeholder="Password Baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          onClick={handleReset}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Simpan Password Baru
        </button>
      </div>
    </div>
  );
}
