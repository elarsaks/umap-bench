import type { Page } from "@playwright/test";

const TOGGLE_LABELS = {
  useWasmDistance: "useWasmDistance",
  useWasmTree: "useWasmTree",
  useWasmMatrix: "useWasmMatrix",
  useWasmNNDescent: "useWasmNNDescent",
  useWasmOptimizer: "useWasmOptimizer",
} as const;

const FEATURE_ALIAS_MAP: Record<string, keyof typeof TOGGLE_LABELS> = {
  tree: "useWasmTree",
  matrix: "useWasmMatrix",
  nn: "useWasmNNDescent",
  nndescent: "useWasmNNDescent",
  optimizer: "useWasmOptimizer",
  dist: "useWasmDistance",
  opt: "useWasmOptimizer",
};

export type WasmConfigSelection = Record<keyof typeof TOGGLE_LABELS, boolean>;

const SEQUENCE_ORDER = ["dist", "tree", "matrix", "nn", "opt"] as const;
const FULL_ORDER = ["none", ...SEQUENCE_ORDER, "all"] as const;

const buildSelection = (raw: string): WasmConfigSelection => {
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
      useWasmDistance: true,
      useWasmTree: true,
      useWasmMatrix: true,
      useWasmNNDescent: true,
      useWasmOptimizer: true,
    };
  }

  if (lower === "none") {
    return defaultSelection;
  }

  const selection = { ...defaultSelection };
  const parts = lower
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  for (const part of parts) {
    const mapped = FEATURE_ALIAS_MAP[part];
    if (mapped) {
      selection[mapped] = true;
    }
  }

  return selection;
};

export const getWasmConfigFromEnv = (): {
  selection: WasmConfigSelection;
  raw: string;
} => {
  const rawValue = (process.env.WASM_FEATURES || "none").trim();
  const raw = rawValue.length > 0 ? rawValue : "none";
  return { selection: buildSelection(raw), raw };
};

export const getWasmConfigsFromEnv = (options?: {
  defaultMode?: "single" | "js-and-all";
}): {
  configs: Array<{ label: string; selection: WasmConfigSelection }>;
  raw: string;
} => {
  const defaultMode = options?.defaultMode ?? "single";
  const rawValue = (process.env.WASM_FEATURES || "").trim();
  const raw = rawValue.length > 0 ? rawValue : "none";
  const lower = raw.toLowerCase();

  if (!rawValue && defaultMode === "js-and-all") {
    return {
      configs: [
        { label: "none", selection: buildSelection("none") },
        { label: "all", selection: buildSelection("all") },
      ],
      raw: "default",
    };
  }

  if (lower === "full") {
    return {
      configs: FULL_ORDER.map((label) => ({
        label,
        selection: buildSelection(label),
      })),
      raw,
    };
  }

  return {
    configs: [{ label: raw, selection: buildSelection(raw) }],
    raw,
  };
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
