import type { Page } from "@playwright/test";

const TOGGLE_LABELS = {
  useWasmDistance: "useWasmDistance",
  useWasmTree: "useWasmTree",
  useWasmMatrix: "useWasmMatrix",
  useWasmNNDescent: "useWasmNNDescent",
  useWasmOptimizer: "useWasmOptimizer",
} as const;

const FEATURE_ALIAS_MAP: Record<string, keyof typeof TOGGLE_LABELS> = {
  distance: "useWasmDistance",
  tree: "useWasmTree",
  matrix: "useWasmMatrix",
  nn: "useWasmNNDescent",
  nndescent: "useWasmNNDescent",
  optimizer: "useWasmOptimizer",
  dist: "useWasmDistance",
  opt: "useWasmOptimizer",
};

export type WasmConfigSelection = Record<keyof typeof TOGGLE_LABELS, boolean>;

export const getWasmConfigFromEnv = (): {
  selection: WasmConfigSelection;
  raw: string;
} => {
  const rawValue = (process.env.WASM_FEATURES || "none").trim();
  const raw = rawValue.length > 0 ? rawValue : "none";
  const lower = raw.toLowerCase();

  const defaultSelection: WasmConfigSelection = {
    useWasmDistance: false,
    useWasmTree: false,
    useWasmMatrix: false,
    useWasmNNDescent: false,
    useWasmOptimizer: false,
  };

  if (lower === "all") {
    return {
      selection: {
        useWasmDistance: true,
        useWasmTree: true,
        useWasmMatrix: true,
        useWasmNNDescent: true,
        useWasmOptimizer: true,
      },
      raw,
    };
  }

  if (lower === "none") {
    return { selection: defaultSelection, raw };
  }

  const selection = { ...defaultSelection };
  const parts = lower.split(",").map((part) => part.trim()).filter(Boolean);
  for (const part of parts) {
    const mapped = FEATURE_ALIAS_MAP[part];
    if (mapped) {
      selection[mapped] = true;
    }
  }

  return { selection, raw };
};

const wasmToggle = (page: Page, label: string) =>
  page
    .locator(".toggle-control", { hasText: label })
    .locator('input[type="checkbox"]');

export const applyWasmConfig = async (
  page: Page,
  config: WasmConfigSelection
) => {
  const entries = Object.entries(config) as Array<
    [keyof WasmConfigSelection, boolean]
  >;
  for (const [key, enabled] of entries) {
    const label = TOGGLE_LABELS[key];
    const checkbox = wasmToggle(page, label);
    if ((await checkbox.isChecked()) !== enabled) {
      await checkbox.click();
    }
  }
};
