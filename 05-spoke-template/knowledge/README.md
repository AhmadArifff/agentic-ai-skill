# Basis Pengetahuan & Riwayat Kasus Bug (.agents/knowledge/)

Direktori ini berfungsi sebagai **pusat memori & basis pengetahuan (*Knowledge Bank*)** untuk mencatat riwayat kendala teknis, bug antarmuka/logika yang pernah diselesaikan, dan solusi arsitektur baku pada proyek `adminShuttleV3`.

---

## Indeks Kasus:
* **[bug-cases.md](./bug-cases.md)**: Riwayat lengkap kendala teknis, akar masalah, dan solusi fix yang telah teruji (seperti kasus softdelete OTA, alignment tabel closing report, cross-database settlement view, dll).

---

## Standar Penambahan Kasus Baru:
Setiap kali AI Agent atau pengembang berhasil menyelesaikan bug atau perbaikan fitur, tambahkan entri baru ke `bug-cases.md` dengan format:
1. **Kasus #**: Judul deskriptif bug.
2. **Konteks & Gejala (Symptom)**: Masalah yang dialami pengguna.
3. **Akar Masalah (Root Cause)**: Analisis teknis penyebab kegagalan.
4. **Solusi yang Diterapkan (Fix Applied)**: File yang diubah dan kode kunci perbaikan.
5. **Pelajaran untuk Pengembangan Masa Depan (Key Takeaway)**: Panduan pencegahan.
