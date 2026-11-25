# MoCha Deployment Guide: ComfyUI WanVideoWrapper & Cloud GPU CLI

MoCha builds on **Wan2.1-T2V-14B** and runs strictly on **NVIDIA CUDA GPUs**. Choose Path A for consumer/prosumer NVIDIA GPUs (16-24 GB VRAM via FP8/GGUF offload) or Path B for official unquantized `bfloat16` CLI execution on Cloud GPUs (40-80 GB VRAM, e.g. A100/H100/L40S).

---

## Path A: ComfyUI + `ComfyUI-WanVideoWrapper` (Recommended for 16-24 GB VRAM)

Maintained by `@kijai` (`https://github.com/kijai/ComfyUI-WanVideoWrapper`):

1. **Install Custom Node**:
   ```bash
   cd ComfyUI/custom_nodes
   git clone https://github.com/kijai/ComfyUI-WanVideoWrapper.git
   pip install -r ComfyUI-WanVideoWrapper/requirements.txt
   ```
2. **Download Models** (Hugging Face):
   - Base Wan2.1 14B (FP8 or GGUF quantized variant for lower VRAM) + `Wan2.1_VAE` + `umt5-xxl` encoder.
   - MoCha checkpoint (`Orange-3DV-Team/MoCha` or Kijai-repackaged MoCha safetensors for `WanVideoWrapper`).
3. **Wire Inputs**:
   - Load `source_video` (`832x480`, `1 + 4k` frames such as `81`).
   - Load `source_mask` (single binary mask aligned to frame 0; white = character to replace).
   - Load `reference_1` (clean background full/half-body) and `reference_2` (front-facing facial close-up).
   - Enable block-swap / model CPU offload if running on 16-24 GB VRAM.

---

## Path B: Official `inference_mocha.py` on Cloud GPU (RunPod / Modal / Vast.ai)

Recommended hardware: Linux + CUDA 12.x + NVIDIA A100 40GB/80GB or H100 80GB + Python 3.10 + ~100 GB free disk space.

### 1. Environment & Clone
```bash
git clone https://github.com/Orange-3DV-Team/MoCha.git
cd MoCha
conda create -n MoCha python=3.10 -y
conda activate MoCha
pip install -r requirements.txt
pip install huggingface_hub
```

### 2. Download Pretrained Checkpoints
```bash
# Base Wan2.1-T2V-14B (~28-55 GB depending on files fetched)
huggingface-cli download Wan-AI/Wan2.1-T2V-14B --local-dir ./models/Wan2.1-T2V-14B

# MoCha checkpoint into ./checkpoints/
huggingface-cli download Orange-3DV-Team/MoCha --local-dir ./checkpoints
```

### 3. Fix Hardcoded Placeholder Paths in `inference_mocha.py` (Critical!)
Upstream `inference_mocha.py` lines 181-185 ship with literal placeholder strings `"/path/to/..."`:
```python
model_manager.load_models([
    [
        "./models/Wan2.1-T2V-14B/diffusion_pytorch_model-00001-of-00006.safetensors",
        "./models/Wan2.1-T2V-14B/diffusion_pytorch_model-00002-of-00006.safetensors",
        "./models/Wan2.1-T2V-14B/diffusion_pytorch_model-00003-of-00006.safetensors",
        "./models/Wan2.1-T2V-14B/diffusion_pytorch_model-00004-of-00006.safetensors",
        "./models/Wan2.1-T2V-14B/diffusion_pytorch_model-00005-of-00006.safetensors",
        "./models/Wan2.1-T2V-14B/diffusion_pytorch_model-00006-of-00006.safetensors",
    ],
    "./models/Wan2.1-T2V-14B/models_t5_umt5-xxl-enc-bf16.pth",
    "./models/Wan2.1-T2V-14B/Wan2.1_VAE.pth",
])
```
Also verify `--ckpt_path` matches the exact downloaded `.ckpt` / `.safetensors` filename inside `./checkpoints/` (default flag expects `./checkpoints/step18500.ckpt`).

### 4. Run Character Replacement
```bash
python inference_mocha.py \
  --data_path ./work/test_data.csv \
  --ckpt_path ./checkpoints/step18500.ckpt \
  --output_dir ./results \
  --cfg_scale 5.0 \
  --dataloader_num_workers 1
```

### Common Gotchas
- **`cupy-cuda12x` install error**: Ensure CUDA 12 toolkit runtime matches the container image (`nvidia/cuda:12.1.1-devel-ubuntu22.04` or newer).
- **Silent output MP4**: `save_video()` writes video stream only (`fps=30`, `quality=5`); re-attach original audio using FFmpeg after verifying visual quality.
- **Long clips (> 161 frames / ~5.3s at 30fps)**: Split the source video into <= 161-frame segments, extract frame 0 mask per segment, run MoCha per segment, and stitch with `ffmpeg` or `herk-edit-kit`.
