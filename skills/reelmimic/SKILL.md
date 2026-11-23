---
name: reelmimic
description: Reference-video style cloning and 2D artistic animation production suite (MIT, adapted from edenfunf/reelmimic). Extracts pacing, shot lengths, camera moves, BPM/beats, and climax curves from any reference video or URL (video-clone + Motion Score compiler) without copying source footage or characters, then builds original animated films across 6 code-rendered 2D engines (watercolor painted-animation via p5.js/p5.brush, anime-cel, crayon-storybook, pixel-art 480x270 framebuffer, paper-cutout 12fps stop-motion, whiteboard doodle explainer), beat-synced music-to-video, and headless Cycles blender-product-film. Use when cloning a reference video's style or editing rhythm, creating hand-painted watercolor, anime cel, crayon storybook, pixel art, paper cut-out, or whiteboard doodle animations, building beat-synced music/lyric videos, or rendering Blender 3D studio product commercials.
---

# ReelMimic: Reference Style Cloning & 2D Artistic Animation Suite

Open-source video style-cloning orchestrator and code-rendered 2D animation engine suite adapted from [edenfunf/reelmimic](https://github.com/edenfunf/reelmimic) (MIT). Give it a reference video (local file, screen recording, or URL) plus a brief, or pick one of the bundled artistic engines directly, to produce an original animated MP4 with frame-accurate motion curves and multi-stage visual review gates.

> **Path Mapping Note**: Upstream engine guides inside `engines/*/` reference paths like `.claude/skills/<engine>/...`. Within this workspace (and global config), resolve those paths relative to this skill directory:
> - Workspace hub: `skills/reelmimic/engines/<engine>/...`
> - Synced local agent root: `.agents/skills/reelmimic/engines/<engine>/...`
> - Global config root: `~/.gemini/config/skills/reelmimic/engines/<engine>/...`

---

## 1. Zero-Overlap Routing (When to Use `reelmimic` vs Sibling Video Skills)

Use this boundary table before starting any video task so each skill handles its unique specialty:

| User Need / Creative Goal | Route To | Why |
| :--- | :--- | :--- |
| **Clone a reference video's editing rhythm, pacing, camera moves, and climax timing into original 2D animation** | **`reelmimic`** (`engines/video-clone/`) | Extracts `shot_details`, BPM/beats, `peaks.json`, and compiles `Motion Score` curves (`Score.cam(id, t)`) with side-by-side climax review. |
| **Hand-painted watercolor, Japanese anime cel, crayon storybook, pixel art (480x270), stop-motion paper cut-out, or whiteboard doodle animation** | **`reelmimic`** (`engines/<style>/`) | Dedicated pure-`f(t)` artistic rendering engines (`p5.brush`, Canvas 2D cel, software framebuffer, cut-paper rigs, marker whiteboard). |
| **Beat-synced music / lyric video driven by `librosa` beat-grid analysis (`audiomap.json`)** | **`reelmimic`** (`engines/music-to-video/` or `engines/painted-animation/references/music-video.md`) | Deterministic `analyze-beatgrid.py` + frame-worker pipeline or hand-painted watercolor karaoke (`src/karaoke.js`). |
| **Photoreal dark-studio 3D product commercial from a product photo (Blender 4.2+ Cycles)** | **`reelmimic`** (`engines/blender-product-film/`) | Reconstructs bottle/can/jar silhouette + label via `prep_product.py` and renders rim-lit Cycles shots via `pfilm.py`. |
| **CapCut / Claude Motion visual timeline editor, `Motion.md` SaaS brand-film remake, 300+ templates, BYOK AI media gateway** | `openmotion` | Dedicated Dockview visual studio + MCP `openmotion_*` + Motion Package v0.2 + BYOK fal.ai/Suno/Eleven v4. |
| **100% offline local studio with local TTS voice-over (Kokoro/Piper/Supertonic), `pr-video`/`release-video`/`repro`, Manim math, CSV/PDF data stories, audio X-ray** | `showtime` | Zero-cloud-API studio (`~/showtime`) with local narration, developer video generators, and `showtime qa`. |
| **Word-anchored viral video cloning & 100-variant UGC/ad factory (SVML/SVS/SVRun)** | `hypit` | Swaps hosts, products, and languages anchored to transcript words via `@hypit/hypit`. |
| **Real talking-head footage post-production (cut silences, review-gated mistake removal, Reels/Shorts 9:16, BPM showreels)** | `herk-edit-kit` + `hyperframes` | Purpose-built for editing recorded camera footage and HTML+GSAP motion overlays. |
| **Pure `<canvas>` code-as-video with frame-by-frame visual annotation viewer (`selection.json`), reusable vector/3D asset kits, fast WebCodecs 4K render** | `motlab` + `motlab-assets` | Clean studio workflow for iterative human frame notes and consistent brand asset kits. |
| **Brand motion art direction, kinetic UI film critique, and Mog Check G0-G5 anti-slop review** | `motionmaxxing` | Senior motion designer direction, measured easing curves, and strict quality grading. |
| **Interactive 3D mechanical cutaway / exploded-view simulator (Three.js offline HTML)** | `teardown` or `3d-configurator-simulator` | Interactive browser exploration and kinematic simulation rather than linear video cloning. |
| **Interactive playable games (Phaser/Three.js/Godot/Unity) + AI game asset canvas** | `ohmygame-studio` | Full game studio MCP pipeline with automated playtesting (`game_use`). |

---

## 2. Progressive Disclosure: 9 Included Engines

Only read the specific engine's `SKILL.md` and `GUIDE.md` when the task routes to that engine:

| Engine (`engines/<name>/`) | Medium / Style | Tech & FPS | Authoritative Docs to Load | Key Scripts & Templates |
| :--- | :--- | :--- | :--- | :--- |
| **`video-clone`** | Master style-cloning router & quality gate | Python + FFmpeg + Motion Score | `engines/video-clone/SKILL.md`, `engines/video-clone/CONTRACT.md`, `engines/video-clone/styles/*.md` | `scripts/analyze.py`, `scripts/motion_score.py`, `scripts/clip_strip.py`, `scripts/compare.py`, `scripts/motion_check.py`, `scripts/align_lyrics.py`, `scripts/fetch_assets.py` |
| **`painted-animation`** | Hand-painted watercolor & boiling ink cartoon | `p5.js` + `p5.brush`, headless Chrome, 1920x1080 | `engines/painted-animation/SKILL.md`, `engines/painted-animation/template/ANIMATION_GUIDE.md`, `engines/painted-animation/references/music-video.md` | `scripts/new_project.sh`, `scripts/beat_grid.py`, `template/render.mjs`, `template/src/karaoke.js` |
| **`anime-cel`** | Japanese TV anime cel-shading (1-2 tone shadows, anime lighting, speedlines) | Canvas 2D, headless Chrome | `engines/anime-cel/SKILL.md`, `engines/anime-cel/GUIDE.md` | `scripts/new_project.sh`, `template/render.mjs`, `template/src/anime.js`, `template/src/cast.js` |
| **`crayon-storybook`** | Wax crayon & colored-pencil children's picture book | `p5.brush` + textured paper, 8 fps feel | `engines/crayon-storybook/SKILL.md`, `engines/crayon-storybook/GUIDE.md` | `scripts/new_project.sh`, `template/render.mjs`, `template/src/crayon.js`, `template/src/karaoke.js` |
| **`pixel-art`** | Retro RPG / pixel story animation (480x270 framebuffer, 4x nearest-neighbor, Bayer dithering) | Canvas 2D software framebuffer | `engines/pixel-art/SKILL.md`, `engines/pixel-art/GUIDE.md` | `scripts/new_project.sh`, `template/render.mjs`, `template/src/pixel.js`, `template/src/cast.js` |
| **`paper-cutout`** | Stop-motion cut paper / split-pin puppets with cardstock shadows | Canvas 2D layered paper, 12 fps | `engines/paper-cutout/SKILL.md`, `engines/paper-cutout/GUIDE.md` | `scripts/new_project.sh`, `template/render.mjs`, `template/src/paper.js`, `template/src/cast.js` |
| **`whiteboard`** | VideoScribe-style hand-drawn marker doodle explainer | Canvas 2D progressive stroke draw | `engines/whiteboard/SKILL.md`, `engines/whiteboard/GUIDE.md` | `scripts/new_project.sh`, `template/render.mjs`, `template/src/whiteboard.js`, `template/src/cast.js` |
| **`music-to-video`** | Beat-synced lyric video, montage, or kinetic promo | `librosa` beatgrid + HyperFrames HTML/GSAP | `engines/music-to-video/SKILL.md`, `engines/music-to-video/references/planning.md`, `engines/music-to-video/sub-agents/frame-worker.md` | `scripts/analyze-beatgrid.py`, `scripts/validate-plan.mjs`, `scripts/stage-assets.mjs` |
| **`blender-product-film`** | Photoreal dark-studio 3D product commercial (glass, liquid, rim light, sweeps) | Blender 4.2+ Cycles GPU + Python | `engines/blender-product-film/SKILL.md` | `scripts/prep_product.py`, `scripts/pfilm.py`, `scripts/render_shots.py`, `scripts/finish.py` |

### Architecture & Compiler Reference Docs (`docs/`)
Read these when extending engines, debugging Motion Score curves, or coordinating multi-agent review gates:
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): Full production pipeline (`analyzing -> styling -> planning -> plan_review -> producing -> critiquing -> revising -> done`), parallel cast gate, shot line, and quality presets (`fast`, `standard`, `fine`).
- [`docs/COMPILER.md`](./docs/COMPILER.md): Motion Score compiler internals (`motion_score.py from-ref`, `predict`, `compile`) that turn measured reference camera motion into reusable easing/camera cues.
- [`docs/HARNESS.md`](./docs/HARNESS.md): Evaluation harness and automated scoring verification.
- [`docs/EXTENDING.md`](./docs/EXTENDING.md): How to author a new style descriptor in `engines/video-clone/styles/` or plug in a custom engine.

