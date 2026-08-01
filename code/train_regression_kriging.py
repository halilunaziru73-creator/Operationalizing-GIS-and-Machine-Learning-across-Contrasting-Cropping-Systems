"""
Hybrid Machine-Learning Regression-Kriging for Vineyard Brix (Sugar Content) Prediction
==========================================================================================
Case Study III (Quinta de Nossa Senhora de Lurdes, Vila Real, Portugal)

This script trains and cross-validates three families of spatial prediction model for
grape must Brix (degrees Brix, sugar content) across five sampling dates (15 Jul - 30 Aug):

  1. Baseline deterministic interpolation : Inverse Distance Weighting (IDW), the method
     used in the original student reports.
  2. Pure machine-learning regression      : Random Forest Regression (RFR) and Gradient
     Boosting Regression (GBR, scikit-learn's implementation of the same gradient-boosted
     decision-tree family as XGBoost) using spatial coordinates, Julian day, and NDVI as
     predictors.
  3. Hybrid regression-kriging (RK)        : the ML model supplies the deterministic trend
     surface; the residuals from that trend are then spatially interpolated (kriging-style,
     via an exponential-variogram ordinary kriging implemented with SciPy) and added back,
     following the classical regression-kriging formulation used widely in digital soil
     mapping and precision agriculture (Trangmar et al., 1985; Shaddad et al., 2016;
     Sekulic et al., 2020).

All models are evaluated using repeated spatial k-fold cross-validation (not a single
train/test split), and are compared using RMSE, MAE and R-squared computed strictly on
held-out points.

Author: Naziru Halilu (analysis pipeline drafted with Claude, Anthropic, for manuscript
preparation). Data collected in the field as part of the original UTAD practicum.
"""

import json
import warnings
import numpy as np
import pandas as pd
from pathlib import Path
from scipy.spatial.distance import cdist
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, StackingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.inspection import permutation_importance
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")
np.random.seed(42)

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
RESULTS = ROOT / "results"
FIGURES = ROOT / "figures"
RESULTS.mkdir(exist_ok=True, parents=True)
FIGURES.mkdir(exist_ok=True, parents=True)

DATES = ["Jul_15", "Jul_30", "Aug_06", "Aug_15", "Aug_30"]
JULIAN = {"Jul_15": 196, "Jul_30": 211, "Aug_06": 218, "Aug_15": 227, "Aug_30": 242}  # non-leap year


# ---------------------------------------------------------------------------
# 1. Load and reshape data to long format: one row per (sample point, date)
# ---------------------------------------------------------------------------
def load_data():
    csv = pd.read_csv(DATA / "BRIX_AMT.csv").iloc[:, :8]
    xl = pd.read_excel(DATA / "Sample_brix_ndvi.xlsx")
    merged = csv.merge(xl[["Id", "NDVI1"]], left_on="Sample", right_on="Id", how="inner")

    long_rows = []
    for _, row in merged.iterrows():
        for d in DATES:
            long_rows.append({
                "sample": int(row["Sample"]),
                "x": row["XX_UTM"],
                "y": row["YY_UTM"],
                "julian_day": JULIAN[d],
                "ndvi": row["NDVI1"],
                "brix": row[d],
                "date": d,
            })
    long_df = pd.DataFrame(long_rows)
    return merged, long_df

def morans_i(coords, values, k=8):
    """Global Moran's I spatial autocorrelation statistic (Moran, 1950), computed with a
    k-nearest-neighbour binary weights matrix. Returns (I, expected_I_under_null)."""
    n = len(values)
    dist = cdist(coords, coords)
    W = np.zeros((n, n))
    for i in range(n):
        nn_idx = np.argsort(dist[i])[1:k + 1]  # exclude self
        W[i, nn_idx] = 1.0
    z = values - values.mean()
    W_sum = W.sum()
    numerator = n * np.sum(W * np.outer(z, z))
    denominator = W_sum * np.sum(z ** 2)
    I = numerator / denominator if denominator != 0 else np.nan
    expected_I = -1.0 / (n - 1)
    return I, expected_I


