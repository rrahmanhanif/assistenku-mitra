import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { supabase } from "../lib/supabaseClient";

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
  ];
}
