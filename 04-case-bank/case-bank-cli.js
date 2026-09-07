#!/usr/bin/env node
/**
 * Case-Bank CLI & Semantic Fast-Lookup Tool
 * 
 * Usage:
 *   node 04-case-bank/case-bank-cli.js list
 *   node 04-case-bank/case-bank-cli.js search <keyword>
 *   node 04-case-bank/case-bank-cli.js validate
 */

const fs = require('node:fs');
const path = require('node:path');

const caseBankDir = path.join(__dirname);
const indexPath = path.join(caseBankDir, 'index.json');
const casesDir = path.join(caseBankDir, 'cases');

if (!fs.existsSync(indexPath)) {
  console.error(`❌ Case-bank index not found at: ${indexPath}`);
  process.exit(1);
}

const rawIndex = fs.readFileSync(indexPath, 'utf-8');
const catalog = JSON.parse(rawIndex);

const action = process.argv[2] || 'list';
const query = process.argv[3] || '';

switch (action) {
  case 'list': {
    console.log('\n======================================================');
    console.log(`        CASE-BANK CATALOG (Total: ${catalog.cases.length} cases)`);
    console.log('======================================================');
    catalog.cases.forEach((c, idx) => {
      console.log(`[${idx + 1}] ID       : ${c.case_id}`);
      console.log(`    Title    : ${c.title}`);
      console.log(`    Category : [${c.category.toUpperCase()}] | Status: ${c.status}`);
      console.log(`    Tags     : ${c.domain_tags.join(', ')}`);
      console.log(`    File     : 04-case-bank/${c.file}`);
      console.log('------------------------------------------------------');
    });
    break;
  }

  case 'search': {
    if (!query) {
      console.error('Usage: node case-bank-cli.js search <keyword>');
      process.exit(1);
    }
    const q = query.toLowerCase();
    const matched = catalog.cases.filter(c => {
      return (
        c.case_id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.domain_tags.some(tag => tag.toLowerCase().includes(q))
      );
    });

    console.log(`\n🔍 Search results for query "${query}" (${matched.length} found):`);
    console.log('======================================================');
    matched.forEach(c => {
      console.log(`• [${c.category.toUpperCase()}] ${c.title}`);
      console.log(`  ID  : ${c.case_id}`);
      console.log(`  File: 04-case-bank/${c.file}`);
      console.log(`  Tags: ${c.domain_tags.join(', ')}`);
      console.log('------------------------------------------------------');
    });
    break;
  }

  case 'validate': {
    console.log('\n🔎 Validating Case-Bank integrity and file existence...');
    let errors = 0;
    catalog.cases.forEach(c => {
      const targetFile = path.join(caseBankDir, c.file);
      if (!fs.existsSync(targetFile)) {
        console.error(`❌ Missing case file: ${targetFile}`);
        errors++;
      } else {
        const content = fs.readFileSync(targetFile, 'utf-8');
        if (!content.includes(c.case_id)) {
          console.error(`⚠️ Case file ${c.file} does not contain declared case_id ${c.case_id}`);
          errors++;
        }
      }
    });

    if (errors === 0) {
      console.log(`✅ All ${catalog.cases.length} cases exist and match index.json!\n`);
    } else {
      console.error(`❌ Validation failed with ${errors} errors.\n`);
      process.exit(1);
    }
    break;
  }

  default:
    console.log('Unknown command. Available commands: list, search <query>, validate');
    break;
}
