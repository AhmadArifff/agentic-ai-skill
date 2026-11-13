# Framework Sinergi Tim & Protokol Komunikasi Developer

> **Team Alignment & Clarity Standard**: Buku panduan taktis ini dirancang untuk memastikan pengembang selalu percaya diri, terstruktur, dan selaras saat berkoordinasi dengan **Atasan / Stakeholder Bisnis** maupun rekan **Tim Pengembang Eksternal** (pembuat Microservice API / Mobile / Integrasi Mitra).

---

## 1. Mengapa Framework Ini Diciptakan?

Dalam pengembangan sistem informasi terpadu modern, sering kali terdapat 2 sisi ekosistem data:
1. **Aplikasi Operasional Internal**: Dikelola oleh tim inti menggunakan database operasional langsung (misal Laravel / Next.js ke MySQL / PostgreSQL).
2. **Microservice API Eksternal / Omnichannel**: Dikelola oleh tim backend eksternal untuk sinkronisasi antar-platform (Aplikasi Mobile Customer, OTA pihak ketiga, Payment Webhook).

**Potensi Masalah di Lapangan**:
* Jika developer ragu apakah suatu fitur butuh API eksternal atau cukup database lokal, manajemen / stakeholder akan meragukan kejelasan perencanaan kerja.
* Jika developer meminta tim API eksternal membuat endpoint baru padahal datanya cukup diolah di DB lokal, komunikasi tim menjadi tidak efisien.
* Jika fitur benar-benar butuh API eksternal namun dikerjakan tanpa kontrak data yang disepakati, terjadi saling tunggu saat integrasi.

Framework ini menyelesaikan masalah tersebut secara permanen.

---

## 2. Pola Komunikasi 3 Kalimat ke Atasan / Stakeholder (Executive Briefing Pattern)

Ketika manajemen, atasan, atau klien menanyakan status, alur, atau rencana fitur baru, gunakan pola **3 Kalimat Emas** ini. Pola ini padat, jelas, berbasis bisnis, dan bebas jargon teknis:

```markdown
"Pak/Bu [Nama Atasan/Stakeholder], untuk [Nama Fitur] alur kerjanya seperti ini:
1. Alur Bisnisnya: Analoginya seperti [Sebutkan Analogi Nyata], tujuannya agar staf [Sebutkan Nilai/Manfaat Operasional].
2. Kebutuhan Tim API: Data ini beroperasi secara [Direct DB Lokal / Hybrid Microservice API Eksternal], jadi tim backend eksternal [TIDAK PERLU / PERLU] membuat endpoint baru.
3. Keamanan Data: Tabel yang terdampak saat penyimpanan adalah [Sebutkan Nama Tabel Utama], dan tidak mengganggu data atau modul lainnya yang sudah berjalan."
```

### Contoh Nyata (Studi Kasus Operasional Loket):
> *"Pak, untuk check-in kedatangan paket alur kerjanya seperti ini:*  
> *1. **Alur Bisnisnya**: Analoginya seperti bus antar-kota yang menurunkan bagasi di terminal tujuan; staf loket memeriksa barang fisik satu per satu sebelum barang masuk gudang dan siap diambil penerima.*  
> *2. **Kebutuhan Tim API**: Seluruh data paket ini beroperasi secara **Direct DB Lokal**, jadi tim backend eksternal **tidak perlu membuat endpoint baru** karena langsung dikelola oleh sistem operasional kita.*  
> *3. **Keamanan Data**: Data kedatangan ini mencatat status di tabel `package_transactions` dan audit log di `package_trackings` tanpa menyentuh modul tiket maupun modul armada."*

---

## 3. Protokol Komunikasi dengan Tim Backend API (Contract-First Protocol)

Jika sebuah fitur **BENAR-BENAR MEMBUTUHKAN ENDPOINT BARU** dari tim backend eksternal (seperti inventori publik, live seatmap antar-aplikasi, atau sinkronisasi OTA):

### Langkah 1: Kunci Kontrak JSON Sebelum Koding Dimulai
Jangan mulai koding integrasi sebelum format payload disepakati. Ajukan draf kontrak JSON seperti berikut:

```json
// DRAF KONTRAK ENDPOINT: POST /v1/example/action
// Request Payload:
{
  "schedule_id": 105,
  "seat_id": "1A",
  "date": "2026-11-08",
  "passenger_name": "Budi Santoso"
}

// Expected Success Response (200 OK):
{
  "status": "success",
  "code": 200,
  "message": "Data berhasil diproses",
  "data": {
    "booking_code": "TNA-20261108-001",
    "status": "confirmed"
  }
}

// Expected Error Response (422 / 400):
{
  "status": "error",
  "code": 422,
  "message": "Kursi 1A sudah dipesan oleh pengguna lain",
  "errors": []
}
```

### Langkah 2: Buat Adapter & Interface Terisolasi
Sambil menunggu endpoint tersedia di staging, siapkan interface adapter atau state kosong yang aman (*graceful fallback*) tanpa mengorbankan struktur kode arsitektur utama.

---

## 4. Checklist 4 Pertanyaan Mandiri Sebelum Koding (Pre-Development Sanity Gate)

Sebelum menyentuh baris kode apa pun, AI Agent dan developer wajib memvalidasi 4 pertanyaan ini:

| No | Pertanyaan Kunci | Opsi Jawaban & Konsekuensi Tindakan |
| :---: | :--- | :--- |
| **1** | **Dari mana asal dan muara data ini?** | • **Lokal Internal**: Cukup database operasional lokal.<br>• **Omnichannel**: Terhubung dengan Mobile App / OTA / Server Pusat. |
| **2** | **Apakah tim backend eksternal perlu membuat endpoint?** | • **TIDAK**: Fitur bersifat internal (operasional cabang, manifest, biaya, laporan).<br>• **YA**: Fitur menyangkut inventori publik lintas-aplikasi (live seatmap, external booking). |
| **3** | **Tabel mana saja yang terkena operasi INSERT/UPDATE?** | Sebutkan nama tabel utama, pivot, dan foreign key. Pastikan file migrasi statis `Schema::create` sudah sinkron. |
| **4** | **Apa analogi dunia nyata untuk alur ini?** | Rangkai 1 analogi operasional yang membumi (ekspedisi bus, kasir bioskop, manifest penerbangan, tutup kasir toko). |

---

## 5. Kamus Bahasa Terpadu (Zero-Jargon Defense)

Hindari istilah teknis murni saat menyusun label antarmuka UI maupun penjelasan ke pemangku kepentingan non-teknis:

| Istilah Teknis Programmer | Padanan Istilah Bisnis Humanis (Gunakan Ini!) |
| :--- | :--- |
| *Direct Database CRUD Query* | **Pengelolaan Data Internal Sistem** (Tersimpan langsung di sistem operasional). |
| *Microservice API Endpoint* | **Koneksi Server Pusat / Sinkronisasi Online Terpadu**. |
| *Insert record ke tabel* | **Pencatatan data transaksi baru**. |
| *Soft delete record* | **Pengarsipan data non-aktif** (Data lama tetap aman untuk histori laporan). |
| *Atomic Locking* | **Penguncian sementara saat transaksi** (Mencegah rebutan kursi/saldo secara bersamaan). |
| *FastXlsxWriter Chunking* | **Ekspor laporan kilat anti-macet** (File langsung terunduh tanpa membebani server). |

