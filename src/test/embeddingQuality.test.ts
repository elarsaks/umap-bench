import { describe, it, expect } from 'vitest';
import { calculateTrustworthiness, calculateStress } from '../utils/embeddingQuality';

describe('embeddingQuality', () => {
  describe('calculateTrustworthiness', () => {
    it('should return 1 for identical original and embedded data', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
        [13, 14, 15],
      ];

      const trustworthiness = calculateTrustworthiness(data, data, 2);
      expect(trustworthiness).toBeCloseTo(1, 5);
    });

    it('should return 0 for empty datasets', () => {
      const trustworthiness = calculateTrustworthiness([], [], 2);
      expect(trustworthiness).toBe(0);
    });

    it('should handle mismatched dataset sizes', () => {
      const original = [[1, 2], [3, 4]];
      const embedded = [[1, 2]];

      const trustworthiness = calculateTrustworthiness(original, embedded, 1);
      expect(trustworthiness).toBe(0);
    });

    it('should calculate reasonable trustworthiness for similar datasets', () => {
      const original = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 2],
      ];

      const embedded = [
        [0, 0],
        [0.9, 0],
        [0, 0.9],
        [1, 1],
        [2.1, 2.1],
      ];

      const trustworthiness = calculateTrustworthiness(original, embedded, 2);
      expect(trustworthiness).toBeGreaterThan(0.5);
      expect(trustworthiness).toBeLessThanOrEqual(1);
    });

    it('should handle high-dimensional data', () => {
      const dimensions = 50;
      const original = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: dimensions }, (_, j) => i * dimensions + j)
      );
      const embedded = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => i * 3 + j)
      );

      const trustworthiness = calculateTrustworthiness(original, embedded, 3);
      expect(trustworthiness).toBeGreaterThanOrEqual(0);
      expect(trustworthiness).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateStress', () => {
    it('should return 0 for identical datasets', () => {
      const data = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];

      const stress = calculateStress(data, data);
      expect(stress).toBeCloseTo(0, 10);
    });

    it('should return Infinity for empty datasets', () => {
      const stress = calculateStress([], []);
      expect(stress).toBe(Infinity);
    });

    it('should return Infinity for mismatched dataset sizes', () => {
      const original = [[1, 2], [3, 4]];
      const embedded = [[1, 2]];

      const stress = calculateStress(original, embedded);
      expect(stress).toBe(Infinity);
    });

    it('should have lower stress for more similar embeddings', () => {
      const original = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ];

      const similar = [
        [0, 0],
        [1.1, 0],
        [0, 1.1],
        [1, 1],
      ];

      const different = [
        [0, 0],
        [5, 0],
        [0, 5],
        [5, 5],
      ];

      const stressSimilar = calculateStress(original, similar);
      const stressDifferent = calculateStress(original, different);

      expect(stressSimilar).toBeLessThan(stressDifferent);
    });

    it('should handle high-dimensional data', () => {
      const dimensions = 20;
      const original = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: dimensions }, (_, j) => i + j)
      );
      const embedded = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 2 }, (_, j) => i + j * 0.5)
      );

      const stress = calculateStress(original, embedded);
      expect(stress).toBeGreaterThan(0);
      expect(stress).toBeLessThan(Infinity);
    });
  });
});
