# umap-bench

Minimal Vite + React + TypeScript benchmark app for experimenting with UMAP implementations.

## Prerequisites
- Node.js 22+ (recommended)
- npm or yarn

## Quick start (Linux / WSL)
```bash
cd /mnt/c/Users/elars/Desktop/Thesis/umap-bench
yarn install
yarn dev
```

Open the dev server at: http://localhost:5173

## Build
```bash
yarn build
```

## Preview
```bash
yarn preview
```

## Testing

Run unit tests with Vitest:
```bash
yarn test
```

Run tests in watch mode during development:
```bash
yarn test:watch
```

Run tests with coverage report:
```bash
yarn test:coverage
```

View coverage report in browser:
```bash
yarn test:ui
```

### Test Structure

The test suite includes:
- **Data Generation Tests** (`dataGeneration.test.ts`) - Validates random and clustered dataset generation with correct dimensions and properties
- **Embedding Quality Tests** (`embeddingQuality.test.ts`) - Tests trustworthiness and stress metrics for embedding quality assessment
- **Performance Monitor Tests** (`performanceMonitor.test.ts`) - Verifies performance metric collection and FPS monitoring
- **Component Tests** (`BenchmarkResults.test.tsx`) - Tests React component rendering and calculation logic

Tests focus on utility functions and business logic rather than the third-party UMAP algorithm implementation.

## Features

- **Dataset Selection** - Choose from various pre-configured datasets or generate custom synthetic data
- **UMAP Configuration** - Adjust n_neighbors, min_dist, n_components, spread, and learning rate parameters
- **Release Selection** - Select different umap-wasm releases directly from the UI to compare performance
- **Performance Metrics** - Track runtime, memory usage, embedding quality, FPS, and responsiveness
- **Visualization** - Interactive 3D visualization of UMAP embeddings using Plotly
