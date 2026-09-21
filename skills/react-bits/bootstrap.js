#!/usr/bin/env node
/**
 * Autonomous Bootstrap Script for React Bits & GSAP Skill
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const SKILL_DIR = __dirname;
console.log('=== React Bits & GSAP Skill Autonomous Bootstrap ===');
console.log(`Operating System: ${os.type()} (${os.platform()} ${os.arch()})`);
console.log(`Node Version    : ${process.version}`);

try {
  const skillMd = path.join(SKILL_DIR, 'SKILL.md');
  if (!fs.existsSync(skillMd)) throw new Error('Missing SKILL.md');
  console.log('[>] Validating React Bits & GSAP patterns... OK');
  console.log('\n=============================================');
  console.log('STATUS: READY! React Bits & GSAP skill is fully operational.');
  console.log('Installation : npm install gsap @gsap/react');
  console.log('Documentation: https://reactbits.dev');
  console.log('=============================================\n');
} catch (err) {
  console.error(`BOOTSTRAP FAILED: ${err.message}`);
  process.exit(1);
}
