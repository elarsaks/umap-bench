import React, { useState } from "react";
import type { DatasetConfig, UMAPConfig, WasmRelease } from "@/types/benchmark";
import { DATASET_CONFIGS } from "@utils/dataGeneration";

interface BenchmarkControlsProps {
  onRunBenchmark: (
    datasetConfig: DatasetConfig,
    umapConfig: UMAPConfig,
    wasmRelease: WasmRelease
  ) => void;
  isRunning: boolean;
  onClearResults: () => void;
  wasmReleases: WasmRelease[];
  selectedWasmRelease: WasmRelease;
  onSelectWasmRelease: (release: WasmRelease) => void;
}

const DEFAULT_UMAP_CONFIG: UMAPConfig = {
  nNeighbors: 15,
  minDist: 0.1,
  nComponents: 3,
  spread: 1.0,
  learningRate: 1.0,
};

export const BenchmarkControls: React.FC<BenchmarkControlsProps> = ({
  onRunBenchmark,
  isRunning,
  onClearResults,
  wasmReleases,
  selectedWasmRelease,
  onSelectWasmRelease,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetConfig>(
    DATASET_CONFIGS[0]
  );
  const [umapConfig, setUmapConfig] = useState<UMAPConfig>(DEFAULT_UMAP_CONFIG);

  const handleRunBenchmark = () => {
    if (!isRunning) {
      onRunBenchmark(selectedDataset, umapConfig, selectedWasmRelease);
    }
  };

  const updateUmapConfig = (key: keyof UMAPConfig, value: number) => {
    setUmapConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="benchmark-controls">
      <h3>Benchmark Configuration</h3>

      <div className="control-section">
        <h4>Dataset Selection</h4>
        <select
          value={DATASET_CONFIGS.indexOf(selectedDataset)}
          onChange={(e) =>
            setSelectedDataset(DATASET_CONFIGS[parseInt(e.target.value)])
          }
          disabled={isRunning}
        >
          {DATASET_CONFIGS.map((config, index) => (
            <option key={index} value={index}>
              {config.name}
            </option>
          ))}
        </select>
        <div className="dataset-info">
          <span>Size: {selectedDataset.size} points</span>
          <span>Dimensions: {selectedDataset.dimensions}</span>
        </div>
      </div>

      <div className="control-section">
        <h4>umap-wasm Release</h4>
        <select
          value={selectedWasmRelease.tag}
          onChange={(e) => {
            const next = wasmReleases.find((r) => r.tag === e.target.value);
            if (next) onSelectWasmRelease(next);
          }}
          disabled={isRunning || wasmReleases.length === 0}
        >
          {wasmReleases.map((release) => (
            <option key={release.tag} value={release.tag}>
              {release.name}
            </option>
          ))}
        </select>
        <div className="dataset-info">
          <span>Selected: {selectedWasmRelease.tag}</span>
          {selectedWasmRelease.notes ? (
            <span>{selectedWasmRelease.notes}</span>
          ) : null}
        </div>
      </div>

      <div className="control-section">
        <h4>UMAP Parameters</h4>
        <div className="parameter-grid">
          <div className="parameter-control">
            <label>
              n_neighbors: {umapConfig.nNeighbors}
              <input
                type="range"
                min="5"
                max="50"
                value={umapConfig.nNeighbors}
                onChange={(e) =>
                  updateUmapConfig("nNeighbors", parseInt(e.target.value))
                }
                disabled={isRunning}
              />
            </label>
          </div>

          <div className="parameter-control">
            <label>
              min_dist: {umapConfig.minDist.toFixed(2)}
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={umapConfig.minDist}
                onChange={(e) =>
                  updateUmapConfig("minDist", parseFloat(e.target.value))
                }
                disabled={isRunning}
              />
            </label>
          </div>

          <div className="parameter-control">
            <label>
              n_components: {umapConfig.nComponents}{" "}
              {umapConfig.nComponents === 3
                ? "(3D)"
                : umapConfig.nComponents === 2
                ? "(2D)"
                : ""}
              <input
                type="range"
                min="2"
                max="5"
                value={umapConfig.nComponents}
                onChange={(e) =>
                  updateUmapConfig("nComponents", parseInt(e.target.value))
                }
                disabled={isRunning}
              />
            </label>
          </div>

          <div className="parameter-control">
            <label>
              spread: {umapConfig.spread.toFixed(1)}
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={umapConfig.spread}
                onChange={(e) =>
                  updateUmapConfig("spread", parseFloat(e.target.value))
                }
                disabled={isRunning}
              />
            </label>
          </div>

          <div className="parameter-control">
            <label>
              learning_rate: {umapConfig.learningRate.toFixed(1)}
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={umapConfig.learningRate}
                onChange={(e) =>
                  updateUmapConfig("learningRate", parseFloat(e.target.value))
                }
                disabled={isRunning}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="control-actions">
        <button
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="run-benchmark-btn"
        >
          {isRunning ? "Running..." : "Run Benchmark"}
        </button>

        <button
          onClick={onClearResults}
          disabled={isRunning}
          className="clear-results-btn"
        >
          Clear Results
        </button>
      </div>
      {/**
      <div className="info-section">
        <h4>Performance Metrics Measured</h4>
        <ul>
          <li>
            <strong>Runtime:</strong> Total execution time using
            performance.now()
          </li>
          <li>
            <strong>Memory:</strong> JavaScript heap usage via Chrome DevTools
            API
          </li>
          <li>
            <strong>Embedding Quality:</strong> Trustworthiness score vs
            original data
          </li>
          <li>
            <strong>Visualization FPS:</strong> Canvas rendering frame rate
          </li>
          <li>
            <strong>Responsiveness:</strong> Event latency via
            PerformanceObserver
          </li>
        </ul>
      </div> */}
    </div>
  );
};
