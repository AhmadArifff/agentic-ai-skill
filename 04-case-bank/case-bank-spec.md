# Spesifikasi Case-Bank & Dual-Approval Promotion

Dokumen ini mendefinisikan arsitektur **Case-Bank**, yaitu basis data pengetahuan terstruktur dan pola arsitektur yang telah divalidasi. Case-Bank bertindak sebagai memori jangka panjang (*long-term organizational memory*) untuk mencegah tim agent mengulang kesalahan yang sama (*anti-patterns*) dan mempercepat adopsi pola yang sudah terbukti (*proven solutions*).

---

## 1. Filosofi & Siklus Hidup Case

Tidak semua ide atau solusi yang dihasilkan agent boleh langsung dianggap sebagai standar emas. Solusi yang baru dirancang dikategorikan sebagai **hipotesis**, dan hanya dapat dipromosikan setelah melalui validasi independen yang ketat.

```
[Solusi Baru Diusulkan] ──► status: hypothesis
                                   │
                                   ▼
                   [Uji Fungsional & Batas Ekstrem]
                            (QA Engineer)
                                   │
                              (approved)
                                   ▼
                   [Uji Asumsi & Deteksi Fallacy]
                           (Tech Critic)
                                   │
                              (approved)
                                   ▼
                    [DUAL-APPROVAL TERCAPAI]
                                   │
                                   ▼
                      status: verified_case
                                   │
                                   ▼
                    [Tersimpan di 04-case-bank/cases/]
```

---

## 2. Aturan Dual-Approval Promotion

Sebuah proposal arsitektur atau pola implementasi **HANYA BISA** dipromosikan dari `hypothesis` menjadi `verified_case` jika memenuhi syarat berikut:

1. **Persetujuan QA (`qa-engineer: approved`)**:
   - Pola telah diuji terhadap kasus batas (*boundary conditions*).
   - Tidak menimbulkan *breaking changes* atau regresi fungsional.
2. **Persetujuan Tech Critic (`tech-critic: approved`)**:
   - Pola terbebas dari *Golden Hammer*, *Premature Optimization*, atau asumsi rapuh.
   - Trade-off biaya operasional dan kompleksitas telah dinyatakan secara eksplisit dan dapat diterima.
3. **Pencatatan Imutabel**:
   - Setelah status menjadi `verified_case`, entri disimpan di folder `04-case-bank/cases/` dengan ID unik.

---

## 3. Klasifikasi Kategori Case

Setiap entri dalam Case-Bank wajib dikategorikan ke dalam salah satu tipe:
- `pattern`: Pola desain arsitektur yang direkomendasikan (misal: "Stateless Session dengan Refresh Token Cookie").
- `anti_pattern`: Pola yang terbukti sering menyebabkan bug, kerentanan, atau masalah performa (misal: "Menyimpan JWT di LocalStorage").
- `heuristic`: Aturan praktis untuk pengambilan keputusan cepat (misal: "Gunakan connection pool jika query PostgreSQL > 20 per detik").

---

## 4. Cara Penggunaan Case-Bank oleh Agent

1. **Saat Fase Orient / Triage**:
   - `triage-router` dan `problem-decomposer` melakukan kueri pencarian semantik ke `04-case-bank/cases/`.
   - Jika ditemukan `verified_case` yang cocok, pola tersebut langsung disuntikkan ke dalam `established_constraints` sebagai referensi wajib bagi Builder.
2. **Saat Fase Review**:
   - `security-engineer` dan `tech-critic` memeriksa apakah builder menggunakan pola yang bertentangan dengan `anti_pattern` yang tersimpan. Jika ya, langsung berikan verdict `rework`.
