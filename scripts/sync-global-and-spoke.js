const fs = require('fs');
const path = require('path');

const userHome = process.env.USERPROFILE || process.env.HOME;
const globalConfigRules = path.join(userHome, '.gemini', 'config', 'rules');
const globalConfigAgents = path.join(userHome, '.gemini', 'config', 'AGENTS.md');
const adminSunjayaRules = path.join('C:', 'Users', 'ASUS', 'Documents', 'Web Dev', 'sunjaya', 'Roleback', 'admin-sunjaya-dev', '.agents', 'rules');

// 1. Ensure directories exist
if (!fs.existsSync(globalConfigRules)) {
  fs.mkdirSync(globalConfigRules, { recursive: true });
}

// 2. Updated content for agentic-ai-orchestration.md
const orchestrationContent = `# Multi-Agent Orchestration & Governance System (Agentic AI)

> **Universal Agentic Entry & Governance Rule**: Pedoman orkestrasi multi-agen, tata kelola arsitektur, 4-tier hirarki peran (24 spesialis), 16 Expert Personas DNA, 42 katalog skill, serta protokol proteksi basis data, sesi state, dan rekayasa antarmuka visual-first.

---

## 1. Arsitektur & Filosofi Sistem (OODA Loop)

Framework ini mengadopsi siklus **OODA (Observe -> Orient -> Decide -> Act)** dengan pemisahan peran secara tegas antara pelaksana (**Builder**) dan penguji (**Reviewer**) guna mengeliminasi *echo-chamber hallucination*.

### 4-Tier Hirarki Peran (24 Spesialis) & 16 Expert Personas DNA:
1. **Generalist Tier (Koordinasi & Dekomposisi)**:
   - \`triage-router\`: Gerbang utama penerima instruksi (*Single Door Policy*), didukung persona **Jeff Bezos** (Working Backwards) & **Paul Graham** (Relentless Execution).
   - \`problem-decomposer\`: Memecah problem menjadi sub-task independen, acceptance criteria, dan dependensi terstruktur.
   - \`goal-tracker\`: Single Source of Truth, mengunci constraint yang sudah disepakati (\`established_constraints\`), melacak status sub-tugas agar agen tidak mengalami *context drift*.
   - \`domain-retriever\`: Menarik konteks arsitektur dari codebase menggunakan knowledge graph (\`graphify\`), didukung persona **Ben Thompson** (Aggregation Theory).
   - \`context-state-pruner\`: Memangkas noise konteks obrolan panjang tanpa menghilangkan esensi arsitektural.
   - \`synthesis-voice\`: Merangkum output multi-agen menjadi respon akhir yang kohesif, ramah, dan solutif.
2. **Specific Tier — Builders (Pelaksana Teknis)**:
   - \`backend-engineer\`: Desain API, skema DB, Redis atomic locking, auth, guard clauses, dan result pattern, didukung persona **Werner Vogels** (Design for Failure) & **DHH** (The Majestic Monolith).
   - \`frontend-engineer\`: Dual-ekosistem Next.js & Vue 3 / Nuxt 3 / Blade, UI/UX Pro Max, Tailwind, WebSockets, Creative Suite, dan WebGL 3D, didukung persona **Matias Duarte** (Material Metaphor) & **Alan Cooper** (Goal-Directed).
   - \`ui-ux-designer\`: Hierarki visual, micro-interactions, motion personality, dan design DNA, didukung persona **Don Norman** (Affordance & Mental Models).
   - \`ml-vision-engineer\`: Spesialis Machine Learning, Deep Learning, dan Computer Vision: clustering, classification, YOLOv8/v11, ONNX INT8 quantization, FastAPI backend, dan in-browser WebGPU.
   - \`web3-blockchain-architect\`: Pure Client-Side terminal, Solana Web3.js & Anchor, anti-hydration mismatch Next.js, zero-secret-leak, dan resilient RPC fallback, didukung persona **Anatoly Yakovenko** (High-Throughput Concurrency).
   - \`multimedia-video-engineer\`: Otomasi pemotongan video Shorts 9:16, timeline interaktif presisi milidetik, audio waveform snapping, dan The 3-Second Hook, didukung persona **MKBHD** & **Casey Neistat** (Retention Pacing).
   - \`copywriter\`: Copy deck, voice, mikrocopy humanis, dan penempatan nilai pasar, didukung persona **Seth Godin** (The Purple Cow).
   - \`ai-engineer\`: Arsitektur prompt terstruktur, alokasi token budget, skema JSON tool calling, dan isolasi prompt injection.
3. **Specific Tier — Reviewers (Penguji Kualitas & Ketahanan — No Self-Review)**:
   - \`qa-engineer\`: Boundary testing, concurrency/race condition test, automated E2E testing, didukung persona **James Bach** (Testing is not Checking).
   - \`security-engineer\`: Validasi OWASP Top 10, sanitasi input, rate limiting, auth token rotation, dan secret leaks.
   - \`product-manager\`: Keselarasan sasaran produk (PRD) dan pencegahan scope creep, didukung persona **Jeff Bezos** (PR/FAQ & Flywheel).
   - \`business-sales-manager\`: Viabilitas komersial, funnel penjualan, dan monetisasi, didukung persona **Aaron Ross** (Predictable Revenue) & **Patrick Campbell** (Value-Based Pricing).
   - \`user-test-professional\`: Evaluasi 10 Prinsip Heuristik Nielsen Norman, beban kognitif, dan friksi aksesibilitas WCAG AA.
   - \`data-cross-verifier\`: Verifikasi angka, klaim statistik, dan bebas data leakage.
   - \`code-reviewer\`: Kepatuhan clean code, modularitas, error handling, dan higienitas komentar.
4. **Governance & Metacognitive Tier**:
   - \`policy-schema-enforcer\`: Gerbang penegak aturan skema JSON/YAML, token audit, dan verifikasi Mandatory Delivery Gate, didukung persona **Kelsey Hightower** (Automation First, Zero-Magic).
   - \`tech-critic\`: Devil's advocate independen, menantang asumsi, mendeteksi fallacy, memeriksa halusinasi, dan mengawasi dual-approval Case-Bank, didukung persona **Charlie Munger** (Inversion & Pre-Mortem).
   - \`deadlock-fallback-resolver\`: Pemutus loop tanpa akhir (*circuit breaker*) dan strategi *graceful degradation*.
   - \`escalation-gate\`: Pencegat aksi destruktif untuk meminta klarifikasi pengguna (*Human-in-the-Loop*).

---

## 2. Aturan Operasional Utama & Guardrails

1. **Single Door Policy**: Pengguna cukup memberikan instruksi alami; \`triage-router\` yang mengorkestrasi agen-agen spesialis di latar belakang.
2. **Reviewer Independence (No Self-Review)**: Builder tidak boleh mereview kodenya sendiri. Setiap artefak builder wajib melalui verifikasi independen oleh Reviewer (\`qa-engineer\` atau \`tech-critic\`).
3. **Circuit Breaker Loop Pengerjaan Ulang**: Jika suatu task mengalami revisi >= 3 kali berturut-turut pada siklus QA-Builder, hentikan proses otomatis dan minta klarifikasi langsung kepada pengguna (*Human-in-the-Loop*).
4. **Session State Consistency**: Selalu periksa dan sinkronkan status \`active_goal\` dan sub-tugas pada \`session-state.json\` agar percakapan panjang tidak mengalami *context drift*.
5. **Katalog 42 Skill Global**: Seluruh agen dapat memanfaatkan 42 skill global yang terpasang di \`~/.gemini/config/skills/\` secara on-demand (*progressive disclosure*).
6. **Proteksi Basis Data Lokal (Zero-Direct-CRUD)**:
   - Pada proyek berbasis MySQL / PostgreSQL / phpMyAdmin (seperti \`adminShuttleV3\` dan \`admin-sunjaya\`), agen **DILARANG KERAS** mengeksekusi kueri mutasi (\`INSERT\`, \`UPDATE\`, \`DELETE\`, \`ALTER\`) langsung ke database lokal secara otonom.
   - Agen hanya bertugas menyusun query SQL terverifikasi agar pengguna sendiri yang mengeksekusinya di phpMyAdmin.
7. **Protokol Onboarding 2 Pertanyaan**:
   - Pertanyaan 1 (Git Workflow): Apakah hasil development langsung di-push ke GitHub? Jika ya: \`git pull\` sebelum kerja, \`git pull\` sesudah kerja untuk validasi konflik, baru \`git push\`.
   - Pertanyaan 2 (Database & Storage): Apakah menggunakan Supabase (otomasi seed & bucket storage) atau MySQL/PostgreSQL/phpMyAdmin (Zero-Direct-CRUD SQL manual).
8. **Visual-First Engineering & Visual Anchor Protocol (Rule 32)**:
   - Dilarang keras melakukan *blind slicing* pada tugas antarmuka UI.
   - Di tahap Planning & Review, agen **WAJIB menyajikan ASCII Wireframe kasar** dan mengklarifikasi **Jangkar Referensi Visual (*Visual Anchor*)**:
     - *Metode A*: Minta/gunakan screenshot desain dari \`scratch/ui-references/\`.
     - *Metode B*: Kiblat desain acuan (Untitled UI / Stripe Dashboard / Vercel Dark Mode).
     - *Metode C*: Mockup visual AI via \`generate_image\` jika pengguna belum memiliki gambaran kasar.
   - Agen dilarang slicing menggunakan \`<div>\` mentah (eliminasi *Passive Skill Syndrome*), wajib aktifkan skill komponen terpasang (\`skills/untitled-ui\`, \`skills/shadcn-ui\`, \`skills/21st-dev\`).
   - Seluruh referensi visual wajib dipersistensikan di \`scratch/\` untuk memori session state yang tidak mengalami halusinasi.
9. **Inversion & Anti-Fallacy Veto**: Persona Charlie Munger pada \`tech-critic\` memiliki hak veto untuk menolak kode yang memuat *premature optimization*, asumsi rapuh, atau bias konfirmasi.
`;