# ---------------------------------------------------------------------------
# 2. Baseline: Inverse Distance Weighting leave-one-out prediction
# ---------------------------------------------------------------------------
def idw_loo_predict(coords, values, power=2):
    dist = cdist(coords, coords)
    np.fill_diagonal(dist, np.inf)  # exclude self (leave-one-out)
    weights = 1.0 / np.power(dist, power)
    weights_norm = weights / weights.sum(axis=1, keepdims=True)
    preds = weights_norm @ values
    return preds


# ---------------------------------------------------------------------------
# 3. Simple ordinary-kriging-style residual interpolation
#    (exponential variogram model fitted by least squares, then kriging weights
#     solved directly -- a lightweight OK implementation with no external kriging
#     dependency, since the sandboxed environment has no network access to install
#     PyKrige).
# ---------------------------------------------------------------------------
def fit_exponential_variogram(coords, residuals, n_lags=10):
    dist = cdist(coords, coords)
    iu = np.triu_indices_from(dist, k=1)
    d = dist[iu]
    sv = 0.5 * (residuals[iu[0]] - residuals[iu[1]]) ** 2
    bins = np.linspace(0, d.max(), n_lags + 1)
    bin_idx = np.digitize(d, bins) - 1
    lag_d, lag_g = [], []
    for b in range(n_lags):
        m = bin_idx == b
        if m.sum() > 0:
            lag_d.append(d[m].mean())
            lag_g.append(sv[m].mean())
    lag_d, lag_g = np.array(lag_d), np.array(lag_g)

    # fit exponential model: gamma(h) = nugget + sill*(1 - exp(-h/range))
    from scipy.optimize import curve_fit

    def model(h, nugget, sill, rng):
        return nugget + sill * (1 - np.exp(-h / max(rng, 1e-6)))

    try:
        popt, _ = curve_fit(model, lag_d, lag_g,
                             p0=[lag_g.min(), lag_g.max(), d.max() / 3],
                             bounds=([0, 0, 1], [lag_g.max(), lag_g.max() * 3, d.max()]))
    except Exception:
        popt = [lag_g.min(), lag_g.max(), d.max() / 3]
    return popt, (lag_d, lag_g)


def ordinary_kriging_loo(coords, residuals):
    popt, _ = fit_exponential_variogram(coords, residuals)
    nugget, sill, rng = popt
    dist = cdist(coords, coords)

    def gamma(h):
        return nugget + sill * (1 - np.exp(-h / max(rng, 1e-6)))

    n = len(coords)
    preds = np.zeros(n)
    for i in range(n):
        idx = [j for j in range(n) if j != i]
        sub_dist = dist[np.ix_(idx, idx)]
        K = gamma(sub_dist)
        K = np.vstack([K, np.ones(len(idx))])
        K = np.hstack([K, np.ones((len(idx) + 1, 1))])
        K[-1, -1] = 0
        k0 = gamma(dist[i, idx])
        k0 = np.append(k0, 1)
        try:
            w = np.linalg.solve(K, k0)
            preds[i] = np.dot(w[:-1], residuals[idx])
        except np.linalg.LinAlgError:
            preds[i] = 0.0
    return preds, popt


