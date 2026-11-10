# Rule 00: Core Guardrails & Security Standards

> **Status**: MUTLAK (Wajib dipatuhi oleh seluruh agen dan peran di proyek ini)

---

## 1. Perlindungan Kredensial & Rahasia
1. **Dilarang Hardcoding Rahasia**: Dilarang menuliskan API Key, Secret Key, Private Key blockchain, token OAuth, atau password database langsung ke dalam file kode, commit Git, atau file markdown.
2. **Gunakan Environment Variables**: Seluruh rahasia wajib dimuat via `.env` atau secret manager lokal yang terdaftar di `.gitignore`.

---

## 2. Integritas Arsitektur & Kepatuhan Batasan
1. **Kepatuhan Terhadap Constraints Terkunci**: Batasan yang tercatat di `session-state.json` pada array `established_constraints` tidak boleh diubah sepihak tanpa konfirmasi eksplisit pengguna.
2. **Zero Unauthorized Destructive Actions**: Dilarang menjalankan perintah berbahaya (seperti `rm -rf`, `DROP TABLE`, atau modifikasi branch git destruktif) tanpa konfirmasi pengguna.

---

## 3. Reviewer Independence (No Self-Review)
1. Builder dilarang menyatakan kodenya sendiri selesai (*done*) tanpa melalui proses pengujian independen oleh Reviewer (`qa-engineer` atau `tech-critic`).
2. Perubahan skema data, konfigurasi keamanan, atau transaksi finansial/blockchain wajib diverifikasi minimal oleh dua reviewer.

---

## 4. Perlindungan Basis Data Lokal (Zero-Direct-CRUD & Manual phpMyAdmin Policy)
1. **Dilarang Direct-CRUD ke Basis Data Lokal**: Pada proyek berbasis MySQL / PostgreSQL / phpMyAdmin (seperti `adminShuttleV3` dan `admin-sunjaya`), agen **DILARANG KERAS** mengeksekusi kueri manipulasi data (`INSERT`, `UPDATE`, `DELETE`) atau perubahan skema (`ALTER`, `DROP`, `CREATE`) langsung ke database lokal secara diam-diam.
2. **Kewajiban Output Berupa Query SQL Terverifikasi**: Agen hanya bertugas menyusun query SQL yang bersih, aman, dan teruji (dalam blok kode atau file skrip `.sql`) agar pengguna sendiri yang memasukkan dan mengeksekusinya di phpMyAdmin.

---

## 5. Perlindungan Kode Rekan Tim (*Co-Developer Non-Regression Guard*)
1. **Inspeksi Git Sebelum Mengubah**: Pada proyek kolaboratif multi-pengembang, sebelum menyelesaikan pekerjaan, agen wajib melakukan pengecekan (`git blame`, `git log`, atau `git diff`) pada berkas yang disentuh untuk memastikan tidak menimpa atau merusak fitur yang telah dibangun oleh rekan pengembang lain.
2. **Stop & Konfirmasi Dampak**: Jika perbaikan atau fitur baru memaksa modifikasi kode milik rekan tim lain, agen **dilarang mengubahnya secara sepihak**. Sajikan berkas/baris terdampak beserta analisis dampaknya kepada pengguna terlebih dahulu.

---

## 6. Zona Waktu Dinamis & Disiplin Dual-Language (DB English vs UI Local)
1. **Dilarang Hardcode Timezone**: Seluruh kalkulasi tanggal/waktu wajib membaca konfigurasi dinamis (`config('app.timezone')`, `APP_TIMEZONE`, atau UTC ISO standar). Dilarang menyematkan string zona waktu statis seperti `'Asia/Makassar'` di kode backend maupun frontend.
2. **Bahasa Database vs Tampilan UI**: Seluruh nilai penyimpanan sistem (*ENUM*, status transaksi `pending`, `scheduled`, `departed`, `canceled`, nama hari `Monday..Sunday`) **wajib Bahasa Inggris baku**. Bahasa lokal (Indonesia) hanya digunakan pada lapisan penyajian antarmuka pengguna (*UI display layer*).

---

## 7. Audit Wajib Skenario Celah Lapangan (*Field Edge-Case Audit*)
Setiap proses **Review**, **Planning**, **Evaluasi**, dan **Fix-Bug** wajib memeriksa 4 celah lapangan:
1. **Konsistensi State-Machine Lintas Menu**: Guard aksi (`can_cancel`, `can_edit`, `can_pay`) harus terpusat (*Single Source of Truth*) sehingga status tombol di list, detail, modal, dan endpoint API selalu sinkron.
2. **Batas Waktu Real-Time (*Anti-Premature Lock*)**: Pencetakan dokumen persiapan sebelum batas waktu operasional (`ETD` / kadaluarsa) tidak boleh mengunci fitur sebelum waktunya tiba.
3. **Integritas Tabel Anak & Audit Log**: Tabel induk, tabel relasi/pivot, dan log audit wajib ikut diperbarui tanpa meninggalkan status yatim (*orphaned status*) atau duplikasi log.
4. **Skenario Kegagalan & Kondisi Pinggiran**: Uji alur pembatalan setelah penjadwalan, pengisian ulang saldo/stok, serta penggantian aktor operasional.

---

## 8. Kebersihan Kode, Anti-Jargon UI & Set Data Uji Manual
1. **Iterasi Purge (Anti-Zombie Code)**: Saat merevisi kode V1 menjadi V2/V3, hapus bersih seluruh kode mati/modal usang sisa iterasi sebelumnya (jangan hanya di-comment).
2. **Zero Inline FQCN & No Silent Catch**: Import seluruh dependensi class di bagian atas file, dan wajib mencatat log error sebelum mengembalikan respons gagal.
3. **UI Bebas Jargon Teknis**: Dilarang menampilkan istilah rekayasa internal (`database`, `query`, `record`, `injeksi`, atau panjang karakter internal) pada label, modal, maupun toast pengguna.
4. **Panduan Uji Manual Pasca-Form**: Setelah membuat atau memodifikasi form input, sajikan contoh set data uji nyata beserta representasi nilainya yang tersimpan di kolom database.

