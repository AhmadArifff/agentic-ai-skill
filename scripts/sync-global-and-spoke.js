const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const userHome = process.env.USERPROFILE || process.env.HOME;
const globalConfigRules = path.join(userHome, '.gemini', 'config', 'rules');
const globalConfigAgents = path.join(userHome, '.gemini', 'config', 'AGENTS.md');
const adminSunjayaRules = path.join('C:', 'Users', 'ASUS', 'Documents', 'Web Dev', 'sunjaya', 'Roleback', 'admin-sunjaya-dev', '.agents', 'rules');
const forceSkillsSync = process.argv.includes('--force-skills');

// 0. Compute live dynamic counts from repository ground truth
const rootSkillsDir = path.join(repoRoot, 'skills');
const actualSkillDirs = fs.existsSync(rootSkillsDir)
  ? fs.readdirSync(rootSkillsDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
  : [];
const actualSkillCount = actualSkillDirs.length;

const rolesDir = path.join(repoRoot, '01-roles');
const roleTiers = ['orchestration', 'builders', 'reviewers', 'governance'];
const actualRoleCount = roleTiers.reduce((sum, tier) => {
  const dir = path.join(rolesDir, tier);
  if (!fs.existsSync(dir)) return sum;
  return sum + fs.readdirSync(dir).filter(f => f.endsWith('.md')).length;
}, 0);

const caseIndexPath = path.join(repoRoot, '04-case-bank', 'index.json');
const actualCaseCount = fs.existsSync(caseIndexPath)
  ? (JSON.parse(fs.readFileSync(caseIndexPath, 'utf8')).cases || []).length
  : 0;

console.log(`📊 Live Master Hub Inventory: ${actualSkillCount} skills | ${actualRoleCount} roles | ${actualCaseCount} verified cases`);

// 0b. Auto-sync live dynamic counts in governance docs to prevent drift
function syncCountsInFile(relPath, replacements) {
  const fullPath = path.join(repoRoot, relPath);
  if (!fs.existsSync(fullPath)) return;
  const original = fs.readFileSync(fullPath, 'utf8');
  let updated = original;
  for (const [pattern, replacement] of replacements) {
    updated = updated.replace(pattern, replacement);
  }
  if (updated !== original) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log(`✅ Auto-synced live counts in ${relPath}`);
  }
}

