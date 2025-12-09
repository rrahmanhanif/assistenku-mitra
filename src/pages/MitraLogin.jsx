// src/pages/MitraLogin.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generateDeviceId } from "../lib/device";

let lastLogin = 0; // throttle biar tidak spam login

export default function MitraLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    // Anti-spam: jeda 8 detik
    const now = Date.now();
    if (now - lastLogin < 8000)
      return alert("Terlalu sering login, coba lagi dalam 8 detik.");
    lastLogin = now;

    setLoading(true);
    setError("");

    // ===========================
    // LOGIN SUPABASE AUTH
    // ===========================
    const { data, error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginErr) {
      setError(loginErr.message);
      setLoading(false);
      return;
    }

    const session = data.session;
    const mitraId = session?.user?.id;

    // ===========================
    // DEVICE ID
    // ===========================
    const deviceId = await generateDeviceId();

    await supabase
      .from("mitra_profiles")
      .update({ device_id: deviceId })
      .eq("id", mitraId);

    // ===========================
    // LOCAL STORAGE
    // ===========================
    localStorage.setItem("mitra_id", mitraId);
    localStorage.setItem("device_id", deviceId);
    localStorage.setItem("mitra_session", session.access_token);

    // Redirect ke dashboard
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
          Assistenku Mitra
        </h2>

        <input
          type="email"
          placeholder="Email Mitra"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />

        <input
          type="password"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>

        <p
          className="text-blue-600 text-center mt-4 cursor-pointer"
          onClick={() => (window.location.href = "/mitra-forgot")}
        >
          Lupa Password?
        </p>

        <p
          className="text-blue-600 text-center mt-2 cursor-pointer"
          onClick={() => (window.location.href = "/mitra-register")}
        >
          Belum punya akun? Daftar Mitra
        </p>
      </form>
    </div>
  );
}
