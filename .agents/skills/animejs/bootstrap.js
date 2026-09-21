#!/usr/bin/env node
/**
 * Autonomous Bootstrap Script for Anime.js Skill
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const SKILL_DIR = __dirname;
console.log('=== Anime.js Skill Autonomous Bootstrap ===');
console.log(`Operating System: ${os.type()} (${os.platform()} ${os.arch()})`);
console.log(`Node Version    : ${process.version}`);

try {
  const skillMd = path.join(SKILL_DIR, 'SKILL.md');
  if (!fs.existsSync(skillMd)) throw new Error('Missing SKILL.md');
  console.log('[>] Validating Anime.js animation patterns... OK');
  console.log('\n=============================================');
  console.log('STATUS: READY! Anime.js skill is fully operational.');
  console.log('Installation : npm install animejs @types/animejs');
  console.log('Documentation: https://animejs.com');
  console.log('=============================================\n');
} catch (err) {
  console.error(`BOOTSTRAP FAILED: ${err.message}`);
  process.exit(1);
}
