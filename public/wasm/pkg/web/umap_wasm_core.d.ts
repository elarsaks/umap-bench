/* tslint:disable */
/* eslint-disable */

export class FlatTree {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get the hyperplanes as a flat Float64Array
   */
  hyperplanes(): Float64Array;
  /**
   * Get the dimensionality
   */
  dim(): number;
  /**
   * Get the leaf indices array
   */
  indices(): Int32Array;
  /**
   * Get number of nodes
   */
  n_nodes(): number;
  /**
   * Get the offsets as a Float64Array
   */
  offsets(): Float64Array;
  /**
   * Get the children array (pairs of child indices)
   */
  children(): Int32Array;
}

export class OptimizerState {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a new optimizer state with the given parameters.
   */
  constructor(head: Uint32Array, tail: Uint32Array, head_embedding: Float64Array, tail_embedding: Float64Array, epochs_per_sample: Float64Array, epochs_per_negative_sample: Float64Array, move_other: boolean, initial_alpha: number, gamma: number, a: number, b: number, dim: number, n_epochs: number, n_vertices: number);
  /**
   * Get the current epoch number.
   */
  readonly current_epoch: number;
  /**
   * Get the current embedding as a flat array.
   */
  readonly head_embedding: Float64Array;
  /**
   * Get the total number of epochs.
   */
  readonly n_epochs: number;
}

export class WasmSparseMatrix {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get all values
   */
  get_values(): Float64Array;
  /**
   * Apply a scalar operation to all values (map with scalar)
   */
  map_scalar(operation: string, scalar: number): WasmSparseMatrix;
  /**
   * Get all entries as flat arrays [rows, cols, values] - ordered by row then col
   */
  get_all_ordered(): Float64Array;
  /**
   * Get a value at the given row and column, with a default value if not present
   */
  get(row: number, col: number, default_value: number): number;
  /**
   * Create a new sparse matrix from rows, cols, values, and dimensions.
   * 
   * # Arguments
   * * `rows` - Row indices for each value
   * * `cols` - Column indices for each value
   * * `values` - The values to store
   * * `n_rows` - Number of rows in the matrix
   * * `n_cols` - Number of columns in the matrix
   */
  constructor(rows: Int32Array, cols: Int32Array, values: Float64Array, n_rows: number, n_cols: number);
  /**
   * Get number of non-zero entries
   */
  nnz(): number;
  /**
   * Set a value at the given row and column
   */
  set(row: number, col: number, value: number): void;
  /**
   * Get all column indices
   */
  get_cols(): Int32Array;
  /**
   * Get the dimensions as [nRows, nCols]
   */
  get_dims(): Uint32Array;
  /**
   * Get all row indices
   */
  get_rows(): Int32Array;
  /**
   * Convert to dense 2D array (row-major, flattened)
   */
  to_array(): Float64Array;
  /**
   * Get the number of columns
   */
  readonly n_cols: number;
  /**
   * Get the number of rows
   */
  readonly n_rows: number;
}

/**
 * Build a random projection tree for the given data.
 * 
 * # Arguments
 * * `data` - Flattened data matrix (row-major, n_samples * dim)
 * * `n_samples` - Number of data points
 * * `dim` - Dimensionality of each point
 * * `leaf_size` - Maximum number of points in a leaf node
 * * `seed` - Random seed for reproducibility
 * 
 * # Returns
 * A FlatTree structure ready for efficient search
 */
export function build_rp_tree(data: Float64Array, n_samples: number, dim: number, leaf_size: number, seed: bigint): FlatTree;

/**
 * Compute the cosine distance between two vectors.
 * 
 * This function computes the cosine distance as 1 - (dot product / (norm_x * norm_y)).
 * Cosine distance measures the angle between vectors and ranges from 0 (identical direction)
 * to 2 (opposite directions).
 * 
 * # Arguments
 * * `x` - First vector as a slice of f64
 * * `y` - Second vector as a slice of f64
 * 
 * # Returns
 * The cosine distance as f64
 * 
 * # Special Cases
 * * If both vectors have zero norm, returns 0.0
 * * If either vector has zero norm, returns 1.0
 * 
 * # Panics
 * Panics if vectors have different lengths
 */
