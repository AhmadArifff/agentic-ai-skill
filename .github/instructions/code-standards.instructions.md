---
applyTo: "**/*.{js,ts,jsx,tsx,vue}"
---
## Aturan Kode (Code Rules)

### Guard Clauses & Early Return
- Validasi kondisi gagal di awal fungsi, lalu `return` langsung.
- Hindari `if-else` bersarang (*pyramid of doom*).

### Result Pattern pada Service Layer
- Kembalikan objek terstruktur `{ success: true, data }` atau `{ success: false, error }`.
- Hindari `throw` exception tanpa penanganan terpusat (`try-catch` global handler).

### Zero Hardcoded
- Dilarang meng-hardcode kredensial, URL, atau data master di dalam kode.
- Gunakan environment variables (`process.env`) atau tabel konfigurasi dinamis.

### Fail Gracefully & Structured Logging
- Tidak ada blok `catch` kosong.
- Catat log berstruktur (JSON) dengan metadata konteks (userId, requestId, timestamp).

### High-Concurrency Atomic Locking
- Pada perebutan sumber daya bersama (stok, antrean, sesi), gunakan distributed atomic lock (Redis TTL).
- Sediakan endpoint/mekanisme resilient teardown untuk pelepasan lock.
