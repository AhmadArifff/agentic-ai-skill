#!/usr/bin/env node
/**
 * Autonomous Cross-Device Bootstrap Script for playwright-skill
 * Can be run by any agentic AI on any fresh device (Windows, macOS, Linux).
 * 
 * Usage:
 *   node .agents/skills/playwright-skill/bootstrap.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const os = require('node:os');

const SKILL_DIR = __dirname;

console.log('=== Playwright Skill Autonomous Bootstrap ===');
console.log(`Operating System: ${os.type()} (${os.platform()} ${os.arch()})`);
console.log(`Node Version    : ${process.version}`);
console.log(`Skill Directory : ${SKILL_DIR}`);

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
  // 1. Verify Node.js Version
  runStep('Validating Node.js version >= 20', () => {
    const major = parseInt(process.versions.node.split('.')[0], 10);
    if (major < 20) {
      throw new Error(`Node.js version must be >= 20.0.0. Current: ${process.version}`);
    }
    return `Major: ${major}`;
  });

  // 2. Check and install dependencies in skill directory
  runStep('Checking npm dependencies (playwright)', () => {
    const pkgPath = path.join(SKILL_DIR, 'package.json');
    const nodeModulesPath = path.join(SKILL_DIR, 'node_modules');
    const playwrightPkg = path.join(nodeModulesPath, 'playwright');

    if (!fs.existsSync(pkgPath)) {
      throw new Error(`package.json not found at ${pkgPath}`);
    }

    if (!fs.existsSync(playwrightPkg)) {
      console.log('Missing node_modules. Installing...');
      execSync('npm install', { cwd: SKILL_DIR, stdio: 'inherit' });
      return 'Installed npm packages';
    }
    return 'Already installed';
  });

  // 3. Check and install Chromium browser binaries
  runStep('Provisioning Chromium browser binary', () => {
    try {
      // Test if playwright can find chromium executable
      const { chromium } = require(path.join(SKILL_DIR, 'node_modules', 'playwright'));
      const execPath = chromium.executablePath();
      if (!fs.existsSync(execPath)) {
        throw new Error('Chromium binary path does not exist');
      }
      return `Binary found: ${path.basename(execPath)}`;
    } catch (e) {
      console.log('Chromium binary missing. Running: npx playwright install chromium...');
      const installCmd = os.platform() === 'linux' 
        ? 'npx playwright install chromium --with-deps' 
        : 'npx playwright install chromium';
      execSync(installCmd, { cwd: SKILL_DIR, stdio: 'inherit' });
      return 'Chromium installed successfully';
    }
  });

  // 4. Test Minimal Browser Execution
  runStep('Running headless sanity test', () => {
    const { chromium } = require(path.join(SKILL_DIR, 'node_modules', 'playwright'));
    execSync(`node -e "const { chromium } = require('./node_modules/playwright'); (async () => { const browser = await chromium.launch({ headless: true }); await browser.close(); })()"`, {
      cwd: SKILL_DIR,
      stdio: 'pipe'
    });
    return 'Headless launch verified';
  });

  result.success = true;
  console.log('\n=============================================');
  console.log('STATUS: READY! Skill is fully operational.');
  console.log('To run scripts:');
  console.log(`  node "${path.join(SKILL_DIR, 'run.js')}" <path-to-script.js>`);
  console.log('=============================================\n');

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  result.success = false;
  result.fatalError = error.message;
  console.error('\nBOOTSTRAP FAILED. Agents should inspect the steps above.');
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}