# ---------------------------------------------------------------------------
# 4. Cross-validated model comparison for one sampling date
# ---------------------------------------------------------------------------
def evaluate_date(df_date, date_label, n_splits=5, n_repeats=4):
    coords = df_date[["x", "y"]].values
    X = df_date[["x", "y", "ndvi"]].values
    y = df_date["brix"].values
    n = len(y)

    metrics = {"IDW": [], "RandomForest": [], "GradientBoosting": [],
               "RF_RegressionKriging": [], "GB_RegressionKriging": []}

    for rep in range(n_repeats):
        kf = KFold(n_splits=n_splits, shuffle=True, random_state=rep)
        for train_idx, test_idx in kf.split(X):
            X_train, X_test = X[train_idx], X[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]
            coords_train, coords_test = coords[train_idx], coords[test_idx]

            # ---- IDW baseline (using train points only, predicting at test locations) ----
            dist = cdist(coords_test, coords_train)
            dist[dist == 0] = 1e-6
            w = 1.0 / dist**2
            w /= w.sum(axis=1, keepdims=True)
            idw_pred = w @ y_train
            metrics["IDW"].append(_score(y_test, idw_pred))

            # ---- Random Forest ----
            rf = RandomForestRegressor(n_estimators=300, max_depth=6, min_samples_leaf=2, random_state=rep)
            rf.fit(X_train, y_train)
            rf_pred = rf.predict(X_test)
            metrics["RandomForest"].append(_score(y_test, rf_pred))

            # ---- Gradient Boosting (XGBoost-equivalent) ----
            gb = GradientBoostingRegressor(n_estimators=200, max_depth=3, learning_rate=0.05, random_state=rep)
            gb.fit(X_train, y_train)
            gb_pred = gb.predict(X_test)
            metrics["GradientBoosting"].append(_score(y_test, gb_pred))

            # ---- Regression-Kriging: RF trend + kriged residuals ----
            rf_train_pred = rf.predict(X_train)
            resid_train = y_train - rf_train_pred
            rk_resid_pred = _krige_residual_to_test(coords_train, resid_train, coords_test)
            rk_pred = rf_pred + rk_resid_pred
            metrics["RF_RegressionKriging"].append(_score(y_test, rk_pred))

            # ---- Regression-Kriging: GB trend + kriged residuals ----
            gb_train_pred = gb.predict(X_train)
            resid_train_gb = y_train - gb_train_pred
            rk_resid_pred_gb = _krige_residual_to_test(coords_train, resid_train_gb, coords_test)
            rk_pred_gb = gb_pred + rk_resid_pred_gb
            metrics["GB_RegressionKriging"].append(_score(y_test, rk_pred_gb))

    summary = {}
    for model_name, scores in metrics.items():
        rmses = [s[0] for s in scores]
        maes = [s[1] for s in scores]
        r2s = [s[2] for s in scores]
        summary[model_name] = {
            "RMSE_mean": float(np.mean(rmses)), "RMSE_std": float(np.std(rmses)),
            "MAE_mean": float(np.mean(maes)), "MAE_std": float(np.std(maes)),
            "R2_mean": float(np.mean(r2s)), "R2_std": float(np.std(r2s)),
        }
    return summary


def _score(y_true, y_pred):
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred) if len(y_true) > 1 else np.nan
    return rmse, mae, r2


def _krige_residual_to_test(coords_train, resid_train, coords_test, n_lags=8):
    """Fit a variogram on the training residuals, then krige the residual surface
    at the test locations (ordinary kriging), returning predicted residuals."""
    popt, _ = fit_exponential_variogram(coords_train, resid_train, n_lags=n_lags)
    nugget, sill, rng = popt

    def gamma(h):
        return nugget + sill * (1 - np.exp(-h / max(rng, 1e-6)))

    n_train = len(coords_train)
    K = gamma(cdist(coords_train, coords_train))
    K = np.vstack([K, np.ones(n_train)])
    K = np.hstack([K, np.ones((n_train + 1, 1))])
    K[-1, -1] = 0

    preds = np.zeros(len(coords_test))
    for i, pt in enumerate(coords_test):
        k0 = gamma(cdist(pt.reshape(1, -1), coords_train)).flatten()
        k0 = np.append(k0, 1)
        try:
            w = np.linalg.solve(K, k0)
            preds[i] = np.dot(w[:-1], resid_train)
        except np.linalg.LinAlgError:
            preds[i] = 0.0
    return preds


