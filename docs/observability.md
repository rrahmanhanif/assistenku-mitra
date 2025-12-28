# Observability: Metrik Bisnis & Teknis

## Metrik funnel pesanan
- **Stage yang dicatat**: `mitra_accepted`, `on_the_way`, `working`, `completed`.
- **Bidang minimal**: `order_id`, `mitra_id`, `recorded_at`, `metadata` (sumber kanal/versi app).
- **Tujuan bisnis**: memantau drop-off per tahap, SLA respons mitra, dan pemenuhan pesanan harian.
- **Pengumpulan data**: tercatat otomatis via `src/lib/observability.js` setiap kali aksi status dieksekusi di `src/lib/orderAction.js`.

## Metrik match time
- **Definisi**: durasi dari `created_at` order sampai mitra menekan “Terima Pesanan”.
- **Pencatatan**: `logMatchTime` menyimpan `duration_ms`, `created_at`, `matched_at`, dan `mitra_id` dengan `upsert` agar satu order hanya memiliki satu catatan.
- **Pembacaan**: metrik bisa di-aggregate (p95, p99) untuk memantau latency matching per layanan atau area.

## Metrik teknis
- **Contoh awal**: `payout.calculated` menyimpan komisi mitra saat order selesai.
- **Dimensi**: `orderId`, `adminCommission`, `taxFee` disimpan di kolom `dimensions` untuk analisis drill-down.
- **Ekstensi**: fungsi `logTechnicalMetric` terbuka untuk metrik lain (latensi API, kegagalan push, dll.) tanpa mengubah modul core.

## Data sink yang disarankan
- **Supabase**: tabel `order_funnel_events`, `order_match_times`, `technical_metrics`, dan `fraud_signals` untuk sinyal keamanan.
- **Pipeline sekunder**: setel replicator/FDW ke warehouse untuk dashboard BI agar tidak membebani database transaksi.

## Governance & kualitas data
- **Skema konsisten**: gunakan `recorded_at` bertipe UTC ISO-8601.
- **Pengamanan**: limit akses tabel metrik dengan RLS yang hanya mengizinkan role sistem observability.
- **Validasi**: tambahkan constraint `NOT NULL` pada `order_id` dan `stage`, serta index kombinasi (`stage`, `recorded_at`) untuk kueri time-series.
