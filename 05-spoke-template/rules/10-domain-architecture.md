# Rule 10: Domain Architecture & Technical Patterns

> **Status**: PANDUAN UTAMA ARSITEKTUR TEKNIS PROYEK

---

## 1. Prinsip Desain Modular
Proyek ini mengadopsi pemisahan tanggung jawab (*Separation of Concerns*):
- **Data & Contract Layer**: Menangani interaksi ke database, RPC blockchain, atau external APIs secara terisolasi.
- **Service / Business Logic Layer**: Seluruh validasi aturan bisnis, kalkulasi nilai, dan alur transaksi berada di lapisan ini.
- **Presentation / UI Layer**: Komponen UI difokuskan pada rendering tampilan, handling user input, dan micro-interactions tanpa mencampuradukkan raw database queries.

---

## 2. Standar Penanganan Kesalahan (*Error Handling*)
1. **Gunakan Guard Clauses Early Exit**: Validasi prasyarat di awal fungsi/method untuk mereduksi nested if-else yang dalam.
2. **Pola Result Pattern**: Kembalikan response yang jelas (`{ success: true, data }` atau `{ success: false, error, code }`) daripada membiarkan unhandled exceptions.
3. **Pesan Kesalahan Humanis**: Tampilkan pesan error ramah pengguna di UI dan catat stack trace teknis hanya di logger backend.

---

## 3. Integrasi & Performa
1. **Optimasi Payload**: Hindari fetching data yang tidak diperlukan ke client.
2. **State Management Bersih**: Hindari duplicate state dan pastikan state lokal/global memiliki single owner yang jelas.
3. **Responsive & Mobile First**: Pastikan antarmuka tidak mengalami horizontal overflow dan memiliki target sentuh minimal 44x44px.

---

## 4. Kepatuhan Standarisasi Arsitektur (Inherit vs Formulate)
1. **Patuhi Standar Eksisting Proyek**: Jika proyek telah memiliki standarisasi arsitektur yang sudah berjalan (seperti arsitektur 4-layer Controller -> Service -> Repository -> Model pada sistem `adminShuttleV3` dan `admin-sunjaya-dev`), agen **100% WAJIB** mematuhi konvensi, penamaan class, dan struktur folder tersebut tanpa improvisasi sepihak.
2. **Rumuskan Standar Bersih Jika Belum Ada**: Jika proyek belum memiliki standarisasi arsitektur (proyek baru atau codebase legacy), agen wajib merumuskan pola arsitektur yang paling cocok:
   - **OOP Modular**: Pemisahan class domain, enkapsulasi state, dan interface kontrak.
   - **Repository Pattern**: Mengisolasi kueri database/API dari Controller.
   - **Clean / Hexagonal Architecture**: Menjaga business logic bebas dari dependensi framework langsung.
   - Pola yang dipilih wajib didokumentasikan di file ini dan dipatuhi secara konsisten di seluruh sesi.

