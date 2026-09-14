# Pola Implementasi: Clustering & Classification (Scikit-Learn, LightGBM, XGBoost)

Panduan praktis kode produksi untuk tugas Klasterisasi dan Klasifikasi data tabular.

---

## 1. Pipeline Klasifikasi Produksi dengan Pencegahan Data Leakage

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import lightgbm as lgb

def train_production_classifier(df: pd.DataFrame, target_col: str, num_cols: list, cat_cols: list):
    X = df.drop(columns=[target_col])
    y = df[target_col]

    # 1. Preprocessor terisolasi
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ('num', num_transformer, num_cols),
        ('cat', cat_transformer, cat_cols)
    ])

    # 2. Penanganan Class Imbalance via scale_pos_weight
    pos_count = (y == 1).sum()
    neg_count = (y == 0).sum()
    scale_weight = neg_count / max(1, pos_count)

    # 3. Model Pipeline
    clf = lgb.LGBMClassifier(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=6,
        scale_pos_weight=scale_weight,
        random_state=42,
        verbose=-1
    )

    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', clf)
    ])

    # 4. Evaluasi Stratified Cross-Validation 5-Fold
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_validate(
        model_pipeline, X, y, cv=cv,
        scoring=['precision', 'recall', 'f1', 'roc_auc'],
        return_train_score=False
    )

    print("=== 5-Fold Cross Validation Results ===")
    print(f"Precision: {scores['test_precision'].mean():.4f} +/- {scores['test_precision'].std():.4f}")
    print(f"Recall   : {scores['test_recall'].mean():.4f} +/- {scores['test_recall'].std():.4f}")
    print(f"F1-Score : {scores['test_f1'].mean():.4f} +/- {scores['test_f1'].std():.4f}")
    print(f"ROC-AUC  : {scores['test_roc_auc'].mean():.4f} +/- {scores['test_roc_auc'].std():.4f}")

    # Fit final model
    model_pipeline.fit(X, y)
    return model_pipeline
```

---

## 2. Klasterisasi: K-Means & DBSCAN dengan Evaluasi Silhouette

```python
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score, davies_bouldin_score
import numpy as np

def find_optimal_kmeans(X_scaled: np.ndarray, max_k: int = 10):
    """Mencari K terbaik menggunakan Silhouette Score dan Elbow Inertia."""
    best_k = 2
    best_score = -1
    models = {}

    for k in range(2, max_k + 1):
        kmeans = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
        labels = kmeans.fit_predict(X_scaled)
        score = silhouette_score(X_scaled, labels)
        db_score = davies_bouldin_score(X_scaled, labels)
        
        print(f"k={k} | Silhouette: {score:.4f} | Davies-Bouldin: {db_score:.4f} | Inertia: {kmeans.inertia_:.1f}")
        models[k] = (kmeans, score)

        if score > best_score:
            best_score = score
            best_k = k

    print(f"\n[Recommendation] Optimal K = {best_k} (Silhouette: {best_score:.4f})")
    return models[best_k][0]

def run_dbscan_clustering(X_scaled: np.ndarray, eps: float = 0.5, min_samples: int = 5):
    """Klasterisasi bentuk arbitrer dan deteksi noise outliers."""
    dbscan = DBSCAN(eps=eps, min_samples=min_samples)
    labels = dbscan.fit_predict(X_scaled)

    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    n_noise = list(labels).count(-1)

    print(f"DBSCAN: Ditemukan {n_clusters} klaster dan {n_noise} titik noise.")
    if n_clusters > 1:
        valid_mask = labels != -1
        score = silhouette_score(X_scaled[valid_mask], labels[valid_mask])
        print(f"Silhouette Score (tanpa noise): {score:.4f}")

    return dbscan, labels
```
