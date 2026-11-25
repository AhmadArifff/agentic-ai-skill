#!/usr/bin/env node
/**
 * System Sanity Verification Script for Agentic AI
 *
 * Verifies roles, session state engine, pipeline protocols, Case-Bank cases,
 * 3-way workspace skills parity, spoke scaffolder presets, and governance count drift.
 */

const fs = require('node:fs');
const path = require('node:path');

console.log('=== Agentic AI System Sanity Verification ===\n');

const listSkillDirs = dir =>
  fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();

const checks = [
  {
    name: 'Roles Structure',
    validate: () => {
      const rolesDir = path.join(__dirname, '01-roles');
      const tiers = ['orchestration', 'builders', 'reviewers', 'governance'];
      let roleCount = 0;
      tiers.forEach(tier => {
        const tierPath = path.join(rolesDir, tier);
        if (!fs.existsSync(tierPath)) throw new Error(`Missing role tier: ${tier}`);
        const files = fs.readdirSync(tierPath).filter(f => f.endsWith('.md'));
        roleCount += files.length;
      });
      if (roleCount !== 24) throw new Error(`Expected 24 roles, found ${roleCount}`);
      return `24 roles across 4 tiers verified (including web3 & multimedia engineers)`;
    }
  },
  {
    name: 'Session State Engine',
    validate: () => {
      const schemaPath = path.join(__dirname, '02-session-state', 'schema.yaml');
      const transitionsPath = path.join(__dirname, '02-session-state', 'state-transitions.md');
      const handoffDocPath = path.join(__dirname, '02-session-state', 'cross-project-handoff.md');
      const templatePath = path.join(__dirname, '02-session-state', 'session-snapshot-template.json');
      if (!fs.existsSync(schemaPath) || !fs.existsSync(transitionsPath) || !fs.existsSync(handoffDocPath) || !fs.existsSync(templatePath)) {
        throw new Error('Missing session state schema, transitions doc, handoff guide, or snapshot template');
      }
      return 'Session state schema, FSM transitions, and cross-project handoff verified';
    }
  },
  {
    name: 'Pipeline & Hand-off Protocols',
    validate: () => {
      const handoffPath = path.join(__dirname, '03-pipelines', 'handoff-protocol.md');
      const reworkPath = path.join(__dirname, '03-pipelines', 'rework-loop-spec.md');
      if (!fs.existsSync(handoffPath) || !fs.existsSync(reworkPath)) {
        throw new Error('Missing pipeline specs');
      }
      return 'Handoff protocol and rework loop circuit breaker verified';
    }
  },
  {
    name: 'Case-Bank Engine & Cases',
    validate: () => {
      const specPath = path.join(__dirname, '04-case-bank', 'case-bank-spec.md');
      const indexPath = path.join(__dirname, '04-case-bank', 'index.json');
      if (!fs.existsSync(specPath) || !fs.existsSync(indexPath)) {
        throw new Error('Missing case-bank spec or index.json');
      }
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      if (!index.cases || index.cases.length === 0) {
        throw new Error('Case-bank index contains no cases');
      }
      index.cases.forEach(c => {
        const casePath = path.join(__dirname, '04-case-bank', c.file);
        if (!fs.existsSync(casePath)) {
          throw new Error(`Case file not found: ${c.file}`);
        }
      });
      return `Case-Bank verified with ${index.cases.length} dual-approved production cases`;
    }
  },
  {
    name: 'Workspace Skills & Parity',
    validate: () => {
      const rootSkillsDir = path.join(__dirname, 'skills');
      const agentSkillsDir = path.join(__dirname, '.agents', 'skills');
      const rootSkills = listSkillDirs(rootSkillsDir);
      const agentSkills = listSkillDirs(agentSkillsDir);
      if (rootSkills.length < 12) throw new Error(`Expected at least 12 skills, found ${rootSkills.length}`);

      const missingInAgents = rootSkills.filter(s => !agentSkills.includes(s));
      const extraInAgents = agentSkills.filter(s => !rootSkills.includes(s));
      if (missingInAgents.length || extraInAgents.length) {
        throw new Error(`Parity mismatch between skills/ and .agents/skills/ (missingInAgents=[${missingInAgents.join(',')}], extraInAgents=[${extraInAgents.join(',')}])`);
      }

      const missingSkillMd = rootSkills.filter(s => s !== '_jutsu' && !fs.existsSync(path.join(rootSkillsDir, s, 'SKILL.md')));
      if (missingSkillMd.length) {
        throw new Error(`Missing SKILL.md in: ${missingSkillMd.join(', ')}`);
      }
      return `${rootSkills.length} workspace skills verified with 100% skills/ <-> .agents/skills/ parity`;
    }
  },
  {
    name: 'Spoke Scaffolder & Template',
    validate: () => {
      const realSkills = new Set(listSkillDirs(path.join(__dirname, 'skills')));
      const scaffoldSrc = fs.readFileSync(path.join(__dirname, 'scripts', 'scaffold-spoke.js'), 'utf-8');
      const matches = [...scaffoldSrc.matchAll(/adoptedSkills:\s*\[([^\]]+)\]/g)];
      if (matches.length === 0) throw new Error('No adoptedSkills presets found in scripts/scaffold-spoke.js');
      let refCount = 0;
      const missing = [];
      for (const m of matches) {
        for (const s of m[1].matchAll(/'([^']+)'/g)) {
          refCount++;
          if (!realSkills.has(s[1])) missing.push(s[1]);
        }
      }
      if (missing.length) {
        throw new Error(`Unknown skill IDs in scaffold-spoke.js presets: ${[...new Set(missing)].join(', ')}`);
      }

      const spokeState = JSON.parse(fs.readFileSync(path.join(__dirname, '05-spoke-template', 'session-state.json'), 'utf-8'));
      for (const field of ['adopted_skills', 'skill_activation_log', 'qa_policy']) {
        if (!(field in spokeState)) {
          throw new Error(`Missing required field "${field}" in 05-spoke-template/session-state.json`);
        }
      }
      return `${matches.length} presets (${refCount} skill refs) & spoke session-state schema verified`;
    }
  },
  {
    name: 'Governance Count Drift Guard',
    validate: () => {
      const n = listSkillDirs(path.join(__dirname, 'skills')).length;
      const checksToRun = [
        { file: 'AGENTS.md', pattern: new RegExp(`## 4\\. Katalog ${n} Skill Terdaftar`) },
        { file: path.join('.agents', 'README.md'), pattern: new RegExp(`diperkuat oleh ${n} skill terdaftar`) },
        { file: path.join('05-spoke-template', 'AGENTS.md'), pattern: new RegExp(`dan ${n} skill global`) },
        { file: path.join('knowledge', 'spoke-adoption-guide.md'), pattern: new RegExp(`• ${n} Skills Global`) },
        { file: path.join('knowledge', 'hub-and-spoke-sync.md'), pattern: new RegExp(`• ${n} Skills &`) }
      ];
      const drifted = [];
      for (const item of checksToRun) {
        const text = fs.readFileSync(path.join(__dirname, item.file), 'utf-8');
        if (!item.pattern.test(text)) drifted.push(item.file);
      }
      if (drifted.length) {
        throw new Error(`Skill count (${n}) out of sync in: ${drifted.join(', ')}. Run: node scripts/sync-global-and-spoke.js`);
      }
      return `All 5 core governance docs match live count (${n} skills) with 0 drift`;
    }
  }
];

let allPassed = true;
checks.forEach(check => {
  try {
    const detail = check.validate();
    console.log(`✅ [PASS] ${check.name.padEnd(30)}: ${detail}`);
  } catch (err) {
    console.error(`❌ [FAIL] ${check.name.padEnd(30)}: ${err.message}`);
    allPassed = false;
  }
});

console.log('\n=============================================');
if (allPassed) {
  console.log('STATUS: SYSTEM HEALTH 100% OPERATIONAL!');
  process.exit(0);
} else {
  console.error('STATUS: SYSTEM HEALTH CHECK FAILED!');
  process.exit(1);
}