syncCountsInFile('AGENTS.md', [
  [/\b\d+ katalog skill\b/g, `${actualSkillCount} katalog skill`],
  [/## 4\. Katalog \d+ Skill Terdaftar/g, `## 4. Katalog ${actualSkillCount} Skill Terdaftar`],
  [/memanfaatkan \d+ skill terdaftar/g, `memanfaatkan ${actualSkillCount} skill terdaftar`],
  [/\*\*\d+ Kasus Produksi Terverifikasi\*\*/g, `**${actualCaseCount} Kasus Produksi Terverifikasi**`],
  [/4-Tier Hirarki Peran \(\d+ Spesialis\)/g, `4-Tier Hirarki Peran (${actualRoleCount} Spesialis)`]
]);

syncCountsInFile(path.join('.agents', 'README.md'), [
  [/diperkuat oleh \d+ skill terdaftar/g, `diperkuat oleh ${actualSkillCount} skill terdaftar`],
  [/\(\d+ kasus produksi terverifikasi\)/g, `(${actualCaseCount} kasus produksi terverifikasi)`]
]);

syncCountsInFile(path.join('05-spoke-template', 'AGENTS.md'), [
  [/dan \d+ skill global\b/g, `dan ${actualSkillCount} skill global`],
  [/dari \*\*\d+ skill global\*\*/g, `dari **${actualSkillCount} skill global**`]
]);

syncCountsInFile(path.join('knowledge', 'spoke-adoption-guide.md'), [
  [/• \d+ Skills Global/g, `• ${actualSkillCount} Skills Global`],
  [/• \d+ Case Bank/g, `• ${actualCaseCount} Case Bank`],
  [/• \d+ Roles &/g, `• ${actualRoleCount} Roles &`],
  [/dari \*\*\d+ skill global\*\*/g, `dari **${actualSkillCount} skill global**`]
]);

syncCountsInFile(path.join('knowledge', 'hub-and-spoke-sync.md'), [
  [/• \d+ Roles &/g, `• ${actualRoleCount} Roles &`],
  [/• \d+ Skills &/g, `• ${actualSkillCount} Skills &`],
  [/• \d+ Verified Production Cases/g, `• ${actualCaseCount} Verified Production Cases`],
  [/katalog \d+ skill\b/g, `katalog ${actualSkillCount} skill`],
  [/Hirarki Peran \(\d+ Spesialis\)/g, `Hirarki Peran (${actualRoleCount} Spesialis)`]
]);

// 1. Ensure directories exist
if (!fs.existsSync(globalConfigRules)) {
  fs.mkdirSync(globalConfigRules, { recursive: true });
}

// 2. Updated content for agentic-ai-orchestration.md (dynamic counts)
const orchestrationContent = `# Multi-Agent Orchestration & Governance System (Agentic AI)

> **Universal Agentic Entry & Governance Rule**: Pedoman orkestrasi multi-agen, tata kelola arsitektur, 4-tier hirarki peran (${actualRoleCount} spesialis), 16 Expert Personas DNA, ${actualSkillCount} katalog skill, serta protokol proteksi basis data, sesi state, dan rekayasa antarmuka visual-first.

---

## 1. Arsitektur & Filosofi Sistem (OODA Loop)

Framework ini mengadopsi siklus **OODA (Observe -> Orient -> Decide -> Act)** dengan pemisahan peran secara tegas antara pelaksana (**Builder**) dan penguji (**Reviewer**) guna mengeliminasi *echo-chamber hallucination*.

### 4-Tier Hirarki Peran (${actualRoleCount} Spesialis) & 16 Expert Personas DNA:
1. **Generalist Tier (Koordinasi & Dekomposisi)**:
   - \`triage-router\`: Gerbang utama penerima instruksi (*Single Door Policy*), didukung persona **Jeff Bezos** (Working Backwards) & **Paul Graham** (Relentless Execution).
   - \`problem-decomposer\`: Memecah problem menjadi sub-task independen, acceptance criteria, dan dependensi terstruktur.
   - \`goal-tracker\`: Single Source of Truth, mengunci constraint yang sudah disepakati (\`established_constraints\`), melacak status sub-tugas agar agen tidak mengalami *context drift*.
   - \`domain-retriever\`: Menarik konteks arsitektur dari codebase menggunakan knowledge graph (\`graphify\`), didukung persona **Ben Thompson** (Aggregation Theory).
   - \`context-state-pruner\`: Memangkas noise konteks obrolan panjang tanpa menghilangkan esensi arsitektural.
   - \`synthesis-voice\`: Merangkum output multi-agen menjadi respon akhir yang kohesif, ramah, dan solutif.
2. **Specific Tier - Builders (Pelaksana Teknis)**:
   - \`backend-engineer\`: Desain API, skema DB, Redis atomic locking, auth, guard clauses, dan result pattern, didukung persona **Werner Vogels** (Design for Failure) & **DHH** (The Majestic Monolith).
   - \`frontend-engineer\`: Dual-ekosistem Next.js & Vue 3 / Nuxt 3 / Blade, UI/UX Pro Max, Tailwind, WebSockets, Creative Suite, dan WebGL 3D, didukung persona **Matias Duarte** (Material Metaphor) & **Alan Cooper** (Goal-Directed).
   - \`ui-ux-designer\`: Hierarki visual, micro-interactions, motion personality, dan design DNA, didukung persona **Don Norman** (Affordance & Mental Models).
   - \`ml-vision-engineer\`: Spesialis Machine Learning, Deep Learning, dan Computer Vision: clustering, classification, YOLOv8/v11, ONNX INT8 quantization, FastAPI backend, dan in-browser WebGPU.
   - \`web3-blockchain-architect\`: Pure Client-Side terminal, Solana Web3.js & Anchor, anti-hydration mismatch Next.js, zero-secret-leak, dan resilient RPC fallback, didukung persona **Anatoly Yakovenko** (High-Throughput Concurrency).
   - \`multimedia-video-engineer\`: Otomasi pemotongan video Shorts 9:16, timeline interaktif presisi milidetik, audio waveform snapping, dan The 3-Second Hook, didukung persona **MKBHD** & **Casey Neistat** (Retention Pacing).
   - \`copywriter\`: Copy deck, voice, mikrocopy humanis, dan penempatan nilai pasar, didukung persona **Seth Godin** (The Purple Cow).
   - \`ai-engineer\`: Arsitektur prompt terstruktur, alokasi token budget, skema JSON tool calling, dan isolasi prompt injection.
3. **Specific Tier - Reviewers (Penguji Kualitas & Ketahanan - No Self-Review)**:
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
4. **Session State Consistency**: Selalu periksa dan sinkronkan status \`active_goal\`, \`adopted_skills\`, dan sub-tugas pada \`session-state.json\` agar percakapan panjang tidak mengalami *context drift*.
5. **Katalog ${actualSkillCount} Skill Global**: Seluruh agen dapat memanfaatkan ${actualSkillCount} skill global yang terpasang di \`~/.gemini/config/skills/\` secara on-demand (*progressive disclosure*), termasuk \`posewear\` (12 galeri referensi visual pose/depth-pose/kostum/potret/ekspresi/pencahayaan & MCP \`posewear_*\` di \`~/posewear\`), \`code-animation-prompts\` (341 prompt gaya animasi kode 10 seri, pencarian \`styles.py\`, render \`window.renderAt(t)\` & arsip visual 196 stills di \`~/code-animation-prompts\`), \`habblaud\` (kantor virtual pixel-art lokal pemantau sesi Claude Code & Codex via SSE, subagen, kuota 5h/mingguan, timelapse & plugin lokal di \`~/habblaud\`), \`diorama\` (Three.js diorama miniatur interaktif pixel/stroked-toon/pixel-stroke, riset & lisensi aset komersial, animasi deterministik \`f(t)\` & 8 skrip QA Playwright), \`reelmimic\` (kloning gaya video referensi \`video-clone\` + Motion Score compiler, 6 engine animasi 2D cat air/anime/crayon/pixel/paper-cutout/whiteboard, \`music-to-video\` beatgrid & \`blender-product-film\`), \`webbrain\` (delegasi browser Chrome/Edge nyata yang sudah login via \`@webbrain/mcp-server\` & \`webbrain_extract\` JSON Schema), \`openmotion\` (Visual Timeline Studio + MCP \`openmotion_*\`, standar \`Motion.md\` brand-film remake & BYOK Multimodal Gateway), \`showtime\` (studio video 100% lokal tanpa cloud API: local TTS/music/SFX, PR/release/recap/repro dev videos, Manim/data explainers, audio-synced X-ray & \`showtime qa\`), \`hypit\` (SVML word-anchored viral video cloning & multi-variant UGC/ad factory via \`@hypit/hypit\`), \`ohmygame-studio\` (AI Game Studio MCP, Design & Asset Canvas, multiplayer, playable stories & automated playtest), \`herk-edit-kit\` & \`hyperframes\` (post-production rekaman kamera, potong hening/salah ucap, Reels/Shorts 9:16, BPM showreel & engine HTML+GSAP Studio), \`motlab\` & \`motlab-assets\` (studio produksi video canvas + viewer revisi visual + asset kit + render 4K WebCodecs), \`archify\` (interactive architecture diagrams & explainers), \`stack-diagram\` (architecture diagram with official logos), \`teardown\` (3D interactive machine simulator & exploded view) dan \`motionmaxxing\` (art direction motion graphics & viral video retention).
6. **Proteksi Basis Data Lokal & Tata Kelola SP/View (Zero-Direct-CRUD)**:
   - Pada proyek berbasis MySQL / PostgreSQL / phpMyAdmin (seperti \`adminShuttleV3\` dan \`admin-sunjaya\`), agen **DILARANG KERAS** mengeksekusi kueri mutasi (\`INSERT\`, \`UPDATE\`, \`DELETE\`, \`ALTER\`) langsung ke database lokal secara otonom.
   - Agen hanya bertugas menyusun query SQL terverifikasi agar pengguna sendiri yang mengeksekusinya di phpMyAdmin.
   - **Optimasi Stored Procedures & Database Views**: Pada modul laporan berat atau transaksi multi-tabel, agen proaktif menawarkan pembuatan Stored Procedure (\`sp_...\`) dan View (\`v_...\`) lengkap dengan error rollback handler, parameter binding, dan \`SQL SECURITY INVOKER\` (atau \`SET search_path = public, pg_temp\` pada Supabase/Postgres) agar logic reusable dan performa optimal.
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
9. **Field Edge-Case Audit, Co-Developer Protection & Dynamic Timezone**:
   - **Audit Skenario Celah Lapangan**: Setiap review & fix-bug wajib memeriksa sinkronisasi state-machine lintas menu (*Single Source of Truth Guard*), batas waktu dinamis tanpa *premature lock* (\`ETD\`/kadaluarsa), dan integritas tabel anak.
   - **Co-Developer Non-Regression Guard**: Sebelum memodifikasi file proyek tim, periksa \`git blame\` / \`git diff\` agar tidak menimpa kode rekan tim secara sepihak.
   - **Zona Waktu Dinamis & Dual-Language**: Dilarang hardcode timezone statis; nilai DB (hari, status ENUM) wajib Bahasa Inggris baku sementara UI lokal Bahasa Indonesia.
   - **Data Engine Strategy & Anti-Jargon**: Deklarasikan \`Direct DB\` vs \`External API\` saat review; gunakan analogi bisnis nyata dan larang jargon kode di antarmuka pengguna.
10. **Inversion & Anti-Fallacy Veto**: Persona Charlie Munger pada \`tech-critic\` memiliki hak veto untuk menolak kode yang memuat *premature optimization*, asumsi rapuh, atau bias konfirmasi.
`;

fs.writeFileSync(path.join(globalConfigRules, 'agentic-ai-orchestration.md'), orchestrationContent, 'utf8');
console.log('✅ Updated ~/.gemini/config/rules/agentic-ai-orchestration.md');

// 3. Copy universal rules to global config rules
const uiReasoningSrc = path.join(repoRoot, 'rules', '30-ui-component-reasoning.md');
const coreGuardrailsSrc = path.join(repoRoot, 'rules', '00-core-guardrails.md');
const workflowDisciplineSrc = path.join(repoRoot, 'rules', '01-workflow-discipline.md');
const visualFirstSrc = path.join(repoRoot, 'rules', '32-visual-first-engineering.md');

[
  { src: uiReasoningSrc, name: '30-ui-component-reasoning.md' },
  { src: coreGuardrailsSrc, name: '00-core-guardrails.md' },
  { src: workflowDisciplineSrc, name: '01-workflow-discipline.md' },
  { src: visualFirstSrc, name: '32-visual-first-engineering.md' }
].forEach(item => {
  if (fs.existsSync(item.src)) {
    fs.copyFileSync(item.src, path.join(globalConfigRules, item.name));
    console.log('✅ Copied ' + item.name + ' to ~/.gemini/config/rules/');
  }
});

// 4. Sync AGENTS.md to global AGENTS.md
const masterAgentsMd = path.join(repoRoot, 'AGENTS.md');
if (fs.existsSync(masterAgentsMd)) {
  fs.copyFileSync(masterAgentsMd, globalConfigAgents);
  console.log('✅ Synced master AGENTS.md to ~/.gemini/config/AGENTS.md');
}

// 5. Sync ALL rules, knowledge, workflows from root to internal .agents/ AND 05-spoke-template/
['rules', 'knowledge', 'workflows'].forEach(folder => {
  const rootDir = path.join(repoRoot, folder);
  const agentDir = path.join(repoRoot, '.agents', folder);
  const spokeDir = path.join(repoRoot, '05-spoke-template', folder);

  if (fs.existsSync(rootDir)) {
    fs.readdirSync(rootDir).forEach(file => {
      if (file.endsWith('.md')) {
        const srcFile = path.join(rootDir, file);
        if (fs.existsSync(agentDir)) {
          fs.copyFileSync(srcFile, path.join(agentDir, file));
        }
        if (fs.existsSync(spokeDir)) {
          fs.copyFileSync(srcFile, path.join(spokeDir, file));
        }
      }
    });
    console.log('✅ Synced all ' + folder + '/*.md to .agents/' + folder + '/ and 05-spoke-template/' + folder + '/');
  }
});

// 5b. Sync scripts from root scripts/ to internal .agents/scripts/ and 05-spoke-template/scripts/
const rootScriptsDir = path.join(repoRoot, 'scripts');
const agentScriptsDir = path.join(repoRoot, '.agents', 'scripts');
const spokeScriptsDir = path.join(repoRoot, '05-spoke-template', 'scripts');

if (!fs.existsSync(agentScriptsDir)) fs.mkdirSync(agentScriptsDir, { recursive: true });
if (!fs.existsSync(spokeScriptsDir)) fs.mkdirSync(spokeScriptsDir, { recursive: true });

['qa-kernel.php'].forEach(scriptFile => {
  const src = path.join(rootScriptsDir, scriptFile);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(agentScriptsDir, scriptFile));
    fs.copyFileSync(src, path.join(spokeScriptsDir, scriptFile));
    console.log('✅ Synced script ' + scriptFile + ' to .agents/scripts/ and 05-spoke-template/scripts/');
  }
});

