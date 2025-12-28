# SOP Dukungan & Insiden

## 1) Kanal & triase
- **Single intake**: semua keluhan/insiden masuk via tiket helpdesk atau form in-app; auto-tag lokasi, layanan, dan versi aplikasi.
- **Prioritas**:
  - P1: transaksi terblokir, kebocoran data, atau downtime pembayaran.
  - P2: fitur kritikal melambat/error berulang namun masih ada workaround.
  - P3: bug minor/kosmetik.
- **On-call**: roster mingguan dengan 2 lapis (primary/secondary) dan escalation matrix ke lead produk & keamanan.

## 2) Runbook insiden
- **Deteksi awal**: gunakan dashboard metrik (funnel & match time) dan alerting threshold (misal p95 match time > 90 detik selama 5 menit).
- **Stabilisasi**: freeze rilis, aktifkan banner status di aplikasi jika berdampak ke mitra/customer.
- **Diagnostik**: cek log Supabase (order_funnel_events, fraud_signals), tracing API, dan sample session yang terpengaruh.
- **Mitigasi**: rollback build, aktifkan feature flag, atau rate-limit endpoint bermasalah.
- **Pemulihan**: verifikasi pemesanan baru berjalan normal, normalisasi data anomali jika ada duplicate/failed payout.

## 3) Komunikasi
- **Internal**: war-room di channel incident dengan timeline, PIC, dan keputusan tertulis.
- **Eksternal**: status page + notifikasi push/email untuk P1/P2; follow-up personal untuk mitra yang kehilangan penghasilan.
- **Pasca insiden**: postmortem 24 jam setelah recovery dengan 5-Whys, aksi preventif, dan SLA penyelesaian.

## 4) Dukungan harian
- **Makro Template**: refund partial, reset akun, klarifikasi komisi, verifikasi lokasi.
- **SOP verifikasi**: cek sinyal fraud (root/jailbreak & mock location) sebelum memproses klaim kehilangan akun.
- **Feedback loop**: tag tiket ke penyebab (UX, performa, penyalahgunaan) untuk prioritas sprint berikutnya.

## 5) Dokumentasi & audit
- Simpan runbook per layanan di repo ini (`docs/`), versi-kan setiap perubahan.
- Audit mingguan atas tiket P1/P2 untuk memastikan RCA diimplementasi dan metrik kembali sehat.
