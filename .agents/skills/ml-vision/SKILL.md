---
name: ml-vision
description: "Comprehensive Machine Learning, Deep Learning, and Computer Vision engineering skill. Enables agents to perform clustering (K-Means, DBSCAN), classification (XGBoost, LightGBM, Random Forest), deep neural network training (PyTorch, CNN, ViT, YOLO object detection, segmentation), model optimization (ONNX export, INT8/FP16 quantization, latency benchmarking), and production integration into Web Apps (FastAPI async microservices, ONNX Runtime WebGPU in-browser) and Mobile Apps (TFLite, CoreML)."
---

# Machine Learning, Deep Learning & Computer Vision Engineering Skill

Keahlian tingkat industri untuk merancang, melatih, mengevaluasi, mengoptimasi, dan mengintegrasikan model Machine Learning, Deep Learning, dan Computer Vision ke dalam aplikasi Web dan Mobile.

---

## 1. Pohon Keputusan Pemilihan Arsitektur (Architecture Decision Tree)

Gunakan panduan berikut sebelum memulai implementasi:

```
Tipe Masalah yang Dihadapi:
│
├── 1. Data Tabular / Numerik / Teks Terstruktur
│   ├── Tanpa Label (Unsupervised) ──► Clustering
│   │   ├── Jumlah klaster diketahui/berbentuk bola ──► K-Means (Evaluasi via Silhouette Score & Elbow)
│   │   ├── Bentuk klaster arbitrer / deteksi noise ──► DBSCAN / HDBSCAN
│   │   └── Struktur hierarkis ──► Agglomerative Hierarchical Clustering
│   │
│   └── Memiliki Label (Supervised Classification)
│       ├── Dataset sedang (< 100k baris) & perlu interpretabilitas ──► Random Forest / Logistic Regression
│       └── Dataset besar, performa kompetisi, fitur heterogen ──► LightGBM / XGBoost / CatBoost
│
├── 2. Data Citra & Video (Computer Vision)
│   ├── Klasifikasi Gambar Tunggal ──► ConvNeXt / EfficientNet / MobileNetV4 / Vision Transformer (ViT)
│   ├── Deteksi Objek Real-Time (Bounding Boxes) ──► YOLOv8 / YOLOv11 / RT-DETR
│   ├── Segmentasi Citra (Piksel ke Piksel) ──► U-Net / DeepLabV3+ (Semantik) atau YOLO-seg (Instans)
│   └── Ekstraksi Fitur & Pencarian Kemiripan ──► Pretrained ResNet/CLIP + Cosine Similarity Vector Index
│
└── 3. Target Lingkungan Deployment (Deployment Target)
    ├── Backend Web Server (Analisis Berat / Batch) ──► FastAPI (Async, Uvicorn, Dynamic Batching)
    ├── Frontend Web Browser (Real-Time / Privasi Tinggi) ──► ONNX Runtime Web (WebGPU / WASM)
    └── Mobile Edge (Android / iOS) ──► TFLite (GPU Delegate) & Apple CoreML (Apple Neural Engine)
```

---

## 2. Standar Kualitas & Guardrails (Production Quality Guardrails)

1. **Pencegahan Kebocoran Data (Zero Data Leakage)**:
   - DILARANG melakukan `fit()` scaler (StandardScaler/MinMaxScaler) atau encoder pada seluruh dataset sebelum train-test split.
   - Gunakan `Pipeline` dari Scikit-learn untuk mengisolasi preprocessing dalam cross-validation folds.
2. **Evaluasi Multidimensi**:
   - DILARANG hanya menggunakan metrik `Accuracy` pada data tidak seimbang (*imbalanced*). Wajib menyertakan **Precision, Recall, F1-Score (macro & weighted), Confusion Matrix,** dan **ROC-AUC**.
   - Untuk Deteksi Objek: laporkan **mAP@50** dan **mAP@50:95**.
   - Untuk Klasterisasi: laporkan **Silhouette Score** (target > 0.5) dan **Davies-Bouldin Index**.
3. **Standarisasi Optimasi Model**:
   - Model PyTorch wajib diekspor ke **ONNX** dan divalidasi presisinya menggunakan `np.testing.assert_allclose()`.
   - Lakukan kuantisasi INT8 (Post-Training Quantization) untuk model edge guna memangkas ukuran memori tanpa mengorbankan akurasi.

---

## 3. Pustaka Referensi Teknis (Technical References)

Pelajari dan terapkan pola implementasi mendalam pada sub-panduan berikut:

1. [`01-clustering-and-classification.md`](./references/01-clustering-and-classification.md):
   - Pola Tabular ML: K-Means, DBSCAN, XGBoost, LightGBM, handling imbalance (SMOTE/class-weight), dan cross-validation pipeline.
2. [`02-deep-learning-and-computer-vision.md`](./references/02-deep-learning-and-computer-vision.md):
   - Arsitektur PyTorch, transfer learning, fine-tuning YOLOv8/v11, augmentasi citra Albumentations, dan evaluasi mAP.
3. [`03-model-optimization-and-export.md`](./references/03-model-optimization-and-export.md):
   - Pipeline ekspor PyTorch ke ONNX, verifikasi tensor, kuantisasi INT8 PTQ, dan benchmarking latensi P95 / memory footprint.
4. [`04-web-and-mobile-integration.md`](./references/04-web-and-mobile-integration.md):
   - Backend: FastAPI async microservice dengan batching & streaming.
   - Web Client: In-browser inference dengan `onnxruntime-web` (WebGPU) dan Canvas overlay real-time.
   - Mobile: Konversi TFLite (Android) dan CoreML (iOS) serta pipeline frame kamera.
