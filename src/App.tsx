import { useState, useCallback, useRef, useEffect } from "react";
import type {
  BenchmarkExportRow,
  BenchmarkResult,
  DatasetConfig,
  UMAPConfig,
  WasmConfig,
} from "./types/benchmark";
import {
  generate3DClusteredData,
  generate3DSphericalClusters,
  generate3DHelixClusters,
  generateIrisDataset,
  generateWineDataset,
  generateSwissRoll,
  generateMNISTLike,
} from "./utils/dataGeneration";
import { BenchmarkControls } from "@components/BenchmarkControls";
import { BenchmarkResults } from "@components/BenchmarkResults";
import { VisualizationCanvas } from "@components/VisualizationCanvas";
import { PerformanceMonitor, FPSMonitor } from "@utils/performanceMonitor";
import { calculateTrustworthiness } from "@utils/embeddingQuality";
import "./App.css";

declare global {
  interface Window {
    __WASM_READY__?: boolean;
    __WASM_LOADING__?: boolean;
    __WASM_PROGRESS__?: number;
    __WASM_ENSURE_READY__?: () => Promise<void>;
    __BENCH_PROGRESS__?: { epoch: number; elapsedMs: number } | null;
  }
}

type UmapModule = typeof import("@elarsaks/umap-wasm");
let wasmInitInFlight: Promise<UmapModule> | null = null;

