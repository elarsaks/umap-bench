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
}

export interface WasmRelease {
  tag: string;
  name: string;
  releaseUrl: string;
  sourceZipUrl: string;
  notes?: string;
}
