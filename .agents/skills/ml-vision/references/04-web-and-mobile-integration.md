# Pola Implementasi: Integrasi Web Apps & Mobile Apps (FastAPI, ONNX WebGPU, TFLite & CoreML)

Panduan praktis menghubungkan model Machine Learning dan Computer Vision ke aplikasi web modern dan aplikasi mobile native.

---

## 1. Web Backend: FastAPI Async Vision Inference Service

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import onnxruntime as ort
import numpy as np
import cv2
import io

app = FastAPI(title="Vision Inference API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi ONNX Runtime Session saat startup
session = ort.InferenceSession("models/model_quantized.onnx", providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
input_name = session.get_inputs()[0].name

def preprocess_image(image_bytes: bytes, target_size=(224, 224)) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Gambar tidak valid atau korup")
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(img_rgb, target_size)
    normalized = (resized.astype(np.float32) / 255.0 - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    tensor = np.transpose(normalized, (2, 0, 1))  # HWC to CHW
    return np.expand_dims(tensor, axis=0).astype(np.float32)

@app.post("/api/v1/predict")
async def predict_vision(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File wajib berupa format gambar")

    contents = await file.read()
    try:
        input_tensor = preprocess_image(contents)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    outputs = session.run(None, {input_name: input_tensor})[0]
    probabilities = np.exp(outputs) / np.sum(np.exp(outputs), axis=1, keepdims=True)
    class_id = int(np.argmax(probabilities[0]))
    confidence = float(probabilities[0][class_id])

    return {
        "status": "success",
        "predicted_class_id": class_id,
        "confidence": round(confidence, 4)
    }
```

---

## 2. Web Client: In-Browser WebGPU Inference (`onnxruntime-web`)

```typescript
import * as ort from 'onnxruntime-web/webgpu';

export class InBrowserVisionRunner {
  private session: ort.InferenceSession | null = null;

  async initialize(modelUrl: string): Promise<void> {
    // Aktifkan WebGPU untuk akselerasi grafis GPU klien
    this.session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ['webgpu', 'wasm']
    });
    console.log('✅ ONNX Runtime WebGPU initialized on client browser.');
  }

  preprocessCanvas(canvas: HTMLCanvasElement): ort.Tensor {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas 2d context');

    const imgData = ctx.getImageData(0, 0, 224, 224);
    const { data } = imgData;
    const float32Data = new Float32Array(3 * 224 * 224);

    // CHW tensor conversion & ImageNet normalization
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    for (let i = 0; i < 224 * 224; i++) {
      for (let c = 0; c < 3; c++) {
        const val = data[i * 4 + c] / 255.0;
        float32Data[c * 224 * 224 + i] = (val - mean[c]) / std[c];
      }
    }
    return new ort.Tensor('float32', float32Data, [1, 3, 224, 224]);
  }

  async runInference(canvas: HTMLCanvasElement): Promise<{ classId: number; score: number }> {
    if (!this.session) throw new Error('Model not initialized');
    const inputTensor = this.preprocessCanvas(canvas);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[this.session.inputNames[0]] = inputTensor;

    const results = await this.session.run(feeds);
    const outputData = results[this.session.outputNames[0]].data as Float32Array;

    let maxIdx = 0;
    let maxVal = -Infinity;
    for (let i = 0; i < outputData.length; i++) {
      if (outputData[i] > maxVal) {
        maxVal = outputData[i];
        maxIdx = i;
      }
    }
    return { classId: maxIdx, score: maxVal };
  }
}
```

---

## 3. Mobile Deployment: TFLite & CoreML Conversion

```python
import torch

# 1. Konversi ke Apple CoreML (iOS / iPadOS)
import coremltools as ct

def export_to_coreml(pytorch_model: torch.nn.Module, save_path: str = "VisionModel.mlpackage"):
    pytorch_model.eval()
    example_input = torch.rand(1, 3, 224, 224)
    traced_model = torch.jit.trace(pytorch_model, example_input)

    mlmodel = ct.convert(
        traced_model,
        inputs=[ct.ImageType(name="input", shape=(1, 3, 224, 224), scale=1/255.0, bias=[-0.485/0.229, -0.456/0.224, -0.406/0.225])]
    )
    mlmodel.save(save_path)
    print(f"✅ CoreML model tersimpan di: {save_path} (Kompatibel Apple Neural Engine)")

# 2. Konversi ke TensorFlow Lite (Android)
# Menggunakan onnx2tf atau tflite converter
# Menghasilkan file .tflite dengan NNAPI dan GPU Delegate
```
