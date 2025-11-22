import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { supabase } from "../supabaseClient";

export default function Register() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [layanan, setLayanan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ambil jenis layanan dari PDF milik kamu
  const jenisLayanan = [
    "ART • Harian",
    "ART • Bulanan",
    "Caregiver • Lansia",
    "Caregiver • Anak",
    "Driver • Lepas",
    "Driver • Harian",
    "Penjaga Toko",
    "Karyawan Minimarket",
    "Kurir Barang",
    "Asisten UMKM",
    "Office Boy",
    "Cleaner • Rumah",
    "Cleaner • Kantor",
    "Koki Rumahan",
    "Baby Sitter",
    "Satpam",
    "Event Helper",
    "Helper Gudang",
    "Montir Panggilan",
    "Barista",
    "Kasir",
    "Waiter",
    "Pet Groomer",
    "Les Privat • SD",
    "Les Privat • SMP",
    "Les Privat • SMA",
    "Pijat Panggilan",
    "Editor Video",
    "Desain Grafis",
    "Fotografer",
    "Lainnya"
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!nama || !email || !password || !layanan) {
        setError("Mohon lengkapi semua data.");
        setLoading(false);
        return;
      }

      // 1. Buat akun Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // 2. Simpan data Mitra ke Supabase
      const { error } = await supabase.from("mitra").insert([
        {
          uid,
          nama,
          email,
          layanan,
          fee_persen: 75,
          saldo: 0,
          status: "menunggu_verifikasi",
          on_duty: false,
        }
      ]);

      if (error) throw error;

      alert("Pendaftaran berhasil! Akun sedang menunggu verifikasi admin.");
      window.location.href = "/login";

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-5">
          Daftar Mitra Assistenku
        </h2>

        {error && <p className="text-red-600 text-center mb-3">{error}</p>}

        <form onSubmit={handleRegister} className="flex flex-col gap-3">

          <input
            type="text"
            placeholder="Nama Lengkap"
            className="border p-2 rounded"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={layanan}
            onChange={(e) => setLayanan(e.target.value)}
          >
            <option value="">Pilih Jenis Layanan</option>
            {jenisLayanan.map((j) => (
              <option key={j}>{j}</option>
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
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Mendaftar..." : "Daftar Mitra"}
          </button>
        </form>

        <p
          className="mt-4 text-center text-blue-600 cursor-pointer"
          onClick={() => (window.location.href = "/login")}
        >
          Sudah punya akun? Masuk
        </p>
      </div>
    </div>
  );
}
