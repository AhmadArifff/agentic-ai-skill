# Panduan Bootstrap Mandiri: ML-Vision Skill (Machine Learning, Deep Learning & Computer Vision)

Dokumen ini adalah instruksi operasional bagi agen AI dan developer untuk menginisialisasi lingkungan Machine Learning, Deep Learning, dan Computer Vision secara otomatis di perangkat baru.

---

## 1. Menjalankan Bootstrap Mandiri

Cukup jalankan script mandiri dari root repositori:

```bash
node skills/ml-vision/bootstrap.js
```

Script ini akan:
1. Memverifikasi runtime Node.js (>= 18.0.0).
2. Memeriksa ketersediaan Python / UV environment.
3. Memvalidasi 4 panduan referensi arsitektur kode produksi.
4. Memastikan metadata skill siap dipanggil oleh agen multi-role.

---

## 2. Pustaka & Framework yang Didukung

### A. Lingkungan Python (Model Training & Backend Inference)
- **Classical ML**: `scikit-learn`, `lightgbm`, `xgboost`, `pandas`, `numpy`
- **Deep Learning & Vision**: `torch`, `torchvision`, `ultralytics` (YOLO), `timm`, `opencv-python`, `albumentations`
- **Model Optimization**: `onnx`, `onnxruntime`, `onnxruntime-gpu`
- **Web Backend Service**: `fastapi`, `uvicorn`, `python-multipart`, `pydantic`

### B. Lingkungan JavaScript / TypeScript (Client-Side In-Browser Inference)
- **ONNX Web**: `npm install onnxruntime-web` (Mendukung backend WebGPU dan WASM multithreaded)
- **TensorFlow.js**: `@tensorflow/tfjs`

### C. Mobile Native Deployment
- **Android**: TensorFlow Lite (`org.tensorflow:tensorflow-lite`), TFLite GPU Delegate
- **iOS**: Apple CoreML framework (`CoreML`, `Vision`), model berformat `.mlpackage`

---

## 3. Ekosistem Integrasi Peran

Peran `ml-vision-engineer` bekerja selaras dengan:
- `backend-engineer`: Merancang API contract gRPC / REST untuk serving model.
- `frontend-engineer`: Menghubungkan video stream kamera HTML5 ke canvas dan bounding box render.
- `data-cross-verifier`: Memeriksa dataset dari kebocoran data (data leakage) dan bias sampling.
- `qa-engineer`: Melakukan automated stress testing pada model endpoint.
- `tech-critic`: Memastikan model tidak overengineered dan trade-off latency vs accuracy terukur.
