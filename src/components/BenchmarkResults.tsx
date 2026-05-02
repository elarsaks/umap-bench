import React from "react";
import type { BenchmarkResult, WasmConfig } from "@/types/benchmark";

interface BenchmarkResultsProps {
  results: BenchmarkResult[];
  isRunning: boolean;
}

function formatWasmConfig(config: WasmConfig): string {
  const enabledComponents: string[] = [];
  if (config.useWasmDistance) enabledComponents.push("Distance");
  if (config.useWasmTree) enabledComponents.push("Tree");
  if (config.useWasmMatrix) enabledComponents.push("Matrix");
  if (config.useWasmNNDescent) enabledComponents.push("NN Descent");
  if (config.useWasmOptimizer) enabledComponents.push("Optimizer");

  if (enabledComponents.length === 0) return "Baseline (JS)";
  if (enabledComponents.length === 5) return "Fully WASM-enabled configuration";
  return `Configuration incorporating ${enabledComponents.join(", ")}`;
}

export const BenchmarkResults: React.FC<BenchmarkResultsProps> = ({
  results,
  isRunning,
}) => {
  if (results.length === 0 && !isRunning) {
    return (
      <div className="benchmark-results">
        <h3>Benchmark Results</h3>
        <p>
          No benchmark results yet. Run a benchmark to see performance metrics.
        </p>
      </div>
    );
  }

  const latest = results[results.length - 1];
  const average = calculateAverages(results);

  return (
    <div className="benchmark-results">
      <h3>Benchmark Results</h3>

      {isRunning && (
        <div className="running-indicator">
          <div className="spinner"></div>
          <span>Running benchmark...</span>
        </div>
      )}

      {latest && (
        <div className="latest-results">
          <h4>Latest Results</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Execution Time</div>
              <div className="metric-value">{latest.executionTime.toFixed(2)} ms</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Memory Usage</div>
              <div className="metric-value">
                {latest.memoryUsage.toFixed(2)} MB
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Embedding Quality</div>
              <div className="metric-value">
                {(latest.embeddingQuality * 100).toFixed(1)}%
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Visualization FPS</div>
              <div className="metric-value">
                {latest.visualizationFPS.toFixed(1)} fps
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Responsiveness</div>
              <div className="metric-value">
                {latest.responsiveness.toFixed(2)} ms
              </div>
            </div>
          </div>
          <div className="dataset-info">
            <span>
              Dataset: {latest.datasetSize} points, {latest.dimensions} dimensions
            </span>
          </div>
        </div>
      )}

      {results.length > 1 && (
        <div className="average-results">
          <h4>Average Results ({results.length} runs)</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Execution Time</div>
              <div className="metric-value">
                {average.executionTime.toFixed(2)} ms
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Memory Usage</div>
              <div className="metric-value">
                {average.memoryUsage.toFixed(2)} MB
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Embedding Quality</div>
              <div className="metric-value">
                {(average.embeddingQuality * 100).toFixed(1)}%
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Visualization FPS</div>
              <div className="metric-value">
                {average.visualizationFPS.toFixed(1)} fps
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Responsiveness</div>
              <div className="metric-value">
                {average.responsiveness.toFixed(2)} ms
              </div>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-table">
          <h4>All Results</h4>
          <table>
            <thead>
              <tr>
                <th>Run</th>
                <th>Execution Time (ms)</th>
                <th>Memory (MB)</th>
                <th>Quality (%)</th>
                <th>FPS</th>
                <th>Latency (ms)</th>
                <th>WASM Configuration</th>
                <th>Dataset</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{result.executionTime.toFixed(2)}</td>
                  <td>{result.memoryUsage.toFixed(2)}</td>
                  <td>{(result.embeddingQuality * 100).toFixed(1)}</td>
                  <td>{result.visualizationFPS.toFixed(1)}</td>
                  <td>{result.responsiveness.toFixed(2)}</td>
                  <td>{formatWasmConfig(result.wasmConfig)}</td>
                  <td>
                    {result.datasetSize}×{result.dimensions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function calculateAverages(results: BenchmarkResult[]): BenchmarkResult {
  if (results.length === 0) {
    return {
      executionTime: 0,
      memoryUsage: 0,
      embeddingQuality: 0,
      visualizationFPS: 0,
      responsiveness: 0,
      datasetSize: 0,
      dimensions: 0,
      timestamp: new Date(),
        wasmConfig: {
          useWasmDistance: false,
          useWasmTree: false,
          useWasmMatrix: false,
          useWasmNNDescent: false,
          useWasmOptimizer: false,
        },
    };
  }

  const totals = results.reduce(
    (acc, result) => ({
      executionTime: acc.executionTime + result.executionTime,
      memoryUsage: acc.memoryUsage + result.memoryUsage,
      embeddingQuality: acc.embeddingQuality + result.embeddingQuality,
      visualizationFPS: acc.visualizationFPS + result.visualizationFPS,
      responsiveness: acc.responsiveness + result.responsiveness,
      datasetSize: acc.datasetSize + result.datasetSize,
      dimensions: acc.dimensions + result.dimensions,
    }),
    {
      executionTime: 0,
      memoryUsage: 0,
      embeddingQuality: 0,
      visualizationFPS: 0,
      responsiveness: 0,
      datasetSize: 0,
      dimensions: 0,
    }
  );

  const count = results.length;
  return {
    executionTime: totals.executionTime / count,
    memoryUsage: totals.memoryUsage / count,
    embeddingQuality: totals.embeddingQuality / count,
    visualizationFPS: totals.visualizationFPS / count,
    responsiveness: totals.responsiveness / count,
    datasetSize: totals.datasetSize / count,
    dimensions: totals.dimensions / count,
    timestamp: new Date(),
    wasmConfig: results[0].wasmConfig,
  };
}
