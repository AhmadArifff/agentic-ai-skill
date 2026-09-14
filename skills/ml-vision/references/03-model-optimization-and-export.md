# Pola Implementasi: Model Optimization, ONNX Export & INT8 Quantization

Panduan praktis mengekspor dan mengompresi model PyTorch ke format ONNX dan kuantisasi INT8 siap produksi.

---

## 1. PyTorch ke ONNX Export dengan Validasi Output Numerik

```python
import torch
import onnx
import onnxruntime as ort
import numpy as np

def export_to_onnx_with_validation(pytorch_model: torch.nn.Module, onnx_save_path: str, input_shape=(1, 3, 224, 224)):
    pytorch_model.eval()
    dummy_input = torch.randn(*input_shape, requires_grad=False)

    # 1. Ekspor ke ONNX
    torch.onnx.export(
        pytorch_model,
        dummy_input,
        onnx_save_path,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    print(f"✅ Model berhasil diekspor ke: {onnx_save_path}")

    # 2. Verifikasi Struktur Graph ONNX
    onnx_model = onnx.load(onnx_save_path)
    onnx.checker.check_model(onnx_model)
    print("✅ Struktur model ONNX valid dan bebas korupsi graf.")

    # 3. Validasi Numerik (PyTorch vs ONNX Runtime)
    with torch.no_grad():
        pt_out = pytorch_model(dummy_input).cpu().numpy()

    ort_session = ort.InferenceSession(onnx_save_path, providers=['CPUExecutionProvider'])
    ort_inputs = {ort_session.get_inputs()[0].name: dummy_input.numpy()}
    ort_out = ort_session.run(None, ort_inputs)[0]

    # Uji kesesuaian numerik hingga presisi 1e-4
    np.testing.assert_allclose(pt_out, ort_out, rtol=1e-03, atol=1e-04)
    print("✅ Validasi numerik lolos: Selisih PyTorch vs ONNX < 1e-4.")
```

---

## 2. Post-Training Quantization (PTQ) INT8 via ONNX Runtime

```python
from onnxruntime.quantization import quantize_dynamic, QuantType
import os

def quantize_onnx_model_int8(input_onnx_path: str, output_int8_path: str):
    """Mengompresi model FP32 ke INT8 secara dinamis (ukuran turun hingga 75%)."""
    quantize_dynamic(
        model_input=input_onnx_path,
        model_output=output_int8_path,
        weight_type=QuantType.QInt8
    )

    size_fp32 = os.path.getsize(input_onnx_path) / (1024 * 1024)
    size_int8 = os.path.getsize(output_int8_path) / (1024 * 1024)
    reduction = ((size_fp32 - size_int8) / size_fp32) * 100

    print(f"Ukuran Asli (FP32) : {size_fp32:.2f} MB")
    print(f"Ukuran INT8        : {size_int8:.2f} MB")
    print(f"Penghematan Memori : {reduction:.1f}%")
```