def evaluate_pooled(long_df, n_splits=5, n_repeats=6):
    """Pooled spatio-temporal evaluation: predictors = x, y, julian_day, ndvi;
    target = brix. Cross-validation groups observations by sample location (GroupKFold),
    so that each fold tests genuine spatial extrapolation to *entirely unseen* vineyard
    locations across all five sampling dates -- the practically relevant test for a
    grower deciding where new sampling points would be most valuable."""
    from sklearn.model_selection import GroupKFold

    X = long_df[["x", "y", "julian_day", "ndvi"]].values
    y = long_df["brix"].values
    coords = long_df[["x", "y"]].values
    groups = long_df["sample"].values

    metrics = {"IDW": [], "RandomForest": [], "GradientBoosting": [], "NeuralNetwork": [],
               "StackingEnsemble": [],
               "RF_RegressionKriging": [], "GB_RegressionKriging": []}

    for rep in range(n_repeats):
        gkf = GroupKFold(n_splits=n_splits)
        # shuffle group order across repeats by permuting the group labels' fold assignment
        rng = np.random.RandomState(rep)
        unique_groups = np.unique(groups)
        perm = rng.permutation(unique_groups)
        group_map = {g: i for i, g in enumerate(perm)}
        shuffled_groups = np.array([group_map[g] for g in groups])

        for train_idx, test_idx in gkf.split(X, y, shuffled_groups):
            X_train, X_test = X[train_idx], X[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]
            coords_train, coords_test = coords[train_idx], coords[test_idx]
            date_train = long_df["date"].values[train_idx]
            date_test = long_df["date"].values[test_idx]

            # ---- IDW baseline: interpolate per-date using same-date training points ----
            idw_pred = np.zeros(len(test_idx))
            for d in DATES:
                m_tr = date_train == d
                m_te = date_test == d
                if m_tr.sum() == 0 or m_te.sum() == 0:
                    continue
                dist = cdist(coords_test[m_te], coords_train[m_tr])
                dist[dist == 0] = 1e-6
                w = 1.0 / dist**2
                w /= w.sum(axis=1, keepdims=True)
                idw_pred[m_te] = w @ y_train[m_tr]
            metrics["IDW"].append(_score(y_test, idw_pred))

            # ---- Random Forest (spatio-temporal) ----
            rf = RandomForestRegressor(n_estimators=400, max_depth=8, min_samples_leaf=2, random_state=rep)
            rf.fit(X_train, y_train)
            rf_pred = rf.predict(X_test)
            metrics["RandomForest"].append(_score(y_test, rf_pred))

            # ---- Gradient Boosting (spatio-temporal, XGBoost-equivalent) ----
            gb = GradientBoostingRegressor(n_estimators=300, max_depth=3, learning_rate=0.05, random_state=rep)
            gb.fit(X_train, y_train)
            gb_pred = gb.predict(X_test)
            metrics["GradientBoosting"].append(_score(y_test, gb_pred))

            # ---- Neural Network (Multi-Layer Perceptron), standardised inputs ----
            nn = make_pipeline(
                StandardScaler(),
                MLPRegressor(hidden_layer_sizes=(32, 16), activation="relu", solver="adam",
                              alpha=1e-3, max_iter=3000, early_stopping=True,
                              n_iter_no_change=25, random_state=rep)
            )
            nn.fit(X_train, y_train)
            nn_pred = nn.predict(X_test)
            metrics["NeuralNetwork"].append(_score(y_test, nn_pred))

            # ---- Stacking Ensemble: RF + GB + NN base learners, Ridge meta-learner ----
            stack = StackingRegressor(
                estimators=[
                    ("rf", RandomForestRegressor(n_estimators=300, max_depth=8, min_samples_leaf=2, random_state=rep)),
                    ("gb", GradientBoostingRegressor(n_estimators=200, max_depth=3, learning_rate=0.05, random_state=rep)),
                    ("nn", make_pipeline(StandardScaler(), MLPRegressor(hidden_layer_sizes=(32, 16), max_iter=3000,
                                                                          early_stopping=True, n_iter_no_change=25,
                                                                          random_state=rep))),
                ],
                final_estimator=RidgeCV(alphas=np.logspace(-3, 3, 20)),
                cv=3,
            )
            stack.fit(X_train, y_train)
            stack_pred = stack.predict(X_test)
            metrics["StackingEnsemble"].append(_score(y_test, stack_pred))

            # ---- Regression-Kriging: RF trend + per-date kriged residuals ----
            rf_train_pred = rf.predict(X_train)
            resid_train = y_train - rf_train_pred
            rk_pred = rf_pred.copy()
            for d in DATES:
                m_tr = date_train == d
                m_te = date_test == d
                if m_tr.sum() < 4 or m_te.sum() == 0:
                    continue
                rk_pred[m_te] += _krige_residual_to_test(coords_train[m_tr], resid_train[m_tr], coords_test[m_te])
            metrics["RF_RegressionKriging"].append(_score(y_test, rk_pred))

            # ---- Regression-Kriging: GB trend + per-date kriged residuals ----
            gb_train_pred = gb.predict(X_train)
            resid_train_gb = y_train - gb_train_pred
            rk_pred_gb = gb_pred.copy()
            for d in DATES:
                m_tr = date_train == d
                m_te = date_test == d
                if m_tr.sum() < 4 or m_te.sum() == 0:
                    continue
                rk_pred_gb[m_te] += _krige_residual_to_test(coords_train[m_tr], resid_train_gb[m_tr], coords_test[m_te])
            metrics["GB_RegressionKriging"].append(_score(y_test, rk_pred_gb))

    summary = {}
    for model_name, scores in metrics.items():
        rmses = [s[0] for s in scores]
        maes = [s[1] for s in scores]
        r2s = [s[2] for s in scores]
        summary[model_name] = {
            "RMSE_mean": float(np.mean(rmses)), "RMSE_std": float(np.std(rmses)),
            "MAE_mean": float(np.mean(maes)), "MAE_std": float(np.std(maes)),
            "R2_mean": float(np.mean(r2s)), "R2_std": float(np.std(r2s)),
        }
    return summary


