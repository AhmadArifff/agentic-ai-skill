/**
 * Autonomous Bootstrap & Verification Runner for antislop-human
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Initializing antislop-human (Human Accessibility & WCAG Contrast) ===');

try {
  const skillMdPath = path.join(__dirname, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    throw new Error('SKILL.md not found in ' + __dirname);
  }
  console.log('✅ [1/3] SKILL.md specification verified.');

  const contrastScript = path.join(__dirname, 'contrast-check.py');
  if (!fs.existsSync(contrastScript)) {
    throw new Error('contrast-check.py not found in ' + __dirname);
  }
  console.log('✅ [2/3] contrast-check.py script located.');

  // Test python contrast selftest
  const out = execSync('python "' + contrastScript + '" --selftest', { encoding: 'utf8' }).trim();
  console.log('✅ [3/3] WCAG Contrast Self-Test passed: ' + out);

  console.log('🎉 [antislop-human] 100% READY for production governance & accessibility audits!\n');
} catch (err) {
  console.error('❌ [antislop-human] Bootstrap failed:', err.message);
  process.exit(1);
}
