# umap-bench

Minimal Vite + React + TypeScript benchmark app for experimenting with UMAP implementations.

## Prerequisites
- Node.js 22+ (recommended)
- npm or yarn

## Environment setup

### Install dependencies
```bash
yarn install
```

### Install Playwright browsers
- macOS / Windows
	```bash
	yarn playwright install chromium
	```
- Linux / WSL (adds required system libs; Ubuntu 24.04 uses *t64* packages)
	```bash
	sudo apt update
	sudo apt install -y libnspr4 libnss3 libxss1 libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 \
		libcups2t64 libx11-xcb1 libxcb1 libxcomposite1 libxrandr2 libxrender1 libxfixes3 \
		libxtst6 libgbm1 libgtk-3-0t64 libpangocairo-1.0-0 libdbus-1-3
	yarn playwright install --with-deps chromium
	```

If Chromium still fails to launch, run `ldd $(yarn playwright install chromium --dry-run | tail -n 1)` and install any libraries marked "not found".

## Quick start (Linux / WSL)
```bash
cd /mnt/c/Users/elars/Desktop/Thesis/umap-bench
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

### Unit Tests (Application Logic)
Tests for utilities, components, and business logic using Vitest.

Located in: `src/test/`

- Quick run
	```bash
	yarn test
	```
- Watch mode
	```bash
	yarn test:watch
	```
- Coverage report
	```bash
	yarn test:coverage
	```
- UI runner
	```bash
	yarn test:ui
	```

### Performance Benchmarks (Experimental)
Playwright-based tests for measuring UMAP implementation performance across different releases and datasets.

Located in: `bench/`

- Install browsers once (Linux/WSL: add `--with-deps` if needed)
	```bash
	yarn playwright install chromium
	```
- Headless benchmark suite
	```bash
	yarn bench
	```
- Run benchmark suite N times and record machine specs (default 10)
	```bash
	yarn bench:loop
	# or customize
	yarn bench:loop --runs=5
	yarn bench:loop --scope=small
	yarn bench:loop --scope=small --runs=3 --wasm=all
	
	# 10 runs for all sizes, JS then WASM (sequential)
	yarn bench:loop --scope=small --runs=10
	yarn bench:loop --scope=mid --runs=10
	yarn bench:loop --scope=large --runs=10
	yarn bench:loop --scope=small --runs=10 --wasm=all
	yarn bench:loop --scope=mid --runs=10 --wasm=all
	yarn bench:loop --scope=large --runs=10 --wasm=all
	
	# Run each single WASM feature
	yarn bench:loop --scope=small --runs=10 --wasm=dist
	yarn bench:loop --scope=mid --runs=10 --wasm=dist
	yarn bench:loop --scope=large --runs=10 --wasm=dist

	yarn bench:loop --scope=small --runs=10 --wasm=tree
	yarn bench:loop --scope=mid --runs=10 --wasm=tree
	yarn bench:loop --scope=large --runs=10 --wasm=tree

	yarn bench:loop --scope=small --runs=10 --wasm=matrix
	yarn bench:loop --scope=mid --runs=10 --wasm=matrix
	yarn bench:loop --scope=large --runs=10 --wasm=matrix

	yarn bench:loop --scope=small --runs=10 --wasm=nn
	yarn bench:loop --scope=mid --runs=10 --wasm=nn
	yarn bench:loop --scope=large --runs=10 --wasm=nn

	yarn bench:loop --scope=small --runs=10 --wasm=opt
	yarn bench:loop --scope=mid --runs=10 --wasm=opt
	yarn bench:loop --scope=large --runs=10 --wasm=opt

	# Master command: set RUNS and SCOPE, run JS + all WASM + single features
	RUNS=10 SCOPE=small bash -lc 'set -e; scope="${SCOPE}"; runs="${RUNS}"; for wasm in none all dist tree matrix nn opt; do if [ "$wasm" = "none" ]; then yarn bench:loop --scope="$scope" --runs="$runs"; else yarn bench:loop --scope="$scope" --runs="$runs" --wasm="$wasm"; fi; done'

	# Full bench: run small + mid + large with all WASM variants
	yarn bench:full
	```
	Scopes: `small`, `mid`, `large`.

### Customization
- Preload WASM (default on) / disable preload:
	```bash
	yarn bench:loop --preload-wasm
	yarn bench:loop --no-preload-wasm
	```
- Examples:
	```bash
	yarn bench:loop --runs=5
	yarn bench:loop --scope=small
	yarn bench:loop --scope=small --runs=3 --wasm=all
	```

- Run full test set: JS-only, each single WASM feature, then all WASM
	```bash
	yarn bench:loop:full
	# or customize
	yarn bench:loop:full --scope=small --runs=3
	```

Performance tests include smoke checks and performance measurements. Results are saved to `bench/results/` with machine specifications for cross-machine comparison.

Note: Playwright no longer generates an HTML report by default. The runner writes machine-readable JSON results to `bench/results/` and removes the `playwright-report/` folder to avoid clutter. If you still want the HTML report, run Playwright with the `html` reporter or remove the cleanup in `scripts/run-benchmarks.cjs`.

## Features

- **Dataset Selection** - Choose from various pre-configured datasets or generate custom synthetic data
- **UMAP Configuration** - Adjust n_neighbors, min_dist, n_components, spread, and learning rate parameters
- **Release Selection** - Select different umap-wasm releases directly from the UI to compare performance
- **Performance Metrics** - Track runtime, memory usage, embedding quality, FPS, and responsiveness
- **Visualization** - Interactive 3D visualization of UMAP embeddings using Plotly
