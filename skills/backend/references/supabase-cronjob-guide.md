# Panduan Backend: Implementasi CronJob dengan Supabase PostgreSQL

Dokumen ini merupakan hasil ekstraksi *best practices* dari proyek **CrownJobExpiredSupbase** dan menjadi standar referensi untuk implementasi cron job serta autentikasi pada backend Express.js dengan Prisma ORM.

## 1. Arsitektur Monorepo & Backend

Backend diimplementasikan dalam sebuah *monorepo* (biasanya menggunakan Turborepo) di direktori `apps/api`.
- **Server:** Express.js
- **ORM:** Prisma
- **Database:** Supabase PostgreSQL
- **Koneksi Database:** Menggunakan IPv4 Connection Pooler (contoh: AWS Poolers port 6543) untuk menghindari *error* `ENOTFOUND` terkait *deprecation* koneksi IPv6 *direct*.

> [!IMPORTANT]  
> Saat melakukan operasi DDL (Data Definition Language) atau interaksi *pooler*, selalu gunakan *Connection Pooler URL* dari *Supabase Dashboard* untuk menjamin konektivitas IPv4.

## 2. Autentikasi dengan Better Auth

Pengamanan rute dan sesi user menggunakan **Better Auth** dikombinasikan dengan JWT.
- **Enkripsi Data Sensitif:** Data rahasia (seperti *Service Role Keys* milik Supabase) wajib dienkripsi menggunakan AES-256 sebelum disimpan ke dalam database. *Plain text password* sangat dilarang.
- **RBAC & Akses:** *Endpoint* yang mengatur konfigurasi *cron job* hanya dapat diakses oleh *user* terautentikasi (*protected routes*).

## 3. Logika "Keep-Alive" Cron Job

Tujuan utama dari mekanisme ini adalah mencegah Supabase *Free Tier* terkena aturan *auto-pause* (berlaku bila tidak ada aktivitas selama 7 hari berturut-turut).

### Mekanisme Eksekusi
1. **Target Tabel:** Backend harus membuat tabel bernama `cronjob_keepalive` secara otomatis pada *database* klien (Supabase) jika tabel tersebut belum ada.
2. **Ping / Interaksi Berkala:** Eksekusi dilakukan dengan menjadwalkan *cron job* (misal melalui integrasi *Vercel Cron* atau utilitas *node-cron* internal).
3. **Operasi CRUD:** Pada setiap eksekusi, *backend* akan melakukan operasi *INSERT* dan kemudian membersihkannya (*DELETE*) atau memperbarui *timestamp*. Ini sudah cukup dihitung sebagai aktivitas DML oleh Supabase.
4. **Log Aktivitas:** Catat riwayat ping/kegagalan (*Activity Logs*) pada *database* utama aplikasi untuk kebutuhan *monitoring* di *Admin Panel*.

## 4. Keamanan & Limitasi

- **Limitasi Free-Tier Policy Enforcer:** Implementasikan aturan bahwa setiap *user* (berdasarkan email) hanya diizinkan untuk menambahkan maksimal 2 konfigurasi *database* target.
- **Health Checks:** Sediakan *endpoint* *Health Check* untuk mengecek aksesibilitas URL *Frontend/Backend* dari klien yang terhubung secara *real-time*.
