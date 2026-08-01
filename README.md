# Operationalizing GIS and Machine Learning across Contrasting Cropping Systems

This repository accompanies the manuscript:
**"Integrated GIS, Remote-Sensing, and Machine-Learning Precision Agriculture Across
Three Portuguese Cropping Systems: Maize Fertility Zoning, Vineyard Pest Monitoring,
and Machine-Learning-Enhanced Grape Ripening Prediction"** (Naziru Halilu).

## Figures

All 21 manuscript figures, grouped by case study. Each panel is labelled (A)(B)(C)...
in plain black text.

### 1. Maize Fertility Zoning (corn_grid)

![Study area](figures/corn_grid1_studyarea.jpg)
**Fig. corn_grid1** — Study area

![Soil maps](figures/corn_grid2_soilmaps.jpg)
**Fig. corn_grid2** — Soil maps

![NDVI](figures/corn_grid3_ndvi.jpg)
**Fig. corn_grid3** — NDVI

![Water](figures/corn_grid4_water.jpg)
**Fig. corn_grid4** — Water/irrigation

![Stats](figures/corn_grid5_stats.jpg)
**Fig. corn_grid5** — Statistical summary

![Model performance](figures/corn_grid6_modelperf.jpg)
**Fig. corn_grid6** — Model performance

![VRT](figures/corn_grid7_vrt.jpg)
**Fig. corn_grid7** — Variable-rate technology (VRT) prescription map

### 2. Vineyard Pest Monitoring (gm_grid)

![Terrain](figures/gm_grid1_terrain.jpg)
**Fig. gm_grid1** — Terrain

![Land use](figures/gm_grid2_landuse.jpg)
**Fig. gm_grid2** — Land use

![Pest monitoring](figures/gm_grid3_pest.jpg)
**Fig. gm_grid3** — Pest monitoring (trap locations)

### 3. Grape Ripening / Brix Prediction (bx_grid)

![Study site](figures/bx_grid1_studysite.jpg)
**Fig. bx_grid1** — Study site

![Regression](figures/bx_grid2_regression.jpg)
**Fig. bx_grid2** — Regression

![Brix sampling](figures/bx_grid3_brixsampling.jpg)
**Fig. bx_grid3** — Brix sampling

![Experimental design](figures/bx_grid4_experimental.jpg)
**Fig. bx_grid4** — Experimental design

![Thiessen polygons](figures/bx_grid5_thiessen.jpg)
**Fig. bx_grid5** — Thiessen polygons

![Remote sensing](figures/bx_grid6_remotesensing.jpg)
**Fig. bx_grid6** — Remote sensing

### 4. Machine-Learning Results (ml_grid)

![Model comparison](figures/ml_grid1_model_comparison.jpg)
**Fig. ml_grid1** — Model comparison (CV RMSE/MAE/R²)

![Feature importance](figures/ml_grid2_feature_importance.jpg)
**Fig. ml_grid2** — Feature + permutation importance

![Observed vs predicted](figures/ml_grid3_observed_vs_predicted.jpg)
**Fig. ml_grid3** — Observed vs. predicted

![Hybrid surface map](figures/ml_grid4_hybrid_surface_map.jpg)
**Fig. ml_grid4** — Hybrid regression-kriging surface map

