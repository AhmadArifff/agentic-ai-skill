#!/usr/bin/env node
/**
 * Session Manager & Cross-Chat Migration Tool
 * 
 * Usage:
 *   node 02-session-state/session-manager.js status
 *   node 02-session-state/session-manager.js export
 *   node 02-session-state/session-manager.js import --file <path>
 */

const fs = require('node:fs');
const path = require('node:path');

const sessionDir = path.join(__dirname);
const activeStateFile = path.join(sessionDir, 'active-session.json');
const templateFile = path.join(sessionDir, 'session-snapshot-template.json');

const args = process.argv.slice(2);
const command = args[0] || 'status';

function loadActiveState() {
  if (fs.existsSync(activeStateFile)) {
    return JSON.parse(fs.readFileSync(activeStateFile, 'utf-8'));
  }
  if (fs.existsSync(templateFile)) {
    return JSON.parse(fs.readFileSync(templateFile, 'utf-8'));
  }
  return null;
}

switch (command) {
  case 'status': {
    const state = loadActiveState();
    if (!state) {
      console.log('No active session state found.');
      process.exit(0);
    }
    console.log('\n======================================================');
    console.log('            AGENTIC AI - ACTIVE SESSION STATUS        ');
    console.log('======================================================');
    console.log(`Session ID     : ${state.session_id}`);
    console.log(`Project        : ${state.project_name || 'N/A'}`);
    console.log(`Current Stage  : ${state.current_stage}`);
    console.log(`Primary Goal   : ${state.primary_goal}`);
    console.log('------------------------------------------------------');
    console.log('Locked Constraints:');
    (state.locked_constraints || []).forEach(c => console.log(`  🔒 ${c}`));
    console.log('------------------------------------------------------');
    console.log('Subtasks Progress:');
    (state.subtasks || []).forEach(st => {
      const badge = st.status === 'done' ? '✅' : st.status === 'in_progress' ? '⏳' : '⏸️';
      console.log(`  ${badge} [${st.id}] ${st.title} (${st.owner_role}) -> ${st.status} (rework: ${st.rework_iteration_count || 0})`);
    });
    console.log('======================================================\n');
    break;
  }

  case 'export': {
    const state = loadActiveState();
    if (!state) {
      console.error('❌ Cannot export: no state available.');
      process.exit(1);
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFileName = `session-snapshot-${timestamp}.json`;
    const exportPath = path.join(sessionDir, exportFileName);
    fs.writeFileSync(exportPath, JSON.stringify(state, null, 2), 'utf-8');
    console.log(`✅ Session snapshot exported successfully to:`);
    console.log(`   ${exportPath}`);
    console.log(`You can copy this file to another project or chat session.`);
    break;
  }

  case 'import': {
    const fileArgIndex = args.indexOf('--file');
    if (fileArgIndex === -1 || !args[fileArgIndex + 1]) {
      console.error('Usage: node session-manager.js import --file <path-to-json>');
      process.exit(1);
    }
    const targetPath = path.resolve(args[fileArgIndex + 1]);
    if (!fs.existsSync(targetPath)) {
      console.error(`❌ File not found: ${targetPath}`);
      process.exit(1);
    }
    const importedContent = fs.readFileSync(targetPath, 'utf-8');
    const parsed = JSON.parse(importedContent);
    fs.writeFileSync(activeStateFile, JSON.stringify(parsed, null, 2), 'utf-8');
    console.log(`✅ Session state imported and set as active session!`);
    console.log(`   Session ID: ${parsed.session_id}`);
    console.log(`   Goal      : ${parsed.primary_goal}`);
    break;
  }

  default:
    console.log('Available commands: status, export, import --file <path>');
    break;
}
