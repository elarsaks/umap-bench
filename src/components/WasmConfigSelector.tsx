import React from "react";
import styled from "styled-components";
import type { WasmConfig } from "@/types/benchmark";

const SectionContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  margin-bottom: 0.75rem;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const WasmTogglesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ToggleControl = styled.label`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: start;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: #667eea;
    background-color: #f8f9fa;
  }
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-top: 0.2rem;

  &:disabled {
    cursor: not-allowed;
  }
`;

const LabelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const LabelText = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.95rem;
`;

const Description = styled.div`
  font-size: 0.85rem;
  color: #7f8c8d;
`;

interface WasmConfigSelectorProps {
  wasmConfig: WasmConfig;
  onUpdateWasmConfig: (config: WasmConfig) => void;
  disabled?: boolean;
}

export const WasmConfigSelector: React.FC<WasmConfigSelectorProps> = ({
  wasmConfig,
  onUpdateWasmConfig,
  disabled = false,
}) => {
  const wasmOptions = [
    {
      key: "useWasmDistance",
      label: "useWasmDistance",
      desc: "Distance computations (euclidean, cosine)",
    },
    {
      key: "useWasmTree",
      label: "useWasmTree",
      desc: "Nearest neighbour search (random projection trees)",
    },
    {
      key: "useWasmMatrix",
      label: "useWasmMatrix",
      desc: "Sparse matrix operations in optimization loops",
    },
  ];

  return (
    <SectionContainer className="control-section">
      <SectionTitle>WASM Acceleration</SectionTitle>
      <WasmTogglesContainer className="wasm-toggles">
        {wasmOptions.map((item) => (
          <ToggleControl key={item.key} className="toggle-control">
            <Checkbox
              checked={wasmConfig[item.key as keyof WasmConfig] as boolean}
              onChange={(e) =>
                onUpdateWasmConfig({
                  ...wasmConfig,
                  [item.key]: e.target.checked,
                })
              }
              disabled={disabled}
            />
            <LabelContent>
              <LabelText>{item.label}</LabelText>
              <Description>{item.desc}</Description>
            </LabelContent>
          </ToggleControl>
        ))}
      </WasmTogglesContainer>
    </SectionContainer>
  );
};
