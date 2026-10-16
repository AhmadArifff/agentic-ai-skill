# Rule 01: Workflow Discipline & OODA Execution

> **Status**: MUTLAK (Pemandu kedisiplinan alur eksekusi multi-agen)

---

## 1. Siklus OODA Loop
Setiap tugas dijalankan melalui 4 fase berulang:
- **Observe**: Baca instruksi pengguna, periksa status terkini di `session-state.json`, dan inspeksi kode yang ada.
- **Orient**: Evaluasi dampak terhadap arsitektur, batasan terkunci (`established_constraints`), dan potensi regresi.
- **Decide**: Susun rencana terstruktur dan tentukan owner peran pelaksana.
- **Act**: Eksekusi perubahan kode secara atomik, rapi, dan teruji.

---

## 2. Review Gate Sebelum Pengembangan
Sebelum menulis baris kode fitur baru, wajib menjalankan evaluasi 7 pilar sesuai [task-review-protocol.md](../workflows/task-review-protocol.md):
1. **Scope**: Apakah cakupan tugas jelas dan tidak mengalami scope-creep?
2. **Schema**: Apakah ada perubahan tipe data, tabel, atau smart contract account?
3. **Security**: Apakah input disanitasi dan otorisasi divalidasi?
4. **Performance**: Apakah ada operasi N+1, memory leak, atau loop boros komputasi?
5. **UX / Accessibility**: Apakah responsivitas layar dan kontras warna memenuhi standar?
6. **Edge Cases**: Apakah kasus jaringan lambat, saldo tidak cukup, atau input kosong sudah ditangani?
7. **Rollback Plan**: Apakah perubahan aman dan dapat dikembalikan jika terjadi kegagalan?

---

## 3. Higienitas Kode & Eliminasi Zombie Artifacts
1. **Bersihkan Kode Sementara**: Hapus console.log debug mentah, komentar sisa iterasi, atau file scratch sementara sebelum tugas ditandai selesai.
2. **Komentar Kode Berkualitas**: Berikan komentar hanya pada logika yang kompleks atau keputusan arsitektural penting. Hindari komentar berlebihan yang hanya menjelaskan hal sepele.
3. **Circuit Breaker Loop**: Jika sebuah tugas mengalami revisi >= 3 kali berturut-turut pada siklus QA-Builder, hentikan loop dan minta panduan langsung kepada pengguna.

---

## 4. Mandatory Tracking via `session-state.json` (Independen dari PRD.md)
1. **Single Source of Truth Progres**: Setiap fitur baru, perbaikan bug, atau perubahan arsitektur **WAJIB** dicatat statusnya di `session-state.json` (subtasks array, status `in_progress` -> `done`, dan owner role).
2. **Tidak Bergantung pada PRD.md**: Mengingat banyak proyek nyata tidak memiliki `PRD.md`, agen dilarang berasumsi bahwa PRD adalah satu-satunya acuan progres. `session-state.json` berfungsi sebagai memori sesi independen agar tim dan agen di sesi berikutnya dapat langsung melanjutkan pekerjaan tanpa konflik fitur.

---

## 5. Mandatory Bug & Discrepancy Logging ke Case-Bank
1. **Catat Setiap Bug Tervalidasi**: Setiap kali ditemukan bug, error runtime, atau ketidaksesuaian hasil setelah development yang berhasil diperbaiki, agen wajib membuat catatan kasus di `.agents/knowledge/cases/` sesuai panduan [record-bug-case.md](../workflows/record-bug-case.md).
2. **Pembelajaran Berkelanjutan**: Agen AI di sesi percakapan berikutnya wajib memeriksa bank kasus lokal ini sebelum merancang solusi agar tidak mengulangi kesalahan arsitektural yang sama.

---

## 6. Protokol Sinkronisasi Git (Pull-Before-Build & Pull-Before-Push)
Untuk proyek dengan alur integrasi GitHub aktif:
1. **Sebelum Mulai Coding**: Wajib jalankan `git pull --rebase origin <branch>` untuk mengambil pembaruan tim terbaru.
2. **Setelah Preview & QA Lolos**: Jalankan kembali `git pull --rebase origin <branch>` untuk mendeteksi potensi konflik. Jika bebas konflik atau konflik telah diselesaikan, baru lakukan `git push` ke repositori.

