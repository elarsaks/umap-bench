import "@elarsaks/umap-wasm";

declare module "@elarsaks/umap-wasm" {
  interface UMAPParameters {
    useWasmTree?: boolean;
    useWasmMatrix?: boolean;
  }
}
