# Rencana Integrasi Fitur Mitra

Dokumen ini merinci kebutuhan fungsional dan pola integrasi untuk delapan area utama aplikasi mitra. Fokusnya pada alur layar, dependensi platform (Android), dan kontrak API sehingga tim front-end, backend, dan mobile bisa bekerja sejajar.

## 1. Autentikasi & KYC
- **Layar**: Pendaftaran (input data diri + password), unggah dokumen identitas/selfie, dan layar status verifikasi.
- **Alur**:
  1. Pendaftaran akun → terima token sesi.
  2. Unggah dokumen via `POST /documents` (sertakan metadata jenis dokumen dan device info untuk audit).
  3. Polling/refresh status lewat `GET /documents/status` hingga status `approved` atau `rejected`.
- **UI/State**: Tampilkan progres upload, status KYC (pending/approved/rejected), dan aksi ulangi upload jika gagal.
- **Validasi**: Client-side cek ukuran/format gambar; backend verifikasi mime + duplikat dokumen.

## 2. Lokasi & Toggle Online
- **Teknologi**: `FusedLocationProvider` untuk akurasi & efisiensi baterai, `WorkManager` untuk kirim latar belakang.
- **Alur**:
  - Toggle Online → mulai worker periodik (mis. setiap 15–30 detik) kirim lokasi real-time ke `/locations/stream`.
  - Toggle Offline → hentikan worker + set status ke backend.
- **Fallback**: Tangani izin lokasi ditolak, mode hemat baterai, dan jeda upload saat tidak ada jaringan (queue & retry).
- **Data**: `{ lat, lng, accuracy, heading, speed, battery }` untuk memberikan konteks ke backend dispatcher.

## 3. Siklus Order
- **Langganan**: Gunakan WebSocket `/orders/stream` untuk menerima order baru/perubahan status.
- **Aksi**: Endpoint `POST /orders/{id}/accept`, `POST /orders/{id}/decline`, `POST /orders/{id}/status` (body berisi status baru & catatan).
- **UI**: Kartu order masuk (detail pelanggan, jarak, estimasi bayar), layar detail dengan aksi Accept/Decline dan update status perjalanan.
- **Reliability**: Implementasikan auto-reconnect WS, idempotency key saat kirim aksi, dan penanda waktu sinkron (server timestamp) untuk urutan status.

## 4. Navigasi & ETA
- **Integrasi**: Directions API (Google/OSM) untuk rute aktif.
- **UI**: Tampilkan polyline rute, ETA, jarak, dan opsi buka di aplikasi peta eksternal.
- **Update**: Hitung ulang ETA/route pada perubahan lokasi signifikan atau status order (pickup → dropoff).

## 5. Chat
- **Opsi**:
  - Firestore/RTDB untuk realtime chat (keamanan via rules berbasis `orderId` + `mitraId`).
  - Atau WebSocket custom dengan channel `order:{id}` + pesan dikirim ke backend untuk persistensi.
- **Fitur**: Pesan teks, indikator read/typing opsional, lampiran gambar (dibatasi ukuran), push notification untuk pesan baru.

## 6. Dompet
- **Layar**: Ringkasan saldo, riwayat transaksi, formulir penarikan.
- **API**: `GET /wallet/balance`, `POST /wallet/withdraw` (validasi nominal & rekening). Dukung webhook/ callback untuk status transfer.
- **Keamanan**: Konfirmasi PIN/OTP sebelum penarikan; tampilkan status penarikan (processing/success/failed) dan nomor referensi.

## 7. Notifikasi
- **Registrasi**: Ambil token FCM, kirim & simpan di backend terikat ke `mitraId` + device.
- **Server**: Backend mengirim push untuk order baru, update status, chat, dan hasil KYC/withdrawal.
- **Klien**: Deep link ke layar terkait (order detail, chat, KYC) dan sinkron dengan WS agar konsisten.

## 8. Dukungan
- **Layar**: Form laporan dengan kategori, deskripsi, lampiran opsional.
- **API**: `POST /support/tickets` menyimpan laporan; tampilkan riwayat tiket & status jika tersedia.
- **UX**: Validasi input minimal, konfirmasi pengiriman, dan fallback offline (queue sampai jaringan kembali).

## Keamanan & Observabilitas
- Gunakan refresh token aman, cek perangkat unik (device_id) seperti di `App.jsx` untuk mencegah sesi ganda.
- Log setiap aksi sensitif (KYC upload, status order, withdraw) dengan timestamp & device info.
- Monitoring: catat error WS, retry lokasi, dan penolakan KYC untuk analitik kualitas data.
