# Pola Implementasi: Deep Learning & Computer Vision (PyTorch & YOLO)

Panduan praktis kode produksi untuk klasifikasi citra, deteksi objek (YOLO), dan augmentasi.

---

## 1. PyTorch Image Classification Pipeline (Transfer Learning & AMP)

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import models, transforms
from torch.cuda.amp import autocast, GradScaler
import time

def build_vision_classifier(num_classes: int, pretrained: bool = True):
    """Membangun backbone EfficientNet-B0 / MobileNetV4 modern."""
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT if pretrained else None)
    
    # Ganti classifier head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features, num_classes)
    )
    return model

def train_epoch_amp(model, dataloader, criterion, optimizer, scaler, device):
    """Training 1 epoch dengan Automatic Mixed Precision (AMP) untuk performa 2x lebih cepat."""
    model.train()
    total_loss, correct, total = 0.0, 0, 0

    for images, targets in dataloader:
        images, targets = images.to(device), targets.to(device)
        optimizer.zero_grad(set_to_none=True)

        with autocast(dtype=torch.float16):
            outputs = model(images)
            loss = criterion(outputs, targets)

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item() * images.size(0)
        _, preds = outputs.max(1)
        correct += preds.eq(targets).sum().item()
        total += targets.size(0)

    return total_loss / total, correct / total
```

---

## 2. Deteksi Objek Real-Time Menggunakan YOLOv8 / YOLOv11

```python
from ultralytics import YOLO
import cv2
import numpy as np

class RealTimeObjectDetector:
    def __init__(self, model_weight_path: str = 'yolov8n.pt', conf_thresh: float = 0.45):
        # Gunakan nano/small model untuk throughput tinggi di web & mobile
        self.model = YOLO(model_weight_path)
        self.conf_thresh = conf_thresh

    def detect_frame(self, frame_bgr: np.ndarray):
        """Mendeteksi bounding boxes, kelas, dan confidence pada satu frame citra."""
        results = self.model.predict(
            source=frame_bgr,
            conf=self.conf_thresh,
            iou=0.5,
            verbose=False
        )[0]

        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            conf = float(box.conf[0].cpu().numpy())
            cls_id = int(box.cls[0].cpu().numpy())
            cls_name = self.model.names[cls_id]

            detections.append({
                "label": cls_name,
                "confidence": round(conf, 4),
                "bbox": [int(x1), int(y1), int(x2), int(y2)]
            })

        return detections
```
