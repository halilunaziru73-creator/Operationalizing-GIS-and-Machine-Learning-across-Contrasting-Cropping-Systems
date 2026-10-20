# Operationalizing GIS and Machine Learning across Contrasting Cropping Systems

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) ![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21760034.svg)](https://doi.org/10.5281/zenodo.21760034)

**Author:** Naziru Halilu

This repository accompanies the revised manuscript **"From point samples to
management maps: a validation-tiered evaluation of GIS, spatial interpolation
and machine learning in three Portuguese precision-agriculture case studies"**
(Naziru Halilu and Juwairiyyah Sulaiman).

The revised manuscript is available as a standalone file, with every figure
placed at the position where it is first cited:

- [Revised manuscript (PDF)](manuscript/Halilu_Sulaiman_Revised_Manuscript.pdf)
- [Revised manuscript (Word)](manuscript/Halilu_Sulaiman_Revised_Manuscript.docx)

The first version of the manuscript ("Integrated GIS, Remote-Sensing, and
Machine-Learning Precision Agriculture Across Three Portuguese Cropping
Systems") and its 21 figures are kept for reference in
[`manuscript/original_submission/`](manuscript/original_submission) and
[`figures/original_submission/`](figures/original_submission).

## Problem, Methodology, and Results

**Main figures**

![Figure 1](figures/Figure_01_workflow.png)

**Figure 1.** Common workflow of the three case studies, from field observation to evidence tier.

**Synthesis.** The three campaigns follow one chain: point observations are joined to GIS layers (Thiessen zones, inverse-distance surfaces, point-support layers), checked with diagnostics, and turned into a decision output, and every output is then assigned an evidence tier. Defining the chain once is what allows the cases to be compared by predefined criteria (observational unit, prediction task, validation tier, uncertainty, implementation need) rather than by crop.

![Figure 2](figures/Figure_02_validation_tiers.png)

**Figure 2.** Validation-tier framework used to synthesise the three case studies.

**Synthesis.** Every output reaches the descriptive tiers, but none reaches agronomic or decision validity (T4) or transferability (T5). The maize prescription equations are only partly validated because they reproduce a reference table rather than a measured crop response, the moth maps remain descriptive, and in Case III the out-of-sample prediction of Brix was tested and not supported.

![Figure 3](figures/Figure_03_sampling_designs.png)

**Figure 3.** Sampling designs of the two case studies with point data.

**Synthesis.** The designs fix what one unit of analysis is. In Case I the 17,724 yield-monitor points are summarised by 16 Thiessen zones of the 4 × 4 composite soil design; in Case III the 68 fixed locations on an approximately 25 m grid were resampled on five dates, so repeated dates add observations but not independent spatial information.

![Figure 4](figures/Figure_04_yield_water_spatial_support.png)

**Figure 4.** Effect of the spatial support on the yield and soil-water correlation in Case I.

**Synthesis.** The same relationship looks very different at two supports. Between yield and deep-layer soil water the correlation is r = 0.97 for the 16 zone means but only r = 0.57 for the 17,724 points, because aggregation removes within-zone noise. The zone-level coefficient describes association between field-scale patterns and not the strength of the relationship at any location, and accounting for spatial dependence reduced the effective sample size of the zone correlations from 16 to about 8–10.

![Figure 5](figures/Figure_05_prescription_equations_maps.png)

**Figure 5.** Prescription equations and potential variable-rate maps in Case I.

**Synthesis.** Linear, quadratic and cubic fits describe the smooth reference tables almost equally well (R² 0.970–0.998), so the model form cannot be chosen by goodness of fit. Applied to the interpolated pH surface, the potential lime total is 35.6–39.4 t against 42.1 t for the uniform rate: the direction of the change is robust, its size varies by about a factor of two, and the maps are potential prescriptions that assume the patterns persist between seasons, which was not tested.

![Figure 6](figures/Figure_06_moth_captures_damage.png)

**Figure 6.** Pheromone-trap network and observed captures and damage of Lobesia botrana at Quinta da Senhora da Graça.

**Synthesis.** Captures were lowest in April, highest in June (up to 16–18 males per trap in the north-eastern and south-eastern sectors) and low again in August, and damage followed one month behind. The maps show observations only: under mating disruption captures reflect incomplete disruption rather than density, and with three inspections and class-valued counts the patterns support descriptive mapping (T1) but not claims about an edge effect, pest origin or dispersal, which are stated as hypotheses to test.

![Figure 7](figures/Figure_07_brix_trend_ndvi.png)

**Figure 7.** Case III, temporal behaviour and NDVI association of Brix.

**Synthesis.** Mean Brix rose from 9.2 to 20.5 °Brix between 15 July and 30 August, and the differences between locations persisted (date 57% and location 42% of the variance; ICC 0.975). The four growth functions fit the five means equally well but diverge when extrapolated, giving a 25.5 °Brix date from 16 September to 28 September, so model-form uncertainty exceeds sampling uncertainty. NDVI was weakly and not significantly associated with Brix (r 0.19–0.24, R² ≤ 0.06).

![Figure 8](figures/Figure_08_brix_validation_forecast.png)

**Figure 8.** Case III, validation of spatial prediction and forecasting.

**Synthesis.** No spatial model beats the date-mean null model (R² 0.55): inverse distance weighting with p = 1 equals it, and all other interpolators and machine-learning models fall below it. Per-date spatial-only cross-validation gives R² between −0.48 and 0.01, and Moran's I of raw Brix is not significant on any date (all p ≥ 0.09), so neighbouring locations are no more similar than distant ones. What is predictable is the location itself: a forecast anchored on each location's past anomaly, issued with data up to 15 August, has an RMSE of 1.59 °Brix against 3.40 °Brix for the vineyard-mean forecast.

![Figure 9](figures/Figure_09_additional_analyses.png)

**Figure 9.** Additional analyses of the strength of evidence.

**Synthesis.** Four analyses bound the conclusions. In Case I, spatial block cross-validation shows inverse-distance weighting of yield as the best predictor (R² 0.72, 0.61 and 0.47 at 30, 60 and 120 m) and skill falling with distance from the training data, and the Monte Carlo interval of the potential lime total (35.6 t; 32.8–38.3 t) stays below the uniform rate. In Case III, the Moran's I power simulation shows that structure with a range of 50 m or more would have been detected (power 0.75–0.94) but not structure at the scale of a few vines, and the semivariogram of the location anomaly lies inside the permutation envelope.

[View interactive graphical abstract →](https://halilunaziru73-creator.github.io/Operationalizing-GIS-and-Machine-Learning-across-Contrasting-Cropping-Systems/)

**Problem.** Geographic information systems are routinely used to turn sparse field observations into management maps, but published precision-agriculture case studies rarely state which level of evidence each map actually carries.

**Methodology.** Three Portuguese field campaigns were re-analysed within one validation-tier framework (T0 computational reproducibility, T1 descriptive mapping, T2 in-sample association, T3 out-of-sample predictive validity, T4 agronomic or decision validity, T5 transferability), with predefined comparison criteria instead of crop type as the basis of the synthesis: (i) Case I, maize fertility, yield and variable-rate prescription at Coimbra (16.85 ha; 17,724 yield-monitor points, 1,613 soil-water points, 16 composite soil samples); (ii) Case II, monitoring of the European grapevine moth *Lobesia botrana* with 25 delta traps under mating disruption at Quinta da Senhora da Graça, Douro (42.97 ha); (iii) Case III, grape ripening at Quinta de Nossa Senhora de Lurdes, Vila Real (68 fixed locations sampled on five dates), with Thiessen/Voronoi tessellation, inverse distance weighting, kriging, NDVI, mixed models, Moran's I with power simulations, spatial cross-validation and machine learning.

**Results.** In Case I the yield–deep-soil-water correlation depended strongly on the spatial support of the analysis (r = 0.97 for 16 Thiessen-zone means, 95% CI 0.92–0.99; r = 0.57 at point level), and the lime and NPK prescription equations reproduced a reference recommendation table (R² ≥ 0.97) without being an independent agronomic validation; recalculated input totals changed by 7–15% with the model form. Case II supported descriptive mapping of captures and damage (T1) but not inferences about pest origin, dispersal or treatment timing. In Case III sampling date explained 57% and persistent location effects 42% of Brix variance (intraclass correlation 0.975), yet Brix showed no spatial autocorrelation (Moran's I, all p > 0.09) and point-level NDVI explained at most 6% of Brix variance. No interpolator or machine-learning model predicted Brix at unsampled locations better than a date-mean null model (cross-validated R² 0.32–0.55 against 0.55), whereas a location-anchored forecast issued 15 days before the last sampling reduced the error from 3.40 to 1.59 °Brix. No output reached tier T4 or T5.

## Table of Contents

- [Figures](#figures)
- [Figures of the first version](#figures-of-the-first-version)
- [Repository structure](#repository-structure)
- [How to Run the Code](#how-to-run-the-code)
- [Results summary](#results-summary)
- [Data provenance](#data-provenance)
- [License](#license)
- [Citation](#citation)
- [Related work](#related-work)

## Figures

The nine supplementary figures of the revised manuscript, in the order of the manuscript. Each figure is followed by a short synthesis of what it shows and what it supports. Full captions are in the [revised manuscript](manuscript/Halilu_Sulaiman_Revised_Manuscript.pdf).

### Main figures

The nine main figures are shown at the top of this page, under Problem, Methodology, and Results.

### Supplementary figures

![Figure S1](figures/Figure_S1_maize_site.png)

**Figure S1.** Case I site, maize field boundary, cadastral and orthophoto context and field plot, Coimbra.

**Synthesis.** Locates the 16.85 ha irrigated maize field in the lower Mondego valley used for all Case I analyses.

![Figure S2](figures/Figure_S2_moth_site_context.png)

**Figure S2.** Case II site context, Quinta da Senhora da Graça: location, terrain, aspect, land use and grape-variety composition.

**Synthesis.** Terrain and land use are shown as context for reading the trap maps; they were not used as explanatory variables, because class-valued counts at 25 traps do not allow a test of their association with captures or damage.

![Figure S3](figures/Figure_S3_grape_site.png)

**Figure S3.** Case III site, Quinta de Nossa Senhora de Lurdes: location, land use and parcel land-use classes.

**Synthesis.** Locates the 6 ha vineyard parcel in which the 68 Brix locations were sampled.

![Figure S4](figures/Figure_S4_maize_idw_surfaces.png)

**Figure S4.** Case I inverse-distance-weighted surfaces of yield, organic matter, K₂O, CaO, MgO and pH.

**Synthesis.** The surfaces are for display only and were not used in any statistical test; the zone-level statistics use the 16 Thiessen zones. Soil pH varies little (5.3–5.6), whereas organic matter, K₂O, CaO and MgO vary more widely across the field.

![Figure S5](figures/Figure_S5_maize_soil_water.png)

**Figure S5.** Case I soil-water points and surfaces for the near-surface and deep layers.

**Synthesis.** The 1,613 soil-water points give the volumetric water content of two layers; the deep layer is the variable that tracks yield most closely (r = 0.97 at zone level), and its pattern is the spatial signal that the yield maps share.

![Figure S6](figures/Figure_S6_maize_sentinel2_ndvi.png)

**Figure S6.** Case I Sentinel-2 NDVI on three dates and NDVI of reference land-cover classes before and after dark-object subtraction.

**Synthesis.** NDVI is used in Case I only for boundary confirmation, crop-trajectory context and a radiometric consistency check, and enters no statistical analysis or prescription.

![Figure S7](figures/Figure_S7_maize_yield_semivariogram.png)

**Figure S7.** Empirical semivariogram of maize grain yield.

**Synthesis.** Semivariance rises from 0.009 (kg m⁻²)² below 15 m to 0.042 at about 250 m without a clear sill, which indicates both short-range structure and a field-scale trend, consistent with a Moran's I of 0.78 for yield at point level.

![Figure S8](figures/Figure_S8_grape_uav_products.png)

**Figure S8.** Case III UAV products: regression diagnostics, NDVI, near-infrared orthomosaic and composite.

**Synthesis.** Shows the UAV multispectral products from which the canopy NDVI value of each of the 68 locations was taken; the NDVI is clearly spatially autocorrelated (Moran's I 0.20–0.29), unlike Brix.

![Figure S9](figures/Figure_S9_grape_brix_maps.png)

**Figure S9.** Case III, Task A: Brix on five dates by field-sampling symbology, inverse-distance interpolation and Thiessen polygons.

**Synthesis.** These are valid displays of the observed point values, but because Brix has no spatial autocorrelation the smooth transitions between points carry no predictive information and should not be used to delineate harvest zones.

---

## Figures of the first version

The 21 figures of the first version of the manuscript, presented in their original order. They are kept alongside the revised figures above.

### Maize Fertility Zoning (Coimbra)

![Study area](figures/original_submission/Figure_01_maize_study_area.jpg)
**Figure 1**, Study-area delineation for the Coimbra maize field.

![IDW interpolation](figures/original_submission/Figure_02_maize_idw_interpolation.jpg)
**Figure 2**, Inverse-distance-weighted interpolation surfaces.

![NDVI temporal dynamics](figures/original_submission/Figure_03_maize_ndvi_temporal.jpg)
**Figure 3**, Temporal NDVI dynamics across the growing season.

![Water sampling design](figures/original_submission/Figure_04_maize_water_sampling.jpg)
**Figure 4**, Water sampling design and interpolated surfaces.

### Vineyard Pest Monitoring (Quinta da Senhora da Graça)

![Terrain characterisation](figures/original_submission/Figure_05_vineyard_terrain.jpg)
**Figure 5**, Terrain characterisation of the study vineyard.

![Land-use and varietal composition](figures/original_submission/Figure_06_vineyard_landuse_varietal.jpg)
**Figure 6**, Land-use and varietal composition.

![Pheromone trap network](figures/original_submission/Figure_07_vineyard_pest_trap_network.jpg)
**Figure 7**, Pheromone trap network and spatio-temporal pest dynamics.

### Grape Ripening / Brix Prediction (Quinta de Nossa Senhora de Lurdes)

![Study-site characterisation](figures/original_submission/Figure_08_grape_study_site.jpg)
**Figure 8**, Study-site characterisation.

![Ripening regression forecast](figures/original_submission/Figure_09_grape_ripening_regression_forecast.jpg)
**Figure 9**, Regression-based ripening forecast.

![Brix, traditional field sampling](figures/original_submission/Figure_10_grape_brix_traditional_sampling.jpg)
**Figure 10**, Spatially interpolated Brix values from traditional field
sampling.

![Brix, UTAD Enology plots](figures/original_submission/Figure_11_grape_brix_utad_plots.jpg)
**Figure 11**, Spatially interpolated Brix values from the UTAD Enology
experimental plots.

![Brix by Thiessen polygons](figures/original_submission/Figure_12_grape_brix_thiessen_polygons.jpg)
**Figure 12**, Brix values partitioned by Thiessen/Voronoi polygons.

![Regression diagnostics and remote sensing](figures/original_submission/Figure_13_grape_regression_diagnostics_remote_sensing.jpg)
**Figure 13**, Regression diagnostics and remote-sensing products for ripening
prediction.

### Maize Fertility Zoning, Model Outputs

![Descriptive and correlation analysis](figures/original_submission/Figure_14_maize_descriptive_correlation_analysis.jpg)
**Figure 14**, Descriptive and correlation analysis for the Coimbra maize
field.

![Model performance and zonation](figures/original_submission/Figure_15_maize_model_performance_zonation.jpg)
**Figure 15**, Model performance and zonation outputs.

![Variable-rate prescription maps](figures/original_submission/Figure_16_maize_variable_rate_prescription.jpg)
**Figure 16**, Variable-rate prescription maps.

### Machine-Learning Results (Grape Ripening)

![Cross-validated model comparison](figures/original_submission/Figure_17_grape_ml_model_comparison.jpg)
**Figure 17**, Cross-validated model comparison for Brix prediction across
seven models.

![Feature importance](figures/original_submission/Figure_18_grape_ml_feature_importance.jpg)
**Figure 18**, Feature importance for Brix prediction.

![Moran's I](figures/original_submission/Figure_19_grape_morans_i.jpg)
**Figure 19**, Global Moran's I spatial autocorrelation of raw Brix values.

![Observed vs. predicted](figures/original_submission/Figure_20_grape_observed_vs_predicted.jpg)
**Figure 20**, Out-of-fold observed-versus-predicted Brix values.

![Spatial interpolation, 30 August](figures/original_submission/Figure_21_grape_spatial_interpolation_30aug.jpg)
**Figure 21**, Spatial interpolation surfaces for 30 August Brix.

---

---

## Repository structure

```
manuscript/ The revised manuscript as a standalone file
 (Halilu_Sulaiman_Revised_Manuscript.docx and .pdf), with
 the nine main figures placed where they are first cited,
 the tables, the references and the supplementary tables and
 figures. The first version is in manuscript/original_submission/.

code/ Python source code of the first version of the study (the
 machine-learning scripts for Case III; the analysis scripts of
 the revision are separate supplementary files):
 - train_regression_kriging.py : trains and cross-validates IDW,
 Random Forest, Gradient Boosting, a Neural Network (MLP), a
 Stacking Ensemble, and hybrid regression-kriging (RF-RK,
 GB-RK) models for Brix prediction; also computes Moran's I
 and permutation importance.
 - make_ml_figures.py : generates the model-comparison,
 feature-importance, Moran's I, and observed-vs-predicted
 analysis charts.
 - make_hybrid_map.py : generates the spatial hybrid
 regression-kriging surface map.
 - make_grid.py : builds the labelled A/B/C...
 figure grids from the field-photo/GIS-map source images.
 - translate_legend.py : translates the Portuguese GIS
 legend text in the vineyard-pest trap figures into English.

data/ The field data used to train the machine-learning models:
 - BRIX_AMT.csv : 68 georeferenced (UTM) sampling points,
 Brix at 5 dates (15 Jul – 30 Aug).
 - Sample_brix_ndvi.xlsx : same points with paired NDVI values.
 - BRIX_AMT_V2.xlsx : original source workbook.

results/ Model outputs:
 - merged_brix_ndvi_utm.csv : the cleaned, merged analysis
 dataset.
 - cv_pooled_spatiotemporal.json : cross-validated RMSE/MAE/R²
 for IDW, Random Forest, Gradient Boosting, Neural Network,
 Stacking Ensemble, RF-RK, and GB-RK (pooled spatio-temporal,
 GroupKFold-by-location design; corresponds to Table 3 in the
 manuscript).
 - cv_model_comparison.json : per-date, spatial-only
 cross-validation results.
 - morans_i_brix.json : global Moran's I
 spatial-autocorrelation statistic for Brix at each sampling
 date (Figure 19).
 - permutation_importance.json : permutation importance for
 Easting, Northing, Julian day, and NDVI (Figure 18).

figures/ The nine main figures (Figure_01 to Figure_09) and the nine
 supplementary figures (Figure_S1 to Figure_S9) of the revised
 manuscript. The 21 figures of the first version are in
 figures/original_submission/.
```

## How to Run the Code

### 1. Clone the repository

```bash
git clone https://github.com/halilunaziru73-creator/Operationalizing-GIS-and-Machine-Learning-across-Contrasting-Cropping-Systems.git
cd Operationalizing-GIS-and-Machine-Learning-across-Contrasting-Cropping-Systems
```

### 2. Install dependencies

Requirements: Python 3, `pandas`, `numpy`, `scipy`, `scikit-learn`, `matplotlib`.
`scikit-learn`'s `GradientBoostingRegressor` is used to implement the
gradient-boosted decision-tree models.

```bash
pip install pandas numpy scipy scikit-learn matplotlib
```

### 3. Reproduce the machine-learning analysis

```bash
cd code
python3 train_regression_kriging.py # trains models, cross-validates, writes results/
python3 make_ml_figures.py # writes machine-learning analysis charts
python3 make_hybrid_map.py # writes the spatial hybrid surface map
```

## Results summary

**Case I, maize in Coimbra.** At the scale of the 16 Thiessen zones, grain yield and deep-layer soil water are strongly correlated (r = 0.97), but at the 17,724 yield points the correlation is r = 0.57, so the coefficient describes association between field-scale patterns and not the strength of the relationship at a location. Accounting for spatial dependence reduces the effective sample size of the zone correlations from 16 to about 8–10. Spatial block cross-validation gives inverse distance weighting as the best predictor of yield (R² 0.72, 0.61 and 0.47 at 30, 60 and 120 m). The potential lime total is 35.6–39.4 t against 42.1 t for the uniform rate (Monte Carlo interval 32.8–38.3 t), a potential prescription that assumes the patterns persist between seasons.

**Case II, *Lobesia botrana*.** Captures peak in June and damage follows one month behind. With three inspections, class-valued counts and mating disruption, the maps support descriptive mapping (tier T1) and hypotheses to test, not claims about an edge effect, pest origin or dispersal.

**Case III, grape Brix.** Mean Brix rose from 9.2 to 20.5 °Brix across five dates at 68 locations. Date explains 57% and location 42% of the variance (ICC 0.975), Moran's I of raw Brix is not significant on any date, and no spatial model beats the date-mean null model (R² 0.55). The location anomaly is nevertheless persistent: a location-anchored forecast issued with data up to 15 August has an RMSE of 1.59 °Brix against 3.40 °Brix for the vineyard-mean forecast. The date at which 25.5 °Brix is reached varies from 16 to 28 September among growth functions that fit the five means equally well.

**Across the cases.** All outputs reach the descriptive validation tiers, but none reaches agronomic or decision validity (T4) or transferability (T5). The value of the framework is that it separates what the data support from what they only illustrate.

## Data provenance

All data in `data/` were collected from original field campaigns conducted as
part of UTAD coursework (Quinta de Nossa Senhora de Lurdes, Vila Real,
Portugal). All cross-validation results in `results/` were computed directly
from this dataset.

## License

Released under the [MIT License](./LICENSE).

## Citation

If you use this repository, please cite it using the metadata in
[`CITATION.cff`](./CITATION.cff) (GitHub renders a "Cite this repository"
button on the repo's main page, in the top-right "About" panel).

## Related work

Part of a broader body of research on GIS, remote sensing, and machine
learning for agronomic and environmental applications:

- [Digital Twin for Gully Biocontrol](https://github.com/halilunaziru73-creator/Digital-Twin-for-the-Evaluation-of-Experimental-Gully-Biocontrol-Using-Morning-Glory-Ipomoea-spp)
- [Geometry-Agnostic Contrastive Learning (GACL)](https://github.com/halilunaziru73-creator/Geometry-Agnostic-Contrastive-Learning-GACL)
- [Real-Time RGB Proxy Vegetation Indexing (N_GACL)](https://github.com/halilunaziru73-creator/Real-Time-RGB-Proxy-Vegetation-Indexing-and-Texture-Analysis-for-UAV-and-Handheld-Crop-Imagery)
- [GIS-Based Delineation for Livestock Slurry Application](https://github.com/halilunaziru73-creator/GIS-based_delineation_of_areas_suitable_for_livestock_slurry_application)
- [Hybrid CNN-BiLSTM-Attention for Sediment Transport](https://github.com/halilunaziru73-creator/Hybrid-CNN-BiLSTM-Attention-Sediment-Transport-Agricultural-Gully-System)
- [Geospatial Data Analysis](https://github.com/halilunaziru73-creator/Geospatial-data-analysis)
