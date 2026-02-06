export interface BenchmarkResult {
  runtime: number;
  memoryUsage: number;
  embeddingQuality: number;
  visualizationFPS: number;
  responsiveness: number;
  datasetSize: number;
  dimensions: number;
  wasmConfig: WasmConfig;
  timestamp: Date;
}

export interface BenchmarkExportRow {
  /** Sequential index of dataset within this benchmark run (1-based) */
  datasetIndex: number;
  timestamp: string;
  datasetName: string;
  datasetSize: number;
  dimensions: number;
  /** "none" for JS, or comma-separated features like "Dist,Tree,Matrix,NN,Opt" */
  wasmFeatures: string;
  runtimeMs: number;
  memoryDeltaMb: number;
  trustworthiness: number;
  fpsAvg: number;
  responsivenessMs: number;
}

export interface PerformanceMetrics {
  start: number;
  end: number;
  memoryBefore: number;
  memoryAfter: number;
  eventLatencies: number[];
}

export interface DatasetConfig {
  name: string;
  size: number;
  dimensions: number;
  generator: () => number[][];
}

export interface UMAPConfig {
  nNeighbors: number;
  minDist: number;
  nComponents: number;
  spread: number;
  learningRate: number;
}

export interface WasmConfig {
  useWasmDistance: boolean;
  useWasmTree: boolean;
  useWasmMatrix: boolean;
  useWasmNNDescent: boolean;
  useWasmOptimizer: boolean;
}

export interface WasmRelease {
  tag: string;
  name: string;
  releaseUrl: string;
  sourceZipUrl: string;
  notes?: string;
}

declare global {
  interface Window {
    __BENCH_EXPORT__?: BenchmarkExportRow[];
    __BENCH_CONTEXT__?: { 
      scope?: string; 
      runTimeoutMs?: number;
      renderingEnabled?: boolean;
    };
    __BENCH_PROGRESS__?: { epoch: number; elapsedMs: number } | null;
  }
}
