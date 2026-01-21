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
const VALID_SCOPES = new Set(['small', 'mid', 'large']);

function extractUiMetrics(summary) {
  const collected = [];

  const readAttachment = (att) => {
    if (!att) return null;
    if (att.body) {
      try {
        const raw = Buffer.from(att.body, 'base64').toString('utf-8');
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    if (att.path && fs.existsSync(att.path)) {
      try {
        const raw = fs.readFileSync(att.path, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const walkSuites = (suite) => {
    if (!suite) return;
    if (suite.suites) suite.suites.forEach(walkSuites);
    if (suite.specs) {
      for (const spec of suite.specs) {
        if (!spec.tests) continue;
        for (const test of spec.tests) {
          if (!test.results) continue;
          for (const result of test.results) {
            const attachments = result.attachments || [];
            for (const att of attachments) {
              if (att.name === 'benchmark-metrics') {
                const parsed = readAttachment(att);
                if (parsed) collected.push(parsed);
              }
            }
          }
        }
      }
    }
  };

  if (summary && summary.suites) {
    summary.suites.forEach(walkSuites);
  }

  return collected;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { runs: DEFAULT_RUNS, scope: null, wasmFeatures: null };
  for (const arg of args) {
    if (arg.startsWith('--runs=')) {
      const n = Number(arg.split('=')[1]);
      if (Number.isFinite(n) && n > 0) result.runs = Math.floor(n);
    }
    if (arg.startsWith('--scope=')) {
      const scope = arg.split('=')[1];
      if (VALID_SCOPES.has(scope)) result.scope = scope;
    }
    if (arg === '--wasm') {
      result.wasmFeatures = 'all';
    }
    if (arg.startsWith('--wasm=')) {
      const value = arg.split('=')[1];
      if (value && value.trim().length > 0) result.wasmFeatures = value.trim();
    }
  }
  if (process.env.RUNS) {
    const n = Number(process.env.RUNS);
    if (Number.isFinite(n) && n > 0) result.runs = Math.floor(n);
  }
  if (process.env.BENCH_SCOPE && VALID_SCOPES.has(process.env.BENCH_SCOPE)) {
    result.scope = process.env.BENCH_SCOPE;
  }
  if (process.env.WASM_FEATURES) {
    result.wasmFeatures = process.env.WASM_FEATURES.trim();
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

function buildPlaywrightArgs(scope) {
  const base = ['playwright', 'test', '--reporter=json'];
  if (scope && VALID_SCOPES.has(scope)) {
    base.push('--grep', `@${scope}`);
  }
  return base;
}

function runPlaywrightOnce(runIndex, scope, wasmFeatures) {
  const start = Date.now();
  const args = buildPlaywrightArgs(scope);
  const result = spawnSync('npx', args, {
    encoding: 'utf-8',
    env: {
      ...process.env,
      ...(wasmFeatures ? { WASM_FEATURES: wasmFeatures } : {}),
    },
    stdio: 'pipe',
  });
  const durationMs = Date.now() - start;

  let summary = null;
  try {
    summary = JSON.parse(result.stdout || '{}');
  } catch (e) {
    summary = null;
  }

  const uiMetrics = summary ? extractUiMetrics(summary) : [];

  return {
    run: runIndex,
    success: result.status === 0,
    exitCode: result.status,
    durationMs,
    stats: summary?.stats ?? null,
    status: summary?.status ?? null,
    errors: summary?.errors ?? [],
    uiMetrics,
    stdoutPreview: (result.stdout || '').slice(0, 2000),
    stderrPreview: (result.stderr || '').slice(0, 2000),
  };
}

function main() {
  const { runs, scope, wasmFeatures } = parseArgs();
  const runResults = [];

  console.log(`Running Playwright benchmark suite ${runs} time(s)...`);
  if (scope) console.log(`Scope: ${scope}`);
  if (wasmFeatures) console.log(`WASM features: ${wasmFeatures}`);

  const outDir = path.join(process.cwd(), 'bench', 'results');
  fs.mkdirSync(outDir, { recursive: true });
  const timestamp = Date.now();
  const outFile = path.join(outDir, `bench-runs-${timestamp}.json`);

  const payload = {
    generatedAt: new Date().toISOString(),
    runs,
    machine: getMachineInfo(),
    git: getGitMeta(),
    wasmFeatures: wasmFeatures ?? 'none',
    results: runResults,
  };

  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));

  for (let i = 1; i <= runs; i++) {
    console.log(`\n--- Run ${i}/${runs} ---`);
    const res = runPlaywrightOnce(i, scope, wasmFeatures);
    runResults.push(res);
    console.log(`Result: ${res.success ? 'PASS' : 'FAIL'} in ${res.durationMs} ms`);
    if (!res.success) {
      console.log('stderr preview:', res.stderrPreview);
    }

    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
  }

  // If Playwright wrote a JSON report, embed it into our payload
  try {
    const pwResults = path.join(process.cwd(), 'playwright-results', 'results.json');
    if (fs.existsSync(pwResults)) {
      const data = fs.readFileSync(pwResults, 'utf-8');
      try {
        payload.playwright = JSON.parse(data);
      } catch (e) {
        payload.playwright = { raw: data };
      }
      // remove the playwright-results file so only our file remains
      try { fs.rmSync(pwResults, { force: true }); } catch (e) { }
    }
  } catch (e) {
    // ignore
  }
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));

  // Remove Playwright HTML report folder (if present) to avoid clutter
  try {
    const pwReportDir = path.join(process.cwd(), 'playwright-report');
    if (fs.existsSync(pwReportDir)) {
      fs.rmSync(pwReportDir, { recursive: true, force: true });
    }
  } catch (e) {
    // ignore
  }

  console.log(`\nSaved run data to ${outFile}`);
}

main();
