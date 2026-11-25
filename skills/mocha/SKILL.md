---
name: mocha
description: End-to-end AI video character replacement without per-frame structural guidance (CVPR 2026, Orange-3DV-Team/MoCha, built on Wan2.1-T2V-14B). Replaces a character in any source video using only a single first-frame binary mask and 1-2 character reference images (full/half-body + front-facing face close-up), via official CUDA inference (inference_mocha.py) or ComfyUI-WanVideoWrapper. Includes a local CPU-safe prep/validator script (scripts/prepare_mocha_job.py) for frame-0 extraction, mask/reference validation, and test_data.csv generation. Use when swapping or replacing a person/character in existing video footage, preparing MoCha masks and reference bundles, or configuring ComfyUI/Cloud GPU Wan2.1 character replacement workflows.
---

# MoCha: End-to-End Video Character Replacement

End-to-end video character replacement workflow adapted from [Orange-3DV-Team/MoCha](https://github.com/Orange-3DV-Team/MoCha) (CVPR 2026, [arXiv:2601.08587](https://arxiv.org/abs/2601.08587)). Unlike reconstruction pipelines that depend on fragile per-frame pose skeletons or depth maps, MoCha unifies source video, a **single first-frame designation mask**, and **1 to 2 character reference images** into one token stream with condition-aware RoPE on top of **Wan2.1-T2V-14B**.

> **Hardware Reality Note**: MoCha inference (`inference_mocha.py`) is **CUDA-only** (`torch.bfloat16`, `cupy-cuda12x`, Wan2.1-T2V-14B + MoCha checkpoint ~30-60 GB total). On machines without an NVIDIA CUDA GPU, prepare and validate all assets locally using [`scripts/prepare_mocha_job.py`](./scripts/prepare_mocha_job.py), then execute rendering on a Cloud GPU (RunPod / Modal / Vast.ai) or a CUDA ComfyUI instance (`ComfyUI-WanVideoWrapper` by `@kijai`).

---

## 1. Zero-Overlap Routing (When to Use `mocha` vs Sibling Skills)

| Creative Goal | Route / Pair With | Why |
| :--- | :--- | :--- |
| **Replace a character/person inside real video footage** using only a first-frame mask + 1-2 reference photos (preserving camera, lighting, occlusions, and object interactions) | **`mocha`** (`skills/mocha/SKILL.md` + `scripts/prepare_mocha_job.py`) | Dedicated Wan2.1-T2V-14B character replacement without per-frame pose/depth guidance. |
| **Pick clean character portrait, outfit, pose, or lighting reference images** to feed into MoCha `reference_1` / `reference_2` | `posewear` (upstream companion) | Supplies curated portrait/outfit references before running MoCha. |
| **Segment frame 0 automatically to create the binary designation mask (`source_mask`)** | `ml-vision` (SAM2 / YOLO segmentation) | Generates clean white-subject / black-background mask aligned 1:1 with frame 0. |
| **Post-production on the replaced video** (cut silences/mistakes, captions, Reels/Shorts 9:16, audio mix, B-roll) | `herk-edit-kit` / `openmotion` / `showtime` (downstream companion) | MoCha outputs a silent `*_replaced.mp4` (30 fps); pair with editing skills to re-attach original audio and finish the cut. |
| **Clone a reference video's pacing into original 2D code-rendered animation** (without reusing source footage) | `reelmimic` / `code-animation-prompts` / `motlab` | Original generative code animation rather than live-footage character replacement. |
| **Word-anchored multi-variant UGC/ad templates** | `hypit` | Declarative SVML template swapping rather than pixel-level diffusion character replacement. |

---

## 2. Exact Input Contract (`test_data.csv`)

MoCha requires **3 mandatory inputs** (plus 1 strongly recommended close-up face reference):

1. **`source_video`**: Original MP4/MOV video containing the character to replace.
   - Default native resolution in `VideoRefDataset`: **`832x480`** (16:9; center-cropped & resized).
   - Valid frame counts follow Wan2.1 VAE temporal stride **`1 + 4k`** (`49`, `81` default, `121`, up to `161` max in `VideoRefDataset`).
2. **`source_mask`**: Single image (`.png` / `.jpg`) aligned 1:1 with **Frame 0** of `source_video`.
   - White pixels (`> 127`) mark the character to replace; black pixels (`<= 127`) mark regions to preserve.
   - Internally downscaled by `/8` for latent space and binarized via `torch.sign(...)`.
3. **`reference_1`**: Target replacement character image on a clean, uncluttered background (full-body or half-body).
4. **`reference_2`** *(strongly recommended)*: High-resolution, front-facing facial close-up of the same replacement character (even a clean crop/zoom from `reference_1` helps identity lock). If unavailable, write the exact literal string `None` in the CSV.

### CSV Format (`data/test_data.csv`)
```csv
source_video,source_mask,reference_1,reference_2
./data/source/clip1.mp4,./data/mask/clip1_frame0_mask.png,./data/reference/char_body.png,./data/reference/char_face.png
./data/source/clip2.mp4,./data/mask/clip2_frame0_mask.png,./data/reference/char2_body.png,None
```

---

## 3. Local Prep Workflow (Runs Locally Without GPU)

Use [`scripts/prepare_mocha_job.py`](./scripts/prepare_mocha_job.py) (requires only Python 3.10+, `ffmpeg`/`ffprobe`, and `Pillow`):

### Step 1: Extract Exact Frame 0 for Mask Painting
```powershell
python skills/mocha/scripts/prepare_mocha_job.py extract-frame0 "path/to/source.mp4" --out "work/frame0.png"
```
Create a binary mask (`work/mask.png`, same dimensions as `frame0.png`) painting the target character white (`#FFFFFF`) and background black (`#000000`).

### Step 2: Validate Inputs & Build `test_data.csv`
```powershell
python skills/mocha/scripts/prepare_mocha_job.py validate \
  --video "path/to/source.mp4" \
  --mask "work/mask.png" \
  --ref1 "work/char_body.png" \
  --ref2 "work/char_face.png" \
  --csv "work/test_data.csv"
```
This verifies:
- `source_video` stream readability, dimensions, fps, duration, and MoCha `1 + 4k` quantized frame count,
- `source_mask` alignment with video aspect ratio and sensible white foreground coverage (warns if empty `< 1%` or possibly inverted `> 85%`),
- `reference_1` and optional `reference_2` readability & resolution,
- Outputs a valid `test_data.csv` ready for `inference_mocha.py --data_path work/test_data.csv`.

### Step 3: Execute Inference (Choose Path A or Path B)
Read [`references/comfyui-and-cloud-gpu.md`](./references/comfyui-and-cloud-gpu.md) for exact execution steps:
- **Path A (Recommended for 16-24 GB NVIDIA GPUs)**: ComfyUI + `kijai/ComfyUI-WanVideoWrapper` with FP8/GGUF offload.
- **Path B (Official CLI on 40-80 GB Cloud GPU)**: `Orange-3DV-Team/MoCha` (`inference_mocha.py`), replacing hardcoded `/path/to/...` Wan2.1 checkpoint paths at lines 182-185.
- Full CLI flag and pipeline parameter table: [`references/inference-params.md`](./references/inference-params.md).

### Step 4: Re-Attach Original Audio (Post-Render)
`save_video()` in `inference_mocha.py` exports a silent 30 fps MP4 (`*_replaced.mp4`). Remux original audio cleanly with FFmpeg:
```bash
ffmpeg -i results/clip1_replaced.mp4 -i data/source/clip1.mp4 -map 0:v:0 -map 1:a:0? -c:v copy -c:a aac -shortest results/clip1_final_with_audio.mp4
```

---

## 4. Mandatory Ethics, Consent & Licensing Guardrails

1. **Likeness Consent & Anti-Deepfake Rule**: Only perform video character replacement using fictional characters, user-owned avatars, or real people who have given explicit consent. Refuse deceptive impersonation or non-consensual likeness swaps.
2. **Upstream License Transparency**: As of repository inspection, `Orange-3DV-Team/MoCha` does **not** ship a top-level `LICENSE` file (while base `Wan2.1-T2V-14B` is Apache-2.0). Never claim MoCha weights/code are MIT; advise the user to verify commercial usage terms directly with the authors (`arXiv:2601.08587`) before commercial deployment.
3. **Never Claim Local Execution Without CUDA**: If the machine lacks an NVIDIA CUDA GPU (`nvidia-smi` absent), clearly state that local prep (`prepare_mocha_job.py`) completed and hand off the validated bundle + Cloud GPU/ComfyUI commands rather than pretending inference succeeded.