export function cosine(x: Float64Array, y: Float64Array): number;

/**
 * Compute the Euclidean distance between two vectors.
 * 
 * This function computes the standard L2 distance by summing the squared 
 * differences of corresponding elements and returning the square root.
 * 
 * # Arguments
 * * `x` - First vector as a slice of f64
 * * `y` - Second vector as a slice of f64
 * 
 * # Returns
 * The Euclidean distance as f64
 * 
 * # Panics
 * Panics if vectors have different lengths
 */
export function euclidean(x: Float64Array, y: Float64Array): number;

/**
 * Nearest Neighbor Descent implementation in Rust/WASM.
 * 
 * This function performs approximate nearest neighbor graph construction
 * using the NN-Descent algorithm.
 * 
 * # Arguments
 * * `data_flat` - Flattened data matrix (row-major)
 * * `n_samples` - Number of data points
 * * `dim` - Dimensionality of each point
 * * `leaf_array_flat` - Flattened leaf array from RP-trees (for initialization)
 * * `n_leaves` - Number of leaves in the RP-tree forest
 * * `leaf_size` - Size of each leaf
 * * `n_neighbors` - Number of neighbors to find
 * * `n_iters` - Number of NN-Descent iterations
 * * `max_candidates` - Maximum number of candidates to consider
 * * `delta` - Early stopping threshold
 * * `rho` - Sampling rate for candidates
 * * `rp_tree_init` - Whether to use RP-tree initialization
 * * `distance_metric` - Distance metric to use ("euclidean" or "cosine")
 * * `seed` - Random seed
 * 
 * # Returns
 * A flattened array containing [distances, indices, flags] for the k-NN graph
 */
export function nn_descent(data_flat: Float64Array, n_samples: number, dim: number, leaf_array_flat: Int32Array, n_leaves: number, leaf_size: number, n_neighbors: number, n_iters: number, max_candidates: number, delta: number, rho: number, rp_tree_init: boolean, distance_metric: string, seed: bigint): Float64Array;

/**
 * Perform multiple optimization steps in a batch.
 * 
 * This function runs multiple epochs of optimization, which can be more
 * efficient than calling optimize_layout_step repeatedly due to reduced
 * JavaScript/WASM boundary crossings.
 * 
 * # Arguments
 * * `state` - Mutable reference to the optimizer state
 * * `rng_seed` - Seed for random number generation
 * * `n_steps` - Number of steps to perform
 * 
 * # Returns
 * The final embedding as a flat vector
 */
export function optimize_layout_batch(state: OptimizerState, rng_seed: bigint, n_steps: number): Float64Array;

/**
 * Perform a single optimization step for UMAP layout.
 * 
 * This function executes one epoch of the stochastic gradient descent algorithm
 * used to optimize the low-dimensional embedding. It processes attractive forces
 * between known neighbors and repulsive forces from negative samples.
 * 
 * # Arguments
 * * `state` - Mutable reference to the optimizer state
 * * `rng_seed` - Seed for random number generation (will be updated internally)
 * 
 * # Returns
 * The updated embedding as a flat vector
 */
export function optimize_layout_step(state: OptimizerState, rng_seed: bigint): Float64Array;

/**
 * Search a flattened tree to find the leaf containing the query point.
 * 
 * # Arguments
 * * `tree` - The FlatTree to search
 * * `point` - Query point to search for
 * * `seed` - Random seed for tie-breaking
 * 
 * # Returns
 * Array of indices in the leaf node containing the query point
 */
export function search_flat_tree(tree: FlatTree, point: Float64Array, seed: bigint): Int32Array;

/**
 * Element-wise addition of two sparse matrices
 */
export function sparse_add(a: WasmSparseMatrix, b: WasmSparseMatrix): WasmSparseMatrix;

/**
 * Remove zero entries from a sparse matrix
 */
export function sparse_eliminate_zeros(m: WasmSparseMatrix): WasmSparseMatrix;

/**
 * Get CSR representation of a sparse matrix
 * Returns flat array: [indices..., values..., indptr...]
 * With counts at the start: [n_indices, n_values, n_indptr, indices..., values..., indptr...]
 */
export function sparse_get_csr(m: WasmSparseMatrix): Float64Array;

