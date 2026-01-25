import { useState, useCallback, useEffect, useRef } from "react";
import { UMAP, initWasm, isWasmAvailable } from "@elarsaks/umap-wasm";
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

function App() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentEmbedding, setCurrentEmbedding] = useState<number[][]>([]);
  const [currentClusters, setCurrentClusters] = useState<number[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Array<[number, number]>>([]);
  const [currentFPS, setCurrentFPS] = useState(0);
  const runCounter = useRef(1);
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmConfig, setWasmConfig] = useState<WasmConfig>({
    useWasmDistance: false,
    useWasmTree: false,
    useWasmMatrix: false,
    useWasmNNDescent: false,
    useWasmOptimizer: false,
  });

  // Initialize WASM module on mount
  useEffect(() => {
    initWasm()
      .then(() => {
        setWasmReady(isWasmAvailable());
        console.log("WASM module initialized successfully");
      })
      .catch((err) => {
        setWasmReady(false);
        console.warn("WASM initialization failed:", err);
      });
  }, []);

  const runBenchmark = useCallback(
    async (
      datasetConfig: DatasetConfig,
      umapConfig: UMAPConfig,
      config: WasmConfig
    ) => {
      // Check if WASM features are requested but WASM is not available
      const needsWasm =
        config.useWasmDistance ||
        config.useWasmTree ||
        config.useWasmMatrix ||
        config.useWasmNNDescent ||
        config.useWasmOptimizer;
      if (needsWasm && !isWasmAvailable()) {
        alert("WASM features requested but WASM module is not initialized. Please wait for initialization or disable WASM features.");
        return;
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

        // Measure FPS during computation
        let visualizationFPS = 0;
        fpsMonitor.start((fps) => {
          visualizationFPS = fps;
          setCurrentFPS(fps);
        });

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

        const embeddedData = await umap.fitAsync(originalData);

        // Stop FPS monitoring
        fpsMonitor.stop();

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
        const wasmMode = wasmEnabled ? `wasm:${wasmFeatures}` : "js";

        const exportRow: BenchmarkExportRow = {
          runId: runCounter.current++,
          timestamp: new Date().toISOString(),
          scope: window.__BENCH_CONTEXT__?.scope ?? null,
          datasetName: datasetConfig.name,
          datasetSize: datasetConfig.size,
          dimensions: datasetConfig.dimensions,
          wasmFeatures,
          wasmMode,
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
        setCurrentEmbedding(embeddedData);
        setCurrentClusters(clusters);
        setCurrentEdges(edges);
      } catch (error) {
        console.error("Benchmark failed:", error);
        alert("Benchmark failed. Check console for details.");
      } finally {
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
      </header>

      <div className="app-content">
        <div className="controls-section">
          <BenchmarkControls
            onRunBenchmark={runBenchmark}
            isRunning={isRunning}
            wasmReady={wasmReady}
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
          ) : (
            <div className="no-visualization">
              <p>Run a benchmark to see the UMAP embedding visualization</p>
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
