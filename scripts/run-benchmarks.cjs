#!/usr/bin/env node
/*
 * Runs Playwright benchmarks multiple times and stores per-run results
 * together with machine + git metadata. Used for cross-machine comparison
 * and tracking changes across commits.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync, execSync } = require('child_process');

const DEFAULT_RUNS = 10;
const VALID_SCOPES = new Set(['small', 'mid', 'large']);

const PW_TMP_RESULTS = path.join(
  os.tmpdir(),
  'umap-bench-playwright-output',
  'results.json'
);

const OUT_DIR = path.join(process.cwd(), 'bench', 'results');

// "sequence" and "full" are treated as special WASM modes.
// They are passed through WASM_FEATURES as literal values.
const WASM_MODES = new Set(['sequence', 'full']);
const WASM_MODE_LABELS = {
  sequence: 'dist -> tree -> matrix -> nn -> opt',
  full: 'js -> dist -> tree -> matrix -> nn -> opt -> all',
};

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeReadFile(filePath, encoding = 'utf-8') {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, encoding);
  } catch {
    return null;
  }
}

function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}

function safeRm(targetPath, opts) {
  try {
    if (fs.existsSync(targetPath)) fs.rmSync(targetPath, opts);
  } catch {
    // ignore
  }
}

function parseArgsAndEnv() {
  const args = process.argv.slice(2);

  const config = {
    runs: DEFAULT_RUNS,
    scope: null, // 'small' | 'mid' | 'large'
    wasm: 'none', // 'none' | string | 'sequence' | 'full'
    preloadWasm: true, // default on; can be disabled via flag/env
  };

  // CLI args
  for (const arg of args) {
    if (arg.startsWith('--runs=')) {
      const n = Number(arg.split('=')[1]);
      if (Number.isFinite(n) && n > 0) config.runs = Math.floor(n);
      continue;
    }

    if (arg.startsWith('--scope=')) {
      const scope = arg.split('=')[1];
      if (VALID_SCOPES.has(scope)) config.scope = scope;
      continue;
    }

    // Older usage: --wasm defaults to "all"
    if (arg === '--wasm') {
      config.wasm = 'all';
      continue;
    }

    if (arg === '--preload-wasm') {
      config.preloadWasm = true;
      continue;
    }

    if (arg === '--no-preload-wasm') {
      config.preloadWasm = false;
      continue;
    }

    if (arg.startsWith('--wasm=')) {
      const value = (arg.split('=')[1] || '').trim();
      if (!value) continue;
      config.wasm = value;
      continue;
    }
  }

  // Env overrides
  if (process.env.RUNS) {
    const n = Number(process.env.RUNS);
    if (Number.isFinite(n) && n > 0) config.runs = Math.floor(n);
  }

  if (process.env.BENCH_SCOPE && VALID_SCOPES.has(process.env.BENCH_SCOPE)) {
    config.scope = process.env.BENCH_SCOPE;
  }

  if (process.env.WASM_FEATURES) {
    const value = process.env.WASM_FEATURES.trim();
    if (value) config.wasm = value;
  }

  if (process.env.PRELOAD_WASM) {
    const raw = process.env.PRELOAD_WASM.trim().toLowerCase();
    if (raw) {
      config.preloadWasm = ['1', 'true', 'yes'].includes(raw);
    }
  }

  return config;
}

function getGitMeta() {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
    }).trim();
    const statusDirty =
      execSync('git status --short', { encoding: 'utf-8' }).trim().length > 0;

    return { commit, branch, statusDirty };
  } catch {
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
  const args = ['playwright', 'test'];
  if (scope && VALID_SCOPES.has(scope)) {
    args.push('--grep', `@${scope}`);
  }
  return args;
}

// Playwright stores benchmark metrics as test attachments.
// Each run may produce multiple metrics entries.
function extractUiMetrics(summary) {
  const collected = [];

  const readAttachmentJson = (att) => {
    if (!att) return null;

    // Attachments can be inline (base64) or written to disk.
    if (att.body) {
      const raw = Buffer.from(att.body, 'base64').toString('utf-8');
      return safeJsonParse(raw);
    }

    if (att.path) {
      const raw = safeReadFile(att.path, 'utf-8');
      return raw ? safeJsonParse(raw) : null;
    }

    return null;
  };

  const walkSuite = (suite) => {
    if (!suite) return;

    if (Array.isArray(suite.suites)) suite.suites.forEach(walkSuite);

    if (!Array.isArray(suite.specs)) return;
    for (const spec of suite.specs) {
      if (!Array.isArray(spec.tests)) continue;

      for (const test of spec.tests) {
        if (!Array.isArray(test.results)) continue;

        for (const result of test.results) {
          const attachments = result.attachments || [];
          for (const att of attachments) {
            if (att.name !== 'benchmark-metrics') continue;
            const parsed = readAttachmentJson(att);
            if (parsed) collected.push(parsed);
          }
        }
      }
    }
  };

  if (summary && Array.isArray(summary.suites)) {
    summary.suites.forEach(walkSuite);
  }

  return collected;
}

function readPlaywrightTmpSummary() {
  const raw = safeReadFile(PW_TMP_RESULTS, 'utf-8');
  if (!raw) return null;

  // Each run should be isolated; remove tmp file after reading.
  safeUnlink(PW_TMP_RESULTS);

  return safeJsonParse(raw) || null;
}

// Some Playwright setups exit with code 1 even when results were produced.
// Treat 0 and 1 as usable runs.
function interpretExitCode(exitCode) {
  const success = exitCode === 0 || exitCode === 1;
  const resultLabel =
    exitCode === 0 ? 'PASS' : exitCode === 1 ? 'PASS (nonzero exit)' : 'FAIL';
  return { success, resultLabel };
}

function runPlaywrightOnce({ runIndex, scope, wasmFeatures, preloadWasm }) {
  safeUnlink(PW_TMP_RESULTS);

  const start = Date.now();
  const args = buildPlaywrightArgs(scope);

  const result = spawnSync('npx', args, {
    encoding: 'utf-8',
    env: {
      ...process.env,
      ...(wasmFeatures && wasmFeatures !== 'none'
        ? { WASM_FEATURES: wasmFeatures }
        : {}),
      ...(preloadWasm ? { PRELOAD_WASM: '1' } : {}),
    },
    stdio: ['ignore', 'inherit', 'pipe'],
  });

  const durationMs = Date.now() - start;
  const summary = readPlaywrightTmpSummary();
  const uiMetrics = summary ? extractUiMetrics(summary) : [];

  const exitCode = result.status;
  const { success, resultLabel } = interpretExitCode(exitCode);

  return {
    run: runIndex,
    wasmFeatures: wasmFeatures ?? 'none',
    success,
    exitCode,
    durationMs,
    stats: summary?.stats ?? null,
    status: summary?.status ?? null,
    errors: summary?.errors ?? [],
    uiMetrics,
    resultLabel,
    stdoutPreview: '',
    stderrPreview: (result.stderr || '').slice(0, 2000),
  };
}

function ensureOutFile() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const timestamp = Date.now();
  return path.join(OUT_DIR, `bench-runs-${timestamp}.json`);
}

function writePayload(outFile, payload) {
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
}

function maybeEmbedPlaywrightJson(payload) {
  try {
    const pwResults = path.join(process.cwd(), 'playwright-results', 'results.json');
    const raw = safeReadFile(pwResults, 'utf-8');
    if (!raw) return;

    payload.playwright = safeJsonParse(raw) || { raw };

    // Keep only the combined output file.
    safeRm(pwResults, { force: true });
  } catch {
    // ignore
  }
}

// Keep repo clean — HTML reports are not needed for benchmarks.
function cleanupPlaywrightArtifacts() {
  const pwReportDir = path.join(process.cwd(), 'playwright-report');
  safeRm(pwReportDir, { recursive: true, force: true });
}

function logConfig({ runs, scope, wasm, preloadWasm }) {
  console.log(`Running Playwright benchmark suite ${runs} time(s)...`);
  if (scope) console.log(`Scope: ${scope}`);

  if (WASM_MODES.has(wasm)) {
    console.log(`WASM ${wasm}: ${WASM_MODE_LABELS[wasm]}`);
  } else if (wasm && wasm !== 'none') {
    console.log(`WASM features: ${wasm}`);
  }

  console.log(`WASM preload: ${preloadWasm ? 'enabled' : 'disabled'}`);
}

function main() {
  const config = parseArgsAndEnv();
  logConfig(config);

  const outFile = ensureOutFile();
  const runResults = [];

  if (!process.env.SKIP_BUILD) {
    console.log('Building benchmark app once before runs...');
    execSync('yarn build', { stdio: 'inherit' });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    runs: config.runs,
    machine: getMachineInfo(),
    git: getGitMeta(),
    wasmFeatures: config.wasm,
    wasmPreload: config.preloadWasm,
    results: runResults,
  };

  // Preserve partial results if the process crashes mid-run.
  writePayload(outFile, payload);

  for (let i = 1; i <= config.runs; i++) {
    const header = WASM_MODES.has(config.wasm)
      ? `--- Run ${i}/${config.runs} (WASM ${config.wasm}) ---`
      : `--- Run ${i}/${config.runs} ---`;

    console.log(`\n${header}`);

    const res = runPlaywrightOnce({
      runIndex: i,
      scope: config.scope,
      wasmFeatures: config.wasm,
      preloadWasm: config.preloadWasm,
    });

    runResults.push(res);

    console.log(`Result: ${res.resultLabel} in ${res.durationMs} ms`);
    if (!res.success) console.log('stderr preview:', res.stderrPreview);

    writePayload(outFile, payload);
  }

  maybeEmbedPlaywrightJson(payload);
  writePayload(outFile, payload);

  cleanupPlaywrightArtifacts();

  console.log(`\nSaved run data to ${outFile}`);
}

main();
