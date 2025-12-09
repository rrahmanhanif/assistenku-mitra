// src/pages/MitraRegister.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generateDeviceId } from "../lib/device";
import { saveMitraToFirebase } from "../lib/firebaseSync";

export default function MitraRegister() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password || !name || !phone) {
      setError("Semua field wajib diisi");
      setLoading(false);
      return;
    }

    // REGISTER SUPABASE AUTH
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setLoading(false);
      return;
    }

    const mitraId = data.user.id;
    const deviceId = await generateDeviceId();

    // SIMPAN KE SUPABASE
    await supabase.from("mitra_profiles").insert({
      id: mitraId,
      full_name: name,
      phone,
      email,
      device_id: deviceId,
      status: "inactive",
    });

    // MIRROR KE FIREBASE (admin/otak)
    await saveMitraToFirebase(mitraId, {
      id: mitraId,
      name,
      phone,
      email,
      device_id: deviceId,
      created_at: Date.now(),
      verified: false
    });

    // SIMPAN LOCAL
    localStorage.setItem("mitra_id", mitraId);
    localStorage.setItem("mitra_name", name);
    localStorage.setItem("device_id", deviceId);

    alert("Registrasi mitra berhasil!");
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen justify-center items-center bg-green-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-green-600">
          Daftar Mitra
        </h2>

        <input
          type="text"
          placeholder="Nama Lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="text"
          placeholder="Nomor HP"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="email"
          placeholder="Email Mitra"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password (min 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded"
        >
          {loading ? "Mendaftar..." : "Daftar"}
        </button>

        <p
          className="text-green-600 text-center mt-4 cursor-pointer"
          onClick={() => (window.location.href = "/mitra-login")}
        >
          Sudah punya akun? Login
        </p>
      </form>
    </div>
  );
}
