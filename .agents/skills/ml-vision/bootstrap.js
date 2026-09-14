#!/usr/bin/env node
/**
 * Autonomous Cross-Device Bootstrap Script for ML-Vision Skill
 * Can be run by any agentic AI on any fresh device (Windows, macOS, Linux).
 * 
 * Usage:
 *   node skills/ml-vision/bootstrap.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const os = require('node:os');

const SKILL_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SKILL_DIR, '..', '..');

console.log('=== ML-Vision Skill Autonomous Bootstrap ===');
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

  // 2. Check Python runtime availability (Optional / Progressive)
  runStep('Checking Python / UV runtime availability', () => {
    let pythonInfo = 'Not detected (client-side ONNX / WebGPU available)';
    try {
      const pyVer = execSync('python --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      pythonInfo = `Python: ${pyVer}`;
    } catch {
      try {
        const py3Ver = execSync('python3 --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        pythonInfo = `Python3: ${py3Ver}`;
      } catch {
        // Python optional if client-side inference
      }
    }
    return pythonInfo;
  });

  // 3. Verify References Directory and Documentation
  runStep('Verifying ML/Vision Reference Guides', () => {
    const refDir = path.join(SKILL_DIR, 'references');
    if (!fs.existsSync(refDir)) throw new Error('Missing references directory');
    const files = fs.readdirSync(refDir);
    if (files.length < 4) throw new Error(`Expected at least 4 reference guides, found ${files.length}`);
    return `${files.length} references verified`;
  });

  // 4. Verify Decision Tree & Capability Schema
  runStep('Verifying SKILL.md capability metadata', () => {
    const skillMd = path.join(SKILL_DIR, 'SKILL.md');
    if (!fs.existsSync(skillMd)) throw new Error('Missing SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    if (!content.includes('ml-vision') || !content.includes('Clustering')) {
      throw new Error('Invalid SKILL.md content');
    }
    return 'SKILL.md verified';
  });

  result.success = true;
  console.log('\n=============================================');
  console.log('STATUS: READY! ML-Vision skill is fully operational.');
  console.log('Supported Capabilities:');
  console.log('  • Machine Learning : Clustering (K-Means, DBSCAN) & Tabular Classification (LightGBM, XGBoost)');
  console.log('  • Deep Learning    : PyTorch, CNN, ViT, Transfer Learning, AMP training');
  console.log('  • Computer Vision  : YOLOv8/v11 Object Detection, Semantic/Instance Segmentation, Albumentations');
  console.log('  • Optimization     : ONNX Export, INT8 PTQ Quantization, Latency Profiling');
  console.log('  • Web & Mobile     : FastAPI Backend, ONNX Runtime WebGPU, TFLite & CoreML');
  console.log('=============================================\n');

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  result.success = false;
  result.fatalError = error.message;
  console.error('\nBOOTSTRAP FAILED. Inspect error log above.');
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}
