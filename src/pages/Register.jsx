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

  // Layanan berdasarkan PDF
  const jenisLayanan = [
    {
      name: "ART",
      gaji: "20.600 – 23.400/jam | 149.600 – 170.000/hari"
    },
    {
      name: "Caregiver",
      gaji: "35.000 – 43.000/jam | 250.000 – 310.000/hari"
    },
    {
      name: "Driver",
      gaji: "35.000 – 45.000/jam | 250.000 – 320.000/hari"
    },
    {
      name: "Penjaga Toko",
      gaji: "22.000 – 27.000/jam | 160.000 – 190.000/hari"
    },
    {
      name: "Lainnya",
      gaji: "25.000 – 32.000/jam | 180.000 – 220.000/hari"
    }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Buat akun firebase auth
      const user = await createUserWithEmailAndPassword(auth, email, password);

      // Cari gaji layanan
      const gaji = jenisLayanan.find((j) => j.name === layanan)?.gaji || "-";

      // Simpan ke Supabase
      const { error: sbError } = await supabase.from("mitra").insert([
        {
          uid: user.user.uid,
          nama,
          email,
          layanan,
          gaji_range: gaji,
          fee_persen: 75, // mitra menerima 75%
          status: "menunggu_verifikasi",
          created_at: new Date()
        }
      ]);

      if (sbError) throw sbError;

      alert("Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi Admin.");
      window.location.href = "/login";

    } catch (err) {
      console.log(err);
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Daftar Mitra Assistenku
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleRegister} className="flex flex-col gap-3">

          <input
            type="text"
            placeholder="Nama Lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <select
            value={layanan}
            onChange={(e) => setLayanan(e.target.value)}
            className="border p-2 rounded"
            required
          >
            <option value="">Pilih Jenis Layanan</option>
            {jenisLayanan.map((j) => (
              <option key={j.name} value={j.name}>
                {j.name} — {j.gaji}
              </option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Email Mitra"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <button
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p
          onClick={() => (window.location.href = "/login")}
          className="text-blue-600 mt-4 text-center cursor-pointer"
        >
          Sudah punya akun? Masuk
        </p>
      </div>
    </div>
  );
}
