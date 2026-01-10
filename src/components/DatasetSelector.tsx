import React from "react";
import styled from "styled-components";
import type { DatasetConfig } from "@/types/benchmark";
import { DATASET_CONFIGS } from "@utils/dataGeneration";

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

interface DatasetSelectorProps {
  selectedDataset: DatasetConfig;
  onSelectDataset: (dataset: DatasetConfig) => void;
  disabled?: boolean;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  selectedDataset,
  onSelectDataset,
  disabled = false,
}) => {
  return (
    <SectionContainer className="control-section">
      <SectionTitle>Dataset Selection</SectionTitle>
      <Select
        value={DATASET_CONFIGS.indexOf(selectedDataset)}
        onChange={(e) =>
          onSelectDataset(DATASET_CONFIGS[parseInt(e.target.value)])
        }
        disabled={disabled}
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
    </SectionContainer>
  );
};
