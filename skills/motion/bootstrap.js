#!/usr/bin/env node
/**
 * Autonomous Cross-Device Bootstrap Script for Motion Skill
 * Can be run by any agentic AI on any fresh device (Windows, macOS, Linux).
 * 
 * Usage:
 *   node .agents/skills/motion/bootstrap.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const os = require('node:os');

const SKILL_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SKILL_DIR, '..', '..', '..');

console.log('=== Motion Animation Skill Autonomous Bootstrap ===');
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
  // 1. Check Node.js runtime
  runStep('Validating Node.js version >= 18', () => {
    const major = parseInt(process.versions.node.split('.')[0], 10);
    if (major < 18) {
      throw new Error(`Node.js version must be >= 18.0.0. Current: ${process.version}`);
    }
    return `Major: ${major}`;
  });

  // 2. Ensure package.json exists in skill directory for isolation
  runStep('Ensuring skill local package.json exists', () => {
    const pkgPath = path.join(SKILL_DIR, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      const pkgJson = {
        name: "motion-skill-runner",
        version: "1.0.0",
        description: "Isolated runner and dependencies for Motion animation skill",
        dependencies: {
          "motion": "^12.4.7"
        }
      };
      fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2), 'utf-8');
      return 'Generated skill package.json';
    }
    return 'Existing package.json found';
  });

  // 3. Install motion library in skill directory
  runStep('Installing motion dependency in skill directory', () => {
    const motionModule = path.join(SKILL_DIR, 'node_modules', 'motion');
    if (!fs.existsSync(motionModule)) {
      console.log('Installing motion via npm...');
      execSync('npm install --prefer-offline --no-audit', { cwd: SKILL_DIR, stdio: 'inherit' });
      return 'Installed motion package';
    }
    return 'motion already present';
  });

  // 4. Verify Module Import & API exports
  runStep('Verifying Motion API exports', () => {
    const { animate } = require(path.join(SKILL_DIR, 'node_modules', 'motion'));
    if (typeof animate !== 'function') {
      throw new Error("Export 'animate' is not a function in motion package");
    }
    return 'animate() export verified';
  });

  result.success = true;
  console.log('\n=============================================');
  console.log('STATUS: READY! Motion skill is fully operational.');
  console.log('Import conventions:');
  console.log('  React  : import { motion, AnimatePresence } from "motion/react"');
  console.log('  JS     : import { animate, scroll } from "motion"');
  console.log('  Vue    : import { motion } from "motion-v"');
  console.log('=============================================\n');

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  result.success = false;
  result.fatalError = error.message;
  console.error('\nBOOTSTRAP FAILED. Inspect error log above.');
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}
