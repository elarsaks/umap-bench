/**
 * Bench library - shared utilities for benchmark tests and analysis.
 */

// Types for JSON output schema
export type {
  MachineInfo,
  GitMeta,
  PlaywrightStats,
  BenchmarkMetric,
  BenchmarkRunResult,
  BenchmarkOutput,
} from './types';

// WASM configuration utilities
export {
  type WasmConfigSelection,
  getWasmConfigFromEnv,
  getWasmConfigsFromEnv,
  applyWasmConfig,
} from './wasm-config';

// Page interaction helpers
export {
  datasetSelect,
  runButton,
  clearButton,
  shouldPreloadWasm,
  getEnvTimeout,
  attachPageDiagnostics,
  preloadWasm,
  waitForWasmReady,
  runBenchmarkAndWait,
  clearResults,
  expectDatasetSummary,
  setBenchContext,
  needsWasm,
  attachBenchmarkMetrics,
} from './page-helpers';