// 5c. Sync skills from root skills/ to .agents/skills/ and ~/.gemini/config/skills/
// Full copy when skill directory is missing (or --force-skills); incremental sync for SKILL.md, AGENTIC_ROUTING.md, and references/*.md
const agentSkillsDir = path.join(repoRoot, '.agents', 'skills');
const globalConfigSkills = path.join(userHome, '.gemini', 'config', 'skills');

function syncFileIfChanged(srcFile, dstFile) {
  if (!fs.existsSync(srcFile)) return false;
  if (fs.existsSync(dstFile)) {
    const srcBuf = fs.readFileSync(srcFile);
    const dstBuf = fs.readFileSync(dstFile);
    if (srcBuf.equals(dstBuf)) return false;
  }
  fs.mkdirSync(path.dirname(dstFile), { recursive: true });
  fs.copyFileSync(srcFile, dstFile);
  return true;
}

function syncSkillKeyDocs(srcSkill, targetSkill) {
  let updated = 0;
  for (const name of ['SKILL.md', 'AGENTIC_ROUTING.md']) {
    if (syncFileIfChanged(path.join(srcSkill, name), path.join(targetSkill, name))) {
      updated++;
    }
  }
  const srcRefs = path.join(srcSkill, 'references');
  if (fs.existsSync(srcRefs) && fs.statSync(srcRefs).isDirectory()) {
    for (const file of fs.readdirSync(srcRefs)) {
      if (file.endsWith('.md')) {
        if (syncFileIfChanged(path.join(srcRefs, file), path.join(targetSkill, 'references', file))) {
          updated++;
        }
      }
    }
  }
  return updated;
}