---

## 3. Core Workflows

### Workflow A: Reference Video Style Clone (`video-clone`)
1. **Analyze Reference**: Run `analyze.py` on a local file or URL (downloads via `yt-dlp` for style analysis only) to extract cuts, BPM/beat timestamps, per-shot camera motion (`shot_details`), brightness/color summary (`look_summary`), `peak_candidates`, `sheet_1fps.jpg`, and `sheet_scenes.jpg`:
   ```bash
   python skills/reelmimic/engines/video-clone/scripts/analyze.py "<video_or_url>" --out projects/<slug>/analysis
   ```
2. **Inspect & Classify Style**: Read `sheet_1fps.jpg`, `sheet_scenes.jpg`, and `report.json`. Extract 12fps strips of candidate climaxes with `clip_strip.py` and write `analysis/STYLE.md` + `analysis/peaks.json`. Match the medium against `engines/video-clone/styles/*.md` and choose the target engine.
3. **Plan & User Review Gate**: Write `STORYBOARD.md` and `plan.json` (every shot mapped to a `ref_shot`, camera spec, climax `hero: true`, and `required_inputs` such as user lyrics, brand logo, or mascot sheets). Render key climax style frames side by side with reference frames before full production. Wait for user approval before generating all shots.
4. **Compile Motion Score**: Convert reference camera telemetry into deterministic curves so shots read `Score.cam(id, t)` and `Score.beat()` instead of hand-guessed numbers:
   ```bash
   python skills/reelmimic/engines/video-clone/scripts/motion_score.py from-ref ...
   ```
