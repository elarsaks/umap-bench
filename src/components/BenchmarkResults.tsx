import React from "react";
import type { BenchmarkResult } from "../types/benchmark.ts";

interface BenchmarkResultsProps {
  results: BenchmarkResult[];
  isRunning: boolean;
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
              <div className="metric-label">Runtime</div>
              <div className="metric-value">{latest.runtime.toFixed(2)} ms</div>
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
              <div className="metric-label">Runtime</div>
              <div className="metric-value">
                {average.runtime.toFixed(2)} ms
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
                <th>Runtime (ms)</th>
                <th>Memory (MB)</th>
                <th>Quality (%)</th>
                <th>FPS</th>
                <th>Latency (ms)</th>
                <th>Wasm Release</th>
                <th>Dataset</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{result.runtime.toFixed(2)}</td>
                  <td>{result.memoryUsage.toFixed(2)}</td>
                  <td>{(result.embeddingQuality * 100).toFixed(1)}</td>
                  <td>{result.visualizationFPS.toFixed(1)}</td>
                  <td>{result.responsiveness.toFixed(2)}</td>
                  <td>{result.wasmRelease}</td>
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
      runtime: 0,
      memoryUsage: 0,
      embeddingQuality: 0,
      visualizationFPS: 0,
      responsiveness: 0,
      datasetSize: 0,
      dimensions: 0,
      timestamp: new Date(),
      wasmRelease: "N/A",
    };
  }

  const totals = results.reduce(
    (acc, result) => ({
      runtime: acc.runtime + result.runtime,
      memoryUsage: acc.memoryUsage + result.memoryUsage,
      embeddingQuality: acc.embeddingQuality + result.embeddingQuality,
      visualizationFPS: acc.visualizationFPS + result.visualizationFPS,
      responsiveness: acc.responsiveness + result.responsiveness,
      datasetSize: acc.datasetSize + result.datasetSize,
      dimensions: acc.dimensions + result.dimensions,
    }),
    {
      runtime: 0,
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
    runtime: totals.runtime / count,
    memoryUsage: totals.memoryUsage / count,
    embeddingQuality: totals.embeddingQuality / count,
    visualizationFPS: totals.visualizationFPS / count,
    responsiveness: totals.responsiveness / count,
    datasetSize: totals.datasetSize / count,
    dimensions: totals.dimensions / count,
    timestamp: new Date(),
    wasmRelease: results[0].wasmRelease,
  };
}
