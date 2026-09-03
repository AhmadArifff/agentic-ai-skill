# Routing, Maps & Navigation Guide — Web & Mobile Integration

Panduan komprehensif integrasi Peta, Navigasi, dan Pencarian Rute (Routing) untuk aplikasi Web dan Mobile (Android/iOS/Flutter/React Native).

---

## 1. Prinsip Utama Arsitektur Peta & Rute

1. **Jangan Membuat Algoritma Rute dari Nol**: Tidak perlu mengodekan algoritma Dijkstra atau A* dari nol. Gunakan SDK/API dari penyedia peta yang sudah mengoptimalkan algoritma tersebut untuk skala global.
2. **Pemisahan Sisi Frontend & Backend**:
   - **Frontend (Web & Mobile Apps)**: Bertugas menampilkan peta visual, memplot titik koordinat (driver/user), dan menggambar garis rute jalan (*polyline*) menggunakan SDK.
   - **Backend (Server)**: 
     - *Layanan Komersial (Google/Mapbox)*: Bertindak sebagai **API Proxy** untuk menyembunyikan API Key dari client-side, menerapkan rate limiting, dan mencatat kuota/biaya.
     - *Layanan Open-Source (OSRM)*: Menjalankan engine pencarian rute berbasis data OpenStreetMap di server sendiri.

---

## 2. Perbandingan Provider & SDK Utama

| Penyedia / Library | Kompatibilitas Platform | Kelebihan Utama | Kekurangan Utama |
|---|---|---|---|
| **Google Maps Platform** | Web (JS), Android, iOS, Flutter, React Native | • Data kemacetan real-time paling akurat di Indonesia<br>• Estimasi Waktu Tiba (ETA) paling presisi<br>• Dokumentasi paling lengkap | • Biaya mahal untuk skala besar<br>• Wajib billing kartu kredit<br>• Resiko bill-shock jika tanpa rate limit |
| **Mapbox API & SDK** | Web (GL JS), Android, iOS, Flutter, React Native | • Kustomisasi visual peta sangat estetik & unik<br>• Rendering rute sangat halus<br>• Mapbox Navigation SDK bawaan turn-by-turn voice guidance | • Data traffic di jalan tikus/gang Indonesia kurang presisi dibanding Google |
| **OSRM + Leaflet / MapLibre** (Open-Source) | Web (Leaflet), Mobile (MapLibre SDK / WebView) | • **100% Gratis**, tanpa kuota request<br>• Privasi data koordinat aman di server sendiri<br>• Kecepatan kalkulasi sangat tinggi (<1ms) | • Harus setup & bayar server OSRM sendiri<br>• Tidak ada data kemacetan bawaan |

---

## 3. Pilihan Solusi Berdasarkan Skala Bisnis & Use Case

### 🎯 Solusi 1: Premium & Real-Time Traffic (Google Maps Platform)
**Ideal untuk:** Ride-hailing (seperti Gojek/Grab), kurir pengiriman ekspres, dan aplikasi logistik kritikal.
- **Web**: Google Maps JavaScript API + Routes API.
- **Mobile**: Google Maps SDK for Android & iOS (atau package resmi Flutter/React Native).
- **Arsitektur**: Client → Backend Proxy (simpan Google API Key) → Google Routes API → Return Polyline → Client Render.

### 🎨 Solusi 2: Kustomisasi Visual High-End & Voice Navigation (Mapbox)
**Ideal untuk:** Aplikasi branded, fleet management, dan navigasi driver dengan panduan suara.
- **Web**: Mapbox GL JS.
- **Mobile**: Mapbox Navigation SDK (dilengkapi *turn-by-turn voice guidance* bawaan).

### 💰 Solusi 3: Free & Uncapped Requests (OSRM + Leaflet / MapLibre)
**Ideal untuk:** Aplikasi internal perusahaan, armada armada logistik internal, atau budget terbatas.
- **Teknologi**: Engine OSRM (Open Source Routing Machine) yang menjalankan algoritma *Contraction Hierarchies* (variasi Dijkstra yang sangat cepat <1ms).
- **Backend Setup**: Pasang OSRM engine + data OpenStreetMap (.pbf) di server Express JS / Docker.
- **Frontend Stack**: Leaflet (Web) atau MapLibre SDK (Mobile/Web) untuk merender peta dan polyline gratis.

---

## 4. Peran Masing-Masing Role Skill

### 📋 Role PM (`/pm`)
- Menilai kebutuhan bisnis (Akurasi Real-Time vs Kustomisasi Visual vs Biaya Server).
- Memilih Provider (Google Maps vs Mapbox vs OSRM) berdasarkan budget dan target kuota.
- Memasukkan kebutuhan Auth Proxy API Key dan estimasi biaya API dalam PRD & Roadmap.

### ⚙️ Role Backend (`/backend`)
- Menyediakan endpoint proxy API rute (misal: `POST /api/v1/routes/calculate`) untuk menyembunyikan API Key komersial.
- Jika menggunakan OSRM: Menyiapkan OSRM server instance, mengintegrasikan HTTP client ke OSRM endpoint (`http://osrm-server:5000/route/v1/driving/...`).
- Menangani caching koordinat rute populer menggunakan Redis.

### 🎨 Role Frontend (`/frontend`)
- Implementasi SDK peta pada Next.js / React Native / Flutter.
- Menggambar Polyline rute jalan dari data koordinat API.
- Menampilkan penanda lokasi (*marker*) user dan driver secara halus dengan animasi posisi.
- Memastikan kontrol peta responsif di HP (Mobile) dan Tablet / iPad terlebih dahulu (Touch targets min 44x44px).

### 🧪 Role QA (`/qa`)
- Audit Keamanan: Memastikan API Key Google/Mapbox **TIDAK TERBUKA** di source code frontend.
- Pengujian Fungsional: Plotting titik awal-tujuan, rendering polyline, dan penganganan kondisi sinyal lemah/offline.
- Pengujian Kinerja: Memastikan rendering peta tidak menyebabkan drop FPS di perangkat HP/Tablet.
