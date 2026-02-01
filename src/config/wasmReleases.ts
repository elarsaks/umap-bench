import type { WasmRelease } from "@/types/benchmark";

export const WASM_RELEASES: WasmRelease[] = [
  {
    tag: "original",
    name: "original",
    releaseUrl: "https://github.com/elarsaks/umap-wasm/releases/tag/original",
    sourceZipUrl:
      "https://github.com/elarsaks/umap-wasm/archive/refs/tags/original.zip",
    notes:
      "Baseline JS-only implementation (reference); first published release.",
  },
];
