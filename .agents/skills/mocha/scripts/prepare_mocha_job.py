#!/usr/bin/env python3
"""
Local CPU-safe preparation and validation helper for MoCha video character replacement.

Subcommands:
  extract-frame0 <video> --out <frame0.png>
      Extracts exact frame 0 via ffmpeg so a 1:1 aligned designation mask can be painted.

  validate --video <mp4> --mask <png> --ref1 <img1> [--ref2 <img2|None>] [--csv <out.csv>]
      Probes source video via ffprobe, validates mask coverage/aspect and reference images via Pillow,
      computes MoCha's quantized 1 + 4k frame count, and optionally writes test_data.csv.
"""

from __future__ import annotations

import argparse
import csv
import json
import shutil
import subprocess
import sys
from pathlib import Path


def check_binary(name: str) -> str:
    found = shutil.which(name)
    if not found:
        raise RuntimeError(f"Required binary '{name}' was not found on PATH.")
    return found


def extract_frame0(video_path: Path, out_path: Path) -> int:
    if not video_path.is_file():
        print(f"ERROR: source video not found: {video_path}", file=sys.stderr)
        return 1
    ffmpeg = check_binary("ffmpeg")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(video_path),
        "-vf",
        "select=eq(n\\,0)",
        "-vframes",
        "1",
        str(out_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0 or not out_path.is_file():
        print(f"ERROR: ffmpeg failed to extract frame 0:\n{proc.stderr}", file=sys.stderr)
        return 1
    print(f"OK: extracted frame 0 -> {out_path}")
    return 0


def probe_video(video_path: Path) -> dict:
    ffprobe = check_binary("ffprobe")
    cmd = [
        ffprobe,
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-count_packets",
        "-show_entries",
        "stream=width,height,r_frame_rate,nb_read_packets,duration",
        "-of",
        "json",
        str(video_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {video_path}: {proc.stderr.strip()}")
    payload = json.loads(proc.stdout)
    streams = payload.get("streams") or []
    if not streams:
        raise RuntimeError(f"No video stream found in {video_path}")
    st = streams[0]
    width = int(st.get("width", 0))
    height = int(st.get("height", 0))
    rate = st.get("r_frame_rate", "30/1")
    num, den = (rate.split("/") + ["1"])[:2]
    fps = round(float(num) / max(float(den), 1.0), 3)
    packets = int(st.get("nb_read_packets", 0) or 0)
    duration = float(st.get("duration", 0.0) or 0.0)
    if packets <= 0 and duration > 0:
        packets = int(round(duration * fps))
    quantized = 1 + ((max(packets, 1) - 1) // 4) * 4
    recommended = min(quantized, 161)
    return {
        "width": width,
        "height": height,
        "fps": fps,
        "frames": packets,
        "duration_sec": round(duration, 2),
        "mocha_quantized_frames": recommended,
    }


def inspect_image(img_path: Path, is_mask: bool = False) -> dict:
    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError("Pillow is required for image inspection (pip install Pillow).") from exc

    with Image.open(img_path) as im:
        width, height = im.size
        info: dict = {"width": width, "height": height, "mode": im.mode}
        if is_mask:
            gray = im.convert("L")
            hist = gray.histogram()
            total = max(width * height, 1)
            white = sum(hist[128:])
            info["foreground_ratio"] = round(white / total, 4)
        return info


def validate_job(args: argparse.Namespace) -> int:
    warnings: list[str] = []
    errors: list[str] = []

    video_path = Path(args.video)
    mask_path = Path(args.mask)
    ref1_path = Path(args.ref1)
    ref2_raw = args.ref2 if args.ref2 else "None"
    ref2_path = None if ref2_raw == "None" else Path(ref2_raw)

    for label, p in [("source_video", video_path), ("source_mask", mask_path), ("reference_1", ref1_path)]:
        if not p.is_file():
            errors.append(f"Missing {label}: {p}")
    if ref2_path is not None and not ref2_path.is_file():
        errors.append(f"Missing reference_2: {ref2_path}")

    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1

    vid = probe_video(video_path)
    mask = inspect_image(mask_path, is_mask=True)
    ref1 = inspect_image(ref1_path, is_mask=False)
    ref2 = inspect_image(ref2_path, is_mask=False) if ref2_path else None

    if vid["frames"] < 5:
        errors.append(f"Video has too few frames ({vid['frames']}); minimum 5 frames recommended.")
    if vid["frames"] > 161:
        warnings.append(
            f"Video has {vid['frames']} frames (> 161 VideoRefDataset max); clip or process in <=161-frame segments."
        )
    if abs((vid["width"] / max(vid["height"], 1)) - (mask["width"] / max(mask["height"], 1))) > 0.05:
        warnings.append(
            f"Mask aspect ratio ({mask['width']}x{mask['height']}) differs from video ({vid['width']}x{vid['height']})."
        )
    fg = mask["foreground_ratio"]
    if fg < 0.01:
        errors.append(f"Mask foreground ratio is {fg:.2%} (< 1%); target character may not be marked white.")
    elif fg > 0.85:
        warnings.append(
            f"Mask foreground ratio is {fg:.2%} (> 85%); verify mask is not inverted (subject=white, background=black)."
        )
    if ref2 is None:
        warnings.append("reference_2 is None; supplying a front-facing facial close-up improves identity preservation.")
    elif min(ref2["width"], ref2["height"]) < 256:
        warnings.append(f"reference_2 resolution is low ({ref2['width']}x{ref2['height']}); >= 512px recommended.")

    summary = {
        "video": vid,
        "mask": mask,
        "reference_1": ref1,
        "reference_2": ref2 or "None",
        "warnings": warnings,
        "status": "FAIL" if errors else "PASS",
    }
    print(json.dumps(summary, indent=2))

    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1

    if args.csv:
        csv_path = Path(args.csv)
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        with csv_path.open("w", newline="", encoding="utf-8") as fh:
            writer = csv.writer(fh)
            writer.writerow(["source_video", "source_mask", "reference_1", "reference_2"])
            writer.writerow([
                video_path.as_posix(),
                mask_path.as_posix(),
                ref1_path.as_posix(),
                ref2_path.as_posix() if ref2_path else "None",
            ])
        print(f"OK: wrote MoCha job CSV -> {csv_path}")

    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare and validate MoCha video character replacement jobs.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_ext = sub.add_parser("extract-frame0", help="Extract exact frame 0 from source video for mask painting.")
    p_ext.add_argument("video", help="Path to source video.")
    p_ext.add_argument("--out", required=True, help="Output PNG path for frame 0.")

    p_val = sub.add_parser("validate", help="Validate source video, mask, and references and write test_data.csv.")
    p_val.add_argument("--video", required=True, help="Path to source video.")
    p_val.add_argument("--mask", required=True, help="Path to first-frame binary mask PNG/JPG.")
    p_val.add_argument("--ref1", required=True, help="Path to primary character reference image.")
    p_val.add_argument("--ref2", default="None", help="Path to facial close-up reference image or 'None'.")
    p_val.add_argument("--csv", help="Optional output path for test_data.csv.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.cmd == "extract-frame0":
        return extract_frame0(Path(args.video), Path(args.out))
    return validate_job(args)


if __name__ == "__main__":
    raise SystemExit(main())
