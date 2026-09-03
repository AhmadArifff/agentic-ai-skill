#!/usr/bin/env node
/**
 * Master Cross-Device Setup & Bootstrap Script for Agentic AI
 * 
 * Run this on any new computer/server after cloning the repository:
 *   npm run setup
 *   # or
 *   node setup.js
 * 
 * Automatically detects the OS and bootstraps all isolated skill runners
 * (Playwright, Motion, shadcn/ui, Magic UI) with zero manual configuration.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const os = require('node:os');

console.log('\n======================================================');
console.log('       AGENTIC AI - AUTONOMOUS DEVICE SETUP           ');
console.log('======================================================');
console.log(`Platform     : ${os.type()} (${os.platform()} ${os.arch()})`);
console.log(`Node Version : ${process.version}`);
console.log(`Directory    : ${__dirname}`);
console.log('------------------------------------------------------\n');

// 1. Validate Node.js runtime
const majorVersion = parseInt(process.versions.node.split('.')[0], 10);
if (majorVersion < 18) {
  console.error(`❌ ERROR: Node.js version must be >= 18.0.0. Current version is ${process.version}.`);
  console.error('Please install a modern LTS version of Node.js.');
  process.exit(1);
}

const skillsDir = path.join(__dirname, '.agents', 'skills');
if (!fs.existsSync(skillsDir)) {
  console.error(`❌ ERROR: Skills directory not found at ${skillsDir}`);
  process.exit(1);
}

// 2. Discover all skills with bootstrap.js
const skillEntries = fs.readdirSync(skillsDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

const bootstrappableSkills = skillEntries.filter(skillName => {
  const bootstrapPath = path.join(skillsDir, skillName, 'bootstrap.js');
  return fs.existsSync(bootstrapPath);
});

console.log(`Discovered ${skillEntries.length} skills in workspace.`);
console.log(`Found ${bootstrappableSkills.length} skills with autonomous bootstrap scripts:`);
bootstrappableSkills.forEach(s => console.log(`  - ${s}`));
console.log('\n[>>] Starting autonomous provisioning sequence...\n');

const results = [];

for (const skillName of bootstrappableSkills) {
  const skillPath = path.join(skillsDir, skillName);
  const bootstrapFile = path.join(skillPath, 'bootstrap.js');

  console.log(`------------------------------------------------------`);
  console.log(`[BOOTSTRAP] Processing skill: ${skillName}`);
  console.log(`------------------------------------------------------`);

  try {
    // Run the skill's bootstrap script
    execSync(`node "${bootstrapFile}"`, {
      cwd: skillPath,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });

    results.push({ skill: skillName, status: 'SUCCESS' });
    console.log(`✅ Skill "${skillName}" provisioned successfully.\n`);
  } catch (err) {
    console.error(`❌ ERROR while provisioning "${skillName}": ${err.message}\n`);
    results.push({ skill: skillName, status: 'FAILED', error: err.message });
  }
}

// 3. Final Summary Report
console.log('======================================================');
console.log('              PROVISIONING SUMMARY                    ');
console.log('======================================================');
let hasFailures = false;

results.forEach(res => {
  if (res.status === 'SUCCESS') {
    console.log(`  ✅ ${res.skill.padEnd(20)} : READY`);
  } else {
    console.log(`  ❌ ${res.skill.padEnd(20)} : FAILED (${res.error})`);
    hasFailures = true;
  }
});
console.log('======================================================');

if (hasFailures) {
  console.error('\n⚠️ Some skills failed to bootstrap. Review the logs above.');
  process.exit(1);
} else {
  console.log('\n🎉 ALL SKILLS AND RUNNERS ARE FULLY OPERATIONAL!');
  console.log('The Agentic AI multi-agent system is ready for development.');
  console.log('To run system sanity verification:');
  console.log('  npm run test:system\n');
  process.exit(0);
}
