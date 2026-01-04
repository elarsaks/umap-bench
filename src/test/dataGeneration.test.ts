import { describe, it, expect, vi } from 'vitest';
import {
  generateRandomData,
  generate3DClusteredData,
  generateClusteredData,
} from '../utils/dataGeneration';

describe('dataGeneration', () => {
  describe('generateRandomData', () => {
    it('should generate data with correct shape and range', () => {
      const size = 100;
      const dimensions = 5;
      const data = generateRandomData(size, dimensions);

      expect(data).toHaveLength(size);
      
      data.forEach((point) => {
        expect(point).toHaveLength(dimensions);
        
        point.forEach((value) => {
          expect(value).toBeGreaterThanOrEqual(-5);
          expect(value).toBeLessThanOrEqual(5);
        });
      });
    });

    it('should handle edge case of size 0', () => {
      const data = generateRandomData(0, 5);
      expect(data).toHaveLength(0);
    });

    it('should be deterministic with mocked random', () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const data1 = generateRandomData(10, 3);
      const data2 = generateRandomData(10, 3);
      
      expect(data1).toEqual(data2);
      mockRandom.mockRestore();
    });
  });

  describe('generate3DClusteredData', () => {
    it('should generate correct shape with valid cluster assignments', () => {
      const size = 200;
      const numClusters = 5;
      const result = generate3DClusteredData(size, numClusters);

      expect(result.data).toHaveLength(size);
      expect(result.clusters).toHaveLength(size);
      
      result.data.forEach((point) => {
        expect(point).toHaveLength(3);
      });

      result.clusters.forEach((cluster) => {
        expect(cluster).toBeGreaterThanOrEqual(0);
        expect(cluster).toBeLessThan(numClusters);
      });

      const uniqueClusters = new Set(result.clusters);
      expect(uniqueClusters.size).toBeLessThanOrEqual(numClusters);
    });

    it('should generate valid edges between points in same cluster', () => {
      const size = 100;
      const result = generate3DClusteredData(size);

      expect(Array.isArray(result.edges)).toBe(true);
      
      result.edges.forEach(([i, j]) => {
        // Valid indices
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(size);
        expect(j).toBeGreaterThanOrEqual(0);
        expect(j).toBeLessThan(size);
        
        // Edges ordered
        expect(i).toBeLessThan(j);
        
        // Same cluster
        expect(result.clusters[i]).toBe(result.clusters[j]);
      });
    });
  });

  describe('generateClusteredData', () => {
    it('should generate data with correct shape', () => {
      const size = 150;
      const dimensions = 8;
      const data = generateClusteredData(size, dimensions);

      expect(data).toHaveLength(size);
      data.forEach((point) => {
        expect(point).toHaveLength(dimensions);
      });
    });

    it('should handle high dimensional data', () => {
      const size = 50;
      const dimensions = 100;
      const data = generateClusteredData(size, dimensions);

      expect(data).toHaveLength(size);
      data.forEach((point) => {
        expect(point).toHaveLength(dimensions);
      });
    });

    it('should be deterministic with mocked random', () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const data1 = generateClusteredData(50, 5);
      const data2 = generateClusteredData(50, 5);
      
      expect(data1).toEqual(data2);
      mockRandom.mockRestore();
    });
  });
});