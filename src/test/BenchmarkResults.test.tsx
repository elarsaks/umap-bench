import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BenchmarkResults } from '@components/BenchmarkResults';
import type { BenchmarkResult } from '@types/benchmark';

describe('BenchmarkResults', () => {
  const mockResult: BenchmarkResult = {
    runtime: 1500,
    memoryUsage: 256,
    embeddingQuality: 0.85,
    visualizationFPS: 60,
    responsiveness: 16,
    datasetSize: 1000,
    dimensions: 50,
    wasmRelease: 'v1.0.0',
    timestamp: new Date('2026-01-04T12:00:00Z'),
  };

  it('should display empty state when no results', () => {
    render(<BenchmarkResults results={[]} isRunning={false} />);
    
    expect(screen.getByText(/no benchmark results yet/i)).toBeInTheDocument();
  });

  it('should display running indicator when benchmark is running', () => {
    render(<BenchmarkResults results={[]} isRunning={true} />);
    
    expect(screen.getByText(/running benchmark/i)).toBeInTheDocument();
  });

  it('should display latest results with all metrics', () => {
    render(<BenchmarkResults results={[mockResult]} isRunning={false} />);
    
    expect(screen.getByText('Latest Results')).toBeInTheDocument();
    expect(screen.getByText(/1500.*ms/i)).toBeInTheDocument();
    expect(screen.getByText(/256.*MB/i)).toBeInTheDocument();
    expect(screen.getByText(/85.*%/i)).toBeInTheDocument();
    expect(screen.getByText(/60.*fps/i)).toBeInTheDocument();
    expect(screen.getByText(/16.*ms/i)).toBeInTheDocument();
    expect(screen.getByText(/1000 points/i)).toBeInTheDocument();
  });

  it('should display average results only with multiple results', () => {
    const { rerender } = render(<BenchmarkResults results={[mockResult]} isRunning={false} />);
    expect(screen.queryByText(/average results/i)).not.toBeInTheDocument();

    const multipleResults = [
      { ...mockResult, runtime: 1000 },
      { ...mockResult, runtime: 1500 },
      { ...mockResult, runtime: 2000 },
    ];
    rerender(<BenchmarkResults results={multipleResults} isRunning={false} />);
    
    expect(screen.getByText(/average results.*3 runs/i)).toBeInTheDocument();
    expect(screen.getByText('All Results')).toBeInTheDocument();
  });

  it('should handle edge case values gracefully', () => {
    const edgeCaseResult: BenchmarkResult = {
      runtime: 0,
      memoryUsage: 9999.123,
      embeddingQuality: 0,
      visualizationFPS: 999999,
      responsiveness: 0.001,
      datasetSize: 0,
      dimensions: 1000,
      wasmRelease: 'test',
      timestamp: new Date(),
    };

    render(<BenchmarkResults results={[edgeCaseResult]} isRunning={false} />);
    
    expect(screen.getByText('Latest Results')).toBeInTheDocument();
  });
});