if (fs.existsSync(rootSkillsDir)) {
  let updatedAgentDocs = 0;
  let updatedGlobalDocs = 0;
  actualSkillDirs.forEach(skillName => {
    const srcSkill = path.join(rootSkillsDir, skillName);
    const targetAgentSkill = path.join(agentSkillsDir, skillName);
    const targetGlobalSkill = path.join(globalConfigSkills, skillName);

    if (forceSkillsSync || !fs.existsSync(targetAgentSkill)) {
      fs.cpSync(srcSkill, targetAgentSkill, { recursive: true, force: true });
      console.log('✅ Synced skill ' + skillName + ' to .agents/skills/');
    } else {
      updatedAgentDocs += syncSkillKeyDocs(srcSkill, targetAgentSkill);
    }

    if (forceSkillsSync || !fs.existsSync(targetGlobalSkill)) {
      fs.cpSync(srcSkill, targetGlobalSkill, { recursive: true, force: true });
      console.log('✅ Synced skill ' + skillName + ' to ~/.gemini/config/skills/');
    } else {
      updatedGlobalDocs += syncSkillKeyDocs(srcSkill, targetGlobalSkill);
    }
  });
  if (updatedAgentDocs > 0) console.log(`✅ Incrementally updated ${updatedAgentDocs} modified skill doc(s) in .agents/skills/`);
  if (updatedGlobalDocs > 0) console.log(`✅ Incrementally updated ${updatedGlobalDocs} modified skill doc(s) in ~/.gemini/config/skills/`);
}

