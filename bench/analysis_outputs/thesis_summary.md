
# UMAP WebAssembly Performance Analysis - Summary

## Key Findings

### RQ1: Individual WASM Feature Performance

**Overall speedup ranges (median across all tests):**

- **All Features**: 1.77x (range: 1.19x - 5.73x) - ✓ Performance improvement

- **Distance**: 1.00x (range: 0.97x - 1.11x) - ≈ Negligible difference

- **Tree**: 0.99x (range: 0.92x - 1.11x) - ≈ Negligible difference

- **Matrix**: 1.00x (range: 0.96x - 1.12x) - ≈ Negligible difference

- **NN Descent**: 0.99x (range: 0.91x - 1.11x) - ≈ Negligible difference

- **Optimizer**: 1.73x (range: 1.19x - 5.64x) - ✓ Performance improvement


### RQ2: All Features Combined vs Individual Features


- **All Features Combined**: 1.77x median speedup
- Comparison: Best performing configuration


### RQ3: Machine-Specific Observations

**Data collected from:**
- Linux machine: 420 measurements
- MacBook: 472 measurements

**Key insight**: Absolute performance differs significantly between machines, but relative speedups show consistent patterns within each machine.

### Statistical Significance

- **Total significant results (p < 0.05)**: 4 out of 12
- **Large effect sizes (|Cliff's δ| > 0.474)**: 4

### Quality Trade-offs

- **Trustworthiness**: Mean = 0.9019, Std = 0.1405
- **Quality preservation**: All WASM variants maintain quality within 15.32% standard deviation

## Recommendations for Thesis

1. **Best Overall Performance**: All Features
2. **Most Consistent**: Feature with lowest speedup variance across datasets
3. **Quality-Preserving**: All features maintain high trustworthiness (> 0.80)

## Data Quality Notes

- Total rows analyzed: 892
- Datasets tested: 6
- Features tested: 7
- Statistical tests performed: 12
- Bootstrap iterations: 10,000 per comparison

---
*Generated from 892 benchmark measurements*
