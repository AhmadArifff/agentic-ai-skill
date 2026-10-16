#!/usr/bin/env node
/**
 * Autonomous Child Spoke Scaffolding & Alignment Tool for Agentic AI
 * 
 * Usage:
 *   node scripts/scaffold-spoke.js --target <target-path> [--name <name>] [--type <type>] [--goal <goal>] [--git-autopush <yes|no>] [--db <supabase|mysql|postgres|sqlite|none>] [--arch <existing|oop|repository|clean>]
 * 
 * Interactive Mode:
 *   npm run spoke:scaffold
 *   node scripts/scaffold-spoke.js --interactive
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

console.log('\n======================================================');
console.log('       AGENTIC AI - CHILD SPOKE ONBOARDING ENGINE     ');
console.log('======================================================\n');

// Parse CLI arguments
const args = process.argv.slice(2);
function getArg(flag, defaultValue = null) {
  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return defaultValue;
}

const isInteractive = args.includes('--interactive') || (!getArg('--target') && process.stdin.isTTY);

async function run() {
  let targetPath = getArg('--target');
  let projectName = getArg('--name');
  let projectType = getArg('--type', 'general');
  let primaryGoal = getArg('--goal');
  let gitAutoPush = getArg('--git-autopush');
  let databaseChoice = getArg('--db');
  let architectureChoice = getArg('--arch');

  if (isInteractive) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const ask = (q, def = '') => new Promise(resolve => {
      rl.question(`${q}${def ? ` [default: ${def}]` : ''}: `, ans => {
        resolve(ans.trim() || def);
      });
    });

    console.log('Silakan lengkapi kuesioner kustomisasi untuk mengadopsi .agents:\n');
    targetPath = await ask('1. Masukkan path folder target proyek', targetPath || './child-spoke');
    projectName = await ask('2. Nama proyek', projectName || path.basename(path.resolve(targetPath)));
    projectType = await ask('3. Tipe proyek (web3-solana | laravel | nextjs | video-ai | service-pos | general)', projectType);
    primaryGoal = await ask('4. Tujuan utama proyek', primaryGoal || `Pengembangan dan penyempurnaan sistem aplikasi ${projectName}`);
    
    console.log('\n--- KUESIONER WORKFLOW & INFRASTRUKTUR WAJIB ---');
    gitAutoPush = await ask('5. Selesai development & preview, apakah langsung dipush ke GitHub? (yes/no)', gitAutoPush || 'no');
    databaseChoice = await ask('6. Database apa yang digunakan? (supabase / postgres / mysql / sqlite / none)', databaseChoice || 'none');
    architectureChoice = await ask('7. Standarisasi arsitektur? (existing [seperti adminShuttleV3] / oop / repository / clean / auto)', architectureChoice || 'auto');

    rl.close();
    console.log('\nMemproses konfigurasi kustomisasi...\n');
  }

  if (!targetPath) {
    console.error('❌ ERROR: Missing required argument: --target <path>');
    console.error('Usage: node scripts/scaffold-spoke.js --target <path> [options]');
    console.error('Atau jalankan: npm run spoke:scaffold -- --interactive');
    process.exit(1);
  }

  const resolvedTarget = path.resolve(targetPath);
  if (!fs.existsSync(resolvedTarget)) {
    console.log(`Directory does not exist. Creating target directory at: ${resolvedTarget}`);
    fs.mkdirSync(resolvedTarget, { recursive: true });
  }

  projectName = projectName || path.basename(resolvedTarget);
  projectType = (projectType || 'general').toLowerCase();
  primaryGoal = primaryGoal || `Pengembangan dan penyempurnaan sistem aplikasi ${projectName}`;
  gitAutoPush = (gitAutoPush || 'no').toLowerCase().startsWith('y');
  databaseChoice = (databaseChoice || 'none').toLowerCase();
  architectureChoice = (architectureChoice || 'auto').toLowerCase();

  console.log(`Target Path       : ${resolvedTarget}`);
  console.log(`Project Name      : ${projectName}`);
  console.log(`Project Type      : ${projectType}`);
  console.log(`Primary Goal      : ${primaryGoal}`);
  console.log(`Git Auto-Push     : ${gitAutoPush ? 'YA (Pull-Before-Build & Pull-Before-Push)' : 'TIDAK (Manual Commit & Push)'}`);
  console.log(`Database & Storage: ${databaseChoice.toUpperCase()}`);
  console.log(`Standar Arsitektur: ${architectureChoice.toUpperCase()}`);
  console.log('------------------------------------------------------\n');

  // Presets by project type
  const PRESETS = {
    'web3-solana': {
      techStack: 'Solana Blockchain (Web3.js, Anchor Framework), Next.js App Router, TypeScript, Tailwind CSS',
      primaryBuilder: 'smart-contract-engineer & frontend-engineer',
      constraints: [
        {
          id: 'C-01',
          category: 'security',
          constraint: 'Dilarang keras menyimpan private key atau wallet mnemonic ke repositori kode',
          locked: true
        },
        {
          id: 'C-02',
          category: 'blockchain',
          constraint: 'RPC Solana dikonfigurasi melalui environment variables dengan rate-limit fallback',
          locked: true
        },
        {
          id: 'C-03',
          category: 'ux',
          constraint: 'Koneksi wallet Phantom/Solflare mendukung auto-reconnect dan responsivitas mobile',
          locked: true
        }
      ]
    },
    'laravel': {
      techStack: 'Laravel 11 (4-Layer: Controller -> Service -> Repository -> Model), MySQL/PostgreSQL, Tailwind CSS',
      primaryBuilder: 'backend-engineer & laravel-architect',
      constraints: [
        {
          id: 'C-01',
          category: 'architecture',
          constraint: 'Pemisahan ketat 4-layer: dilarang menjalankan Eloquent kueri langsung di Controller atau Blade',
          locked: true
        },
        {
          id: 'C-02',
          category: 'security',
          constraint: 'Validasi input wajib melalui FormRequest terpisah dan otorisasi Spatie RBAC',
          locked: true
        }
      ]
    },
    'nextjs': {
      techStack: 'Next.js App Router (React 19), TypeScript, Tailwind CSS, Server Actions',
      primaryBuilder: 'frontend-engineer & fullstack-engineer',
      constraints: [
        {
          id: 'C-01',
          category: 'performance',
          constraint: 'Gunakan Server Components sebagai default; tandai use client hanya pada komponen interaktif',
          locked: true
        },
        {
          id: 'C-02',
          category: 'styling',
          constraint: 'Tailwind CSS tokenized palette dengan dark-mode support dan WCAG AA contrast',
          locked: true
        }
      ]
    },
    'video-ai': {
      techStack: 'Multimedia & Video Automation (Canvas, WebCodecs, FFmpeg, Audio Waveform API), TypeScript, Next.js',
      primaryBuilder: 'multimedia-video-engineer & frontend-engineer',
      constraints: [
        {
          id: 'C-01',
          category: 'multimedia',
          constraint: 'Timeline editor wajib mendukung penyesuaian detik dan milidetik fleksibel (bukan fixed interval)',
          locked: true
        },
        {
          id: 'C-02',
          category: 'retention',
          constraint: 'Wajib mengoptimalkan The 3-Second Hook dan safe-zone format 9:16 vertikal',
          locked: true
        },
        {
          id: 'C-03',
          category: 'audio',
          constraint: 'Terapkan micro-crossfade (15ms) pada setiap titik potong sambungan klip audio',
          locked: true
        }
      ]
    },
    'service-pos': {
      techStack: 'Point of Sale & Multi-Stage Service Fulfillment (Next.js/Laravel, PostgreSQL, Thermal Printing)',
      primaryBuilder: 'backend-engineer & ui-ux-designer',
      constraints: [
        {
          id: 'C-01',
          category: 'business_rule',
          constraint: 'Wajib menerapkan Finite State Machine pada tahapan pengerjaan jasa dengan audit log',
          locked: true
        },
        {
          id: 'C-02',
          category: 'financial_ledger',
          constraint: 'Kalkulasi diskon bertingkat dan saldo kasir wajib menggunakan integer cent/sen tanpa floating rounding error',
          locked: true
        }
      ]
    },
    'general': {
      techStack: 'Fullstack Modern Web Application',
      primaryBuilder: 'software-engineer & frontend-engineer',
      constraints: [
        {
          id: 'C-01',
          category: 'security',
          constraint: 'Dilarang hardcode kredensial rahasia ke repositori kode',
          locked: true
        },
        {
          id: 'C-02',
          category: 'quality',
          constraint: 'Wajib menerapkan evaluasi 7 pilar task review dan prinsip No Self-Review',
          locked: true
        }
      ]
    }
  };

  const preset = PRESETS[projectType] || PRESETS['general'];
  const compiledConstraints = [...preset.constraints];

  // Inject Git Workflow constraint if enabled
  if (gitAutoPush) {
    compiledConstraints.push({
      id: 'C-GIT',
      category: 'git_discipline',
      constraint: 'Alur Git Aktif: Wajib git pull --rebase sebelum mulai coding, dan wajib git pull --rebase setelah preview lolos sebelum melakukan git push.',
      locked: true
    });
  }

  // Inject Database / Supabase constraint
  if (databaseChoice === 'supabase') {
    preset.techStack += ' | Supabase (PostgreSQL, Storage Buckets, Auth, RLS)';
    compiledConstraints.push({
      id: 'C-SUPABASE',
      category: 'database_storage',
      constraint: 'Supabase Aktif: Skema data idempoten (upsert), isolasi bucket public-assets dan private-documents, dan pembatasan RLS policy.',
      locked: true
    });
  } else if (databaseChoice !== 'none') {
    compiledConstraints.push({
      id: 'C-DB',
      category: 'database',
      constraint: `Database Aktif: Menggunakan ${databaseChoice.toUpperCase()} dengan transaksi atomik dan isolasi kueri pada repository layer.`,
      locked: true
    });
  }

  // Inject Architecture constraint
  if (architectureChoice === 'existing') {
    compiledConstraints.push({
      id: 'C-ARCH-EXISTING',
      category: 'architecture',
      constraint: 'Wajib 100% mematuhi konvensi dan standarisasi arsitektur eksisting proyek (seperti adminShuttleV3 / admin-sunjaya-dev).',
      locked: true
    });
  } else if (architectureChoice === 'oop') {
    compiledConstraints.push({
      id: 'C-ARCH-OOP',
      category: 'architecture',
      constraint: 'Terapkan arsitektur OOP modular dengan enkapsulasi domain, single responsibility, dan interface kontrak.',
      locked: true
    });
  } else if (architectureChoice === 'repository') {
    compiledConstraints.push({
      id: 'C-ARCH-REPO',
      category: 'architecture',
      constraint: 'Terapkan Repository Pattern untuk mengisolasi logika akses data dari controller atau presentasi.',
      locked: true
    });
  }

  const templateDir = path.join(__dirname, '..', '05-spoke-template');
  if (!fs.existsSync(templateDir)) {
    console.error(`❌ ERROR: Template directory not found at: ${templateDir}`);
    process.exit(1);
  }

  const spokeAgentsDir = path.join(resolvedTarget, '.agents');
  fs.mkdirSync(spokeAgentsDir, { recursive: true });

  function copyAndTransform(source, destination) {
    const stat = fs.statSync(source);
    if (stat.isDirectory()) {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }
      const entries = fs.readdirSync(source);
      entries.forEach(entry => {
        copyAndTransform(path.join(source, entry), path.join(destination, entry));
      });
    } else {
      let content = fs.readFileSync(source, 'utf-8');

      // Replace placeholders
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
      content = content.replace(/\{\{TECH_STACK\}\}/g, preset.techStack);
      content = content.replace(/\{\{PRIMARY_BUILDER_ROLE\}\}/g, preset.primaryBuilder);
      content = content.replace(/\{\{PRIMARY_GOAL\}\}/g, primaryGoal);

      // If session-state.json, replace constraints with compiled constraints
      if (path.basename(destination) === 'session-state.json') {
        try {
          const parsed = JSON.parse(content);
          parsed.project_name = projectName;
          parsed.primary_goal = primaryGoal;
          parsed.established_constraints = compiledConstraints;
          parsed.git_autopush_enabled = gitAutoPush;
          parsed.database = databaseChoice;
          parsed.architecture_standard = architectureChoice;
          content = JSON.stringify(parsed, null, 2);
        } catch (err) {
          // Fallback to string replace
        }
      }

      fs.writeFileSync(destination, content, 'utf-8');
      console.log(`  📄 Created: ${path.relative(resolvedTarget, destination)}`);
    }
  }

  console.log('[>>] Scaffolding .agents into child spoke...\n');
  copyAndTransform(templateDir, spokeAgentsDir);

  // Also create root AGENTS.md in child spoke if it doesn't exist
  const rootAgentsFile = path.join(resolvedTarget, 'AGENTS.md');
  if (!fs.existsSync(rootAgentsFile)) {
    const templateAgents = path.join(spokeAgentsDir, 'AGENTS.md');
    if (fs.existsSync(templateAgents)) {
      fs.copyFileSync(templateAgents, rootAgentsFile);
      console.log(`  📄 Created root entry: AGENTS.md`);
    }
  }

  console.log('\n======================================================');
  console.log('✅ CHILD SPOKE PROVISIONED SUCCESSFULLY!');
  console.log('======================================================');
  console.log(`Lokasi .agents   : ${spokeAgentsDir}`);
  console.log(`Active State File : ${path.join(spokeAgentsDir, 'session-state.json')}`);
  console.log(`Entry File       : ${path.join(resolvedTarget, 'AGENTS.md')}`);
  console.log(`Git Protocol     : ${gitAutoPush ? 'Pull-Before-Build & Pull-Before-Push AKTIF' : 'Manual Push'}`);
  console.log(`Database Adapter : ${databaseChoice.toUpperCase()}`);
  console.log('\nSistem siap untuk development. Agen AI otomatis membaca aturan ini saat workspace dibuka.');
}

run().catch(err => {
  console.error(`❌ Unexpected error: ${err.message}`);
  process.exit(1);
});