![Moran's I](figures/ml_grid5_morans_i.jpg)
**Fig. ml_grid5** — Moran's I spatial autocorrelation

---

## Folder structure

```
manuscript/   The final Word (.docx) manuscript (30 pages), with all in-text citations
              hyperlinked to bookmarked entries in the reference list (28 references),
              20 numbered equations (Eqn 1-20) covering IDW, NDVI, Pearson correlation,
              quadratic regressions, Random Forest, Gradient Boosting, a Multi-Layer
              Perceptron neural network, a Stacking Ensemble, regression-kriging
              (variogram + kriging system), Moran's I, and RMSE/MAE/R2, plus a
              Nomenclature table (Table 0), and 21 figures (each panel labelled A, B,
              C... in plain black text, no coloured background).

code/         All Python and JavaScript source code used in this project:
                - train_regression_kriging.py : trains and cross-validates IDW, Random
                  Forest, Gradient Boosting, a Neural Network (MLP), a Stacking
                  Ensemble, and hybrid regression-kriging (RF-RK, GB-RK) models for
                  Brix prediction; also computes Moran's I and permutation importance
                  (Sections 2.5 / 3.4 / 4.4 of the manuscript).
                - make_ml_figures.py           : generates the model-comparison,
                  feature-importance + permutation-importance, Moran's I, and
                  observed-vs-predicted figures (Figures 17-20).
                - make_hybrid_map.py           : generates the spatial hybrid
                  regression-kriging surface map (Figure 21).
                - make_grid.py                 : builds the labelled A/B/C... figure
                  grids from the original field-photo/GIS-map images.
                - translate_legend.py          : translates the Portuguese GIS legend
                  text in the vineyard-pest trap figures into English.
                - refs.js, build.js, generate.js, write.js : the manuscript-generation
                  pipeline (reference list with bookmarks/hyperlinks, equation
                  rendering, section content, and final .docx assembly).

data/         The real field data used to train the machine-learning models:
                - BRIX_AMT.csv          : 68 georeferenced (UTM) sampling points, Brix
                  at 5 dates (15 Jul - 30 Aug).
                - Sample_brix_ndvi.xlsx : same points with paired NDVI values.
                - BRIX_AMT_V2.xlsx      : original source workbook.

results/      Model outputs:
                - merged_brix_ndvi_utm.csv       : the cleaned, merged analysis dataset.
                - cv_pooled_spatiotemporal.json  : cross-validated RMSE/MAE/R2 for IDW,
                  Random Forest, Gradient Boosting, Neural Network, Stacking Ensemble,
                  RF-RK, and GB-RK (pooled spatio-temporal, GroupKFold-by-location
                  design; this is Table 3 in the manuscript).
                - cv_model_comparison.json       : per-date, spatial-only cross-
                  validation results (supplementary to the pooled analysis).
                - morans_i_brix.json             : global Moran's I spatial-
                  autocorrelation statistic for Brix at each sampling date (Figure 19).
                - permutation_importance.json    : model-agnostic permutation
                  importance for Easting, Northing, Julian day, and NDVI (Figure 18C).

figures/      All 21 manuscript figure images (JPEG), including the 5 new
              machine-learning figures (ml_grid1-5) and the 16 original case-study
              figure grids (corn_*, gm_*, bx_*), each labelled with plain (A)(B)(C)...
              panel letters.
```

## How to reproduce the machine-learning analysis

Requirements: Python 3, `pandas`, `numpy`, `scipy`, `scikit-learn`, `matplotlib`.
(Note: XGBoost was not available in the sandboxed environment used to prepare this
package; scikit-learn's `GradientBoostingRegressor`, which implements the same
gradient-boosted decision-tree algorithm, was used as a documented substitute.)

```bash
cd code
python3 train_regression_kriging.py   # trains models, cross-validates, writes results/
python3 make_ml_figures.py            # writes figures/ml_grid1-3
python3 make_hybrid_map.py            # writes figures/ml_grid4 (spatial surface map)
```

## Honest summary of the machine-learning result

Under rigorous, spatially grouped cross-validation (each vineyard sampling location
held out in full, across all five dates), Random Forest, Gradient Boosting, a Neural
Network (MLP), a Stacking Ensemble, and hybrid regression-kriging **did not outperform
simple IDW interpolation** for Brix prediction at the sampling density available (68
points): cross-validated R2 was 0.538 (IDW), 0.520 (Random Forest), 0.453 (Gradient
Boosting), 0.370 (Neural Network), 0.467 (Stacking Ensemble), and 0.378-0.454
(regression-kriging variants). This is reported transparently in the manuscript
(Section 4.4) rather than adjusted to show a more favourable result. Two independent
diagnostics explain why: permutation importance shows Julian day dominates NDVI and
spatial coordinates by roughly 5:1, and the global Moran's I statistic shows only weak
spatial autocorrelation in raw Brix values (I = 0.005-0.040 against an expected -0.015
under complete spatial randomness) - meaning there is little spatially structured
residual signal left for regression-kriging to exploit once the temporal trend is
removed. The pipeline itself is a genuine, reusable methodological contribution and is
expected to show clearer benefits on denser, multi-covariate, and/or multi-season
datasets (see manuscript Sections 4.1 and 4.3 for a data-driven discussion of where
machine learning is most likely to help next, using the maize dataset as the leading
candidate).

## Data provenance

All data in `data/` were provided by the author from original field campaigns
conducted as part of UTAD coursework (Quinta de Nossa Senhora de Lurdes, Vila Real,
Portugal). No data in this package were fabricated or simulated; all cross-validation
results in `results/` were computed directly from this dataset.
