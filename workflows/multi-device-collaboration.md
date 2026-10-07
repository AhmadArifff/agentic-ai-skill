# Multi-Device Collaboration Protocol: Git Rebase & Linear History

> **Panduan Mutlak Pengembangan Lintas Perangkat**: Dokumen ini mengatur alur kerja ketika repositori dikembangkan oleh beberapa developer atau agen AI dari perangkat berbeda (laptop, PC kantor, cloud environment) agar tidak terjadi merge conflict atau penimpaan kode (*overwriting*).

---

## 1. Aturan Emas: Wajib `git pull --rebase origin main` Sebelum Menulis Kode

Setiap kali developer atau agen memulai sesi kerja baru atau berpindah perangkat, **Langkah Pertama yang WAJIB Dijalankan Sebelum Menulis Kode Apapun** adalah:

```bash
git pull --rebase origin main
```

### Mengapa Ini Wajib?
1. **Mengambil Perubahan Terkini**:
   - Mencegah pengerjaan di atas basis kode yang basi (*stale code*).
2. **Menjaga Riwayat Linier (*Linear History*)**:
   - Penggunaan flag `--rebase` memastikan commit lokal baru diletakkan di puncak riwayat (*top of branch*), sehingga tidak menghasilkan commit merge otomatis yang berantakan (`Merge branch 'main' of ...`).
3. **Inspeksi Commit Terakhir**:
   - Cek ringkasan commit terbaru menggunakan:
     ```bash
     git log -n 5 --oneline
     ```

---

## 2. Resolusi Konflik Cerdas (Jika Terjadi Konflik Git)

Jika saat melakukan `git pull --rebase origin main` terjadi konflik konten:
1. **Deteksi Berkas Terdampak**:
   - Periksa berkas dengan status `CONFLICT (content)`.
2. **Pembedahan Marker Git**:
   - Buka berkas dan periksa penanda:
     ```text
     <<<<<<< HEAD
     Kode dari remote / commit sebelumnya
     =======
     Kode dari perubahan lokal
     >>>>>>> commit-hash
     ```
3. **Penggabungan Bijak**:
   - Gabungkan logika bisnis yang sah dari kedua belah pihak. Jangan menghapus perbaikan yang baru saja ditambahkan oleh developer lain tanpa alasan yang jelas.
4. **Verifikasi Integritas**:
   - Jalankan verifikasi sistem (misal: `npm run test:system` atau `npm run type-check`).
5. **Lanjutkan Rebase**:
   ```bash
   git add .
   git rebase --continue
   ```

---

## 3. Checklist Developer & Agen Setiap Sesi

```text
[Langkah 0]  git pull --rebase origin main  (Ambil perubahan terkini)
     ↓
[Langkah 1]  Baca task & periksa session state aktif
     ↓
[Langkah 2]  Buat rencana pengerjaan terstruktur jika tugas kompleks
     ↓
[Langkah 3]  Tulis kode (Builder) & Verifikasi Reviewer (Reviewer/QA)
     ↓
[Langkah 4]  git add . && git commit -m "feat/fix/docs: ..."
     ↓
[Langkah 5]  git pull --rebase origin main (Sinkronisasi akhir sebelum push)
     ↓
[Langkah 6]  git push origin main (Push bersih ke remote repository)
```