fs.writeFileSync(path.join(globalConfigRules, 'agentic-ai-orchestration.md'), orchestrationContent, 'utf8');
console.log('✅ Updated ~/.gemini/config/rules/agentic-ai-orchestration.md');

// 3. Copy 30-ui-component-reasoning.md to global rules
const uiReasoningSrc = path.join(__dirname, '..', 'rules', '30-ui-component-reasoning.md');
if (fs.existsSync(uiReasoningSrc)) {
  fs.copyFileSync(uiReasoningSrc, path.join(globalConfigRules, '30-ui-component-reasoning.md'));
  console.log('✅ Copied 30-ui-component-reasoning.md to ~/.gemini/config/rules/');
}

// 4. Copy 00-core-guardrails.md to global rules
const coreGuardrailsSrc = path.join(__dirname, '..', '05-spoke-template', 'rules', '00-core-guardrails.md');
if (fs.existsSync(coreGuardrailsSrc)) {
  fs.copyFileSync(coreGuardrailsSrc, path.join(globalConfigRules, '00-core-guardrails.md'));
  console.log('✅ Copied 00-core-guardrails.md to ~/.gemini/config/rules/');
}

// 5. Copy 32-visual-first-engineering.md to global rules
const visualFirstSrc = path.join(__dirname, '..', 'rules', '32-visual-first-engineering.md');
if (fs.existsSync(visualFirstSrc)) {
  fs.copyFileSync(visualFirstSrc, path.join(globalConfigRules, '32-visual-first-engineering.md'));
  console.log('✅ Copied 32-visual-first-engineering.md to ~/.gemini/config/rules/');
}

// 6. Sync AGENTS.md to global AGENTS.md
const masterAgentsMd = path.join(__dirname, '..', 'AGENTS.md');
if (fs.existsSync(masterAgentsMd)) {
  fs.copyFileSync(masterAgentsMd, globalConfigAgents);
  console.log('✅ Synced master AGENTS.md to ~/.gemini/config/AGENTS.md');
}

// 7. Sync rules to admin-sunjaya-dev if exists
if (fs.existsSync(adminSunjayaRules)) {
  fs.copyFileSync(uiReasoningSrc, path.join(adminSunjayaRules, '30-ui-component-reasoning.md'));
  fs.copyFileSync(visualFirstSrc, path.join(adminSunjayaRules, '32-visual-first-engineering.md'));
  console.log('✅ Synced 30-ui-component-reasoning.md and 32-visual-first-engineering.md to admin-sunjaya-dev/.agents/rules/');
} else {
  console.log('⚠️ admin-sunjaya-dev rules path not found at: ' + adminSunjayaRules);
}

console.log('🎉 Global & Spoke synchronization complete!');
