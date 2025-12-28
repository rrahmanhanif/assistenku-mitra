# Product Requirements Document (PRD) — Assistenku Mitra

## Latar Belakang dan Tujuan
Assistenku Mitra adalah aplikasi pendamping untuk mitra lapangan dalam mengelola layanan, jadwal, serta pendapatan. Dokumen ini memetakan fitur prioritas awal, alur pengguna, platform rilis, serta wilayah operasional untuk perhitungan biaya dan regulasi.

## Daftar Fitur Prioritas
### Fase 1 — Peluncuran Awal
1. **Onboarding & Verifikasi Mitra**  
   - Registrasi dengan email/nomor telepon, unggah identitas, dan verifikasi melalui OTP.  
   - Pengajuan dokumen legal dan pengecekan latar belakang.
2. **Profil & Kualifikasi Mitra**  
   - Pengelolaan profil, keahlian, sertifikasi, dan tarif dasar.  
   - Status ketersediaan (online/offline) dan area layanan.
3. **Manajemen Pesanan**  
   - Terima/tolak permintaan, lihat detail pekerjaan, dan estimasi waktu.  
   - Penjadwalan ulang dengan persetujuan pelanggan.  
   - Pemberitahuan real-time untuk pembaruan status.
4. **Navigasi & Check-in**  
   - Peta dan rute ke lokasi pelanggan.  
   - Check-in/out berbasis lokasi untuk bukti kedatangan dan penyelesaian.
5. **Pembayaran & Pendapatan**  
   - Ringkasan pendapatan harian/mingguan/bulanan.  
   - Metode pencairan (rekening bank/e-wallet) dengan status penarikan.  
   - Slip pembayaran dan riwayat transaksi.
6. **Dukungan & Keamanan**  
   - Pusat bantuan, chat dengan CS, dan pelaporan insiden.  
   - Asuransi kerja dasar sesuai regulasi wilayah awal.

### Fase 2 — Optimalisasi
1. **Rating & Ulasan Dua Arah**  
   - Mitra dapat memberi dan menerima ulasan untuk meningkatkan reputasi.  
   - Mekanisme sengketa ulasan.
2. **Optimasi Jadwal & Rute**  
   - Rekomendasi penjadwalan dan batching pesanan terdekat.  
   - Prediksi permintaan harian.
3. **Promosi & Insentif**  
   - Misi harian/mingguan, bonus performa, dan kupon.  
   - Dashboard KPI pribadi.
4. **Integrasi Perangkat**  
   - Dukungan wearable (notifikasi dan check-in cepat).  
   - Integrasi printer struk portabel jika relevan.

## Alur Pengguna (Happy Path)
1. **Registrasi & Verifikasi** → Mitra memasukkan email/telepon → menerima OTP → unggah KTP/SIM/sertifikat → menunggu verifikasi.  
2. **Menyiapkan Profil** → Isi profil, keahlian, tarif, area layanan → set status online.  
3. **Menerima Pesanan** → Notifikasi permintaan masuk → lihat detail → terima → sistem set jadwal.  
4. **Menuju Lokasi & Check-in** → Navigasi ke lokasi → check-in otomatis/ manual sesuai geofencing.  
5. **Menyelesaikan Pekerjaan** → Catat hasil, foto bukti (opsional) → check-out → status selesai.  
6. **Pembayaran** → Pendapatan tercatat → pilih metode pencairan → tarik saldo → unduh slip pembayaran.  
7. **Dukungan** → Jika ada kendala, akses pusat bantuan atau ajukan laporan.

## Platform & Perangkat Target
- **Platform awal:** Android.  
- **Target SDK:** 33 (Android 13) untuk memanfaatkan API terbaru tanpa kehilangan kompatibilitas.  
- **Minimum SDK:** 24 (Android 7.0, alternatif 26/Android 8.0 jika diperlukan fitur background/notification yang lebih ketat).  
- **Dukungan perangkat:** Smartphone dengan RAM ≥ 2 GB, konektivitas 4G, dan GPS.

## Region Operasional Awal
- **Wilayah:** Indonesia (fokus metropolitan: Jabodetabek).  
- **Pertimbangan biaya & regulasi:**  
  - Pajak penghasilan (PPN/PPH) sesuai klasifikasi jasa; opsi pemotongan otomatis pada pencairan.  
  - Asuransi kerja dasar (BPJS Ketenagakerjaan) dan opsi asuransi tambahan kecelakaan.  
  - Kepatuhan privasi data (UU PDP) dan kewajiban penyimpanan data domestik bila diperlukan.  
  - Struktur biaya mencakup biaya pembayaran (gateway), asuransi per pesanan, dan margin platform.
