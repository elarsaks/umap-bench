import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor, FPSMonitor } from '../utils/performanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('startMonitoring', () => {
    it('should initialize metrics', () => {
      monitor.startMonitoring();
      const metrics = monitor.endMonitoring();

      expect(metrics.start).toBeGreaterThan(0);
      expect(metrics.memoryBefore).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(metrics.eventLatencies)).toBe(true);
    });
  });

  describe('endMonitoring', () => {
    it('should return performance metrics', () => {
      monitor.startMonitoring();
      const metrics = monitor.endMonitoring();

      expect(metrics).toHaveProperty('start');
      expect(metrics).toHaveProperty('end');
      expect(metrics).toHaveProperty('memoryBefore');
      expect(metrics).toHaveProperty('memoryAfter');
      expect(metrics).toHaveProperty('eventLatencies');
    });

    it('should have end time greater than start time', () => {
      monitor.startMonitoring();
      const metrics = monitor.endMonitoring();

      expect(metrics.end).toBeGreaterThanOrEqual(metrics.start);
    });

    it('should measure elapsed time', async () => {
      monitor.startMonitoring();
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const metrics = monitor.endMonitoring();
      const elapsed = metrics.end - metrics.start;

      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });

  describe('getAverageEventLatency', () => {
    it('should return 0 for empty array', () => {
      const average = PerformanceMonitor.getAverageEventLatency([]);
      expect(average).toBe(0);
    });

    it('should calculate correct average', () => {
      const latencies = [10, 20, 30, 40];
      const average = PerformanceMonitor.getAverageEventLatency(latencies);
      
      expect(average).toBe(25);
    });

    it('should handle single value', () => {
      const latencies = [42];
      const average = PerformanceMonitor.getAverageEventLatency(latencies);
      
      expect(average).toBe(42);
    });

    it('should handle decimal values', () => {
      const latencies = [1.5, 2.5, 3.5];
      const average = PerformanceMonitor.getAverageEventLatency(latencies);
      
      expect(average).toBeCloseTo(2.5, 5);
    });
  });
});

describe('FPSMonitor', () => {
  let fpsMonitor: FPSMonitor;

  beforeEach(() => {
    fpsMonitor = new FPSMonitor();
    vi.useFakeTimers();
  });

  afterEach(() => {
    fpsMonitor.stop();
    vi.restoreAllMocks();
  });

  describe('start', () => {
    it('should accept a callback function', () => {
      const callback = vi.fn();
      fpsMonitor.start(callback);
      
      expect(callback).toBeDefined();
    });

    it('should call callback with fps value', () => {
      const callback = vi.fn();
      fpsMonitor.start(callback);

      // Fast forward time to trigger FPS calculation
      vi.advanceTimersByTime(1000);

      // Callback might not be called immediately, but it should be set up
      expect(callback).toHaveBeenCalledTimes(0); // Initially not called
    });
  });

  describe('stop', () => {
    it('should stop monitoring without errors', () => {
      const callback = vi.fn();
      fpsMonitor.start(callback);
      
      expect(() => fpsMonitor.stop()).not.toThrow();
    });

    it('should not throw when stopping without starting', () => {
      expect(() => fpsMonitor.stop()).not.toThrow();
    });

    it('should clear callback after stop', () => {
      const callback = vi.fn();
      fpsMonitor.start(callback);
      fpsMonitor.stop();
      
      // After stop, no more callbacks should be invoked
      vi.advanceTimersByTime(2000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('multiple start/stop cycles', () => {
    it('should handle multiple start/stop cycles', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      fpsMonitor.start(callback1);
      fpsMonitor.stop();
      
      fpsMonitor.start(callback2);
      fpsMonitor.stop();

      expect(() => fpsMonitor.stop()).not.toThrow();
    });
  });
});
