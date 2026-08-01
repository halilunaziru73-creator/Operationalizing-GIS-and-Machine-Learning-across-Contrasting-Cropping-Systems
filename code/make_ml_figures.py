"""Generate figures summarising the ML model comparison for the manuscript."""
import json
import numpy as np
import pandas as pd
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, StackingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import GroupKFold
from scipy.spatial.distance import cdist

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from train_regression_kriging import load_data, DATES, _krige_residual_to_test, _score

ROOT = Path(__file__).resolve().parent.parent
RESULTS = ROOT / "results"
FIGURES = ROOT / "figures"

plt.rcParams.update({"font.size": 11, "font.family": "DejaVu Sans"})

MODEL_COLORS = {
    "IDW": "#7f8c8d",
    "RandomForest": "#2e86ab",
    "GradientBoosting": "#e07a1f",
    "NeuralNetwork": "#c0392b",
    "StackingEnsemble": "#16a085",
    "RF_RegressionKriging": "#2e7d32",
    "GB_RegressionKriging": "#8e44ad",
}
MODEL_LABELS = {
    "IDW": "IDW\n(baseline)",
    "RandomForest": "Random\nForest",
    "GradientBoosting": "Gradient\nBoosting",
    "NeuralNetwork": "Neural\nNetwork (MLP)",
    "StackingEnsemble": "Stacking\nEnsemble",
    "RF_RegressionKriging": "RF + Kriged\nResiduals",
    "GB_RegressionKriging": "GB + Kriged\nResiduals",
}

# ---------------------------------------------------------------------
# Figure A: Pooled spatio-temporal model comparison (RMSE and R2 bars)
# ---------------------------------------------------------------------
with open(RESULTS / "cv_pooled_spatiotemporal.json") as f:
    pooled = json.load(f)

models = list(pooled.keys())
fig, axes = plt.subplots(1, 2, figsize=(13, 5))

rmse_means = [pooled[m]["RMSE_mean"] for m in models]
rmse_stds = [pooled[m]["RMSE_std"] for m in models]
colors = [MODEL_COLORS[m] for m in models]
labels = [MODEL_LABELS[m] for m in models]

axes[0].bar(labels, rmse_means, yerr=rmse_stds, color=colors, capsize=4, edgecolor="black", linewidth=0.6)
axes[0].set_ylabel("Cross-validated RMSE (\u00baBx)")
axes[0].set_title("(A) Prediction error by model\n(lower is better)")
axes[0].tick_params(axis="x", labelsize=8, rotation=25)
axes[0].grid(axis="y", alpha=0.3)

r2_means = [pooled[m]["R2_mean"] for m in models]
r2_stds = [pooled[m]["R2_std"] for m in models]
axes[1].bar(labels, r2_means, yerr=r2_stds, color=colors, capsize=4, edgecolor="black", linewidth=0.6)
axes[1].set_ylabel("Cross-validated R\u00b2")
axes[1].set_title("(B) Predictive skill by model\n(higher is better)")
axes[1].tick_params(axis="x", labelsize=8, rotation=25)
axes[1].axhline(0, color="black", linewidth=0.8)
axes[1].grid(axis="y", alpha=0.3)

plt.tight_layout()
plt.savefig(FIGURES / "ml_grid1_model_comparison.jpg", dpi=200, bbox_inches="tight")
plt.close()
print("Saved ml_grid1_model_comparison.jpg")

# ---------------------------------------------------------------------
# Figure B: Feature importance (RF and GB) fitted on the full pooled dataset
# ---------------------------------------------------------------------
merged, long_df = load_data()
X = long_df[["x", "y", "julian_day", "ndvi"]].values
y = long_df["brix"].values
feat_names = ["Easting (X_UTM)", "Northing (Y_UTM)", "Julian day", "NDVI"]

rf_full = RandomForestRegressor(n_estimators=500, max_depth=8, min_samples_leaf=2, random_state=0)
rf_full.fit(X, y)
gb_full = GradientBoostingRegressor(n_estimators=300, max_depth=3, learning_rate=0.05, random_state=0)
gb_full.fit(X, y)

fig, axes = plt.subplots(1, 3, figsize=(15.5, 4.2))
rf_imp = rf_full.feature_importances_
order = np.argsort(rf_imp)
axes[0].barh(np.array(feat_names)[order], rf_imp[order], color="#2e86ab", edgecolor="black", linewidth=0.6)
axes[0].set_title("(A) Random Forest\n(impurity-based)")
axes[0].set_xlabel("Relative importance")
axes[0].grid(axis="x", alpha=0.3)

gb_imp = gb_full.feature_importances_
order2 = np.argsort(gb_imp)
axes[1].barh(np.array(feat_names)[order2], gb_imp[order2], color="#e07a1f", edgecolor="black", linewidth=0.6)
axes[1].set_title("(B) Gradient Boosting\n(impurity-based)")
axes[1].set_xlabel("Relative importance")
axes[1].grid(axis="x", alpha=0.3)

with open(RESULTS / "permutation_importance.json") as f:
    perm = json.load(f)