/**
 * Create a sparse identity matrix
 */
export function sparse_identity(size: number): WasmSparseMatrix;

/**
 * Element-wise maximum of two sparse matrices
 */
export function sparse_maximum(a: WasmSparseMatrix, b: WasmSparseMatrix): WasmSparseMatrix;

/**
 * Scalar multiplication of a sparse matrix
 */
export function sparse_multiply_scalar(a: WasmSparseMatrix, scalar: number): WasmSparseMatrix;

/**
 * Normalize a sparse matrix (l2 normalization by row)
 */
export function sparse_normalize(m: WasmSparseMatrix, norm_type: string): WasmSparseMatrix;

/**
 * Element-wise multiplication of two sparse matrices
 */
export function sparse_pairwise_multiply(a: WasmSparseMatrix, b: WasmSparseMatrix): WasmSparseMatrix;

/**
 * Element-wise subtraction of two sparse matrices
 */
export function sparse_subtract(a: WasmSparseMatrix, b: WasmSparseMatrix): WasmSparseMatrix;

/**
 * Transpose a sparse matrix
 */
export function sparse_transpose(matrix: WasmSparseMatrix): WasmSparseMatrix;

/**
 * Simple helper to ensure the wasm is loaded and working.
 */
export function version(): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_flattree_free: (a: number, b: number) => void;
  readonly __wbg_optimizerstate_free: (a: number, b: number) => void;
  readonly __wbg_wasmsparsematrix_free: (a: number, b: number) => void;
  readonly build_rp_tree: (a: number, b: number, c: number, d: number, e: number, f: bigint) => number;
  readonly cosine: (a: number, b: number, c: number, d: number) => number;
  readonly euclidean: (a: number, b: number, c: number, d: number) => number;
  readonly flattree_children: (a: number) => [number, number];
  readonly flattree_dim: (a: number) => number;
  readonly flattree_hyperplanes: (a: number) => any;
  readonly flattree_indices: (a: number) => [number, number];
  readonly flattree_n_nodes: (a: number) => number;
  readonly flattree_offsets: (a: number) => any;
  readonly nn_descent: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: bigint) => [number, number, number, number];
  readonly optimize_layout_batch: (a: number, b: bigint, c: number) => [number, number];
  readonly optimize_layout_step: (a: number, b: bigint) => [number, number];
  readonly optimizerstate_current_epoch: (a: number) => number;
  readonly optimizerstate_head_embedding: (a: number) => [number, number];
  readonly optimizerstate_n_epochs: (a: number) => number;
  readonly optimizerstate_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number) => number;
  readonly search_flat_tree: (a: number, b: number, c: number, d: bigint) => [number, number];
  readonly sparse_add: (a: number, b: number) => number;
  readonly sparse_eliminate_zeros: (a: number) => number;
  readonly sparse_get_csr: (a: number) => any;
  readonly sparse_identity: (a: number) => number;
  readonly sparse_maximum: (a: number, b: number) => number;
  readonly sparse_multiply_scalar: (a: number, b: number) => number;
  readonly sparse_normalize: (a: number, b: number, c: number) => number;
  readonly sparse_pairwise_multiply: (a: number, b: number) => number;
  readonly sparse_subtract: (a: number, b: number) => number;
  readonly sparse_transpose: (a: number) => number;
  readonly version: () => [number, number];
  readonly wasmsparsematrix_get: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly wasmsparsematrix_get_all_ordered: (a: number) => [number, number];
  readonly wasmsparsematrix_get_cols: (a: number) => any;
  readonly wasmsparsematrix_get_dims: (a: number) => [number, number];
  readonly wasmsparsematrix_get_rows: (a: number) => any;
  readonly wasmsparsematrix_get_values: (a: number) => any;
  readonly wasmsparsematrix_map_scalar: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly wasmsparsematrix_n_cols: (a: number) => number;
  readonly wasmsparsematrix_n_rows: (a: number) => number;
  readonly wasmsparsematrix_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
  readonly wasmsparsematrix_nnz: (a: number) => number;
  readonly wasmsparsematrix_set: (a: number, b: number, c: number, d: number) => [number, number];
  readonly wasmsparsematrix_to_array: (a: number) => any;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
