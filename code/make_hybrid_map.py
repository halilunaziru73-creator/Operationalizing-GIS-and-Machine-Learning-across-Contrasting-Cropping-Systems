"""Generate a spatial map comparing IDW, RF trend, and RF+Kriging hybrid surfaces
for the final (30 August) Brix sampling date -- the practically most relevant date
for harvest-zone decision-making."""
import numpy as np
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.spatial.distance import cdist
from sklearn.ensemble import RandomForestRegressor

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from train_regression_kriging import load_data, fit_exponential_variogram

ROOT = Path(__file__).resolve().parent.parent
FIGURES = ROOT / "figures"

merged, long_df = load_data()
df = long_df[long_df["date"] == "Aug_30"].reset_index(drop=True)

x, y = df["x"].values, df["y"].values
ndvi = df["ndvi"].values
brix = df["brix"].values
coords = np.column_stack([x, y])

# Build prediction grid
grid_n = 120
xi = np.linspace(x.min() - 20, x.max() + 20, grid_n)
yi = np.linspace(y.min() - 20, y.max() + 20, grid_n)
XI, YI = np.meshgrid(xi, yi)
grid_coords = np.column_stack([XI.ravel(), YI.ravel()])

# NDVI at grid points via IDW of observed NDVI (a simple, defensible proxy since we
# only have point NDVI here, not a continuous NDVI raster in this data package)
dist_grid_obs = cdist(grid_coords, coords)
dist_grid_obs[dist_grid_obs == 0] = 1e-6
w_ndvi = 1.0 / dist_grid_obs**2
w_ndvi /= w_ndvi.sum(axis=1, keepdims=True)
ndvi_grid = (w_ndvi @ ndvi).reshape(XI.shape)

# (A) IDW surface of Brix
w_brix = 1.0 / dist_grid_obs**2
w_brix /= w_brix.sum(axis=1, keepdims=True)
idw_grid = (w_brix @ brix).reshape(XI.shape)

# (B) RF trend surface (predictors: x, y, ndvi_grid)
rf = RandomForestRegressor(n_estimators=400, max_depth=8, min_samples_leaf=2, random_state=0)
X_train = np.column_stack([x, y, ndvi])
rf.fit(X_train, brix)
X_grid = np.column_stack([grid_coords[:, 0], grid_coords[:, 1], ndvi_grid.ravel()])
rf_grid = rf.predict(X_grid).reshape(XI.shape)

# (C) Hybrid regression-kriging: RF trend + kriged residuals
resid = brix - rf.predict(X_train)
popt, _ = fit_exponential_variogram(coords, resid, n_lags=8)
nugget, sill, rng = popt

def gamma(h):
    return nugget + sill * (1 - np.exp(-h / max(rng, 1e-6)))

n_obs = len(coords)
K = gamma(cdist(coords, coords))
K = np.vstack([K, np.ones(n_obs)])
K = np.hstack([K, np.ones((n_obs + 1, 1))])
K[-1, -1] = 0
K_inv = np.linalg.pinv(K)

k0_all = gamma(cdist(grid_coords, coords))
k0_all = np.hstack([k0_all, np.ones((grid_coords.shape[0], 1))])
weights_all = k0_all @ K_inv
resid_grid = (weights_all[:, :-1] @ resid).reshape(XI.shape)
rk_grid = rf_grid + resid_grid

# ---------------- Plot ----------------
fig, axes = plt.subplots(1, 4, figsize=(17, 4.3))
panels = [
    (idw_grid, "(A) IDW baseline surface\n(30 August Brix, \u00baBx)"),
    (rf_grid, "(B) Random Forest trend\nsurface (\u00baBx)"),
    (rk_grid, "(C) Hybrid RF + kriged-\nresidual surface (\u00baBx)"),
    (ndvi_grid, "(D) Interpolated NDVI\ncovariate surface"),
]
vmin_brix = min(idw_grid.min(), rf_grid.min(), rk_grid.min())
vmax_brix = max(idw_grid.max(), rf_grid.max(), rk_grid.max())

for i, (grid, title) in enumerate(panels):
    ax = axes[i]
    if i < 3:
        im = ax.contourf(XI, YI, grid, levels=20, cmap="RdYlGn", vmin=vmin_brix, vmax=vmax_brix)
    else:
        im = ax.contourf(XI, YI, grid, levels=20, cmap="YlGn")
    ax.scatter(x, y, s=10, c="black", marker=".", alpha=0.6)
    ax.set_title(title, fontsize=10.5)
    ax.set_xlabel("Easting (m)", fontsize=8.5)
    if i == 0:
        ax.set_ylabel("Northing (m)", fontsize=8.5)
    ax.tick_params(labelsize=7)
    plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

plt.tight_layout()
plt.savefig(FIGURES / "ml_grid4_hybrid_surface_map.jpg", dpi=200, bbox_inches="tight")
plt.close()
print("Saved ml_grid4_hybrid_surface_map.jpg")