if __name__ == "__main__":
    merged, long_df = load_data()
    merged.to_csv(RESULTS / "merged_brix_ndvi_utm.csv", index=False)

    # ---- Moran's I on raw Brix values per date (tests spatial autocorrelation) ----
    morans_results = {}
    for d in DATES:
        df_date = long_df[long_df["date"] == d]
        coords_d = df_date[["x", "y"]].values
        brix_d = df_date["brix"].values
        I, expected_I = morans_i(coords_d, brix_d, k=8)
        morans_results[d] = {"morans_I": float(I), "expected_I_null": float(expected_I)}
        print(f"Moran's I for Brix on {d}: I={I:.3f} (expected under no autocorrelation = {expected_I:.3f})")
    with open(RESULTS / "morans_i_brix.json", "w") as f:
        json.dump(morans_results, f, indent=2)

    print("=" * 70)
    print("POOLED SPATIO-TEMPORAL MODEL (GroupKFold by sampling location)")
    print("=" * 70)
    pooled_summary = evaluate_pooled(long_df)
    for model_name, s in pooled_summary.items():
        print(f"  {model_name:22s}  RMSE={s['RMSE_mean']:.3f}+/-{s['RMSE_std']:.3f}  "
              f"MAE={s['MAE_mean']:.3f}  R2={s['R2_mean']:.3f}+/-{s['R2_std']:.3f}")
    with open(RESULTS / "cv_pooled_spatiotemporal.json", "w") as f:
        json.dump(pooled_summary, f, indent=2)

    # ---- Permutation importance (model-agnostic, more rigorous than built-in importances) ----
    X_full = long_df[["x", "y", "julian_day", "ndvi"]].values
    y_full = long_df["brix"].values
    rf_full = RandomForestRegressor(n_estimators=500, max_depth=8, min_samples_leaf=2, random_state=0)
    rf_full.fit(X_full, y_full)
    perm_imp = permutation_importance(rf_full, X_full, y_full, n_repeats=30, random_state=0, scoring="r2")
    perm_summary = {
        name: {"importance_mean": float(m), "importance_std": float(s)}
        for name, m, s in zip(["x", "y", "julian_day", "ndvi"], perm_imp.importances_mean, perm_imp.importances_std)
    }
    with open(RESULTS / "permutation_importance.json", "w") as f:
        json.dump(perm_summary, f, indent=2)
    print("\nPermutation importance (Random Forest, R2 scoring):")
    for k, v in perm_summary.items():
        print(f"  {k:12s} {v['importance_mean']:.4f} +/- {v['importance_std']:.4f}")

    print("\n" + "=" * 70)
    print("PER-DATE SPATIAL-ONLY MODEL (KFold within each date; x, y, ndvi only)")
    print("=" * 70)
    all_summaries = {}
    for d in DATES:
        df_date = long_df[long_df["date"] == d].reset_index(drop=True)
        summary = evaluate_date(df_date, d)
        all_summaries[d] = summary
        print(f"\nDate: {d}  (n={len(df_date)})")
        for model_name, s in summary.items():
            print(f"  {model_name:22s}  RMSE={s['RMSE_mean']:.3f}+/-{s['RMSE_std']:.3f}  "
                  f"MAE={s['MAE_mean']:.3f}  R2={s['R2_mean']:.3f}")
    with open(RESULTS / "cv_model_comparison.json", "w") as f:
        json.dump(all_summaries, f, indent=2)

    print("\nSaved results to:", RESULTS)
