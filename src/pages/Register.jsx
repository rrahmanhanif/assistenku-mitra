import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { supabase } from "../supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [layanan, setLayanan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const jenisLayanan = [
    "ART",
    "Caregiver",
    "Driver",
    "Penjaga Toko",
    "Lainnya"
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Buat akun Firebase Auth
      const user = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Simpan profil Mitra ke Supabase
      await supabase.from("mitra").insert([
        {
          uid: user.user.uid,
          nama: nama,
          email: email,
          layanan: layanan,
          fee_persen: 75,    // mitra menerima 75%
          status: "menunggu_verifikasi"
        }
      ]);

      alert("Pendaftaran berhasil! Menunggu verifikasi Admin.");
      window.location.href = "/login";

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-bold text-primary mb-4 text-center">
          Daftar Mitra
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleRegister} className="flex flex-col gap-3">

          <input
            type="text"
            placeholder="Nama Lengkap"
            className="border p-2 rounded"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <select
            value={layanan}
            onChange={(e) => setLayanan(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Pilih Jenis Layanan</option>
            {jenisLayanan.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="bg-primary text-white py-2 rounded hover:bg-blue-600 transition"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="mt-3 text-center text-blue-600 cursor-pointer"
           onClick={() => (window.location.href = "/login")}
        >
          Sudah punya akun? Masuk
        </p>
      </div>
    </div>
  );
}
