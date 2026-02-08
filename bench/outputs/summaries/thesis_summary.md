
# UMAP WebAssembly Performance Analysis - Summary

## Analysis Configuration
- **Total Measurements**: 380
- **Datasets Tested**: 6
- **Features Tested**: 7

## Key Findings

### RQ1: Individual WASM Feature Performance

**Speedup ranges (median across all tests):**

- **All Features**: 1.58x (range: 1.18x - 1.89x) - ✓ Performance improvement

- **Distance**: 0.99x (range: 0.95x - 1.01x) - ≈ Negligible difference

- **Tree**: 1.01x (range: 1.00x - 1.05x) - ≈ Negligible difference

- **Matrix**: 1.02x (range: 1.00x - 1.02x) - ≈ Negligible difference

- **NN Descent**: 0.99x (range: 0.94x - 1.01x) - ≈ Negligible difference

- **Optimizer**: 1.47x (range: 1.17x - 1.85x) - ✓ Performance improvement


### RQ2: All Features Combined vs Individual Features


- **All Features Combined**: 1.58x median speedup
- **Best Individual Feature**: Optimizer (1.47x)
- **Comparison**: All Features is best


### Statistical Significance


- **Total comparisons**: 6
- **Significant results (p < 0.05)**: 2 (33.3%)
- **Large effect sizes (|Cliff's δ| > 0.474)**: 0
- **Medium effect sizes (0.33 < |Cliff's δ| < 0.474)**: 2


### Quality Trade-offs


- **Mean Trustworthiness**: 0.8953 (±0.1489)
- **Quality Range**: 0.5576 - 0.9975
- **Quality Stability**: All features maintain trustworthiness > 0.969

### Performance Rankings

**Top 3 Features by Composite Score:**

1. **Optimizer** (score: 0.896)
   - Speedup: 1.27x
   - Quality ratio: 1.003
   - FPS ratio: 0.732

2. **All Features** (score: 0.822)
   - Speedup: 1.26x
   - Quality ratio: 1.003
   - FPS ratio: 0.687

3. **Matrix** (score: 0.807)
   - Speedup: 1.03x
   - Quality ratio: 1.001
   - FPS ratio: 1.001


## Dataset Size Effects

**Scaling behavior across dataset sizes (80 - 1000 samples):**

- **Distance**: improves (0.95x → 0.99x, +5.0%)
- **Tree**: degrades (1.05x → 1.04x, -1.6%)
- **Matrix**: improves (1.01x → 1.02x, +0.5%)
- **NN Descent**: improves (0.94x → 0.99x, +4.9%)
- **All Features**: degrades (1.84x → 1.26x, -31.5%)
- **Optimizer**: degrades (1.67x → 1.26x, -24.6%)


## Recommendations


1. **Best Overall Performance**: Optimizer (composite score: 0.896)
2. **Fastest Execution**: All Features (1.58x speedup)
3. **Most Consistent**: Feature with lowest variance across datasets
4. **Quality Preservation**: All WASM features maintain high trustworthiness (> 0.969)


## Analysis Methodology

- **Statistical Method**: Mann-Whitney U tests (non-parametric)
- **Confidence Intervals**: Bootstrap resampling (10,000 iterations)
- **Effect Size Metric**: Cliff's Delta
- **Significance Level**: α = 0.05

---
*Analysis performed with 380 measurements across 6 datasets*
