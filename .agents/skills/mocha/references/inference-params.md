# MoCha Inference Parameters & Dataset Internals

Extracted verbatim from upstream `Orange-3DV-Team/MoCha/inference_mocha.py`.

## 1. CLI Arguments (`parse_args()`)

| Flag | Default | Description |
| :--- | :--- | :--- |
| `--data_path` | `./data/test_data.csv` | CSV listing `source_video,source_mask,reference_1,reference_2` |
| `--ckpt_path` | `./checkpoints/step18500.ckpt` | MoCha fine-tuned DiT state dict (`strict=True` load into `pipe.dit`) |
| `--output_dir` | `./results` | Output directory; files saved as `<source_stem>_replaced.mp4` |
| `--dataloader_num_workers` | `1` | PyTorch DataLoader worker count (`0` for main-process debugging) |
| `--cfg_scale` | `5.0` | Classifier-free guidance scale |

## 2. `VideoRefDataset` & Pipeline Defaults

| Setting | Value in Upstream Code | Notes |
| :--- | :--- | :--- |
| Spatial resolution | `height=480`, `width=832` | Aspect-preserving scale + `CenterCrop(480, 832)` + `Resize` |
| Mask resolution | `height // 8`, `width // 8` (`60x104`) | Downscaled for Wan2.1 VAE latent space; binarized via `torch.sign(...)`, repeated to 16 latent channels |
| Dataset `max_num_frames` | `161` | Automatically quantized down to `1 + (count - 1) // 4 * 4` when source clip has fewer frames |
| Pipeline `num_frames` | `81` (~2.7 s at 30 fps) | Hardcoded in `pipe(...)` call at line 229; adjust to match `1 + 4k` clip length up to 161 |
| `num_inference_steps` | `50` | Standard diffusion denoising steps |
| `seed` | `0` | Fixed deterministic seed |
| `tiled` | `True` | VAE tiling enabled to reduce peak VRAM |
| Output FPS & quality | `fps=30`, `quality=5` | Written via DiffSynth `save_video()` (no audio track) |
| Precision & device | `torch.bfloat16` on `cuda` | Loaded on `cpu` first via `ModelManager`, then moved to `cuda` |
