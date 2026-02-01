
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
function decodeText(ptr, len) {
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

const FlatTreeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_flattree_free(ptr >>> 0, 1));

const OptimizerStateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_optimizerstate_free(ptr >>> 0, 1));

const WasmSparseMatrixFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsparsematrix_free(ptr >>> 0, 1));

/**
 * A flattened random projection tree structure for efficient nearest neighbor search.
 * The tree is represented in flat arrays for efficient memory layout and cache performance.
 */
class FlatTree {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FlatTree.prototype);
        obj.__wbg_ptr = ptr;
        FlatTreeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FlatTreeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_flattree_free(ptr, 0);
    }
    /**
     * Get the hyperplanes as a flat Float64Array
     * @returns {Float64Array}
     */
    hyperplanes() {
        const ret = wasm.flattree_hyperplanes(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the dimensionality
     * @returns {number}
     */
    dim() {
        const ret = wasm.flattree_dim(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the leaf indices array
     * @returns {Int32Array}
     */
    indices() {
        const ret = wasm.flattree_indices(this.__wbg_ptr);
        var v1 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Get number of nodes
     * @returns {number}
     */
    n_nodes() {
        const ret = wasm.flattree_n_nodes(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the offsets as a Float64Array
     * @returns {Float64Array}
     */
    offsets() {
        const ret = wasm.flattree_offsets(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the children array (pairs of child indices)
     * @returns {Int32Array}
     */
    children() {
        const ret = wasm.flattree_children(this.__wbg_ptr);
        var v1 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) FlatTree.prototype[Symbol.dispose] = FlatTree.prototype.free;
exports.FlatTree = FlatTree;

/**
 * Represents the state needed for gradient descent optimization in UMAP.
 * This struct holds all the necessary data for performing iterative layout optimization.
 */
class OptimizerState {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OptimizerStateFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_optimizerstate_free(ptr, 0);
    }
    /**
     * Seed the internal RNG used by the optimizer.
     * @param {bigint} seed
     */
    set_rng_seed(seed) {
        wasm.optimizerstate_set_rng_seed(this.__wbg_ptr, seed);
    }
    /**
     * Get the current epoch number.
     * @returns {number}
     */
    get current_epoch() {
        const ret = wasm.optimizerstate_current_epoch(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the current embedding as a flat array.
     * @returns {Float64Array}
     */
    get head_embedding() {
        const ret = wasm.optimizerstate_head_embedding(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Get the length of the embedding buffer.
     * @returns {number}
     */
    head_embedding_len() {
        const ret = wasm.optimizerstate_head_embedding_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get a pointer to the embedding buffer (for zero-copy views).
     * @returns {number}
     */
    head_embedding_ptr() {
        const ret = wasm.optimizerstate_head_embedding_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Create a new optimizer state with the given parameters.
     * @param {Uint32Array} head
     * @param {Uint32Array} tail
     * @param {Float64Array} head_embedding
     * @param {Float64Array} tail_embedding
     * @param {Float64Array} epochs_per_sample
     * @param {Float64Array} epochs_per_negative_sample
     * @param {boolean} move_other
     * @param {number} initial_alpha
     * @param {number} gamma
     * @param {number} a
     * @param {number} b
     * @param {number} dim
     * @param {number} n_epochs
     * @param {number} n_vertices
     */
    constructor(head, tail, head_embedding, tail_embedding, epochs_per_sample, epochs_per_negative_sample, move_other, initial_alpha, gamma, a, b, dim, n_epochs, n_vertices) {
        const ptr0 = passArray32ToWasm0(head, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(tail, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(head_embedding, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(tail_embedding, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArrayF64ToWasm0(epochs_per_sample, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArrayF64ToWasm0(epochs_per_negative_sample, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ret = wasm.optimizerstate_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, move_other, initial_alpha, gamma, a, b, dim, n_epochs, n_vertices);
        this.__wbg_ptr = ret >>> 0;
        OptimizerStateFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get the total number of epochs.
     * @returns {number}
     */
    get n_epochs() {
        const ret = wasm.optimizerstate_n_epochs(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the current RNG seed/state.
     * @returns {bigint}
     */
    rng_seed() {
        const ret = wasm.optimizerstate_rng_seed(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
}
if (Symbol.dispose) OptimizerState.prototype[Symbol.dispose] = OptimizerState.prototype.free;
exports.OptimizerState = OptimizerState;

/**
 * Internal 2-dimensional sparse matrix class implemented in Rust/WASM.
 *
 * This mirrors the JavaScript SparseMatrix class for efficient sparse matrix
 * operations in WebAssembly.
 */
class WasmSparseMatrix {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSparseMatrix.prototype);
        obj.__wbg_ptr = ptr;
        WasmSparseMatrixFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSparseMatrixFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsparsematrix_free(ptr, 0);
    }
    /**
     * Get all values
     * @returns {Float64Array}
     */
    get_values() {
        const ret = wasm.wasmsparsematrix_get_values(this.__wbg_ptr);
        return ret;
    }
    /**
     * Apply a scalar operation to all values (map with scalar)
     * @param {string} operation
     * @param {number} scalar
     * @returns {WasmSparseMatrix}
     */
    map_scalar(operation, scalar) {
        const ptr0 = passStringToWasm0(operation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsparsematrix_map_scalar(this.__wbg_ptr, ptr0, len0, scalar);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSparseMatrix.__wrap(ret[0]);
    }
    /**
     * Get all entries as flat arrays [rows, cols, values] - ordered by row then col
     * @returns {Float64Array}
     */
    get_all_ordered() {
        const ret = wasm.wasmsparsematrix_get_all_ordered(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Get a value at the given row and column, with a default value if not present
     * @param {number} row
     * @param {number} col
     * @param {number} default_value
     * @returns {number}
     */
    get(row, col, default_value) {
        const ret = wasm.wasmsparsematrix_get(this.__wbg_ptr, row, col, default_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * Create a new sparse matrix from rows, cols, values, and dimensions.
     *
     * # Arguments
     * * `rows` - Row indices for each value
     * * `cols` - Column indices for each value
     * * `values` - The values to store
     * * `n_rows` - Number of rows in the matrix
     * * `n_cols` - Number of columns in the matrix
     * @param {Int32Array} rows
     * @param {Int32Array} cols
     * @param {Float64Array} values
     * @param {number} n_rows
     * @param {number} n_cols
     */
    constructor(rows, cols, values, n_rows, n_cols) {
        const ptr0 = passArray32ToWasm0(rows, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(cols, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(values, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsparsematrix_new(ptr0, len0, ptr1, len1, ptr2, len2, n_rows, n_cols);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        WasmSparseMatrixFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get number of non-zero entries
     * @returns {number}
     */
    nnz() {
        const ret = wasm.wasmsparsematrix_nnz(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Set a value at the given row and column
     * @param {number} row
     * @param {number} col
     * @param {number} value
     */
    set(row, col, value) {
        const ret = wasm.wasmsparsematrix_set(this.__wbg_ptr, row, col, value);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Get the number of columns
     * @returns {number}
     */
    get n_cols() {
        const ret = wasm.wasmsparsematrix_n_cols(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the number of rows
     * @returns {number}
     */
    get n_rows() {
        const ret = wasm.wasmsparsematrix_n_rows(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get all column indices
     * @returns {Int32Array}
     */
    get_cols() {
        const ret = wasm.wasmsparsematrix_get_cols(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the dimensions as [nRows, nCols]
     * @returns {Uint32Array}
     */
    get_dims() {
        const ret = wasm.wasmsparsematrix_get_dims(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Get all row indices
     * @returns {Int32Array}
     */
    get_rows() {
        const ret = wasm.wasmsparsematrix_get_rows(this.__wbg_ptr);
        return ret;
    }
    /**
     * Convert to dense 2D array (row-major, flattened)
     * @returns {Float64Array}
     */
    to_array() {
        const ret = wasm.wasmsparsematrix_to_array(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) WasmSparseMatrix.prototype[Symbol.dispose] = WasmSparseMatrix.prototype.free;
exports.WasmSparseMatrix = WasmSparseMatrix;

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
 * @param {Float64Array} data
 * @param {number} n_samples
 * @param {number} dim
 * @param {number} leaf_size
 * @param {bigint} seed
 * @returns {FlatTree}
 */
function build_rp_tree(data, n_samples, dim, leaf_size, seed) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.build_rp_tree(ptr0, len0, n_samples, dim, leaf_size, seed);
    return FlatTree.__wrap(ret);
}
exports.build_rp_tree = build_rp_tree;

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
 * @param {Float64Array} x
 * @param {Float64Array} y
 * @returns {number}
 */
function cosine(x, y) {
    const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.cosine(ptr0, len0, ptr1, len1);
    return ret;
}
exports.cosine = cosine;

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
 * @param {Float64Array} x
 * @param {Float64Array} y
 * @returns {number}
 */
function euclidean(x, y) {
    const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.euclidean(ptr0, len0, ptr1, len1);
    return ret;
}
exports.euclidean = euclidean;

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
 * @param {Float64Array} data_flat
 * @param {number} n_samples
 * @param {number} dim
 * @param {Int32Array} leaf_array_flat
 * @param {number} n_leaves
 * @param {number} leaf_size
 * @param {number} n_neighbors
 * @param {number} n_iters
 * @param {number} max_candidates
 * @param {number} delta
 * @param {number} rho
 * @param {boolean} rp_tree_init
 * @param {string} distance_metric
 * @param {bigint} seed
 * @returns {Float64Array}
 */
function nn_descent(data_flat, n_samples, dim, leaf_array_flat, n_leaves, leaf_size, n_neighbors, n_iters, max_candidates, delta, rho, rp_tree_init, distance_metric, seed) {
    const ptr0 = passArrayF64ToWasm0(data_flat, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(leaf_array_flat, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(distance_metric, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.nn_descent(ptr0, len0, n_samples, dim, ptr1, len1, n_leaves, leaf_size, n_neighbors, n_iters, max_candidates, delta, rho, rp_tree_init, ptr2, len2, seed);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v4;
}
exports.nn_descent = nn_descent;

/**
 * Perform multiple optimization steps in a batch.
 *
 * This function runs multiple epochs of optimization, which can be more
 * efficient than calling optimize_layout_step repeatedly due to reduced
 * JavaScript/WASM boundary crossings.
 *
 * # Arguments
 * * `state` - Mutable reference to the optimizer state
 * * `n_steps` - Number of steps to perform
 *
 * # Returns
 * The final embedding as a flat vector
 * @param {OptimizerState} state
 * @param {number} n_steps
 * @returns {Float64Array}
 */
function optimize_layout_batch(state, n_steps) {
    _assertClass(state, OptimizerState);
    const ret = wasm.optimize_layout_batch(state.__wbg_ptr, n_steps);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}
exports.optimize_layout_batch = optimize_layout_batch;

/**
 * Perform multiple optimization steps in place without cloning the embedding.
 * @param {OptimizerState} state
 * @param {number} n_steps
 */
function optimize_layout_batch_in_place(state, n_steps) {
    _assertClass(state, OptimizerState);
    wasm.optimize_layout_batch_in_place(state.__wbg_ptr, n_steps);
}
exports.optimize_layout_batch_in_place = optimize_layout_batch_in_place;

/**
 * Perform a single optimization step for UMAP layout.
 *
 * # Arguments
 * * `state` - Mutable reference to the optimizer state
 * # Returns
 * The updated embedding as a flat vector
 * @param {OptimizerState} state
 * @returns {Float64Array}
 */
function optimize_layout_step(state) {
    _assertClass(state, OptimizerState);
    const ret = wasm.optimize_layout_step(state.__wbg_ptr);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}
exports.optimize_layout_step = optimize_layout_step;

/**
 * Perform a single optimization step in place without cloning the embedding.
 * @param {OptimizerState} state
 */
function optimize_layout_step_in_place(state) {
    _assertClass(state, OptimizerState);
    wasm.optimize_layout_step_in_place(state.__wbg_ptr);
}
exports.optimize_layout_step_in_place = optimize_layout_step_in_place;

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
 * @param {FlatTree} tree
 * @param {Float64Array} point
 * @param {bigint} seed
 * @returns {Int32Array}
 */
function search_flat_tree(tree, point, seed) {
    _assertClass(tree, FlatTree);
    const ptr0 = passArrayF64ToWasm0(point, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.search_flat_tree(tree.__wbg_ptr, ptr0, len0, seed);
    var v2 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}
exports.search_flat_tree = search_flat_tree;

/**
 * Element-wise addition of two sparse matrices
 * @param {WasmSparseMatrix} a
 * @param {WasmSparseMatrix} b
 * @returns {WasmSparseMatrix}
 */
function sparse_add(a, b) {
    _assertClass(a, WasmSparseMatrix);
    _assertClass(b, WasmSparseMatrix);
    const ret = wasm.sparse_add(a.__wbg_ptr, b.__wbg_ptr);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_add = sparse_add;

/**
 * Remove zero entries from a sparse matrix
 * @param {WasmSparseMatrix} m
 * @returns {WasmSparseMatrix}
 */
function sparse_eliminate_zeros(m) {
    _assertClass(m, WasmSparseMatrix);
    const ret = wasm.sparse_eliminate_zeros(m.__wbg_ptr);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_eliminate_zeros = sparse_eliminate_zeros;

/**
 * Get CSR representation of a sparse matrix
 * Returns flat array: [indices..., values..., indptr...]
 * With counts at the start: [n_indices, n_values, n_indptr, indices..., values..., indptr...]
 * @param {WasmSparseMatrix} m
 * @returns {Float64Array}
 */
function sparse_get_csr(m) {
    _assertClass(m, WasmSparseMatrix);
    const ret = wasm.sparse_get_csr(m.__wbg_ptr);
    return ret;
}
exports.sparse_get_csr = sparse_get_csr;

/**
 * Create a sparse identity matrix
 * @param {number} size
 * @returns {WasmSparseMatrix}
 */
function sparse_identity(size) {
    const ret = wasm.sparse_identity(size);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_identity = sparse_identity;

/**
 * Element-wise maximum of two sparse matrices
 * @param {WasmSparseMatrix} a
 * @param {WasmSparseMatrix} b
 * @returns {WasmSparseMatrix}
 */
function sparse_maximum(a, b) {
    _assertClass(a, WasmSparseMatrix);
    _assertClass(b, WasmSparseMatrix);
    const ret = wasm.sparse_maximum(a.__wbg_ptr, b.__wbg_ptr);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_maximum = sparse_maximum;

/**
 * Scalar multiplication of a sparse matrix
 * @param {WasmSparseMatrix} a
 * @param {number} scalar
 * @returns {WasmSparseMatrix}
 */
function sparse_multiply_scalar(a, scalar) {
    _assertClass(a, WasmSparseMatrix);
    const ret = wasm.sparse_multiply_scalar(a.__wbg_ptr, scalar);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_multiply_scalar = sparse_multiply_scalar;

/**
 * Normalize a sparse matrix (l2 normalization by row)
 * @param {WasmSparseMatrix} m
 * @param {string} norm_type
 * @returns {WasmSparseMatrix}
 */
function sparse_normalize(m, norm_type) {
    _assertClass(m, WasmSparseMatrix);
    const ptr0 = passStringToWasm0(norm_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sparse_normalize(m.__wbg_ptr, ptr0, len0);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_normalize = sparse_normalize;

/**
 * Element-wise multiplication of two sparse matrices
 * @param {WasmSparseMatrix} a
 * @param {WasmSparseMatrix} b
 * @returns {WasmSparseMatrix}
 */
function sparse_pairwise_multiply(a, b) {
    _assertClass(a, WasmSparseMatrix);
    _assertClass(b, WasmSparseMatrix);
    const ret = wasm.sparse_pairwise_multiply(a.__wbg_ptr, b.__wbg_ptr);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_pairwise_multiply = sparse_pairwise_multiply;

/**
 * Element-wise subtraction of two sparse matrices
 * @param {WasmSparseMatrix} a
 * @param {WasmSparseMatrix} b
 * @returns {WasmSparseMatrix}
 */
function sparse_subtract(a, b) {
    _assertClass(a, WasmSparseMatrix);
    _assertClass(b, WasmSparseMatrix);
    const ret = wasm.sparse_subtract(a.__wbg_ptr, b.__wbg_ptr);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_subtract = sparse_subtract;

/**
 * Transpose a sparse matrix
 * @param {WasmSparseMatrix} matrix
 * @returns {WasmSparseMatrix}
 */
function sparse_transpose(matrix) {
    _assertClass(matrix, WasmSparseMatrix);
    const ret = wasm.sparse_transpose(matrix.__wbg_ptr);
    return WasmSparseMatrix.__wrap(ret);
}
exports.sparse_transpose = sparse_transpose;

/**
 * Simple helper to ensure the wasm is loaded and working.
 * @returns {string}
 */
function version() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.version();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}
exports.version = version;

exports.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

exports.__wbg_new_from_slice_9a48ef80d2a51f94 = function(arg0, arg1) {
    const ret = new Float64Array(getArrayF64FromWasm0(arg0, arg1));
    return ret;
};

exports.__wbg_new_from_slice_e6bd3cfb5a35313d = function(arg0, arg1) {
    const ret = new Int32Array(getArrayI32FromWasm0(arg0, arg1));
    return ret;
};

exports.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
};

const wasmPath = `${__dirname}/umap_wasm_core_bg.wasm`;
const wasmBytes = require('fs').readFileSync(wasmPath);
const wasmModule = new WebAssembly.Module(wasmBytes);
const wasm = exports.__wasm = new WebAssembly.Instance(wasmModule, imports).exports;

wasm.__wbindgen_start();
