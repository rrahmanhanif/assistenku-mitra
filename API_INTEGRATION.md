# API Integration (Mitra App)

Dokumen ini menjelaskan cara aplikasi Mitra terhubung ke API terpusat `https://api.assistenku.com`.

## Konfigurasi Environment

Tambahkan variabel berikut pada `.env`:

VITE_API_BASE_URL=https://api.assistenku.com

csharp
Salin kode

Contoh lengkap tersedia pada `.env.example`.

## Struktur HTTP Service

Semua panggilan API harus memakai HTTP service di `src/services/http/`:

- `baseUrl.js`: sumber base URL (`VITE_API_BASE_URL`).
- `getToken.js`: mengambil access token dari sesi Supabase.
- `endpoints.js`: daftar endpoint terpusat.
- `httpClient.js`: wrapper fetch dengan auth header dan parsing respons.

Contoh penggunaan:

```js
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

const me = await httpClient.get(endpoints.auth.whoami);
const worklogs = await httpClient.get(endpoints.mitra.worklogs);
Error Handling
Jika endpoint gagal diakses, UI wajib menampilkan pesan:

php-template
Salin kode
FEATURE NOT READY: <detail_error>
Tujuannya agar pengguna melihat error asli dari API (bukan data dummy).

Catatan
Jangan membuat folder root /api.

Jangan menambah serverless functions di repo ini.

Endpoint yang dipakai UI Mitra sudah terdaftar di src/services/http/endpoints.js.

markdown
Salin kode

**Cara pakai:**
1. Buat file `API_INTEGRATION.md`
2. Paste isi di atas
3. Commit & push

Kalau mau, saya bisa buatkan **versi khusus Admin & Customer** agar semua repo punya standar dokumentasi yang sama.