5. **Independent Review Gates (No Self-Review)**:
   - **Cast Gate**: Verify character turnaround sheets (front view, 8+ expressions, 6+ poses) at full resolution before building shots.
   - **Shot Review**: Inspect contact sheets and 12fps strips per segment; fix pose snaps, disconnected limbs, jitter, or unreadable overlays before assembly.
   - **Assembly & Final Critic**: Run `motion_check.py` to catch black frames or unintended freezes, compare climaxes side-by-side (`clip_strip.py --vs` / `compare.py`), and encode final MP4 with audio.

### Workflow B: Direct 2D Artistic Animation Build
When the user asks directly for watercolor, anime cel, crayon storybook, pixel art, paper cut-out, or whiteboard animation (without a reference video):
1. Pick the matching engine under `engines/<engine>/` and read its `SKILL.md` + `GUIDE.md` (or `template/ANIMATION_GUIDE.md` for `painted-animation`).
2. Copy its `template/` folder into your project directory (or run `bash skills/reelmimic/engines/<engine>/scripts/new_project.sh <project-dir>` via Git Bash on Windows) and run `npm install`.
3. Every frame **must be a pure function of time `t`** (no mutable state across frames, no `Math.random()`; use deterministic `hash(i)` and `boilSeed(key)`) so parallel workers render identical frames out of order.
4. Render contact sheets and strips during iteration before full encode:
   ```bash
   node render.mjs --sheet=0.1,0.8,1.6,2.4 --cols=4 --w=480 --out=out/check/sheet.jpg
   node render.mjs --strip=2.1:2.6 --out=out/check/strip.jpg
   node render.mjs --frames --workers=4
   node render.mjs --encode --out=out/video.mp4 --audio=assets/song.mp3
   ```
   On Windows, if Chrome is not auto-detected, pass `--chrome="C:\Program Files\Google\Chrome\Application\chrome.exe"`.

