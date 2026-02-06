import React, { useState } from "react";
import styled from "styled-components";
import type { DatasetConfig, UMAPConfig, WasmConfig } from "@/types/benchmark";
import { DATASET_CONFIGS } from "@utils/dataGeneration";
import { WasmConfigSelector } from "./WasmConfigSelector";

const ControlsContainer = styled.div`
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  margin-bottom: 0.75rem;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover:not(:disabled) {
    border-color: #667eea;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DatasetInfo = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const ParameterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ParameterControl = styled.div`
  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: #2c3e50;
  }

  input[type="range"] {
    width: 100%;
    cursor: pointer;
    accent-color: #667eea;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`;

const ControlActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RunButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const ClearButton = styled(Button)`
  background-color: #e74c3c;
  color: white;

  &:hover:not(:disabled) {
    background-color: #c0392b;
    transform: translateY(-2px);
  }
`;

interface BenchmarkControlsProps {
  onRunBenchmark: (
    datasetConfig: DatasetConfig,
    umapConfig: UMAPConfig,
    wasmConfig: WasmConfig,
    renderingEnabled: boolean
  ) => void;
  isRunning: boolean;
  wasmReady: boolean;
  wasmLoading: boolean;
  wasmProgress: number;
  onClearResults: () => void;
  wasmConfig: WasmConfig;
  onUpdateWasmConfig: (config: WasmConfig) => void;
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
  wasmReady,
  wasmLoading,
  wasmProgress,
  onClearResults,
  wasmConfig,
  onUpdateWasmConfig,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetConfig>(
    DATASET_CONFIGS[0]
  );
  const [renderingEnabled, setRenderingEnabled] = useState<boolean>(() => {
    // Default: disabled for benchmark mode, enabled for interactive use
    return !window.__BENCH_CONTEXT__?.scope;
  });
  const [umapConfig, setUmapConfig] = useState<UMAPConfig>(DEFAULT_UMAP_CONFIG);

  const handleRunBenchmark = () => {
    if (!isRunning) {
      onRunBenchmark(selectedDataset, umapConfig, wasmConfig, renderingEnabled);
    }
  };
  const needsWasm = Object.values(wasmConfig).some(Boolean);
  const runDisabled = isRunning || (needsWasm && !wasmReady);

  const updateUmapConfig = (key: keyof UMAPConfig, value: number) => {
    setUmapConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ControlsContainer className="benchmark-controls">
      <h3>Benchmark Configuration</h3>

      <SectionContainer className="control-section">
        <SectionTitle>Dataset Selection</SectionTitle>
        <Select
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
        </Select>
        <DatasetInfo className="dataset-info">
          <span>Size: {selectedDataset.size} points</span>
          <span>Dimensions: {selectedDataset.dimensions}</span>
        </DatasetInfo>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={renderingEnabled}
            onChange={(e) => setRenderingEnabled(e.target.checked)}
            disabled={isRunning}
            style={{ cursor: 'pointer' }}
          />
          <span>Enable 3D Visualization (may impact performance on large datasets)</span>
        </label>
      </SectionContainer>

      <SectionContainer className="control-section">
        <SectionTitle>WASM Optimization Features</SectionTitle>
        <WasmConfigSelector wasmConfig={wasmConfig} onUpdateWasmConfig={onUpdateWasmConfig} />
        {(wasmLoading || needsWasm) && !wasmReady ? (
          <div className="wasm-loading">
            <div className="wasm-loading-title">Loading WASM...</div>
            <div className="wasm-progress">
              <div
                className="wasm-progress-bar"
                style={{ width: `${Math.max(2, wasmProgress)}%` }}
              />
            </div>
            <div className="wasm-progress-label">
              {wasmLoading ? `${Math.min(99, wasmProgress)}%` : "Starting..."}
            </div>
          </div>
        ) : null}
      </SectionContainer>

      <SectionContainer className="control-section">
        <SectionTitle>UMAP Parameters</SectionTitle>
        <ParameterGrid className="parameter-grid">
          <ParameterControl className="parameter-control">
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
          </ParameterControl>

          <ParameterControl className="parameter-control">
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
          </ParameterControl>

          <ParameterControl className="parameter-control">
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
          </ParameterControl>

          <ParameterControl className="parameter-control">
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
          </ParameterControl>

          <ParameterControl className="parameter-control">
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
          </ParameterControl>
        </ParameterGrid>
      </SectionContainer>

      <ControlActions className="control-actions">
        <RunButton
          onClick={handleRunBenchmark}
          disabled={runDisabled}
          className="run-benchmark-btn"
        >
          {isRunning
            ? "Running..."
            : needsWasm && !wasmReady
            ? "Waiting for WASM..."
            : "Run Benchmark"}
        </RunButton>

        <ClearButton
          onClick={onClearResults}
          disabled={isRunning}
          className="clear-results-btn"
        >
          Clear Results
        </ClearButton>
      </ControlActions>
    </ControlsContainer>
  );
};
