#!/usr/bin/env node
/*
 * Run Playwright benchmark tests multiple times and capture per-run stats
 * plus machine metadata for cross-machine comparison.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync, execSync } = require('child_process');

const DEFAULT_RUNS = 10;

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { runs: DEFAULT_RUNS };
  for (const arg of args) {
    if (arg.startsWith('--runs=')) {
      const n = Number(arg.split('=')[1]);
      if (Number.isFinite(n) && n > 0) result.runs = Math.floor(n);
    }
  }
  if (process.env.RUNS) {
    const n = Number(process.env.RUNS);
    if (Number.isFinite(n) && n > 0) result.runs = Math.floor(n);
  }
  return result;
}

function getGitMeta() {
  try {
    return {
      commit: execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim(),
      statusDirty: execSync('git status --short', { encoding: 'utf-8' }).trim().length > 0,
    };
  } catch (e) {
    return null;
  }
}

function getMachineInfo() {
  const cpus = os.cpus() || [];
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuModel: cpus[0]?.model ?? 'unknown',
    cpuCores: cpus.length,
    totalMemBytes: os.totalmem(),
    loadAvg: os.loadavg(),
    hostname: os.hostname(),
  };
}

function runPlaywrightOnce(runIndex) {
  const start = Date.now();
  const result = spawnSync('npx', ['playwright', 'test', '--reporter=json'], {
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  const durationMs = Date.now() - start;

  let summary = null;
  try {
    summary = JSON.parse(result.stdout || '{}');
  } catch (e) {
    summary = null;
  }

  return {
    run: runIndex,
    success: result.status === 0,
    exitCode: result.status,
    durationMs,
    stats: summary?.stats ?? null,
    status: summary?.status ?? null,
    errors: summary?.errors ?? [],
    stdoutPreview: (result.stdout || '').slice(0, 2000),
    stderrPreview: (result.stderr || '').slice(0, 2000),
  };
}

function main() {
  const { runs } = parseArgs();
  const runResults = [];

  console.log(`Running Playwright benchmark suite ${runs} time(s)...`);

  for (let i = 1; i <= runs; i++) {
    console.log(`\n--- Run ${i}/${runs} ---`);
    const res = runPlaywrightOnce(i);
    runResults.push(res);
    console.log(`Result: ${res.success ? 'PASS' : 'FAIL'} in ${res.durationMs} ms`);
    if (!res.success) {
      console.log('stderr preview:', res.stderrPreview);
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    runs,
    machine: getMachineInfo(),
    git: getGitMeta(),
    results: runResults,
  };

  const outDir = path.join(process.cwd(), 'test-results');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `bench-runs-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));

  console.log(`\nSaved run data to ${outFile}`);
}

main();