perm_names = ["Easting (X_UTM)", "Northing (Y_UTM)", "Julian day", "NDVI"]
perm_keys = ["x", "y", "julian_day", "ndvi"]
perm_means = np.array([perm[k]["importance_mean"] for k in perm_keys])
perm_stds = np.array([perm[k]["importance_std"] for k in perm_keys])
order3 = np.argsort(perm_means)
axes[2].barh(np.array(perm_names)[order3], perm_means[order3], xerr=perm_stds[order3],
             color="#8e44ad", edgecolor="black", linewidth=0.6, capsize=3)
axes[2].set_title("(C) Permutation importance\n(model-agnostic, RF)")
axes[2].set_xlabel("Mean R\u00b2 decrease when\nfeature is permuted")
axes[2].grid(axis="x", alpha=0.3)

plt.tight_layout()
plt.savefig(FIGURES / "ml_grid2_feature_importance.jpg", dpi=200, bbox_inches="tight")
plt.close()
print("Saved ml_grid2_feature_importance.jpg")

# ---------------------------------------------------------------------
# Figure B2: Moran's I spatial autocorrelation of raw Brix values per date
# ---------------------------------------------------------------------
with open(RESULTS / "morans_i_brix.json") as f:
    morans = json.load(f)

fig, ax = plt.subplots(figsize=(7, 4.3))
dates_labels = DATES
I_vals = [morans[d]["morans_I"] for d in dates_labels]
expected_I = morans[DATES[0]]["expected_I_null"]
ax.bar(dates_labels, I_vals, color="#2e86ab", edgecolor="black", linewidth=0.6)
ax.axhline(expected_I, color="red", linestyle="--", linewidth=1.2,
           label=f"Expected I under no\nautocorrelation ({expected_I:.3f})")
ax.set_ylabel("Global Moran's I")
ax.set_title("(A) Spatial autocorrelation of Brix\nby sampling date (k=8 nearest neighbours)")
ax.legend(fontsize=8, loc="upper right")
ax.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(FIGURES / "ml_grid5_morans_i.jpg", dpi=200, bbox_inches="tight")
plt.close()
print("Saved ml_grid5_morans_i.jpg")

# ---------------------------------------------------------------------
# Figure C: Observed vs. predicted (pooled out-of-fold predictions, best two models)
# ---------------------------------------------------------------------
groups = long_df["sample"].values
coords = long_df[["x", "y"]].values
dates_arr = long_df["date"].values

oof_idw = np.full(len(y), np.nan)
oof_rf = np.full(len(y), np.nan)
oof_stack = np.full(len(y), np.nan)

gkf = GroupKFold(n_splits=5)
for train_idx, test_idx in gkf.split(X, y, groups):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train = y[train_idx]
    coords_train, coords_test = coords[train_idx], coords[test_idx]
    date_train, date_test = dates_arr[train_idx], dates_arr[test_idx]

    rf = RandomForestRegressor(n_estimators=400, max_depth=8, min_samples_leaf=2, random_state=0)
    rf.fit(X_train, y_train)
    oof_rf[test_idx] = rf.predict(X_test)

    stack = StackingRegressor(
        estimators=[
            ("rf", RandomForestRegressor(n_estimators=300, max_depth=8, min_samples_leaf=2, random_state=0)),
            ("gb", GradientBoostingRegressor(n_estimators=200, max_depth=3, learning_rate=0.05, random_state=0)),
            ("nn", make_pipeline(StandardScaler(), MLPRegressor(hidden_layer_sizes=(32, 16), max_iter=3000,
                                                                  early_stopping=True, n_iter_no_change=25,
                                                                  random_state=0))),
        ],
        final_estimator=RidgeCV(alphas=np.logspace(-3, 3, 20)),
        cv=3,
    )
    stack.fit(X_train, y_train)
    oof_stack[test_idx] = stack.predict(X_test)

    for d in DATES:
        m_tr = date_train == d
        m_te = date_test == d
        if m_tr.sum() == 0 or m_te.sum() == 0:
            continue
        dist = cdist(coords_test[m_te], coords_train[m_tr])
        dist[dist == 0] = 1e-6
        w = 1.0 / dist**2
        w /= w.sum(axis=1, keepdims=True)
        oof_idw[test_idx[m_te]] = w @ y_train[m_tr]

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
lims = [y.min() - 1, y.max() + 1]
for ax, pred, title, r2 in [
    (axes[0], oof_idw, "(A) IDW baseline\n(out-of-fold)", pooled["IDW"]["R2_mean"]),
    (axes[1], oof_rf, "(B) Random Forest\n(out-of-fold)", pooled["RandomForest"]["R2_mean"]),
    (axes[2], oof_stack, "(C) Stacking Ensemble\n(out-of-fold)", pooled["StackingEnsemble"]["R2_mean"]),
]:
    ax.scatter(y, pred, s=18, alpha=0.55, color="#2e86ab", edgecolor="none")
    ax.plot(lims, lims, "k--", linewidth=1, label="1:1 line")
    ax.set_xlim(lims); ax.set_ylim(lims)
    ax.set_xlabel("Observed Brix (\u00baBx)")
    ax.set_ylabel("Predicted Brix (\u00baBx)")
    ax.set_title(f"{title}\nmean R\u00b2 = {r2:.2f}")
    ax.legend(fontsize=8, loc="upper left")
    ax.grid(alpha=0.25)

plt.tight_layout()
plt.savefig(FIGURES / "ml_grid3_observed_vs_predicted.jpg", dpi=200, bbox_inches="tight")
plt.close()
print("Saved ml_grid3_observed_vs_predicted.jpg")