// 6. Sync compatible universal rules & blueprints to admin-sunjaya-dev without overwriting custom DB/bug files
if (fs.existsSync(adminSunjayaRules)) {
  if (fs.existsSync(uiReasoningSrc)) fs.copyFileSync(uiReasoningSrc, path.join(adminSunjayaRules, '30-ui-component-reasoning.md'));
  if (fs.existsSync(visualFirstSrc)) fs.copyFileSync(visualFirstSrc, path.join(adminSunjayaRules, '32-visual-first-engineering.md'));
  const adminSunjayaKnowledge = path.join('C:', 'Users', 'ASUS', 'Documents', 'Web Dev', 'sunjaya', 'Roleback', 'admin-sunjaya-dev', '.agents', 'knowledge');
  const spViewsKnowledgeSrc = path.join(repoRoot, 'knowledge', 'stored-procedures-and-views.md');
  const teamAlignKnowledgeSrc = path.join(repoRoot, 'knowledge', 'team-alignment-framework.md');
  if (fs.existsSync(adminSunjayaKnowledge)) {
    if (fs.existsSync(spViewsKnowledgeSrc)) fs.copyFileSync(spViewsKnowledgeSrc, path.join(adminSunjayaKnowledge, 'stored-procedures-and-views.md'));
    if (fs.existsSync(teamAlignKnowledgeSrc)) fs.copyFileSync(teamAlignKnowledgeSrc, path.join(adminSunjayaKnowledge, 'team-alignment-framework.md'));
  }
  console.log('✅ Synced compatible universal rules and blueprints to admin-sunjaya-dev/.agents/');
} else {
  console.log('⚠️ admin-sunjaya-dev rules path not found at: ' + adminSunjayaRules);
}

console.log('🎉 Global & Spoke synchronization complete!');
