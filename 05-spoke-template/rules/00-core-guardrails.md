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
