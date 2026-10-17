# Rule 30: UI Component Reasoning & Interaction Intent Taxonomy

> **UI/UX Reasoning Standard**: Pedoman pemetaan niat interaksi (*Interaction Intent*) agar agen AI dapat memilih, merancang, dan mengimplementasikan elemen antarmuka yang tepat (Toast, Modal, Drawer, Popover, Inline Alert, Tooltip) sesuai konteks kebutuhan pengguna.

---

## 1. Matriks Reasoning Elemen UI (When to Use What)

Setiap elemen antarmuka memiliki tingkat gangguan (*intrusiveness*), siklus hidup (*lifecycle*), dan tujuan UX yang spesifik:

| Elemen UI | Tingkat Gangguan | Siklus Hidup | Kapan Wajib Digunakan (Reasoning) | Larangan Penggunaan |
| :--- | :---: | :---: | :--- | :--- |
| **Toast / Snackbar** | Rendah (Pasif) | Auto-dismiss 3-4 detik | Umpan balik sukses/info cepat yang **tidak memerlukan tindakan pengguna** (contoh: *"Data berhasil disimpan"*, *"Link disalin"*). | Dilarang untuk konfirmasi aksi destruktif atau pesan error kritis yang butuh dibaca teliti. |
| **Modal Dialog** | Tinggi (Memblokir) | Manual (Klik tombol / ESC / Backdrop) | **Keputusan berisiko tinggi** (konfirmasi hapus), formulir pendek penting yang wajib diselesaikan sebelum lanjut. | Dilarang untuk notifikasi sukses biasa atau form yang terlalu panjang (> 8 field). |
| **Drawer / Slide-Over Sheet** | Sedang | Manual (Tutup panel / ESC) | Menampilkan **detail entitas lengkap** (detail trip supir, detail buket) atau form multi-input tanpa meninggalkan konteks halaman. | Dilarang jika kontennya hanya 1-2 baris teks (gunakan Modal atau Popover). |
| **Popover Confirmation** | Rendah - Sedang | Manual (Batal / Ya) | **Konfirmasi mikro 1-klik** tepat di samping elemen pemicu (contoh: tombol hapus 1 baris tabel, switch status aktif/nonaktif). | Dilarang jika membutuhkan input form tambahan yang banyak. |
| **Inline Alert / Callout** | Sedang (In-Flow) | Permanen sampai kondisi selesai | Peringatan status sistem yang **mempengaruhi seluruh halaman** (contoh: *"Mode Istirahat Aktif"*, *"Koneksi RPC Terputus"*). | Dilarang menggunakan alert pop-up browser bawaan `window.alert()`. |
| **Tooltip** | Sangat Rendah | Hover / Focus (Delay 150ms) | Penjelasan singkat mengenai icon tanpa teks, singkatan status, atau tombol icon-only. | Dilarang meletakkan tombol interaktif atau teks panjang di dalam tooltip. |

---

## 2. Standar Teknis & Lapisan Z-Index

Untuk mencegah bug visual seperti modal tertutup navbar atau datepicker terpotong (*clipping*):

```css
/* Standar Skala Z-Index */
--z-dropdown:   1000;
--z-sticky:     1020; /* Navbar / Header */
--z-fixed:      1030; /* Sidebar */
--z-modal-backdrop: 1050;
--z-modal:      1055;
--z-popover:    1060;
--z-tooltip:    1070;
--z-toast:      1080; /* Toast selalu di lapisan teratas */
```

1. **Aturan Toast**:
   - Posisi default: Pojok kanan atas (`top-right`) atau pojok kanan bawah (`bottom-right`).
   - Kontainer toast wajib memiliki `pointer-events: none` dengan item toast `pointer-events: auto` agar tidak memblokir klik tombol di bawahnya.
   - Maksimal 3 toast bertumpuk (*stacked*), toast terlama otomatis gugur.
2. **Aturan Modal Dialog**:
   - Wajib memiliki backdrop gelap dengan blur halus (`bg-black/50 backdrop-blur-sm`).
   - Wajib mendukung penutupan via tombol **Escape (ESC)** dan klik di luar area modal (*backdrop click*).
   - Fokus keyboard otomatis terkunci di dalam modal (*Focus Trap*).
   - Jika modal memuat Datepicker / Select2, wajib sertakan `dropdownParent` atau `parentEl` ke kontainer modal agar kalender tidak terpotong.

---

## 3. Formula Prompting 3-Elemen (Panduan Komunikasi)

Agar agen AI langsung memahami reasoning tanpa salah tafsir, gunakan formula sederhana ini:

$$\text{Formula: [Komponen Spesifik]} + \text{[Pemicu / Trigger]} + \text{[Perilaku / Aksi]}$$

- **Contoh 1 (Toast)**:
  *"Setelah user klik Simpan Jadwal dan response API sukses, tampilkan **Toast hijau** di pojok kanan atas bertuliskan 'Jadwal berhasil diperbarui', auto-dismiss 3 detik."*
- **Contoh 2 (Modal)**:
  *"Saat tombol Hapus Driver diklik, buka **Modal Konfirmasi tengah layar** berwarna merah dengan judul 'Hapus Driver?', tampilkan nama driver, dan tombol 'Batal' serta 'Ya, Hapus Permanen'."*
- **Contoh 3 (Drawer)**:
  *"Saat baris tabel diklik, buka **Drawer geser dari kanan (Slide-Over)** untuk melihat riwayat operasional daily supir tanpa me-reload halaman."*
