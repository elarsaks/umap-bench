import React from "react";
import styled from "styled-components";
import type { UMAPConfig } from "@/types/benchmark";

const SectionContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  margin-bottom: 0.75rem;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
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

interface UMAPConfigSelectorProps {
  umapConfig: UMAPConfig;
  onUpdateUmapConfig: (key: keyof UMAPConfig, value: number) => void;
  disabled?: boolean;
}

export const UMAPConfigSelector: React.FC<UMAPConfigSelectorProps> = ({
  umapConfig,
  onUpdateUmapConfig,
  disabled = false,
}) => {
  return (
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
                onUpdateUmapConfig("nNeighbors", parseInt(e.target.value))
              }
              disabled={disabled}
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
                onUpdateUmapConfig("minDist", parseFloat(e.target.value))
              }
              disabled={disabled}
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
                onUpdateUmapConfig("nComponents", parseInt(e.target.value))
              }
              disabled={disabled}
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
                onUpdateUmapConfig("spread", parseFloat(e.target.value))
              }
              disabled={disabled}
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
                onUpdateUmapConfig("learningRate", parseFloat(e.target.value))
              }
              disabled={disabled}
            />
          </label>
        </ParameterControl>
      </ParameterGrid>
    </SectionContainer>
  );
};