### Workflow C: Beat-Synced Music Video (`music-to-video`)
1. Initialize a HyperFrames project (`npx hyperframes init "videos/<project>" --non-interactive --example=blank`) and stage `assets/bgm.mp3`.
2. Run the canonical beat analyzer once (requires Python `librosa`, `numpy`, `soundfile`):
   ```bash
   python skills/reelmimic/engines/music-to-video/scripts/analyze-beatgrid.py "videos/<project>/assets/bgm.mp3" -o "videos/<project>/audiomap.json" --print
   ```
3. Lay out musical frames in `STORYBOARD.md`, validate with `node skills/reelmimic/engines/music-to-video/scripts/validate-plan.mjs`, build each frame composition, assemble `index.html`, and render via HyperFrames.

### Workflow D: Headless Blender Product Film (`blender-product-film`)
Requires Blender 4.2+ (`BLENDER` env var or `blender` on `PATH`; Cycles GPU recommended):
1. Reconstruct bottle/can/jar silhouette and label mask from a front-view product photo:
   ```bash
   python skills/reelmimic/engines/blender-product-film/scripts/prep_product.py <photo> --out build/product --height <meters>
   ```
2. Author JSON shot specs under `build/shots/`, inspect look-dev stills (`render_shots.py build --quality final --stills auto`) and motion previews (`--quality preview --cut`), then run final Cycles render and composite titles/audio via `finish.py build/edit.json`.

---

## 4. Environment Requirements & Optional Web UI

- **Core Runtime**: Node.js 18+, Python 3.10+, FFmpeg/FFprobe, Google Chrome/Chromium.
- **Optional Python Packages** (install on demand per workflow):
  - `yt-dlp` (downloading reference URLs in `analyze.py`)
  - `librosa`, `numpy`, `soundfile` (for `music-to-video/scripts/analyze-beatgrid.py`)
  - `faster-whisper` (word timing alignment in `video-clone/scripts/align_lyrics.py`)
  - Blender 4.2+ & optional `realesrgan-ncnn-vulkan` (`blender-product-film`)
- **Optional Browser Studio UI (`http://localhost:4318`)**: The upstream `app/` React + Express studio UI and static demo binaries (~18 MB) are intentionally excluded from this skill package to keep the Agentic AI hub lightweight. If a user explicitly wants the click-through ReelMimic browser dashboard, clone `https://github.com/edenfunf/reelmimic.git` into a standalone workspace outside this hub and run `npm run start`.

---

## 5. Mandatory Guardrails & Attribution

1. **Style-Only Cloning**: Learn editing rhythm, framing, camera motion, palette arc, and climax structure from the reference video. **Never copy** reference footage, frames, characters, logos, or third-party brand marks into the output.
2. **Lyrics Integrity**: Only align lyrics supplied explicitly by the user (`inputs/lyrics.txt` or `.lrc` via `align_lyrics.py`). Never fabricate or transcribe copyrighted lyrics without user-provided text.
3. **Product Truthfulness**: In product films, only display claims and copy printed on the user's product or explicitly provided by the user. Never invent product specifications or metrics.
4. **Honest Visual QA**: Always inspect rendered contact sheets, 12fps motion strips, and face/detail crops before encoding final MP4 output. Never cover unfinished animation with flash frames or hard black cuts.
5. **Licensing**: Bundled under MIT License ([`LICENSE`](./LICENSE)); see [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) for upstream notices (`ClaudeAnimationBase` MIT, `p5.brush`, etc.).
