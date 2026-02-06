/**
 * TypeScript types for benchmark JSON output schema.
 * These types define the structure of bench-runs-*.json files.
 */

/** Machine metadata captured during benchmark run */
export interface MachineInfo {
  platform: string;
  release: string;
  arch: string;
  cpuModel: string;
  cpuCores: number;
  totalMemBytes: number;
  loadAvg: [number, number, number];
  hostname: string;
}

/** Git context at benchmark time */
export interface GitMeta {
  commit: string;
  branch: string;
  statusDirty: boolean;
}

/** Playwright stats for a single run */
export interface PlaywrightStats {
  startTime: string;
  duration: number;
  expected: number;
  skipped: number;
  unexpected: number;
  flaky: number;
}

/** Single benchmark measurement (one dataset) */
export interface BenchmarkMetric {
  datasetIndex: number;
  timestamp: string;
  datasetName: string;
  datasetSize: number;
  dimensions: number;
  wasmFeatures: string;
  runtimeMs: number;
  memoryDeltaMb: number;
  trustworthiness: number;
  fpsAvg: number;
  responsivenessMs: number;
}

/** Result of a single benchmark run */
export interface BenchmarkRunResult {
  run: number;
  success: boolean;
  exitCode: number;
  durationMs: number;
  stats: PlaywrightStats | null;
  errors: string[];
  metrics: BenchmarkMetric[];
  resultLabel: string;
  stderrPreview?: string;
}

/** Top-level benchmark output file */
export interface BenchmarkOutput {
  generatedAt: string;
  runs: number;
  machine: MachineInfo;
  git: GitMeta | null;
  wasmFeatures: string;
  wasmPreload: boolean;
  results: BenchmarkRunResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Window interface extensions for browser-side benchmark globals
// These are set by the benchmark app and read by Playwright tests
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    // WASM loading state
    __WASM_LOADING__?: boolean;
    __WASM_PROGRESS__?: number;
    __WASM_ENSURE_READY__?: () => Promise<void>;

    // Benchmark export data
    __BENCH_EXPORT__?: BenchmarkMetric[];
    __BENCH_CONTEXT__?: {
      scope?: string;
      runTimeoutMs?: number;
      renderingEnabled?: boolean;
    };
    __BENCH_PROGRESS__?: { epoch: number; elapsedMs: number } | null;
  }
}
