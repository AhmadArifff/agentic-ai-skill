#!/usr/bin/env node
/**
 * Autonomous Child Spoke Scaffolding & Alignment Tool for Agentic AI
 * 
 * Usage:
 *   node scripts/scaffold-spoke.js --target <target-path> [--name <name>] [--type <type>] [--goal <goal>]
 * 
 * Example:
 *   node scripts/scaffold-spoke.js --target "c:\Users\ASUS\Documents\Web Dev\improving\SolanaTradeMemes" --name "SolanaTradeMemes" --type "web3-solana"
 */

const fs = require('node:fs');
const path = require('node:path');

console.log('\n======================================================');
console.log('       AGENTIC AI - CHILD SPOKE SCAFFOLDING ENGINE    ');
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

const targetPath = getArg('--target');
if (!targetPath) {
  console.error('❌ ERROR: Missing required argument: --target <path>');
  console.error('Usage: node scripts/scaffold-spoke.js --target <path> [--name <name>] [--type <web3-solana|laravel|nextjs|general>] [--goal <goal>]');
  process.exit(1);
}

const resolvedTarget = path.resolve(targetPath);
if (!fs.existsSync(resolvedTarget)) {
  console.log(`Directory does not exist. Creating target directory at: ${resolvedTarget}`);
  fs.mkdirSync(resolvedTarget, { recursive: true });
}

const projectName = getArg('--name', path.basename(resolvedTarget));
const projectType = (getArg('--type', 'general')).toLowerCase();
const primaryGoal = getArg('--goal', `Pengembangan dan penyempurnaan sistem aplikasi ${projectName}`);

console.log(`Target Path  : ${resolvedTarget}`);
console.log(`Project Name : ${projectName}`);
console.log(`Project Type : ${projectType}`);
console.log(`Primary Goal : ${primaryGoal}`);
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

    // If session-state.json, replace constraints with preset constraints
    if (path.basename(destination) === 'session-state.json') {
      try {
        const parsed = JSON.parse(content);
        parsed.project_name = projectName;
        parsed.primary_goal = primaryGoal;
        parsed.established_constraints = preset.constraints;
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
console.log('\nSistem siap untuk development. Agen AI otomatis membaca aturan ini saat workspace dibuka.');
process.exit(0);
