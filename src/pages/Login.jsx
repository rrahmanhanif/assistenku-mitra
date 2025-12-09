import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { generateDeviceId } from "../lib/device";

let lastLogin = 0;

export default function LoginMitra() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const now = Date.now();
    if (now - lastLogin < 8000)
      return alert("Terlalu sering, coba lagi 8 detik");
    lastLogin = now;

    setLoading(true);
    setError("");

    // LOGIN via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const session = data.session;
    const mitraId = session?.user?.id;

    // Generate Device ID
    const deviceId = generateDeviceId();

    // Simpan device_id ke database
    await supabase
      .from("mitra_profiles")
      .update({ device_id: deviceId })
      .eq("id", mitraId);

    // Simpan ke lokal
    localStorage.setItem("device_id", deviceId);
    localStorage.setItem("mitra_session", session.access_token);

    // Redirect
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl shadow-md w-96">
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

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
          disabled={loading}
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>

        <p
          className="text-blue-600 text-center mt-4 cursor-pointer"
          onClick={() => (window.location.href = "/register")}
        >
          Belum punya akun? Daftar Mitra
        </p>
      </form>
    </div>
  );
}
