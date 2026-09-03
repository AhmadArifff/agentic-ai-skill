---
name: playwright
description: Skill otomatisasi browser dan pengujian end-to-end (E2E) berbasis Playwright MCP. Digunakan untuk navigasi web, pengisian form, penangkapan screenshot, inspeksi accessibility snapshot (AXTree), pemantauan console error, audit network request, visual regression, dan verifikasi antarmuka web interaktif secara deterministik.
---

# Playwright Browser Automation & E2E Testing Skill

## 1. Identitas & Peran dalam Multi-Agent Architecture

Skill **Playwright** memberdayakan agent dalam sistem multi-agent (khususnya `qa-engineer`, `frontend-engineer`, `user-test-professional`, dan `security-engineer`) untuk berinteraksi langsung dengan browser nyata secara programatik menggunakan server **Playwright MCP**.

### Prinsip Operasional:
1. **Accessibility-First Inspection**: Utamakan pengambilan `browser_snapshot` (pohon aksesibilitas / AXTree) daripada mengandalkan query selector CSS yang rapuh. Ini memastikan elemen diidentifikasi berdasarkan peran (*role*) dan label semantik.
2. **Zero Unchecked Errors**: Setiap pengujian halaman wajib memeriksa log konsol browser (`browser_console_messages`) dan jaringan (`browser_network_requests`) untuk memastikan tidak ada unhandled exception atau kegagalan fetch HTTP (4xx/5xx).
3. **Evidence-Based Verification**: Sertakan bukti visual tangkapan layar (`browser_take_screenshot`) untuk memvalidasi render antarmuka dan laporan review.

---

## 2. Katalog Alat Playwright MCP & Pola Penggunaan

Playwright MCP menyediakan rangkaian tool terstandarisasi untuk mengendalikan browser:

| Kategori | Alat MCP | Fungsi & Praktik Terbaik |
|---|---|---|
| **Navigasi & Sesi** | `browser_navigate` | Membuka URL target (lokal `http://localhost:3000` atau URL staging). Selalu tunggu hingga network idle atau DOM ready. |
| | `browser_navigate_back` | Kembali ke halaman sebelumnya dalam riwayat sesi. |
| | `browser_close` | Menutup sesi browser dan membebaskan sumber daya. |
| | `browser_tabs` | Mengelola multi-tab jika aplikasi membuka jendela popup/tab baru. |
| **Pemeriksaan Struktur** | `browser_snapshot` | Mengambil accessibility tree terstruktur lengkap dengan ID node interaktif untuk target aksi klik/ketik. |
| | `browser_find` | Mencari elemen spesifik berdasarkan teks atau peran aksesibilitas. |
| | `browser_wait_for` | Menunggu elemen muncul sebelum melakukan aksi, mencegah flakiness. |
| **Interaksi Input** | `browser_click` | Melakukan klik pada tombol, tautan, atau checkbox. |
| | `browser_type` | Mengetik teks ke dalam input field (mendukung input bertahap). |
| | `browser_fill_form` | Mengisi seluruh form secara batch untuk efisiensi eksekusi. |
| | `browser_select_option` | Memilih opsi pada elemen dropdown `<select>`. |
| | `browser_press_key` | Mengirim tombol keyboard khusus (`Enter`, `Escape`, `Tab`). |
| | `browser_drag` & `browser_drop` | Menguji interaksi drag-and-drop antar elemen UI. |
| **Audit & Observabilitas**| `browser_console_messages` | Membaca log console (warning, error, uncaught promise rejections). |
| | `browser_network_requests` | Memeriksa status request API backend dan response code. |
| | `browser_take_screenshot` | Menangkap gambar visual halaman penuh (*fullPage*) atau elemen tertentu. |
| | `browser_evaluate` | Menjalankan ekspresi JavaScript aman di dalam konteks halaman. |

---

## 3. Alur Kerja Standar Pengujian E2E (QA & Reviewer Swarm)

```
[1. Navigasi] ──► browser_navigate(url)
                       │
                       ▼
[2. Snapshot] ──► browser_snapshot() ──► Dapatkan node ID semantik
                       │
                       ▼
[3. Interaksi] ──► browser_fill_form() / browser_click()
                       │
                       ▼
[4. Tunggu Hasil] ─► browser_wait_for(selector_atau_teks)
                       │
                       ▼
[5. Audit Kualitas]─► browser_console_messages() & browser_network_requests()
                       │
                       ▼
[6. Bukti Visual] ─► browser_take_screenshot()
                       │
                       ▼
[7. Hasil Verdict] ─► Set status 'approved' atau 'rework' dengan bukti log
```

---

## 4. Pola Implementasi per Skenario Nyata

### Skenario A: Pengujian Alur Login Kasir
1. Buka halaman: `browser_navigate(url: "http://localhost:3000/login")`.
2. Ambil snapshot: `browser_snapshot()` untuk mengidentifikasi input email, password, dan tombol masuk.
3. Isi form:
   ```json
   {
     "form": [
       { "role": "textbox", "name": "Email", "value": "kasir@toko.id" },
       { "role": "textbox", "name": "Password", "value": "KataSandiKuat123!" }
     ]
   }
   ```
4. Klik tombol submit: `browser_click(role: "button", name: "Masuk")`.
5. Tunggu redirect ke dashboard kasir: `browser_wait_for(text: "Ringkasan Shift Kasir")`.
6. Cek console error: `browser_console_messages()`. Pastikan array error kosong.
7. Ambil screenshot dashboard: `browser_take_screenshot(name: "login_success_dashboard")`.

### Skenario B: Audit Aksesibilitas & Focus Trap
1. Gunakan `browser_press_key(key: "Tab")` secara berulang untuk memverifikasi urutan fokus keyboard.
2. Pastikan modal dialog dapat ditutup menggunakan tombol `Escape`.
3. Verifikasi bahwa fokus kembali ke elemen pemicu (*trigger element*) setelah modal ditutup.

---

## 5. Integrasi dengan Role Multi-Agent

- **`qa-engineer`**: Menggunakan Playwright untuk eksekusi test matrix fungsional (positive path, negative path, boundary values).
- **`user-test-professional`**: Memeriksa kelancaran alur interaksi, ukuran target klik, dan deteksi kebingungan navigasi.
- **`security-engineer`**: Memeriksa console log untuk memastikan tidak ada token sensitif yang bocor melalui `console.log` dan memvalidasi respons CSP (*Content Security Policy*).
- **`frontend-engineer`**: Melakukan validasi lokal cepat saat membangun komponen baru sebelum menyerahkannya ke Reviewer Swarm.

---

## 6. Definition of Done (DoD) — Playwright Testing

- [ ] URL target berhasil dimuat tanpa network timeout.
- [ ] Accessibility snapshot diperiksa untuk elemen kunci sebelum melakukan klik/input.
- [ ] Form submit atau interaksi target berhasil mencapai kondisi akhir yang diharapkan.
- [ ] `browser_console_messages` telah diperiksa dan tidak mengandung uncaught runtime error.
- [ ] `browser_network_requests` memverifikasi bahwa endpoint backend merespons dengan status 200/201 (bukan 500).
- [ ] Screenshot hasil verifikasi tersimpan sebagai bukti pengujian objektif.
