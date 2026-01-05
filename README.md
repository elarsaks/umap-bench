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
	npx playwright install chromium
	```
- Linux / WSL (adds required system libs; Ubuntu 24.04 uses *t64* packages)
	```bash
	sudo apt update
	sudo apt install -y libnspr4 libnss3 libxss1 libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 \
		libcups2t64 libx11-xcb1 libxcb1 libxcomposite1 libxrandr2 libxrender1 libxfixes3 \
		libxtst6 libgbm1 libgtk-3-0t64 libpangocairo-1.0-0 libdbus-1-3
	npx playwright install --with-deps chromium
	```

If Chromium still fails to launch, run `ldd $(npx playwright install chromium --dry-run | tail -n 1)` and install any libraries marked "not found".

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

### Unit tests (Vitest)
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

### Benchmark tests (Playwright)
- Install browsers once (Linux/WSL: add `--with-deps` if needed)
	```bash
	npx playwright install chromium
	```
- Headless benchmark suite
	```bash
	yarn bench
	```
- Run benchmark suite N times and record machine specs (default 10)
	```bash
	yarn bench:loop
	# or customize
	RUNS=5 yarn bench:loop
	node scripts/bench-loop.cjs --runs=20
	```
- Headed run (see the browser)
	```bash
	yarn bench:headed
	```
- Interactive runner
	```bash
	yarn bench:ui
	```
- Alias (keeps the old name)
	```bash
	yarn e2e
	```

Benchmark tests live in `e2e/` and currently include a smoke check that the app loads and the benchmark controls render.

## Features

- **Dataset Selection** - Choose from various pre-configured datasets or generate custom synthetic data
- **UMAP Configuration** - Adjust n_neighbors, min_dist, n_components, spread, and learning rate parameters
- **Release Selection** - Select different umap-wasm releases directly from the UI to compare performance
- **Performance Metrics** - Track runtime, memory usage, embedding quality, FPS, and responsiveness
- **Visualization** - Interactive 3D visualization of UMAP embeddings using Plotly
