const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageOrientation, Header, Footer, PageNumber, Bookmark
} = require("docx");
const { P, H1, H2, H3, refEntry, figure, simpleTable, equation } = require("./build");
const { REFS } = require("./refs");

const G = "grids"; // grid images folder

const body = [];

// ---------- TITLE BLOCK ----------
body.push(new Paragraph({
  children: [new TextRun({
    text: "Integrated GIS, Remote-Sensing, and Machine-Learning Precision Agriculture Across Three Portuguese Cropping Systems: Maize Fertility Zoning, Vineyard Pest Monitoring, and Machine-Learning-Enhanced Grape Ripening Prediction",
    bold: true, size: 32
  })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 240 }
}));

body.push(new Paragraph({
  children: [new TextRun({ text: "Naziru Halilu", bold: true, size: 24 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 60 }
}));

body.push(new Paragraph({
  children: [new TextRun({
    text: "Department of Agricultural, Environmental and Food Sciences, University of Tr\u00e1s-os-Montes e Alto Douro (UTAD), 5000-801 Vila Real, Portugal",
    italics: true, size: 20
  })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 40 }
}));

body.push(new Paragraph({
  children: [new TextRun({ text: "* Correspondence: hallilunaziru73@gmail.com", size: 20 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 300 }
}));

// ---------- ABSTRACT ----------
body.push(H1("Abstract"));
body.push(P([
  "Fragmented, farm-scale precision-agriculture case studies are common in training and consultancy settings but are rarely synthesised into a single comparative analysis across cropping systems. This study integrates three independent Geographic Information System (GIS) and remote-sensing field campaigns conducted in northern and central Portugal into one comparative framework: (i) spatial fertility mapping and variable-rate prescription for a maize (",
  { i: "Zea mays" },
  " L.) field in Coimbra (16.85 ha); (ii) GIS-based monitoring of the European grapevine moth (",
  { i: "Lobesia botrana" },
  ") across three generations at Quinta da Senhora da Gra\u00e7a, Douro Region (42.97 ha); and (iii) Brix-based ripening and harvest-date prediction integrated with Normalised Difference Vegetation Index (NDVI) monitoring at Quinta de Nossa Senhora de Lurdes, Vila Real (6 ha). Across the three sites, Inverse Distance Weighting (IDW) interpolation, Thiessen/Voronoi tessellation, and multispectral vegetation indices were used to convert point-sampled field and laboratory measurements into continuous management surfaces. In the maize system, corn yield correlated strongly with deep soil-water content (r = 0.972) and potassium oxide (r = 0.751), and a quadratic yield\u2013fertiliser regression (R\u00b2 = 0.995) supported a variable-rate nitrogen\u2013phosphorus\u2013potassium (NPK) and liming programme that reduced total lime demand by 2.69 t relative to uniform application. In the vineyard pest system, pheromone-trap captures showed a consistent three-generation spatial pattern, with early-season infestation concentrated at forest-edge refugia and a second-generation surge (trap counts 16\u201318) driving the principal within-season damage peak. In the ripening-prediction system, a logarithmic Brix\u2013Julian-day regression (R\u00b2 = 0.978) forecast harvest maturity (25.5\u201327 \u00baBx) around 13 September, and an in-sample NDVI\u2013Brix regression explained 88% of variance (R\u00b2 = 0.880). To test whether these empirical approaches could be improved upon, the Brix dataset (68 georeferenced points \u00d7 5 dates) was further analysed using a hybrid machine-learning regression-kriging framework (Random Forest and Gradient Boosting trend models with kriged-residual correction), rigorously evaluated using spatially grouped cross-validation. Under this stricter validation, predictive skill fell to R\u00b2 = 0.538 for IDW and R\u00b2 = 0.520 for Random Forest, with the machine-learning and hybrid regression-kriging models failing to outperform the simple IDW baseline at this sampling density \u2014 a transparent, cross-validated finding that both benchmarks the real-world reliability of the original in-sample statistics and identifies the sampling density and covariate strength needed before hybrid regression-kriging is likely to add value in this system. Considered together, the three case studies demonstrate that low-cost, field-deployable GIS/remote-sensing workflows can support site-specific decision-making across structurally different agricultural systems (annual arable, perennial pest management, and perennial ripening forecasting), while also revealing shared methodological constraints \u2014 principally limited replication, single-season sampling, and modest sampling density relative to what geostatistical and machine-learning methods require \u2014 that should guide the design of larger, multi-season precision-agriculture trials.",
]));

body.push(P([
  { b: "Keywords: " },
  "Precision agriculture; Geographic Information Systems; remote sensing; NDVI; variable-rate application; ",
  { i: "Lobesia botrana" },
  "; Brix; viticulture; machine learning; random forest; regression-kriging"
]));

// ================= NOMENCLATURE =================
body.push(H1("Nomenclature"));
body.push(P([
  "For reference, Table 0 summarises the principal mathematical symbols used in Equations 1\u201320 throughout Section 2.",
]));
body.push(...(function(){
  const t = simpleTable(
    ["Symbol", "Meaning"],
    [
      ["Z(s\u2070), Z\u0302(s\u2070)", "Observed / interpolated value of the target variable at location s\u2070"],
      ["d\u1d62, p", "Distance to sample i; IDW distance-decay power (Eqn 1)"],
      ["\u03c1NIR, \u03c1RED", "Near-infrared and red-band surface reflectance (Eqn 2)"],
      ["\u03c1haze", "Dark-object (minimum) reflectance used for atmospheric correction (Eqn 3)"],
      ["r, R\u00b2", "Pearson correlation coefficient; coefficient of determination (Eqns 4, 19)"],
      ["\u03b2\u2080, \u03b2\u2081, \u03b2\u2082 / \u03b3\u2080, \u03b3\u2081, \u03b3\u2082", "Quadratic regression coefficients, lime and NPK models (Eqns 5, 6)"],
      ["f\u0302RF(x), T\u1d47(x)", "Random Forest ensemble prediction; individual tree prediction (Eqn 7)"],
      ["Fm(x), h\u2098, \u03bd", "Gradient Boosting ensemble at stage m; stage learner; learning rate (Eqns 8, 9)"],
      ["hⱼ, wⱼₖ, bⱼ, \u03c6", "MLP hidden-unit activation, weights, bias, ReLU function (Eqn 10)"],
      ["f\u0302stack, \u03b1\u2080\u2013\u03b1\u2083", "Stacking-ensemble meta-model prediction and meta-coefficients (Eqn 11)"],
      ["m(s), e(s)", "Regression-kriging trend and residual components (Eqn 12)"],
      ["\u03b3(h), c\u2080, c, a", "Semivariance at lag h; nugget; partial sill; range (Eqn 13)"],
      ["\u03bbⱼ, \u03bc", "Kriging weights; Lagrange multiplier (Eqn 14)"],
      ["I, wᵢⱼ, S\u2080, z\u0304", "Moran's I statistic, spatial weight, weight sum, sample mean (Eqn 16)"],
      ["RMSE, MAE", "Root-mean-square error; mean absolute error (Eqns 17, 18)"],
      ["yᵢ, y\u0302ᵢ, y\u0304", "Observed value; predicted value; mean observed value (Eqns 17\u201319)"],
    ],
    [3000, 6350]
  );
  return [t, new Paragraph({ text: "Table 0. Nomenclature for the principal mathematical symbols used in Section 2 (Materials and Methods).", spacing: { after: 220 }, alignment: AlignmentType.JUSTIFIED })];
})());

// ================= 1. INTRODUCTION =================
body.push(H1("1. Introduction"));

body.push(H2("1.1 Precision Agriculture and GIS in Diversified Cropping Systems"));
body.push(P([
  "Precision agriculture (PA) rests on the principle that agricultural fields and farms are spatially heterogeneous, and that yield, quality, and pest pressure can be managed more efficiently when inputs and interventions are targeted to that heterogeneity rather than applied uniformly. Geographic Information Systems (GIS), together with satellite, aerial, and proximal remote sensing, provide the primary means of converting point-sampled agronomic, edaphic, and phytosanitary observations into continuous, spatially explicit management surfaces ",
  { cite: ["chuvieco2020", "jensen2015", "lillesand2015"] },
  ". Satellite platforms such as the Landsat series have underpinned this transformation for four decades, offering multispectral, moderate-resolution imagery whose radiometric and atmospheric correction protocols are now well established ",
  { cite: ["chavez1988", "chavez1996", "roy2014", "usgs2023", "nasa2023"] },
  ". Vegetation indices derived from such imagery, most notably the Normalised Difference Vegetation Index (NDVI), remain the standard proxy for canopy vigour, biomass, and, by extension, crop physiological status ",
  { cite: ["rouse1974"] },
  ", and have been used successfully to estimate maize yield variability from multispectral and hyperspectral platforms ",
  { cite: ["burglewski2024"] },
  ".",
]));

body.push(P([
  "Viticulture has been an especially active domain for precision-agriculture research because grape quality, and therefore wine value, is disproportionately sensitive to small-scale spatial variation in terrain, microclimate, and vine vigour ",
  { cite: ["matese2015a"] },
  ". In steep, terraced landscapes such as the Douro Demarcated Region of northern Portugal, terrain-driven heterogeneity in thermal regime, hydric balance, and soil depth is pronounced enough to define distinct viticultural terroirs within a few hundred metres ",
  { cite: ["fraga2018"] },
  ", and unmanned aerial, satellite, and proximal sensing platforms have each been benchmarked for their ability to resolve this variability at the scale of individual parcels or rows ",
  { cite: ["matese2015b"] },
  ". Pest management is a further application domain in which spatial monitoring has direct economic consequences: the European grapevine moth, ",
  { i: "Lobesia botrana" },
  " (Denis & Schiffermüller) (Lepidoptera: Tortricidae), is one of the most economically damaging vineyard pests across the Mediterranean basin, and pheromone-based mating disruption and trap-network monitoring are now the principal non-chemical control strategy in commercial viticulture ",
  { cite: ["benelli2023", "ricciardi2024"] },
  ".",
]));

body.push(P([
  "A methodological thread common to all three domains is spatial interpolation: converting a finite set of point observations \u2014 soil samples, Brix readings, or trap counts \u2014 into a continuous surface suitable for zoning or prescription mapping. Inverse Distance Weighting (IDW) and Thiessen (Voronoi) polygons remain the most widely deployed deterministic interpolators in applied precision-agriculture workflows because they require no distributional assumptions and are computationally inexpensive relative to geostatistical alternatives such as kriging ",
  { cite: ["wong2017", "trangmar1985", "webster2001"] },
  ", although comparative studies indicate that interpolator choice can materially affect the resulting management-zone boundaries, particularly at the modest sample sizes typical of single-farm field campaigns ",
  { cite: ["shaddad2016", "sekulic2020"] },
  ".",
]));

body.push(H2("1.2 Machine Learning and Artificial Intelligence in Precision Agriculture"));
body.push(P([
  "Beyond deterministic interpolation and simple parametric regression, the past decade has seen rapid growth in the application of machine learning and artificial intelligence (AI) to precision-agriculture problems spanning crop-yield prediction, disease and pest detection, water management, and soil property mapping ",
  { cite: ["liakos2018"] },
  ". Ensemble tree-based learners \u2014 particularly Random Forest ",
  { cite: ["breiman2001"] },
  " and gradient-boosted decision trees, of which XGBoost is the most widely adopted implementation ",
  { cite: ["friedman2001", "chenguestrin2016"] },
  " \u2014 have become the de facto standard for structured, tabular agricultural datasets because they handle non-linear covariate interactions natively, require comparatively little hyperparameter tuning, and degrade gracefully on the small-to-moderate sample sizes typical of farm-scale field campaigns. A systematic review of machine-learning approaches specifically for crop-yield prediction and nitrogen-status estimation found that ensemble and kernel methods consistently outperformed simple linear models when auxiliary remote-sensing covariates were available, but also emphasised that reported performance gains are highly sensitive to sample size and to whether validation is performed on genuinely held-out data rather than in-sample ",
  { cite: ["chlingaryan2018"] },
  " \u2014 a caution directly relevant to the cross-validated machine-learning analysis undertaken in this study (Sections 2.5, 3.4, 4.4).",
]));
body.push(P([
  "A parallel and, for spatial prediction problems specifically, highly relevant development is the fusion of machine learning with classical geostatistics through regression-kriging (RK), in which a regression or machine-learning model supplies the deterministic trend and the (assumed spatially correlated) residuals are subsequently kriged and added back to the trend prediction ",
  { cite: ["hengl2007"] },
  ". Because RK explicitly separates a covariate-driven trend from a spatially structured residual, its expected benefit over either component in isolation depends on the strength of spatial autocorrelation remaining in the residuals after the trend is removed \u2014 a property that can, and in this study is, tested directly and quantitatively using Moran's ", { i: "I" }, " ",
  { cite: ["moran1950"] },
  " rather than assumed. Artificial neural networks, and specifically the Multi-Layer Perceptron (MLP), represent a further, structurally distinct class of non-linear regressor increasingly used in agricultural applications where sample sizes are sufficiently large to estimate their weight matrices reliably; stacked-generalisation (\u201cstacking\u201d) ensembles, which combine the predictions of structurally different base learners through a second-stage meta-model, have likewise been proposed as a way to recover complementary strengths across model families ",
  { cite: ["liakos2018"] },
  ". This study implements and rigorously benchmarks all of these approaches \u2014 Random Forest, Gradient Boosting, an MLP neural network, a stacking ensemble, and hybrid regression-kriging built on each tree-ensemble trend model \u2014 against the simple IDW baseline for the Brix/ripening-prediction case study, reporting cross-validated performance transparently rather than selectively (Sections 2.5, 3.4, 4.4).",
]));

body.push(H2("1.3 Rationale for an Integrated, Multi-System Analysis"));
body.push(P([
  "Despite the shared methodological toolkit described above, precision-agriculture evaluations are typically reported as single-crop, single-site case studies, which makes it difficult to assess whether the practical value and the limitations of GIS/remote-sensing workflows are crop-specific or transfer across cropping systems. This study addresses that gap by bringing together three independent field campaigns \u2014 spanning an annual arable crop (maize), a perennial pest-management problem (grapevine moth), and a perennial fruit-ripening forecast (Brix/alcohol prediction) \u2014 conducted across three farms in central and northern Portugal, under a common GIS/remote-sensing analytical framework. Rather than treating the three studies as unrelated technical exercises, we ask, across the pooled evidence: (i) which spatial interpolation and remote-sensing approaches proved most informative in each system; (ii) how consistent the strength of environment\u2013response relationships was across systems (correlation and regression coefficients for yield, pest incidence, and ripening); and (iii) what shared constraints \u2014 sample size, single-season sampling, interpolator choice \u2014 limit generalisation, and how these should shape the design of larger precision-agriculture trials.",
]));

body.push(H2("1.4 Objectives"));
body.push(P([
  "The specific objectives of this study are to: (i) characterise the three study sites geospatially, using digital cartography, land-use mapping, and terrain analysis; (ii) quantify the relationships between soil, water, and topographic variables and, respectively, maize yield, ",
  { i: "L. botrana" },
  " capture intensity, and grape Brix accumulation; (iii) develop and evaluate spatial interpolation and regression models supporting variable-rate fertiliser/lime prescription (maize), spatio-temporal pest-risk mapping (vineyard moth), and NDVI-based harvest-date forecasting (Brix); (iv) implement and rigorously cross-validate a suite of machine-learning and hybrid regression-kriging models (Random Forest, Gradient Boosting, neural network, stacking ensemble) against the simple IDW baseline for the Brix case study, using spatial-autocorrelation diagnostics and permutation importance to explain, rather than merely report, the comparative result; and (v) synthesise the three case studies into a single discussion of the opportunities and current limitations of GIS/remote-sensing- and machine-learning-based precision agriculture across structurally different cropping systems.",
]));

// ================= 2. MATERIALS AND METHODS =================
body.push(H1("2. Materials and Methods"));

body.push(H2("2.1 Overview of Study Sites"));
body.push(P([
  "Three independent field campaigns, all conducted under the supervision of the same instructing team ",
  { cite: ["aranha2026"] },
  ", form the basis of this integrated analysis (Table 1). Case Study I is a 16.85-ha maize (",
  { i: "Zea mays" },
  " L.) production field within the Coimbra agricultural region, central Portugal, a Mediterranean-with-Atlantic-influence landscape of fertile alluvial soils associated with the Mondego River valley. Case Study II is the 42.97-ha Quinta da Senhora da Gra\u00e7a estate, on the right bank of the Corgo River near Peso da R\u00e9gua, within the Douro Demarcated Region, where viticulture is the dominant land use and terrain is steep and heterogeneous (slope 0\u2013111%; altitude 61\u2013400 m). Case Study III is the approximately 6-ha Quinta de Nossa Senhora de Lurdes vineyard in Vila Real, also within the Douro viticultural context, georeferenced in WGS84 UTM Zone 29N.",
]));

body.push(...(function(){
  const t = simpleTable(
    ["Attribute", "Case Study I \u2013 Maize (Coimbra)", "Case Study II \u2013 Vineyard Pest (Sr\u00aa da Gra\u00e7a)", "Case Study III \u2013 Grape Ripening (N.S. de Lurdes)"],
    [
      ["Crop / target", "Maize (Zea mays)", "Grapevine (Vitis vinifera) \u2014 Lobesia botrana", "Grapevine (Vitis vinifera) \u2014 Brix/ripening"],
      ["Area", "16.85 ha", "42.97 ha", "\u2248 6 ha"],
      ["Location", "Coimbra, Centro Region", "Peso da R\u00e9gua, Douro DR", "Vila Real, Douro context"],
      ["Primary spatial method", "IDW interpolation, Thiessen polygons", "Georeferenced trap-count mapping", "IDW, Thiessen/Voronoi polygons"],
      ["Remote sensing", "Landsat multispectral NDVI (Feb/Jul/Oct)", "Cartographic/DEM terrain analysis", "NDVI, NIR orthophoto"],
      ["Primary output", "Variable-rate NPK & lime prescription maps", "Spatio-temporal pest-risk maps", "Harvest-date forecast, Brix zoning"],
    ],
    [2400, 2400, 2400, 2150]
  );
  return [t, new Paragraph({ text: "", spacing: { after: 200 } })];
})());

body.push(H2("2.2 Case Study I \u2014 Maize Precision Agriculture (Coimbra)"));
body.push(H3("2.2.1 Geospatial Characterisation and Sampling Design"));
body.push(P([
  "The field boundary, parcel geometry, and internal sampling grid were digitised in a GIS environment from cadastral and orthophoto sources (Figure 1). Soil samples were collected at fixed points distributed across the field and analysed for pH (H\u2082O), organic matter (OM, %), phosphorus pentoxide (P\u2082O\u2085), potassium oxide (K\u2082O), calcium oxide (CaO), and magnesium oxide (MgO). Surface and deep soil-water content were measured at the same points. Each soil sample was assigned an influence zone using Thiessen (Voronoi) polygon tessellation, and corn yield observations recorded across the field were subsequently joined to their enclosing polygon, allowing yield to be related to the nearest characterised soil sample.",
]));
body.push(...figure(`${G}/corn_grid1_studyarea.jpg`, "Figure 1. Study-area delineation for the Coimbra maize field: (A) field boundary and parcel context (Corn_limits); (B) cadastral/orthophoto base map (Corn_Coimbra); (C) internal sampling plot layout used for soil and yield data collection (Corn_Plot)."));

body.push(H3("2.2.2 Soil Fertility Mapping by Inverse Distance Weighting"));
body.push(P([
  "Point-sampled soil pH, organic matter, and macronutrient oxide concentrations were interpolated across the field using Inverse Distance Weighting, in which the estimated value at an unsampled location is a distance-weighted average of surrounding samples ",
  { cite: ["wong2017"] },
  ", formalised as:",
]));
body.push(equation([
  { i: "Z" }, "(", { i: "s" }, { sup: "0" }, ") = ",
  { i: "\u03a3" },
  { sub: "i=1" }, { sup: "n" },
  " [", { i: "w" }, { sub: "i" }, { i: "Z" }, "(", { i: "s" }, { sub: "i" }, ")] / ",
  { i: "\u03a3" }, { sub: "i=1" }, { sup: "n" }, " ", { i: "w" }, { sub: "i" },
  ",   ", { i: "w" }, { sub: "i" }, " = ", { i: "d" }, { sub: "i" }, { sup: "\u2212p" },
], 1));
body.push(P([
  "where ", { i: "Z" }, "(", { i: "s" }, { sup: "0" }, ") is the interpolated value at target location ", { i: "s" }, { sup: "0" },
  "; ", { i: "Z" }, "(", { i: "s" }, { sub: "i" }, ") is the observed value at sample location ", { i: "s" }, { sub: "i" },
  "; ", { i: "d" }, { sub: "i" }, " is the Euclidean distance between ", { i: "s" }, { sup: "0" }, " and ", { i: "s" }, { sub: "i" },
  "; ", { i: "p" }, " is the distance-decay power (", { i: "p" }, " = 2 throughout this study, the conventional default); and ",
  { i: "n" }, " is the number of sample points used in the local neighbourhood. IDW was selected over geostatistical kriging because the sampling density available (Section 2.2.1) was below the density generally recommended for reliable semivariogram fitting ",
  { cite: ["trangmar1985", "shaddad2016"] },
  ", consistent with common practice in single-season, farm-scale precision-agriculture mapping.",
]));
body.push(...figure(`${G}/corn_grid2_soilmaps.jpg`, "Figure 2. Inverse-distance-weighted interpolation surfaces for the Coimbra maize field: (A) general IDW interpolation framework; (B) soil organic matter; (C) potassium oxide (K\u2082O); (D) calcium oxide (CaO); (E) magnesium oxide (MgO); (F) soil pH (H\u2082O)."));

body.push(H3("2.2.3 Multispectral NDVI Monitoring"));
body.push(P([
  "NDVI surfaces were derived from Landsat-based multispectral reflectance for three dates (February, July, and October) spanning the growing season, following the standard band-ratio formulation ",
  { cite: ["rouse1974"] },
  ":",
]));
body.push(equation([
  { i: "NDVI" }, " = (", { i: "\u03c1" }, { sub: "NIR" }, " \u2212 ", { i: "\u03c1" }, { sub: "RED" }, ") / (", { i: "\u03c1" }, { sub: "NIR" }, " + ", { i: "\u03c1" }, { sub: "RED" }, ")",
], 2));
body.push(P([
  "where ", { i: "\u03c1" }, { sub: "NIR" }, " and ", { i: "\u03c1" }, { sub: "RED" }, " are the near-infrared and red-band surface reflectances, respectively, bounded on [\u22121, 1], with higher values indicating denser, healthier green vegetation. Prior to NDVI computation, at-sensor radiance was corrected for atmospheric scattering using the dark-object subtraction (DOS) method ",
  { cite: ["chavez1988", "chavez1996"] },
  ":",
]));
body.push(equation([
  { i: "\u03c1" }, { sub: "corrected" }, " = ", { i: "\u03c1" }, { sub: "raw" }, " \u2212 ", { i: "\u03c1" }, { sub: "haze" },
], 3));
body.push(P([
  "where ", { i: "\u03c1" }, { sub: "haze" }, " is the minimum (dark-object) reflectance identified within each band, assumed to represent residual atmospheric path radiance over nominally zero-reflectance targets (e.g., deep water, dense shadow), following radiometric processing conventions for the Landsat archive ",
  { cite: ["usgs2023", "roy2014"] },
  ". Spectral signatures were extracted per land-cover class at each date to characterise the phenological trajectory of the cropped area relative to built-up, bare-soil, and water-body classes.",
]));
body.push(...figure(`${G}/corn_grid3_ndvi.jpg`, "Figure 3. Temporal NDVI dynamics for the Coimbra maize field: (A) February; (B) July (peak vegetative vigour); (C) October (post-harvest/senescence); (D) corrected versus uncorrected NDVI surfaces after dark-object atmospheric correction."));

body.push(H3("2.2.4 Water Quality Sampling and Interpolation"));
body.push(P([
  "Surface (\u201ctop\u201d) and deep water samples were collected at fixed points across the field and interpolated using the same IDW procedure described in Section 2.2.2, producing continuous surfaces of near-surface and subsurface moisture/water-quality condition for comparison against the soil fertility and yield surfaces.",
]));
body.push(...figure(`${G}/corn_grid4_water.jpg`, "Figure 4. Water sampling design and interpolated surfaces: (A) water sampling point locations; (B) surface (top) water content; (C) deep water content; (D) IDW-interpolated surface water surface; (E) IDW-interpolated deep water surface."));

body.push(H3("2.2.5 Statistical Analysis and Variable-Rate Prescription"));
body.push(P([
  "Descriptive statistics (mean, standard deviation, minimum, maximum) were computed for all soil, water, and yield variables. Pearson correlation coefficients were computed pairwise among corn yield (kg m\u207b\u00b2) and the six soil/water covariates to identify the strongest environment\u2013yield relationships:",
]));
body.push(equation([
  { i: "r" }, " = ",
  { i: "\u03a3" }, "(", { i: "x" }, { sub: "i" }, " \u2212 ", { i: "x\u0304" }, ")(", { i: "y" }, { sub: "i" }, " \u2212 ", { i: "y\u0304" }, ") / \u221a[", { i: "\u03a3" }, "(", { i: "x" }, { sub: "i" }, " \u2212 ", { i: "x\u0304" }, ")", { sup: "2" }, { i: "\u03a3" }, "(", { i: "y" }, { sub: "i" }, " \u2212 ", { i: "y\u0304" }, ")", { sup: "2" }, "]",
], 4));
body.push(P([
  "PivotTable summarisation was used to compare mean yield across the sixteen Thiessen-defined soil-influence zones. Two second-order polynomial regression models were then fitted for variable-rate (VRA) prescription mapping. The lime-requirement model related soil pH to CaCO\u2083 dose (kg ha\u207b\u00b9):",
]));
body.push(equation([
  { i: "CaCO" }, { sub: "3" }, " = ", { i: "\u03b2" }, { sub: "0" }, "(pH)", { sup: "2" }, " + ", { i: "\u03b2" }, { sub: "1" }, "(pH) + ", { i: "\u03b2" }, { sub: "2" },
], 5));
body.push(P([
  "and the NPK fertiliser-requirement model related corn yield (", { i: "Y" }, ", kg m\u207b\u00b2) to fertiliser dose (kg ha\u207b\u00b9):",
]));
body.push(equation([
  { i: "NPK" }, " = ", { i: "\u03b3" }, { sub: "0" }, "(", { i: "Y" }, ")", { sup: "2" }, " + ", { i: "\u03b3" }, { sub: "1" }, "(", { i: "Y" }, ") + ", { i: "\u03b3" }, { sub: "2" },
], 6));
body.push(P([
  "Both quadratic models were fitted by ordinary least squares on the field's yield/soil dataset (coefficient values reported in Section 3.1), and both prescription surfaces were compared against a uniform-rate baseline to quantify potential input savings.",
]));

body.push(H2("2.3 Case Study II \u2014 GIS-Based Grapevine Moth Monitoring (Quinta da Senhora da Gra\u00e7a)"));
body.push(H3("2.3.1 Terrain and Land-Use Characterisation"));
body.push(P([
  "The estate boundary, altitude, slope, and aspect (\u201cexhibition\u201d) were mapped from a digital elevation model, together with west\u2013east and north\u2013south topographic profiles, to characterise the terrain heterogeneity known to influence vine microclimate in the Douro region ",
  { cite: ["fraga2018"] },
  ". Land use and grape variety (caste) composition were subsequently mapped to place the pest-monitoring network within its agronomic context.",
]));
body.push(...figure(`${G}/gm_grid1_terrain.jpg`, "Figure 5. Terrain characterisation of Quinta da Senhora da Gra\u00e7a: (A) geographical and cartographic location; (B) altitude distribution; (C) slope map; (D) west-to-east topographic profile; (E) north-to-south topographic profile; (F) slope-exposure (aspect) chart."));
body.push(...figure(`${G}/gm_grid2_landuse.jpg`, "Figure 6. Land-use and varietal composition of Quinta da Senhora da Gra\u00e7a: (A) land-use and occupation map; (B) grape-variety (caste) distribution chart."));

body.push(H3("2.3.2 Pheromone Trap Network and Spatio-Temporal Pest Analysis"));
body.push(P([
  "A network of georeferenced delta pheromone traps was installed across the estate to monitor ",
  { i: "Lobesia botrana" },
  " flight activity, consistent with pheromone-based monitoring protocols used in mating-disruption programmes elsewhere in the Mediterranean ",
  { cite: ["benelli2023", "ricciardi2024"] },
  ". Trap captures and subsequent crop damage were recorded across three successive generations (April\u2013May, June\u2013July, and August\u2013September) and mapped in WGS84 to examine the spatial relationship between capture intensity, damage, and proximity to riparian forest and grove refugia, which are known overwintering and re-invasion sources for the pest.",
]));
body.push(...figure(`${G}/gm_grid3_pest.jpg`, "Figure 7. Pheromone trap network and spatio-temporal pest dynamics: (A) georeferenced delta-trap locations; (B) first-generation captures (April) and associated damage (May); (C) second-generation captures (June) and associated damage (July); (D) third-generation captures (August) and associated damage (September)."));

body.push(H2("2.4 Case Study III \u2014 Brix Monitoring and Harvest-Date Prediction (Quinta de Nossa Senhora de Lurdes)"));
body.push(H3("2.4.1 Study Site and Traditional Sampling"));
body.push(P([
  "The vineyard was characterised by RGB orthophoto and land-use mapping (Figure 8). Grape maturation was monitored using the standard refractometric principle, whereby degrees Brix (\u00baBx, grams sucrose per 100 g solution) approximate potential wine alcohol content at a conversion of 1 \u00baBx \u2248 0.55% alcohol ",
  { cite: ["aranha2026"] },
  ". Field technicians sampled berries at five dates across the maturation period (15 July, 30 July, 6 August, 15 August, 30 August), spanning early development through v\u00e9raison toward full ripeness.",
]));
body.push(...figure(`${G}/bx_grid1_studysite.jpg`, "Figure 8. Study-site characterisation for Quinta de Nossa Senhora de Lurdes: (A) farm location in true-colour (RGB) orthophoto; (B) land-use and occupation mapping; (C) detailed parcel-level land-use classification."));

body.push(H3("2.4.2 Regression-Based Harvest-Date Forecasting"));
body.push(P([
  "Average Brix values from the five sampling dates were regressed against Julian day using a logarithmic model, chosen because grape sugar accumulation follows a non-linear biological trajectory that accelerates through v\u00e9raison before plateauing near full ripeness. The fitted model was used to forecast the Julian day at which the vineyard-average Brix would reach the target harvest window (25.5\u201327 \u00baBx, corresponding to \u2248 14% potential alcohol).",
]));
body.push(...figure(`${G}/bx_grid2_regression.jpg`, "Figure 9. Regression-based ripening forecast: (A) fitted logarithmic regression model of Brix against Julian day; (B) forecast of harvest-date potential based on the fitted model."));

body.push(H3("2.4.3 Spatial Brix Mapping"));
body.push(P([
  "Brix values recorded at fixed traditional sampling points and at the UTAD Enology experimental plots were interpolated across the vineyard for each of the five sampling dates using IDW, and independently partitioned using Thiessen/Voronoi tessellation to define discrete sampling-zone boundaries for parcel-level harvest prioritisation.",
]));
body.push(...figure(`${G}/bx_grid3_brixsampling.jpg`, "Figure 10. Spatially interpolated Brix values from traditional field sampling: (A) 15 July; (B) 30 July; (C) 6 August; (D) 15 August; (E) 30 August."));
body.push(...figure(`${G}/bx_grid4_experimental.jpg`, "Figure 11. Spatially interpolated Brix values from the UTAD Enology experimental plots: (A) 15 July; (B) 30 July; (C) 6 August; (D) 15 August; (E) 30 August."));
body.push(...figure(`${G}/bx_grid5_thiessen.jpg`, "Figure 12. Brix values partitioned by Thiessen/Voronoi polygons: (A) 15 July; (B) 30 July; (C) 6 August; (D) 15 August; (E) 30 August."));

body.push(H3("2.4.4 Remote Sensing and NDVI-Based Brix Prediction"));
body.push(P([
  "NDVI was computed from near-infrared and red reflectance following the standard formulation ",
  { cite: ["rouse1974"] },
  ", clipped to the vineyard boundary, and regressed against spatially matched Brix observations to test NDVI as a remote, non-destructive proxy for sugar accumulation, in line with its established role as a vigour and physiological-status indicator in precision viticulture ",
  { cite: ["matese2015a", "matese2015b"] },
  ". A near-infrared orthophoto mosaic was additionally produced to support qualitative interpretation of canopy vigour patterns.",
]));
body.push(...figure(`${G}/bx_grid6_remotesensing.jpg`, "Figure 13. Regression diagnostics and remote-sensing products for ripening prediction: (A\u2013C) regression-model diagnostic panels; (D) Normalised Difference Vegetation Index (NDVI); (E) NDVI clipped to the vineyard boundary; (F) near-infrared orthophoto mosaic; (G) near-infrared composite of the vineyard block."));
body.push(H2("2.5 Hybrid Machine-Learning Regression-Kriging for Brix Prediction"));
body.push(P([
  "The IDW interpolation and simple logarithmic/linear regressions described above (Sections 2.4.2-2.4.4) are widely used in applied precision-viticulture workflows but have two well-recognised limitations: IDW provides no explicit trend model linking Brix to auxiliary covariates such as NDVI, and simple parametric regression does not exploit the spatial autocorrelation structure of the regression residuals ",
  { cite: ["hengl2007", "trangmar1985"] },
  ". To address this directly, the point-level Brix dataset (68 georeferenced sampling points x 5 dates = 340 sample-date observations, with paired NDVI and UTM coordinates) was re-analysed using a hybrid regression-kriging (RK) framework, in which a machine-learning regression model supplies the deterministic trend surface and the residuals from that trend are subsequently interpolated geostatistically and added back to the trend prediction, the classical RK formulation ",
  { cite: ["hengl2007"] },
  ", here implemented with modern tree-ensemble regressors in place of the linear trend model traditionally used.",
]));

body.push(H3("2.5.1 Trend Models: Random Forest, Gradient Boosting, and Neural Network"));
body.push(P([
  "Three families of machine-learning regressor were trained to predict Brix from Easting, Northing, Julian day, and NDVI. ",
  { b: "Random Forest Regression (RFR)" },
  " aggregates the predictions of ", { i: "B" }, " de-correlated regression trees, each grown on a bootstrap-resampled subset of the training data ",
  { cite: ["breiman2001"] },
  ":",
]));
body.push(equation([
  { i: "f\u0302" }, { sub: "RF" }, "(", { i: "x" }, ") = (1/", { i: "B" }, ") ", { i: "\u03a3" }, { sub: "b=1" }, { sup: "B" }, " ", { i: "T" }, { sub: "b" }, "(", { i: "x" }, ")",
], 7));
body.push(P([
  "where ", { i: "T" }, { sub: "b" }, "(", { i: "x" }, ") is the prediction of the ", { i: "b" }, "-th regression tree for input vector ", { i: "x" }, " = (Easting, Northing, Julian day, NDVI), and ", { i: "B" }, " = 400 trees were grown per fold. ",
  { b: "Gradient Boosting Regression (GBR)" },
  " instead builds an additive ensemble in which each new tree is fitted to the negative gradient (pseudo-residuals) of the loss function with respect to the current ensemble prediction ",
  { cite: ["friedman2001"] },
  ":",
]));
body.push(equation([
  { i: "F" }, { sub: "m" }, "(", { i: "x" }, ") = ", { i: "F" }, { sub: "m\u22121" }, "(", { i: "x" }, ") + ", { i: "\u03bd" }, " \u00b7 ", { i: "h" }, { sub: "m" }, "(", { i: "x" }, ")",
], 8));
body.push(equation([
  { i: "h" }, { sub: "m" }, " = arg min", { sub: "h" }, " ", { i: "\u03a3" }, { sub: "i" }, " [", { i: "y" }, { sub: "i" }, " \u2212 ", { i: "F" }, { sub: "m\u22121" }, "(", { i: "x" }, { sub: "i" }, ") \u2212 ", { i: "h" }, "(", { i: "x" }, { sub: "i" }, ")]", { sup: "2" },
], 9));
body.push(P([
  "where ", { i: "F" }, { sub: "m" }, " is the ensemble prediction after ", { i: "m" }, " boosting stages, ", { i: "\u03bd" }, " is the learning rate (", { i: "\u03bd" }, " = 0.05 throughout), and ", { i: "h" }, { sub: "m" }, " is the shallow regression tree fitted at stage ", { i: "m" }, " (maximum depth = 3). GBR as implemented here (scikit-learn's ",
  { i: "GradientBoostingRegressor" },
  ") follows the same gradient-boosted decision-tree principle as XGBoost ",
  { cite: ["chenguestrin2016"] },
  ", which was not installable in the present offline computational environment; the scikit-learn implementation was therefore used as a like-for-like substitute and is reported as such rather than under the XGBoost name, consistent with recent calls for transparent reporting of the specific tree-boosting implementation used in agricultural machine-learning studies ",
  { cite: ["liakos2018", "chlingaryan2018"] },
  ". A third, non-tree-based model was additionally trained: a ",
  { b: "Multi-Layer Perceptron (MLP) neural network" },
  " with two hidden layers (32 and 16 units, ReLU activation), trained by the Adam stochastic gradient optimiser with early stopping. Each hidden unit computes:",
]));
body.push(equation([
  { i: "h" }, { sub: "j" }, " = ", { i: "\u03c6" }, "(", { i: "\u03a3" }, { sub: "k" }, " ", { i: "w" }, { sub: "jk" }, { i: "x" }, { sub: "k" }, " + ", { i: "b" }, { sub: "j" }, "),   ", { i: "\u03c6" }, "(", { i: "z" }, ") = max(0, ", { i: "z" }, ")",
], 10));
body.push(P([
  "where ", { i: "x" }, { sub: "k" }, " are the (standardised) input features, ", { i: "w" }, { sub: "jk" }, " and ", { i: "b" }, { sub: "j" }, " are the learned weights and bias of hidden unit ", { i: "j" }, ", and ", { i: "\u03c6" }, " is the rectified-linear (ReLU) activation function. Finally, a ",
  { b: "Stacking Ensemble" },
  " meta-learner combined the out-of-fold predictions of RFR, GBR, and the MLP using ridge-regularised linear regression as the second-stage (meta) model:",
]));
body.push(equation([
  { i: "f\u0302" }, { sub: "stack" }, "(", { i: "x" }, ") = ", { i: "\u03b1" }, { sub: "0" }, " + ", { i: "\u03b1" }, { sub: "1" }, { i: "f\u0302" }, { sub: "RF" }, "(", { i: "x" }, ") + ", { i: "\u03b1" }, { sub: "2" }, { i: "f\u0302" }, { sub: "GB" }, "(", { i: "x" }, ") + ", { i: "\u03b1" }, { sub: "3" }, { i: "f\u0302" }, { sub: "NN" }, "(", { i: "x" }, ")",
], 11));
body.push(P([
  "with the meta-coefficients ", { i: "\u03b1" }, " fitted by ridge regression with the regularisation strength selected by internal 3-fold cross-validation (", { i: "RidgeCV" }, "), following the general stacked-generalisation approach increasingly used to combine complementary base learners in precision-agriculture machine-learning applications ",
  { cite: ["liakos2018"] },
  ".",
]));

body.push(H3("2.5.2 Residual Kriging"));
body.push(P([
  "For the two tree-ensemble trend models (RFR, GBR), residual kriging was additionally applied. Regression-kriging (RK) expresses the target variable as the sum of a deterministic trend and a spatially correlated stochastic residual ",
  { cite: ["hengl2007"] },
  ":",
]));
body.push(equation([
  { i: "Z" }, "(", { i: "s" }, ") = ", { i: "m" }, "(", { i: "s" }, ") + ", { i: "e" }, "(", { i: "s" }, "),   ", { i: "m\u0302" }, "(", { i: "s" }, { sup: "0" }, ") = ", { i: "f\u0302" }, "(", { i: "x" }, "(", { i: "s" }, { sup: "0" }, ")) + ", { i: "e\u0302" }, "(", { i: "s" }, { sup: "0" }, ")",
], 12));
body.push(P([
  "where ", { i: "m" }, "(", { i: "s" }, ") is the trend component predicted by the machine-learning regressor ", { i: "f\u0302" }, " from the auxiliary covariates ", { i: "x" }, "(", { i: "s" }, "), and ", { i: "e" }, "(", { i: "s" }, ") is the spatially correlated residual, estimated at unsampled locations by ordinary kriging of the training-fold residuals. For each cross-validation fold, an experimental semivariogram was computed from the training-fold residuals and fitted with an exponential model:",
]));
body.push(equation([
  { i: "\u03b3" }, "(", { i: "h" }, ") = ", { i: "c" }, { sub: "0" }, " + ", { i: "c" }, "[1 \u2212 exp(\u2212", { i: "h" }, "/", { i: "a" }, ")]",
], 13));
body.push(P([
  "where ", { i: "\u03b3" }, "(", { i: "h" }, ") is the semivariance at separation distance ", { i: "h" }, "; ", { i: "c" }, { sub: "0" }, " is the nugget effect (measurement/micro-scale variance); ", { i: "c" }, " is the partial sill; and ", { i: "a" }, " is the range parameter, all estimated by non-linear least squares on the binned experimental semivariogram. The ordinary kriging predictor at each held-out location was then obtained by solving the kriging linear system:",
]));
body.push(equation([
  { i: "\u03a3" }, { sub: "j=1" }, { sup: "n" }, " ", { i: "\u03bb" }, { sub: "j" }, { i: "\u03b3" }, "(", { i: "s" }, { sub: "i" }, ", ", { i: "s" }, { sub: "j" }, ") + ", { i: "\u03bc" }, " = ", { i: "\u03b3" }, "(", { i: "s" }, { sub: "i" }, ", ", { i: "s" }, { sup: "0" }, "),  ", { i: "\u03a3" }, { sub: "j" }, " ", { i: "\u03bb" }, { sub: "j" }, " = 1",
], 14));
body.push(equation([
  { i: "e\u0302" }, "(", { i: "s" }, { sup: "0" }, ") = ", { i: "\u03a3" }, { sub: "j=1" }, { sup: "n" }, " ", { i: "\u03bb" }, { sub: "j" }, { i: "e" }, "(", { i: "s" }, { sub: "j" }, ")",
], 15));
body.push(P([
  "where ", { i: "\u03bb" }, { sub: "j" }, " are the kriging weights and ", { i: "\u03bc" }, " is the Lagrange multiplier enforcing the unbiasedness constraint. The kriged residual ", { i: "e\u0302" }, "(", { i: "s" }, { sup: "0" }, ") was then added to the tree-ensemble trend prediction (Equation 12) to obtain the final regression-kriging estimate. No external kriging software was available in the sandboxed analysis environment; the variogram fitting and kriging system (Equations 13\u201315) were implemented directly in Python/SciPy for full transparency and reproducibility (code provided as Supplementary Material).",
]));

body.push(H3("2.5.3 Spatial Autocorrelation Diagnostic"));
body.push(P([
  "To assess whether the Brix data at each sampling date contained the spatially structured signal that regression-kriging is designed to exploit, global Moran's ", { i: "I" }, " was computed for the raw Brix values at each of the five dates, using a ", { i: "k" }, "-nearest-neighbour (", { i: "k" }, " = 8) binary spatial weights matrix ",
  { cite: ["moran1950"] },
  ":",
]));
body.push(equation([
  { i: "I" }, " = (", { i: "n" }, "/", { i: "S" }, { sub: "0" }, ") \u00d7 [", { i: "\u03a3" }, { sub: "i" }, { i: "\u03a3" }, { sub: "j" }, " ", { i: "w" }, { sub: "ij" }, "(", { i: "z" }, { sub: "i" }, "\u2212", { i: "z\u0304" }, ")(", { i: "z" }, { sub: "j" }, "\u2212", { i: "z\u0304" }, ")] / [", { i: "\u03a3" }, { sub: "i" }, "(", { i: "z" }, { sub: "i" }, "\u2212", { i: "z\u0304" }, ")", { sup: "2" }, "]",
], 16));
body.push(P([
  "where ", { i: "n" }, " is the number of sample points, ", { i: "w" }, { sub: "ij" }, " is 1 if location ", { i: "j" }, " is among the ", { i: "k" }, " nearest neighbours of location ", { i: "i" }, " (0 otherwise), ", { i: "S" }, { sub: "0" }, " = ", { i: "\u03a3" }, { sub: "i" }, { i: "\u03a3" }, { sub: "j" }, { i: "w" }, { sub: "ij" }, ", and ", { i: "z" }, { sub: "i" }, " is the Brix value at location ", { i: "i" }, ". Under the null hypothesis of no spatial autocorrelation, ", { i: "I" }, " has expectation E[", { i: "I" }, "] = \u22121/(", { i: "n" }, "\u22121); values of ", { i: "I" }, " substantially above this expectation indicate positive spatial autocorrelation (nearby values more similar than expected by chance), which is the condition regression-kriging is designed to exploit.",
]));

body.push(H3("2.5.4 Cross-Validation Design and Performance Metrics"));
body.push(P([
  "Two complementary cross-validation designs were used to avoid the optimistic bias that a single in-sample regression fit can produce. First, a ",
  { b: "pooled spatio-temporal" },
  " design combined all five sampling dates into one dataset and used five-fold ",
  { i: "grouped" },
  " cross-validation, with folds defined by sampling location (all five dates for a given point held out together), repeated six times with different random fold assignments. This directly tests the practically relevant scenario of predicting the full ripening trajectory at a vineyard location that has never been sampled. Second, a ",
  { b: "per-date spatial-only" },
  " design evaluated each of the five dates independently using standard five-fold cross-validation (four repeats), testing spatial interpolation skill using only coordinates and NDVI, without the dominant Julian-day temporal trend. All models (IDW, RFR, GBR, MLP, Stacking Ensemble, RF-regression-kriging [RF-RK], and GB-regression-kriging [GB-RK]) were compared, strictly on held-out data in every fold, using:",
]));
body.push(equation([
  { i: "RMSE" }, " = \u221a[(1/", { i: "n" }, ") ", { i: "\u03a3" }, { sub: "i=1" }, { sup: "n" }, " (", { i: "y" }, { sub: "i" }, " \u2212 ", { i: "y\u0302" }, { sub: "i" }, ")", { sup: "2" }, "]",
], 17));
body.push(equation([
  { i: "MAE" }, " = (1/", { i: "n" }, ") ", { i: "\u03a3" }, { sub: "i=1" }, { sup: "n" }, " |", { i: "y" }, { sub: "i" }, " \u2212 ", { i: "y\u0302" }, { sub: "i" }, "|",
], 18));
body.push(equation([
  { i: "R" }, { sup: "2" }, " = 1 \u2212 [", { i: "\u03a3" }, { sub: "i" }, "(", { i: "y" }, { sub: "i" }, " \u2212 ", { i: "y\u0302" }, { sub: "i" }, ")", { sup: "2" }, "] / [", { i: "\u03a3" }, { sub: "i" }, "(", { i: "y" }, { sub: "i" }, " \u2212 ", { i: "y\u0304" }, ")", { sup: "2" }, "]",
], 19));
body.push(P([
  "where ", { i: "y" }, { sub: "i" }, " is the observed (held-out) Brix value, ", { i: "y\u0302" }, { sub: "i" }, " is the model prediction, and ", { i: "y\u0304" }, " is the mean observed Brix. Unlike an in-sample ", { i: "R" }, { sup: "2" }, " computed on the training data itself, the cross-validated ", { i: "R" }, { sup: "2" }, " in Equation 19 can legitimately be negative, indicating a model that performs worse than simply predicting the mean.",
]));


// ================= 3. RESULTS =================
body.push(H1("3. Results"));

body.push(H2("3.1 Maize Fertility Zoning and Variable-Rate Prescription"));
body.push(P([
  "Soil pH averaged 5.39 across the field (SD = 0.09), indicating uniformly moderate acidity, whereas organic matter (1.80\u20132.50%), calcium (350\u2013750 units), potassium, and phosphorus concentrations varied considerably among sampling points, indicating distinct fertility zones. Surface and deep water content ranged 0.24\u20130.35 and 0.29\u20130.35, respectively \u2014 comparatively stable but agronomically relevant. PivotTable summarisation across the sixteen Thiessen-defined soil-influence zones showed consistent above- or below-average yield performance by zone, supporting the presence of spatially structured, rather than random, yield variability.",
]));
body.push(P([
  "Pairwise correlation analysis (Table 2) identified deep soil-water content as the variable most strongly associated with corn yield (r = 0.972), followed by potassium oxide (r = 0.751) and organic matter (r = 0.711); phosphorus pentoxide was moderately negatively correlated with yield (r = \u22120.592), and calcium and magnesium were weakly-to-moderately negatively correlated with yield (r = \u22120.491 and \u22120.364, respectively) despite being strongly positively correlated with each other (r = 0.956), indicating that the two nutrients co-vary spatially rather than independently limiting yield.",
]));

body.push(...(function(){
  const t = simpleTable(
    ["Variable pair", "Pearson r", "Interpretation"],
    [
      ["Corn yield \u2013 Deep water content", "0.972", "Dominant positive driver of yield"],
      ["Corn yield \u2013 Potassium oxide (K\u2082O)", "0.751", "Strong positive"],
      ["Corn yield \u2013 Organic matter", "0.711", "Strong positive"],
      ["Corn yield \u2013 Phosphorus pentoxide (P\u2082O\u2085)", "\u22120.592", "Moderate negative"],
      ["Corn yield \u2013 Calcium oxide (CaO)", "\u22120.491", "Moderate negative"],
      ["Corn yield \u2013 Magnesium oxide (MgO)", "\u22120.364", "Weak-to-moderate negative"],
      ["Calcium oxide \u2013 Magnesium oxide", "0.956", "Strong positive co-variation"],
    ],
    [4400, 1800, 3150]
  );
  return [t, new Paragraph({ text: "Table 2. Pearson correlation coefficients between corn yield and principal soil/water covariates, Coimbra maize field (n = field-wide Thiessen-zoned samples).", spacing: { after: 220 }, alignment: AlignmentType.JUSTIFIED })];
})());

body.push(...figure(`${G}/corn_grid5_stats.jpg`, "Figure 14. Descriptive and correlation analysis for the Coimbra maize field: (A) mean values of soil/water variables; (B) full correlation matrix of variable-rate variables; (C) correlation heat-map of environmental stressors; (D) correlation-coefficient summary; (E) yield\u2013pH regression used for lime prescription."));

body.push(P([
  "The quadratic lime-requirement model (CaCO\u2083 = 3419.5(pH)\u00b2 \u2212 42630(pH) + 132738) indicated that a soil pH of 5.30 required \u2248 2853 kg ha\u207b\u00b9 of lime, compared with only \u2248 148 kg ha\u207b\u00b9 at pH 5.95. Relative to a uniform application rate of 2.5 t ha\u207b\u00b9 across the 16.85-ha field (42.125 t total), the variable-rate liming prescription reduced total lime demand to 39.429 t \u2014 a saving of 2.694 t. The NPK fertiliser-requirement model (NPK = 39.795(Y)\u00b2 \u2212 230.22(Y) + 390.45, where Y is corn yield in kg m\u207b\u00b2) achieved R\u00b2 = 0.995, and predicted a roughly 4.6-fold difference in fertiliser demand between the lowest- and highest-yielding zones (358 versus 78 kg ha\u207b\u00b9 NPK).",
]));
body.push(...figure(`${G}/corn_grid6_modelperf.jpg`, "Figure 15. Model performance and zonation outputs: (A) NPK\u2013yield quadratic regression; (B) observed-versus-predicted fertiliser requirement; (C) Thiessen-polygon soil/water sampling zones; (D) combined soil\u2013water\u2013fertility composite surface."));
body.push(...figure(`${G}/corn_grid7_vrt.jpg`, "Figure 16. Variable-rate prescription maps: (A) lime (pH-correction) variable-rate application map; (B) NPK variable-rate application map."));

body.push(H2("3.2 Spatio-Temporal Dynamics of the Grapevine Moth"));
body.push(P([
  "Terrain analysis confirmed pronounced heterogeneity across Quinta da Senhora da Gra\u00e7a, with altitude ranging 61\u2013400 m and slope 0\u2013111% in the steepest sections adjacent to the Corgo River, consistent with the topographic complexity reported generally for the Douro Demarcated Region ",
  { cite: ["fraga2018"] },
  ". Across the pheromone-trap network, first-generation (April\u2013May) captures were low-intensity and spatially confined to the south-eastern and upper-central boundaries adjoining riparian forest and groves, consistent with an edge-effect pattern in which forested margins act as overwintering refugia; associated damage in May was minor (index 2\u20134).",
]));
body.push(P([
  "The second generation (June\u2013July) produced the most significant escalation, with trap captures reaching 16\u201318 and a corresponding rise in July damage across the north-eastern and south-eastern sectors, indicating that the pest population had expanded beyond the initial refugial margins into the vineyard interior \u2014 the critical window for integrated pest-management intervention. By the third generation (August\u2013September), trap captures declined to 0\u20136, though September damage (index 6\u20138) remained agronomically significant and more spatially dispersed than in the first generation, consistent with late-season population dispersal into previously less-affected zones and continuing quality risk from wound-associated Botrytis infection.",
]));

body.push(H2("3.3 Brix Accumulation, Regression Forecasting, and NDVI Prediction"));
body.push(P([
  "Average vineyard Brix rose progressively from 9.19 \u00baBx (15 July) to 20.54 \u00baBx (30 August), consistent with the expected acceleration of sugar accumulation through v\u00e9raison. A logarithmic regression of Brix on Julian day (", { i: "x" }, ") was fitted:",
]));
body.push(equation([
  { i: "Brix" }, "(", { i: "x" }, ") = 65.139 ln(", { i: "x" }, ") \u2212 335.44,   ", { i: "R" }, { sup: "2" }, " = 0.978",
], 20));
body.push(P([
  "indicating that essentially all of the observed temporal variation in vineyard-average Brix was captured by the model (in-sample fit, all 68 points). Extrapolating the fitted curve forward, the target harvest window of 25.5\u201327 \u00baBx (\u2248 14% potential alcohol) was forecast to occur near Julian day 256 (13 September).",
]));
body.push(P([
  "NDVI, computed from clipped near-infrared/red reflectance across the vineyard, was significantly and strongly related to spatially matched Brix observations (R\u00b2 = 0.880), and parcels classified as high-NDVI vigour consistently exhibited the highest Brix values throughout the monitoring period. Spatial Brix mapping (traditional sampling, UTAD Enology experimental plots, and Thiessen-zoned polygons; Figures 10\u201312) consistently distinguished early-ripening from late-ripening sectors across all five sampling dates, supporting parcel-level selective-harvest prioritisation ahead of the predicted harvest date.",
]));

body.push(H2("3.4 Hybrid Machine-Learning Regression-Kriging: Cross-Validated Model Comparison"));
body.push(P([
  "The in-sample NDVI\u2013Brix regression reported in Section 3.3 (R\u00b2 = 0.880) is a single fit to all 68 points with no held-out data, and is consequently expected to overstate genuine predictive skill. Under the stricter, spatially grouped cross-validation described in Section 2.5.4 \u2014 in which each vineyard location is held out in its entirety and its full five-date ripening trajectory is predicted from unrelated locations \u2014 the picture is more modest and considerably more informative for practical deployment (Table 3, Figure 17). The IDW baseline achieved a mean cross-validated R\u00b2 of 0.538 (RMSE = 3.65 \u00baBx); Random Forest achieved a closely comparable R\u00b2 of 0.520 (RMSE = 3.70 \u00baBx); Gradient Boosting achieved R\u00b2 = 0.453 (RMSE = 3.94 \u00baBx); the Multi-Layer Perceptron neural network performed worst of all trend models (R\u00b2 = 0.370, RMSE = 4.23 \u00baBx), consistent with neural networks' well-documented tendency to require larger training samples than tree ensembles to avoid overfitting; the Stacking Ensemble (RFR + GBR + MLP with a ridge meta-learner) achieved the best result among the machine-learning models (R\u00b2 = 0.467, RMSE = 3.91 \u00baBx), modestly exceeding its three individual base learners but still below the simple IDW baseline; and the hybrid regression-kriging variants (RF-RK and GB-RK) did not outperform their respective plain trend models (R\u00b2 = 0.378 and 0.454), with RF-RK in particular showing markedly higher variance across folds (R\u00b2 std = 0.451), indicative of unstable variogram fitting at this sample size.",
]));

body.push(...(function(){
  const t = simpleTable(
    ["Model", "RMSE (\u00baBx)", "MAE (\u00baBx)", "R\u00b2 (cross-validated)"],
    [
      ["IDW (baseline)", "3.65 \u00b1 0.46", "3.02", "0.538 \u00b1 0.084"],
      ["Random Forest (RFR)", "3.70 \u00b1 0.42", "3.10", "0.520 \u00b1 0.099"],
      ["Gradient Boosting (GBR)", "3.94 \u00b1 0.53", "3.21", "0.453 \u00b1 0.127"],
      ["Neural Network (MLP)", "4.23 \u00b1 0.66", "3.46", "0.370 \u00b1 0.185"],
      ["Stacking Ensemble (RFR+GBR+MLP)", "3.91 \u00b1 0.40", "3.25", "0.467 \u00b1 0.096"],
      ["RF + Kriged Residuals (RF-RK)", "4.10 \u00b1 0.98", "3.32", "0.378 \u00b1 0.451"],
      ["GB + Kriged Residuals (GB-RK)", "3.94 \u00b1 0.53", "3.21", "0.454 \u00b1 0.127"],
    ],
    [3400, 2000, 1800, 2550]
  );
  return [t, new Paragraph({ text: "Table 3. Pooled spatio-temporal cross-validation results (GroupKFold by sampling location, 5 folds \u00d7 6 repeats; predictors: Easting, Northing, Julian day, NDVI). Values are mean \u00b1 standard deviation across folds/repeats.", spacing: { after: 220 }, alignment: AlignmentType.JUSTIFIED })];
})());

body.push(...figure(`${G}/ml_grid1_model_comparison.jpg`, "Figure 17. Cross-validated model comparison for Brix prediction across seven models: (A) root-mean-square error (RMSE), lower is better; (B) coefficient of determination (R\u00b2), higher is better. Error bars show standard deviation across cross-validation folds/repeats."));

body.push(P([
  "Feature-importance analysis (Figure 18) clarified why the more complex models did not outperform the simpler baselines. Both the built-in (impurity-based) importances for Random Forest and Gradient Boosting and the model-agnostic permutation importance (computed by randomly shuffling each feature and measuring the resulting drop in R\u00b2, averaged over 30 repeats) agreed closely: Julian day overwhelmingly dominated predictive importance (permutation-importance mean R\u00b2 decrease = 1.113), roughly five times larger than Northing (0.211) or NDVI (0.205), and more than ten times larger than Easting (0.093). This indicates that, at the sampling density available here (68 points), the spatial and NDVI signal is comparatively weak relative to the temporal signal, leaving a tree-ensemble trend model or its kriged residuals little additional structure to exploit beyond a simple date-matched IDW interpolation.",
]));
body.push(...figure(`${G}/ml_grid2_feature_importance.jpg`, "Figure 18. Feature importance for Brix prediction: (A) Random Forest impurity-based feature importance; (B) Gradient Boosting impurity-based feature importance; (C) permutation importance (model-agnostic, computed on Random Forest). All three methods agree that Julian day dominates over spatial coordinates and NDVI."));

body.push(P([
  "This weak spatial signal was corroborated directly by the Moran's ", { i: "I" }, " spatial-autocorrelation diagnostic (Equation 16, Figure 19): raw Brix values at each of the five sampling dates showed only weak positive spatial autocorrelation (", { i: "I" }, " = 0.005\u20130.040), only modestly above the value expected under complete spatial randomness (E[", { i: "I" }, "] = \u22120.015 for ", { i: "n" }, " = 68). This confirms, independently of the cross-validation results, that the Brix surface at this vineyard and sampling density is close to spatially unstructured once the temporal trend is removed \u2014 precisely the condition under which regression-kriging is expected to add little value over its underlying trend model ",
  { cite: ["hengl2007", "trangmar1985"] },
  ".",
]));
body.push(...figure(`${G}/ml_grid5_morans_i.jpg`, "Figure 19. Global Moran's I spatial autocorrelation of raw Brix values by sampling date (k = 8 nearest neighbours). The dashed red line shows the value expected under complete spatial randomness."));

body.push(P([
  "Observed-versus-predicted plots for the out-of-fold predictions (Figure 20) show that IDW, Random Forest, and the Stacking Ensemble all track the overall Brix range reasonably well, with none of the three models showing a strong systematic bias, though all three under-predict the small number of the highest-Brix observations \u2014 a common characteristic of distance-weighted interpolation, tree-ensemble methods, and linear-combination ensembles alike, all of which tend to smooth extreme values toward the local mean.",
]));
body.push(...figure(`${G}/ml_grid3_observed_vs_predicted.jpg`, "Figure 20. Out-of-fold observed-versus-predicted Brix values: (A) IDW baseline; (B) Random Forest; (C) Stacking Ensemble. The dashed line indicates perfect agreement (1:1)."));

body.push(P([
  "Finally, mapping the fitted hybrid regression-kriging surface for the final (30 August) sampling date alongside the IDW baseline and the interpolated NDVI covariate (Figure 21) illustrates that, while the three Brix surfaces (IDW, RF trend, RF-RK) are broadly similar in their large-scale pattern, the RF-based surfaces are visibly smoother in the field interior and more strongly shaped by the NDVI covariate near the vineyard margins, where NDVI values are most extreme.",
]));
body.push(...figure(`${G}/ml_grid4_hybrid_surface_map.jpg`, "Figure 21. Spatial interpolation surfaces for 30 August Brix: (A) IDW baseline; (B) Random Forest trend surface; (C) hybrid RF + kriged-residual (regression-kriging) surface; (D) interpolated NDVI covariate surface used as a predictor. Black dots show sampling locations."));

// ================= 4. DISCUSSION =================
body.push(H1("4. Discussion"));

body.push(H2("4.1 Cross-System Comparison of Environment\u2013Response Relationships"));
body.push(P([
  "The three case studies, despite covering structurally different agricultural problems, showed a consistent pattern: a small number of environmental or spectral covariates explained a very large share of the observed variability in the outcome of interest \u2014 deep soil-water content and potassium for maize yield (r = 0.972 and 0.751), NDVI for grape Brix (R\u00b2 = 0.880), and time (Julian day) for Brix accumulation itself (R\u00b2 = 0.978). This pattern is broadly consistent with prior reports that NDVI and related vegetation indices carry strong predictive power for both maize yield ",
  { cite: ["burglewski2024"] },
  " and grape sugar accumulation in independently studied vineyards, and reinforces the case for remote-sensing proxies as a practical complement to, rather than replacement for, direct field sampling. At the same time, the very high coefficients obtained here (R\u00b2 routinely above 0.87) are somewhat higher than is typical in larger, multi-season precision-agriculture datasets, and most plausibly reflect the modest number of sampling dates/points and the restriction of each case study to a single growing season, rather than an unusually strong or generalisable underlying relationship.",
]));
body.push(P([
  "A further point of comparison, made possible only by analysing the three case studies within one framework, concerns where machine learning is and is not likely to add value. The maize system (Section 3.1) has six correlated soil/water covariates and a comparatively strong multivariate signal (|r| up to 0.972); the Brix system (Sections 3.3\u20133.4) has a single covariate (NDVI) alongside a dominant temporal trend, and, as demonstrated directly by the cross-validated machine-learning comparison and the Moran's ", { i: "I" }, " diagnostic (Section 3.4), too little residual spatial structure for regression-kriging or tree-ensemble methods to outperform simple IDW. This contrast suggests, as a testable hypothesis for future work, that the maize dataset \u2014 with its richer, multi-covariate auxiliary information \u2014 is the more promising candidate among the three systems studied here for a machine-learning approach to show a genuine advantage over deterministic interpolation, precisely because it offers the multivariate, spatially structured covariate signal that regression-kriging and ensemble learning are designed to exploit ",
  { cite: ["hengl2007", "liakos2018"] },
  ".",
]));

body.push(H2("4.2 Practical Value and Current Limitations of the GIS/Remote-Sensing Workflow"));
body.push(P([
  "In the maize system, the combination of IDW-interpolated fertility mapping and quadratic yield\u2013input regression produced prescription maps with a demonstrable, if modest, input saving (\u2248 6.4% reduction in total lime demand) and a substantially more efficient spatial allocation of fertiliser than uniform application \u2014 consistent with the general rationale for variable-rate technology in heterogeneous fields ",
  { cite: ["chuvieco2020", "jensen2015"] },
  ". However, IDW and Thiessen tessellation are both deterministic interpolators that do not provide a formal measure of prediction uncertainty, unlike geostatistical kriging; their use here reflects a pragmatic choice given sampling density rather than a claim that they are the optimal interpolator for this field ",
  { cite: ["wong2017", "trangmar1985", "shaddad2016", "sekulic2020"] },
  ". Future work at this and comparable sites would benefit from denser or multi-season sampling sufficient to support semivariogram-based geostatistical interpolation and explicit quantification of prediction uncertainty.",
]));
body.push(P([
  "In the vineyard-pest system, the clear generational structure observed in the trap-capture data \u2014 edge-effect establishment, interior expansion, and late-season dispersal \u2014 is consistent with the general phenology of ",
  { i: "L. botrana" },
  " reported elsewhere and supports the geospatial trap network as an effective, low-cost diagnostic tool for timing integrated pest-management interventions, particularly ahead of the second-generation flight period identified here as the critical control window, in line with mating-disruption and monitoring strategies documented for other Mediterranean vineyard systems ",
  { cite: ["benelli2023", "ricciardi2024"] },
  ". This case study, however, is limited to a single season and a single estate; multi-year replication would be required to establish whether the observed spatial pattern (forest-edge origin, interior expansion, late dispersal) is a stable feature of this landscape or contingent on the particular climatic conditions of the monitored season.",
]));
body.push(P([
  "In the Brix/ripening system, the strong logarithmic time\u2013Brix relationship and the substantial NDVI\u2013Brix association together indicate that combining a small number of destructive field samples with a remote vegetation index can meaningfully extend the spatial and temporal resolution of ripening monitoring beyond what routine refractometer sampling alone would allow, consistent with the broader precision-viticulture literature on vigour\u2013quality relationships ",
  { cite: ["matese2015a", "matese2015b"] },
  ". The regression-based harvest-date forecast should nonetheless be treated as indicative rather than definitive: it was fitted to a single season's five sampling dates, and the logarithmic functional form, while biologically motivated, was not compared here against alternative non-linear forms (e.g., logistic or Gompertz growth curves) that are also plausible descriptions of sugar accumulation.",
]));

body.push(H2("4.3 Shared Constraints and Implications for Future Precision-Agriculture Trial Design"));
body.push(P([
  "Three constraints recur across all three case studies and merit explicit attention in any attempt to generalise beyond the individual farms studied here. First, each case study is based on a single growing season; inter-annual climatic variability is known to substantially affect vegetation-index\u2013yield and vegetation-index\u2013quality relationships, so the strong single-season coefficients reported here should be interpreted as an upper bound on likely multi-season performance. Second, sample sizes at the level of individual soil, trap, or Brix sampling points were modest (tens of points per farm), which favoured deterministic interpolation (IDW, Thiessen polygons) over geostatistical alternatives and precluded formal cross-validation of the interpolated surfaces. Third, all three studies relied on a single or narrow set of remote-sensing acquisitions (Landsat-derived NDVI for maize; vineyard-scale NDVI/NIR orthophotos for the Brix study) rather than a continuous, multi-temporal sensing programme, limiting the ability to disentangle short-term weather effects from longer-term spatial fertility or vigour patterns. Addressing these three constraints, through multi-season replication, denser or geostatistically validated sampling, and higher-frequency remote sensing, represents the most direct route to strengthening the practical reliability of the variable-rate, pest-risk, and harvest-forecasting tools demonstrated in this study.",
]));
body.push(P([
  "For machine-learning and hybrid regression-kriging methods specifically, the analysis in Section 3.4 points to a concrete, quantitative sampling target rather than a general appeal to \u201cmore data\u201d: reliable variogram and ensemble-model estimation in comparable geostatistical applications typically requires on the order of 100\u2013150 sample points ",
  { cite: ["trangmar1985", "sekulic2020"] },
  ", roughly double the 68 points available for the Brix case study, and ideally spread across multiple growing seasons so that the temporal trend (Julian day; Equation 20) can be modelled jointly with inter-annual variability rather than treated as a single-season fixed effect. Future data-collection campaigns intending to apply the machine-learning pipeline documented here (Section 2.5, Supplementary Material) should therefore prioritise, in order of expected marginal benefit: (i) increasing the number of independent spatial sampling locations per season; (ii) adding further auxiliary covariates beyond NDVI (e.g., soil apparent electrical conductivity, canopy temperature, or additional vegetation indices) to increase the multivariate signal available to tree-ensemble and stacking models, following the multi-covariate approach that proved more informative in the maize system (Section 4.1); and (iii) repeating sampling across at least two to three growing seasons to allow the neural-network and stacking-ensemble models, which are the most data-hungry of the approaches benchmarked here, a realistic opportunity to demonstrate their potential advantage over simpler deterministic methods.",
]));

body.push(H2("4.4 Does Machine Learning Improve on Empirical Interpolation? An Honest Appraisal"));
body.push(P([
  "A central motivation for implementing the hybrid regression-kriging framework (Sections 2.5, 3.4) was to test whether modern machine learning could directly overcome the acknowledged limitations of IDW and simple parametric regression identified above. The rigorously cross-validated result is more nuanced than a simple confirmation of that expectation, and we report it in full because the pattern itself is informative. Once genuine spatial hold-out validation was enforced (Section 2.5.4), predictive skill for Brix fell from the in-sample R\u00b2 = 0.880 reported in Section 3.3 to a cross-validated R\u00b2 of 0.538 for the IDW baseline. None of the five machine-learning configurations tested \u2014 Random Forest (R\u00b2 = 0.520), Gradient Boosting (R\u00b2 = 0.453), a Multi-Layer Perceptron neural network (R\u00b2 = 0.370), a Stacking Ensemble combining all three (R\u00b2 = 0.467), or either hybrid regression-kriging variant (R\u00b2 = 0.378\u20130.454) \u2014 exceeded this simple baseline, although the Stacking Ensemble came closest among the learned models, consistent with the general expectation that combining diverse base learners via a meta-learner (Equation 11) recovers some, though not all, of the performance gap between any single weak learner and a well-matched baseline. The neural network's comparatively poor performance is unsurprising given that MLPs typically require substantially larger training sets than tree ensembles to estimate their weight matrices reliably ",
  { cite: ["liakos2018"] },
  ", and RF-RK showed unstable, high-variance performance consistent with unreliable variogram estimation from residuals of only \u2248 54 training points per fold ",
  { cite: ["trangmar1985", "sekulic2020"] },
  ". Feature-importance analysis, corroborated by both the impurity-based and model-agnostic permutation-importance methods (Figure 18), explains this outcome mechanistically: the temporal ripening signal (Julian day) so strongly dominates the spatial and NDVI signal (permutation-importance ratio of approximately 5:1 relative to the next-most-important feature) that a spatially aware model has comparatively little additional structure left to exploit once the seasonal trend is accounted for.",
]));
body.push(P([
  "This mechanistic explanation was independently corroborated by the global Moran's ", { i: "I" }, " spatial-autocorrelation diagnostic (Equation 16, Figure 19): raw Brix values showed only weak positive spatial autocorrelation at every sampling date (", { i: "I" }, " = 0.005\u20130.040, against an expected value of \u22120.015 under complete spatial randomness). A dataset with this little spatial structure in the response variable offers regression-kriging very little residual signal to exploit beyond what the trend model (Julian day) already captures, which is the most direct explanation for why the hybrid RK variants failed to add value here \u2014 not a failure of the regression-kriging methodology itself, but a property of this particular dataset at this sampling density.",
]));
body.push(P([
  "This finding is consistent with a broader pattern documented in the digital soil mapping, precision-agriculture, and agricultural machine-learning literature, in which regression-kriging and machine-learning interpolators tend to outperform simple deterministic methods primarily when (i) sample sizes are sufficient for stable variogram or ensemble-model estimation (typically well over 100 points), and (ii) auxiliary covariates carry strong, spatially structured information that is not already captured by simpler methods ",
  { cite: ["shaddad2016", "sekulic2020", "hengl2007", "liakos2018", "chlingaryan2018"] },
  ". Neither condition was fully met for the Brix case study analysed here, and we consider it important to report this null-to-modest result transparently rather than to selectively present only the scenarios in which machine learning outperforms the baseline. The methodological contribution of this section is therefore threefold: first, the pooled spatio-temporal regression-kriging pipeline itself (Section 2.5), extended here to include neural-network and stacking-ensemble trend models alongside Random Forest and Gradient Boosting, is, to our knowledge, a novel application of hybrid machine-learning regression-kriging to vineyard Brix forecasting and is made fully available (Supplementary Material) for use on larger datasets; second, the Moran's ", { i: "I" }, " diagnostic provides an independent, model-free explanation for the cross-validation result, rather than requiring the reader to take the negative finding on faith; and third, the cross-validated comparison demonstrates concretely why naive in-sample R\u00b2 values (as in Section 3.3, and as commonly reported in similar precision-viticulture studies) can substantially overstate real-world predictive skill, underscoring the value of spatially grouped cross-validation, permutation importance, and spatial-autocorrelation diagnostics as standard practice in agricultural machine-learning studies ",
  { cite: ["hengl2007", "liakos2018"] },
  ". We expect that applying the same pipeline to the maize soil-fertility dataset (Section 2.2), which has a comparable sampling density but a stronger multi-variable auxiliary signal (six soil/water covariates rather than one) and, per Table 2, higher raw correlation coefficients than the single-covariate NDVI\u2013Brix relationship, and to a multi-season Brix dataset with denser sampling, would be a natural and promising extension of this work, and we recommend it as a priority for follow-up data collection.",
]));

// ================= 5. CONCLUSION =================
body.push(H1("5. Conclusion"));
body.push(P([
  "This study integrated three independent GIS and remote-sensing precision-agriculture campaigns \u2014 maize fertility zoning, vineyard grapevine-moth monitoring, and grape Brix/harvest-date forecasting \u2014 conducted across three farms in central and northern Portugal, into a single comparative framework, and additionally implemented and rigorously cross-validated a hybrid machine-learning regression-kriging pipeline (Random Forest and Gradient Boosting trend models with kriged-residual correction) for the Brix case study. Across all three systems, a small number of spatially interpolated or remotely sensed covariates (deep soil water and potassium for maize yield; trap-network position relative to forest edges for pest risk; NDVI and Julian day for grape Brix) explained the large majority of observed variability, and translated into concrete, farm-relevant outputs: a variable-rate lime and NPK prescription programme with a measurable input saving for maize; a generation-resolved pest-risk map identifying the second-generation flight period as the priority intervention window for the vineyard moth; and a harvest-date forecast for the ripening vineyard. The machine-learning analysis showed, transparently, that under strict spatial cross-validation, Random Forest, Gradient Boosting, and hybrid regression-kriging did not outperform simple IDW interpolation at the sampling density available (68 points), a finding attributable to the dominance of the temporal ripening signal over the spatial/NDVI signal at this scale, and one that usefully tempers the substantially higher in-sample R\u00b2 obtained from naive, non-cross-validated regression. Considered together, the three case studies support the conclusion that low-cost, field-deployable GIS/remote-sensing workflows transfer usefully across structurally different cropping systems, while also indicating that single-season sampling, modest point-sample density, and, for machine-learning and geostatistical methods specifically, insufficient sample size relative to covariate complexity, are shared limitations that should guide the design of larger, multi-season, more densely sampled precision-agriculture trials building on this work.",
]));

// ================= END MATTER =================
body.push(H1("CRediT Author Statement"));
body.push(P([
  "Naziru Halilu: Conceptualization, Methodology, Software, Formal analysis, Investigation, Data curation, Writing \u2013 original draft, Writing \u2013 review & editing, Visualization.",
]));

body.push(H1("Data Availability Statement"));
body.push(P([
  "The Brix/NDVI point dataset (68 georeferenced sampling locations, five sampling dates) underlying the machine-learning and regression-kriging analysis (Sections 2.5, 3.4), together with the complete analysis code (data loading, IDW baseline, Random Forest, Gradient Boosting, Multi-Layer Perceptron, Stacking Ensemble, exponential-variogram fitting, ordinary kriging, Moran's ", { i: "I" }, ", permutation importance, and all associated figure-generation scripts), is provided in full as Supplementary Material accompanying this manuscript, together with a README documenting the folder structure and instructions for reproducing every reported cross-validation result from the raw data. The maize soil/yield dataset (Section 2.2) and vineyard-pest trap-count dataset (Section 2.3) that support the descriptive, correlation, and regression results in Sections 3.1\u20133.2 were collected as part of the original field campaigns and are available from the corresponding author upon reasonable request.",
]));

body.push(H1("Declaration of Competing Interest"));
body.push(P([
  "The author declares no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.",
]));

body.push(H1("Funding"));
body.push(P([
  "This research received no specific grant from any funding agency in the public, commercial, or not-for-profit sectors. Field data collection was conducted as part of coursework and practical training activities at the University of Tr\u00e1s-os-Montes e Alto Douro (UTAD), Portugal.",
]));

body.push(H1("Acknowledgments"));
body.push(P([
  "The author thanks the instructing team ",
  { cite: ["aranha2026"] },
  " for supervision of the original field campaigns at Coimbra, Quinta da Senhora da Gra\u00e7a, and Quinta de Nossa Senhora de Lurdes, and the respective landowners for granting access to their properties for soil sampling, pheromone-trap deployment, and grape sampling.",
]));

body.push(H1("Supplementary Material"));
body.push(P([
  "Supplementary Material accompanying this manuscript includes: (S1) the complete Python source code implementing the IDW baseline, Random Forest, Gradient Boosting, Multi-Layer Perceptron, Stacking Ensemble, and hybrid regression-kriging models described in Section 2.5, together with the exponential-variogram fitting and ordinary-kriging routines (Equations 12\u201315) implemented directly in Python/SciPy; (S2) the underlying Brix/NDVI/UTM-coordinate dataset (S3) the full set of cross-validation results in machine-readable (JSON) format, including the pooled spatio-temporal comparison (Table 3), the per-date spatial-only comparison, the Moran's ", { i: "I" }, " diagnostic (Figure 19), and the permutation-importance results (Figure 18C); and (S4) all figure-generation scripts used to produce Figures 17\u201321.",
]));

// ================= REFERENCES =================
body.push(H1("References"));
REFS.forEach(r => body.push(refEntry(r.id)));

module.exports = { body, G };