function App() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentEmbedding, setCurrentEmbedding] = useState<number[][]>([]);
  const [currentClusters, setCurrentClusters] = useState<number[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Array<[number, number]>>([]);
  const [currentFPS, setCurrentFPS] = useState(0);
  const runCounter = useRef(1);
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmLoading, setWasmLoading] = useState(false);
  const [wasmProgress, setWasmProgress] = useState(0);
  const [wasmConfig, setWasmConfig] = useState<WasmConfig>({
    useWasmDistance: false,
    useWasmTree: false,
    useWasmMatrix: false,
    useWasmNNDescent: false,
    useWasmOptimizer: false,
  });
  const umapModuleRef = useRef<UmapModule | null>(null);

  const loadUmapModule = useCallback(async (): Promise<UmapModule> => {
    if (umapModuleRef.current) return umapModuleRef.current;
    const mod = await import("@elarsaks/umap-wasm");
    umapModuleRef.current = mod;
    return mod;
  }, []);

  const getWasmUrl = useCallback(() => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const origin =
      typeof window !== "undefined" && window.location
        ? window.location.origin
        : "";
    return new URL(
      "wasm/pkg/web/umap_wasm_core_bg.wasm",
      origin + baseUrl
    ).toString();
  }, []);

  const ensureWasmReady = useCallback(async () => {
    if (wasmInitInFlight) {
      return wasmInitInFlight;
    }

    const initPromise = (async () => {
      const mod = await loadUmapModule();
      if (!mod.isWasmAvailable()) {
        setWasmLoading(true);
        setWasmProgress(0);
        if (typeof window !== "undefined") {
          window.__WASM_LOADING__ = true;
          window.__WASM_PROGRESS__ = 0;
        }

        const runInit = async () => {
          await mod.initWasm({
            wasmUrl: getWasmUrl(),
            onProgress: (progress) => {
              let next: number | null = null;
              if (typeof progress?.percent === "number") {
                next = Math.min(99, Math.max(1, Math.floor(progress.percent)));
              } else if (progress?.phase === "instantiate") {
                next = 95;
              } else if (progress?.phase === "done") {
                next = 100;
              }
              if (next === null) return;
              setWasmProgress((prev) => {
                const updated = next > prev ? next : prev;
                if (typeof window !== "undefined") {
                  window.__WASM_PROGRESS__ = updated;
                }
                return updated;
              });
            },
          });
        };

        try {
          const maxAttempts = 2;
          let lastErr: unknown = null;
          for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
              await runInit();
              lastErr = null;
              break;
            } catch (err) {
              lastErr = err;
              if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 300));
              }
            }
          }
          if (lastErr) {
            throw lastErr;
          }
        } catch (err) {
          setWasmLoading(false);
          setWasmProgress(0);
          if (typeof window !== "undefined") {
            window.__WASM_LOADING__ = false;
            window.__WASM_PROGRESS__ = 0;
            window.__WASM_READY__ = false;
          }
          throw err;
        }
      }
      const ready = mod.isWasmAvailable();
      setWasmReady(ready);
      if (ready) {
        setWasmProgress(100);
        setWasmLoading(false);
        if (typeof window !== "undefined") {
          window.__WASM_LOADING__ = false;
          window.__WASM_PROGRESS__ = 100;
          window.__WASM_READY__ = true;
        }
      }
      return mod;
    })();

    wasmInitInFlight = initPromise;
    try {
      return await initPromise;
    } finally {
      wasmInitInFlight = null;
    }
  }, [getWasmUrl, loadUmapModule]);

  useEffect(() => {
    ensureWasmReady().catch((err) => {
      console.warn("WASM initialization failed:", err);
    });
  }, [ensureWasmReady]);

  useEffect(() => {
    const needsWasm = Object.values(wasmConfig).some(Boolean);
    if (!needsWasm || wasmReady) return;
    ensureWasmReady().catch((err) => {
      console.warn("WASM initialization failed:", err);
    });
  }, [ensureWasmReady, wasmConfig, wasmReady]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__WASM_READY__ = wasmReady;
    }
  }, [wasmReady]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__WASM_LOADING__ = wasmLoading;
    }
  }, [wasmLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__WASM_ENSURE_READY__ = async () => {
        await ensureWasmReady();
      };
    }
  }, [ensureWasmReady]);

  const runBenchmark = useCallback(
    async (
      datasetConfig: DatasetConfig,
      umapConfig: UMAPConfig,
      config: WasmConfig,
      renderingEnabled: boolean
    ) => {
      const mod = await loadUmapModule();
      const { UMAP, isWasmAvailable } = mod;
      // Check if WASM features are requested but WASM is not available
      const needsWasm =
        config.useWasmDistance ||
        config.useWasmTree ||
        config.useWasmMatrix ||
        config.useWasmNNDescent ||
        config.useWasmOptimizer;
      if (needsWasm && !isWasmAvailable()) {
        try {
          await ensureWasmReady();
        } catch (err) {
          alert(
            "WASM initialization failed. Please disable WASM features or try again."
          );
          return;
        }
      }

      setIsRunning(true);

      try {
        // Generate dataset
        const originalData = datasetConfig.generator();

        // Generate 3D cluster/edge data for visualization based on dataset name
        let clusters: number[] = [];
        let edges: Array<[number, number]> = [];

        if (datasetConfig.name.includes("Iris Dataset")) {
          const clusteredData = generateIrisDataset();
          clusters = clusteredData.clusters;
          edges = clusteredData.edges;
        } else if (datasetConfig.name.includes("Wine Dataset")) {
          const clusteredData = generateWineDataset();
          clusters = clusteredData.clusters;
          edges = clusteredData.edges;
        } else if (datasetConfig.name.includes("Swiss Roll")) {
          const clusteredData = generateSwissRoll(datasetConfig.size);
          clusters = clusteredData.clusters;
          edges = clusteredData.edges;
        } else if (datasetConfig.name.includes("MNIST-like")) {
          const clusteredData = generateMNISTLike(datasetConfig.size);
          clusters = clusteredData.clusters;
          edges = clusteredData.edges;
        } else if (datasetConfig.name.includes("3D Spherical")) {
          const clusteredData = generate3DSphericalClusters(
            datasetConfig.size,
            4
          );
          clusters = clusteredData.clusters;
          edges = clusteredData.edges;
        } else if (datasetConfig.name.includes("3D Helix")) {
          const clusteredData = generate3DHelixClusters(datasetConfig.size);
          clusters = clusteredData.clusters;
          edges = clusteredData.edges;
        } else if (
          datasetConfig.name.includes("3D Dense") ||
          datasetConfig.name.includes("3D")
        ) {
          const clusteredData = generate3DClusteredData(datasetConfig.size, 5);
          clusters = clusteredData.clusters;
          edges = clusteredData.edges;
        } else {
          // Generate simple clusters for non-3D datasets
          clusters = Array.from({ length: datasetConfig.size }, () =>
            Math.floor(Math.random() * 3)
          );
        }

        // Initialize performance monitoring
        const perfMonitor = new PerformanceMonitor();
        const fpsMonitor = new FPSMonitor();

        // Start monitoring
        perfMonitor.startMonitoring();

        // Measure FPS during computation (only if rendering is enabled)
        let visualizationFPS = 0;
        if (renderingEnabled) {
          fpsMonitor.start((fps) => {
            visualizationFPS = fps;
            setCurrentFPS(fps);
          });
        } else {
          setCurrentFPS(0);
        }

        // Run UMAP
        const umap = new UMAP({
          nNeighbors: umapConfig.nNeighbors,
          minDist: umapConfig.minDist,
          nComponents: umapConfig.nComponents,
          spread: umapConfig.spread,
          learningRate: umapConfig.learningRate,
          useWasmDistance: config.useWasmDistance,
          useWasmTree: config.useWasmTree,
          useWasmMatrix: config.useWasmMatrix,
          useWasmNNDescent: config.useWasmNNDescent,
          useWasmOptimizer: config.useWasmOptimizer,
        });

        const benchContext = window.__BENCH_CONTEXT__ ?? {};
        const maxRunMs =
          typeof benchContext.runTimeoutMs === "number"
            ? benchContext.runTimeoutMs
            : null;
        let aborted = false;
        const runStart = performance.now();
        if (typeof window !== "undefined") {
          window.__BENCH_PROGRESS__ = { epoch: 0, elapsedMs: 0 };
        }
        const embeddedData = await umap.fitAsync(originalData, (epoch) => {
          const elapsedMs = Math.round(performance.now() - runStart);
          if (typeof window !== "undefined") {
            window.__BENCH_PROGRESS__ = { epoch, elapsedMs };
          }
          if (maxRunMs !== null && elapsedMs > maxRunMs) {
            aborted = true;
            return false;
          }
          return true;
        });
        if (aborted) {
          throw new Error(
            `Benchmark aborted after ${Math.round(
              (performance.now() - runStart) / 1000
            )}s`
          );
        }

        // Stop FPS monitoring (only if it was started)
        if (renderingEnabled) {
          fpsMonitor.stop();
        }

        // End performance monitoring
        const metrics = perfMonitor.endMonitoring();

        // Calculate embedding quality
        const trustworthiness = calculateTrustworthiness(
          originalData,
          embeddedData
        );

        // Calculate metrics
        const runtime = metrics.end - metrics.start;
        const memoryUsage = metrics.memoryAfter - metrics.memoryBefore;
        const responsiveness = PerformanceMonitor.getAverageEventLatency(
          metrics.eventLatencies
        );

        // Create result
        const result: BenchmarkResult = {
          runtime,
          memoryUsage,
          embeddingQuality: trustworthiness,
          visualizationFPS,
          responsiveness,
          datasetSize: datasetConfig.size,
          dimensions: datasetConfig.dimensions,
          wasmConfig: config,
          timestamp: new Date(),
        };

        const wasmFeatureList = [
          config.useWasmDistance ? "Dist" : null,
          config.useWasmTree ? "Tree" : null,
          config.useWasmMatrix ? "Matrix" : null,
          config.useWasmNNDescent ? "NN" : null,
          config.useWasmOptimizer ? "Opt" : null,
        ].filter(Boolean);
        const wasmEnabled = wasmFeatureList.length > 0;
        const wasmFeatures = wasmEnabled ? wasmFeatureList.join(",") : "none";

        const exportRow: BenchmarkExportRow = {
          datasetIndex: runCounter.current++,
          timestamp: new Date().toISOString(),
          datasetName: datasetConfig.name,
          datasetSize: datasetConfig.size,
          dimensions: datasetConfig.dimensions,
          wasmFeatures,
          renderingEnabled,
          runtimeMs: runtime,
          memoryDeltaMb: memoryUsage,
          trustworthiness,
          fpsAvg: visualizationFPS,
          responsivenessMs: responsiveness,
        };
        if (!window.__BENCH_EXPORT__) window.__BENCH_EXPORT__ = [];
        window.__BENCH_EXPORT__.push(exportRow);

        // Update state
        setResults((prev) => [...prev, result]);
        // Update visualization only if rendering is enabled
        if (renderingEnabled) {
          setCurrentEmbedding(embeddedData);
          setCurrentClusters(clusters);
          setCurrentEdges(edges);
        } else {
          // Clear visualization when rendering is disabled
          setCurrentEmbedding([]);
          setCurrentClusters([]);
          setCurrentEdges([]);
        }
      } catch (error) {
        console.error("Benchmark failed:", error);
        if (typeof window !== "undefined" && !window.__BENCH_CONTEXT__?.scope) {
          alert("Benchmark failed. Check console for details.");
        }
      } finally {
        if (typeof window !== "undefined") {
          window.__BENCH_PROGRESS__ = null;
        }
        setIsRunning(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setCurrentEmbedding([]);
    setCurrentClusters([]);
    setCurrentEdges([]);
    setCurrentFPS(0);
    runCounter.current = 1;
    window.__BENCH_EXPORT__ = [];
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>UMAP Performance Benchmark</h1>
        <p>
          Comprehensive performance testing for UMAP.js with real-time metrics
        </p>
        <button 
          className="analysis-button"
          onClick={() => {
            const baseUrl = import.meta.env.BASE_URL || '/';
            window.open(`${baseUrl}analysis.html`, '_blank');
          }}
          title="View detailed performance analysis"
        >
          📊 View Analysis Report
        </button>
      </header>

      <div className="app-content">
        <div className="controls-section">
          <BenchmarkControls
            onRunBenchmark={runBenchmark}
            isRunning={isRunning}
            wasmReady={wasmReady}
            wasmLoading={wasmLoading}
            wasmProgress={wasmProgress}
            wasmConfig={wasmConfig}
            onUpdateWasmConfig={setWasmConfig}
            onClearResults={clearResults}
          />
        </div>

        <div className="visualization-section">
          <h3>UMAP Embedding Visualization</h3>
          {currentEmbedding.length > 0 ? (
            <div>
              <VisualizationCanvas
                data={currentEmbedding}
                clusters={currentClusters}
                edges={currentEdges}
              />
              <div className="fps-indicator">
                3D Plotly Visualization (FPS: {currentFPS.toFixed(1)})
              </div>
            </div>
          ) : isRunning ? (
            <div className="no-visualization">
              <p>Benchmark running...</p>
              <p className="hint" style={{ fontSize: '0.9em', opacity: 0.7 }}>
                {currentFPS === 0 
                  ? '⚡ Rendering disabled for optimal performance' 
                  : 'Visualization will appear after benchmark completes'}
              </p>
            </div>
          ) : (
            <div className="no-visualization">
              <p>Run a benchmark to see the UMAP embedding visualization</p>
              <p className="hint" style={{ fontSize: '0.9em', opacity: 0.7 }}>
                Enable the visualization checkbox above for 3D rendering
              </p>
            </div>
          )}
        </div>

        <div className="results-section">
          <BenchmarkResults results={results} isRunning={isRunning} />
        </div>
      </div>
    </div>
  );
}

export default App;
