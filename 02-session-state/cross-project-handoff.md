# Protokol Session State & Cross-Project Chat Migration

Dokumen ini mendefinisikan mekanisme bagaimana **Session State** dan **Case-Bank** beroperasi secara mulus melintasi berbagai jendela percakapan (*chat sessions*), repositori, dan proyek pengembangan.

---

## 1. Arsitektur Memori Sesi Multi-Proyek

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CONFIG GLOBAL (~/.gemini/config/)               │
│   • 27 Skill Global (backend, frontend, qa, threejs, dll.)             │
│   • Global Orchestration Rules (Single Door Policy, Reviewer Indep.)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               WORKSPACE REPOSITORI (agentic-ai-skill)                  │
│                                                                        │
│   [04-case-bank/]                      [02-session-state/]             │
│   • Memori Jangka Panjang              • Memori Jangka Pendek          │
│   • Pola Terverifikasi (Cases)         • Status FSM Aktif (Subtasks)   │
│   • Anti-Patterns yang Dilarang        • Locked Constraints            │
│   • Fast Lookup via index.json         • Cross-Session Snapshots       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│  PROJECT A (Chat Session 1)  │          │  PROJECT B (Chat Session 2)  │
│  "E-Commerce Kasir Pos"      │          │  "Customer Mobile App"       │
│  • Import Case-Bank Solusi   │          │  • Mewarisi Locked Auth Case │
│  • Export Session Snapshot   ├─────────►│  • Melanjutkan API Subtasks  │
└──────────────────────────────┘          └──────────────────────────────┘
```

---

## 2. Siklus Alur di Setiap Chat Session Baru

Saat pengguna membuka jendela chat baru atau beralih antar-proyek:

### Langkah 1: Fase Orientasi (Case-Bank Query)
Sebelum menulis kode apapun, agent menjalankan Fast-Lookup ke Case-Bank:
```bash
node 04-case-bank/case-bank-cli.js search <domain-problem>
```
- Jika ada **verified_case**: Agent langsung mengadopsi pola tersebut (misal: Redis atomic lock, HttpOnly cookie auth).
- Jika ada **anti_pattern**: Agent secara proaktif menolak solusi buruk (misal: hardcoded secrets, absolute path host).

### Langkah 2: Evaluasi Status Sesi (Session State Check)
Agent memeriksa apakah tugas ini adalah kelanjutan dari chat session sebelumnya:
- **Jika sesi baru**: Inisialisasi dokumen `session-state.yaml` dengan `primary_goal` dan `decomposed_subtasks`.
- **Jika sesi lanjutan**: Muat `session-snapshot.json` dari sesi sebelumnya menggunakan utilitas `02-session-state/session-manager.js`.

### Langkah 3: Eksekusi & Hand-off Terstruktur
Sub-tugas dieksekusi secara berurutan sesuai dependensi. Setiap handoff antar-role (misal: Builder -> QA Reviewer -> Tech Critic) dicatat secara terperinci.

### Langkah 4: Promosi Pengetahuan ke Case-Bank
Jika selama proses pengembangan ditemukan solusi baru yang tangguh dan lolos **Dual-Approval (QA + Tech Critic)**:
1. Simpan case baru di folder `04-case-bank/cases/`.
2. Daftarkan di `04-case-bank/index.json`.
3. Commit dan push ke GitHub agar seluruh tim dan chat session berikutnya dapat langsung memanfaatkannya.

---

## 3. Format Snapshot untuk Migrasi Antar-Sesi

Saat ingin memindahkan konteks pengerjaan ke chat session baru tanpa kehilangan riwayat keputusan:

```json
{
  "session_id": "sess-20260907-ecommerce-pos",
  "project_name": "agentic-ai-core",
  "active_goal": "Penerapan autentikasi dan sinkronisasi real-time",
  "locked_constraints": [
    "Wajib menggunakan relative path di seluruh dokumentasi",
    "Auth token wajib di simpan di HttpOnly SameSite=Strict cookie",
    "Maksimal rework loop reviewer adalah 3x sebelum eskalasi ke human"
  ],
  "subtasks_summary": {
    "total": 5,
    "completed": 3,
    "in_progress": "task-004-websocket-heartbeat",
    "pending": ["task-005-playwright-e2e"]
  },
  "next_recommended_role": "frontend-engineer"
}
```

---

## 4. Cara Menggunakan Utilitas Session Manager

Gunakan script pembantu di root direktori:

```bash
# 1. Cek status sesi saat ini
node 02-session-state/session-manager.js status

# 2. Buat snapshot untuk dipindahkan ke chat session lain
node 02-session-state/session-manager.js export

# 3. Import snapshot dari chat session sebelumnya
node 02-session-state/session-manager.js import --file ./session-snapshot.json
```
