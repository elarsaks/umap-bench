import type { PerformanceMetrics } from "@types/benchmark";

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    start: 0,
    end: 0,
    memoryBefore: 0,
    memoryAfter: 0,
    eventLatencies: [],
  };

  private observer: PerformanceObserver | null = null;

  startMonitoring(): void {
    this.metrics.start = performance.now();
    this.metrics.memoryBefore = this.getMemoryUsage();
    this.metrics.eventLatencies = [];
    this.setupPerformanceObserver();
  }

  endMonitoring(): PerformanceMetrics {
    this.metrics.end = performance.now();
    this.metrics.memoryAfter = this.getMemoryUsage();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    return { ...this.metrics };
  }

  private setupPerformanceObserver(): void {
    if ("PerformanceObserver" in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "event") {
            const eventEntry = entry as PerformanceEventTiming;
            const latency =
              eventEntry.processingEnd - eventEntry.processingStart;
            this.metrics.eventLatencies.push(latency);
          }
        }
      });

      try {
        this.observer.observe({ entryTypes: ["event"] });
      } catch (error) {
        console.warn("Event timing not supported:", error);
      }
    }
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      const memory = (
        performance as Performance & { memory?: { usedJSHeapSize: number } }
      ).memory;
      return memory ? memory.usedJSHeapSize / (1024 * 1024) : 0;
    }
    return 0;
  }

  static getAverageEventLatency(latencies: number[]): number {
    if (latencies.length === 0) return 0;
    return (
      latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length
    );
  }
}

export class FPSMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private animationId: number | null = null;
  private callback: ((fps: number) => void) | null = null;

  start(callback: (fps: number) => void): void {
    this.callback = callback;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.loop();
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.callback = null;
  }

  private loop = (): void => {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime - this.lastTime >= 1000) {
      this.fps = (this.frameCount * 1000) / (currentTime - this.lastTime);
      this.frameCount = 0;
      this.lastTime = currentTime;

      if (this.callback) {
        this.callback(this.fps);
      }
    }

    this.animationId = requestAnimationFrame(this.loop);
  };

  getCurrentFPS(): number {
    return this.fps;
  }
}
