# umap-bench

Minimal Vite + React + TypeScript benchmark app for experimenting with UMAP implementations.

Prerequisites
- Node.js 22+ (recommended)
- npm

Quick start (Linux / WSL)
```bash
cd /mnt/c/Users/elars/Desktop/Thesis/umap-bench
npm install
npm run dev
```

Open the dev server at: http://localhost:5173

Build
```bash
npm run build
```

Preview
```bash
npm run preview
```

Select umap-wasm release
- Set `UMAP_WASM_RELEASE` to the desired tag before running the app (optional):
```bash
export UMAP_WASM_RELEASE=v1.2.3
npm run dev
```
