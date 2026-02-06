
# UMAP WebAssembly Performance Analysis - Summary

## Analysis Configuration
- **Machine**: Linux
- **Total Measurements**: 420
- **Datasets Tested**: 6
- **Features Tested**: 7

## Key Findings

### RQ1: Individual WASM Feature Performance

**Speedup ranges (median across all tests):**

- **All Features**: 1.64x (range: 1.19x - 4.33x) - ✓ Performance improvement

- **Distance**: 1.00x (range: 0.97x - 1.11x) - ≈ Negligible difference

- **Tree**: 1.00x (range: 0.99x - 1.11x) - ≈ Negligible difference

- **Matrix**: 1.01x (range: 1.00x - 1.12x) - ≈ Negligible difference

- **NN Descent**: 0.99x (range: 0.99x - 1.11x) - ≈ Negligible difference

- **Optimizer**: 1.63x (range: 1.19x - 4.47x) - ✓ Performance improvement


### RQ2: All Features Combined vs Individual Features


- **All Features Combined**: 1.64x median speedup
- **Best Individual Feature**: All Features (1.64x)
- **Comparison**: All Features is best


### Statistical Significance

- **Total comparisons**: 6
- **Significant results (p < 0.05)**: 2 (33.3%)
- **Large effect sizes (|Cliff's δ| > 0.474)**: 2
- **Medium effect sizes (0.33 < |Cliff's δ| < 0.474)**: 0

### Quality Trade-offs

- **Mean Trustworthiness**: 0.8971 (±0.1433)
- **Quality Range**: 0.5589 - 0.9975
- **Quality Stability**: All features maintain trustworthiness > 0.967

### Performance Rankings

**Top 3 Features by Composite Score:**

6. **Optimizer** (score: 1.182)
   - Speedup: 1.70x
   - Quality ratio: 0.997
   - FPS ratio: 0.670

1. **All Features** (score: 1.011)
   - Speedup: 1.57x
   - Quality ratio: 0.997
   - FPS ratio: 0.666

4. **Matrix** (score: 0.803)
   - Speedup: 1.02x
   - Quality ratio: 1.000
   - FPS ratio: 1.008


## Dataset Size Effects

**Scaling behavior across dataset sizes (80 - 1000 samples):**

- **All Features**: degrades (4.33x → 1.25x, -71.1%)
- **Distance**: degrades (1.11x → 1.00x, -9.4%)
- **Tree**: degrades (1.11x → 1.00x, -10.4%)
- **Matrix**: degrades (1.12x → 1.00x, -10.5%)
- **NN Descent**: degrades (1.11x → 0.99x, -11.4%)
- **Optimizer**: degrades (4.47x → 1.24x, -72.3%)


## Recommendations

1. **Best Overall Performance**: Optimizer (composite score: 1.182)
2. **Fastest Execution**: All Features (1.64x speedup)
3. **Most Consistent**: Feature with lowest variance across datasets
4. **Quality Preservation**: All WASM features maintain high trustworthiness (> 0.967)

## Analysis Methodology

- **Statistical Method**: Mann-Whitney U tests (non-parametric)
- **Confidence Intervals**: Bootstrap resampling (10,000 iterations)
- **Effect Size Metric**: Cliff's Delta
- **Significance Level**: α = 0.05

---
*Analysis performed on Linux with 420 measurements across 6 datasets*
