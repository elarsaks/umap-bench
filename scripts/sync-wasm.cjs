#!/usr/bin/env node
/* Sync the wasm web package from node_modules into public/wasm. */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const src = path.join(
  root,
  'node_modules',
  '@elarsaks',
  'umap-wasm',
  'wasm',
  'pkg',
  'web'
);
const dest = path.join(root, 'public', 'wasm', 'pkg', 'web');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(srcDir, destDir) {
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(src)) {
  console.error(`[sync-wasm] Missing source path: ${src}`);
  process.exit(1);
}

copyDir(src, dest);
console.log(`[sync-wasm] Copied WASM package to ${dest}`);
