#!/usr/bin/env node
/**
 * Autonomous Cross-Device Bootstrap Script for Magic UI Skill
 * Can be run by any agentic AI on any fresh device (Windows, macOS, Linux).
 * 
 * Usage:
 *   node .agents/skills/magic-ui/bootstrap.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const os = require('node:os');

const SKILL_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SKILL_DIR, '..', '..', '..');

console.log('=== Magic UI Skill Autonomous Bootstrap ===');
console.log(`Operating System: ${os.type()} (${os.platform()} ${os.arch()})`);
console.log(`Node Version    : ${process.version}`);
console.log(`Skill Directory : ${SKILL_DIR}`);
console.log(`Project Root    : ${PROJECT_ROOT}`);

const result = {
  success: false,
  os: os.platform(),
  nodeVersion: process.version,
  skillDir: SKILL_DIR,
  steps: []
};

function runStep(stepName, fn) {
  try {
    process.stdout.write(`[>] ${stepName}... `);
    const msg = fn();
    console.log(`OK ${msg ? `(${msg})` : ''}`);
    result.steps.push({ step: stepName, status: 'pass', detail: msg });
  } catch (err) {
    console.log(`FAILED!`);
    console.error(`    Error: ${err.message}`);
    result.steps.push({ step: stepName, status: 'fail', error: err.message });
    throw err;
  }
}

try {
  // 1. Check Node.js version >= 18
  runStep('Validating Node.js version >= 18', () => {
    const major = parseInt(process.versions.node.split('.')[0], 10);
    if (major < 18) {
      throw new Error(`Node.js version must be >= 18.0.0. Current: ${process.version}`);
    }
    return `Major: ${major}`;
  });

  // 2. Ensure package.json exists in skill directory
  runStep('Ensuring skill package.json exists', () => {
    const pkgPath = path.join(SKILL_DIR, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      const pkgJson = {
        name: "magic-ui-skill-runner",
        version: "1.0.0",
        description: "Isolated runner and dependencies for Magic UI skill",
        dependencies: {
          "clsx": "^2.1.1",
          "tailwind-merge": "^2.6.0",
          "lucide-react": "^0.469.0",
          "motion": "^12.4.7"
        }
      };
      fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2), 'utf-8');
      return 'Generated skill package.json';
    }
    return 'Existing package.json found';
  });

  // 3. Install core dependencies in skill directory
  runStep('Installing core UI helper dependencies', () => {
    const clsxPath = path.join(SKILL_DIR, 'node_modules', 'clsx');
    const twMergePath = path.join(SKILL_DIR, 'node_modules', 'tailwind-merge');
    if (!fs.existsSync(clsxPath) || !fs.existsSync(twMergePath)) {
      console.log('Installing clsx, tailwind-merge, lucide-react...');
      execSync('npm install --prefer-offline --no-audit', { cwd: SKILL_DIR, stdio: 'inherit' });
      return 'Installed packages';
    }
    return 'Dependencies already present';
  });

  // 4. Test cn() helper function logic
  runStep('Testing cn() utility function logic', () => {
    const { clsx } = require(path.join(SKILL_DIR, 'node_modules', 'clsx'));
    const { twMerge } = require(path.join(SKILL_DIR, 'node_modules', 'tailwind-merge'));
    function cn(...inputs) {
      return twMerge(clsx(inputs));
    }
    const merged = cn("p-4 bg-red-500", "p-6 bg-blue-500", { "text-white": true });
    if (merged !== "p-6 bg-blue-500 text-white") {
      throw new Error(`cn() produced unexpected result: ${merged}`);
    }
    return `cn() verified successfully: "${merged}"`;
  });

  // 5. Test CLI accessibility (Shadcn Registry runner for Magic UI)
  runStep('Verifying Shadcn CLI registry runner for Magic UI', () => {
    execSync('npx --yes shadcn@latest --version', { cwd: SKILL_DIR, stdio: 'pipe' });
    return 'shadcn CLI reachable (Magic UI Registry format)';
  });

  result.success = true;
  console.log('\n=============================================');
  console.log('STATUS: READY! Magic UI skill is fully operational.');
  console.log('CLI Component Scaffolding (Official Magic UI Registry):');
  console.log('  npx shadcn@latest add "https://magicui.design/r/[component-name]"');
  console.log('Component docs: https://magicui.design/docs');
  console.log('=============================================\n');

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  result.success = false;
  result.fatalError = error.message;
  console.error('\nBOOTSTRAP FAILED. Inspect error log above.');
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}
