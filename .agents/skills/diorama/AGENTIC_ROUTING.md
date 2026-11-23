# Agentic AI Hub Routing & Upgrade Notes for `diorama`

This companion file lives alongside the unmodified upstream `@sloemo/diorama` package (`v1.2.1` / playbook `v5.7.0`, MIT License) so `SKILL.md` remains 100% pristine for clean upstream registry updates.

## 1. Zero-Overlap Routing (3D / WebGL / Animation Skills)

| Task / User Request | Route To | Reason |
| :--- | :--- | :--- |
| **Stylized rotatable Three.js miniature slab diorama** (Classic Pixel Art 64-color dither + ink contour, Stroked Toon, or Pixel + Stroke), deterministic pure-`f(t)` cast/vehicles/water/combat scenes, CC0/CC-BY research-first ledger (`SOURCES.md` + `CREDITS.md`), or 8-script Playwright `freeze(t)` visual QA | **`diorama`** (`skills/diorama/SKILL.md`) | Dedicated two-gate intake (Look -> Model Sourcing), construction-first 10-step pipeline, copy-in core modules, and deterministic per-entity visual verification (`frames.mjs`, `audit.mjs`, `shoot.mjs`). |
| **Photoreal / PBR mechanical cutaway simulator** with live telemetry gauges, interactive sliders, auto-tour cursor, and procedural audio score video capture (engines, gearboxes, linkages) | `teardown` | Purpose-built for offline single-page PBR engineering cutaways with live numeric telemetry consoles and procedural `score.py` audio. Note: for stylized pixel/toon educational explanations with V8 dock + reversible part inspection, `diorama` Educational Mechanism Profile (5.7) applies instead. |
| **Medical / industrial product configurator** (Draco-compressed GLB/GLTF swaps, biomechanical prosthesis ROM, PBR material switcher, floating HTML HUD) | `3d-configurator-simulator` | Specialized for `DRACOLoader` asset pipelines, modular part swaps with `.dispose()` memory hygiene, and product configurator HUDs. |
| **Low-level Three.js API references** (custom GLSL shaders, EffectComposer bloom/DOF, BufferGeometry, lights, loaders) | `threejs-*` (10 modular skills) | Foundational API reference modules to pair alongside any 3D build. |
| **Full playable interactive 2D/3D web or engine games** (Phaser, Three.js, Godot, Unity) with multiplayer, Asset Canvas, and playtest MCP | `ohmygame-studio` | Dedicated game studio MCP workflow and automated playtesting (`game_use`). |
| **2D artistic animation & reference video style cloning** (watercolor, anime cel, crayon, pixel-art 2D framebuffer, paper cut-out, whiteboard, Blender Cycles product commercials) | `reelmimic` | Pure 2D code-rendered video cloning and Blender Cycles photoreal product films (not interactive rotatable Three.js slabs). |

## 2. Two Mandatory Intake Gates (From `SKILL.md` v5.7.0)

Before creating the first mesh in a new diorama project, ask once in this exact order (unless explicitly answered in the brief):
1. **Look Gate**: `pixel` (Classic Pixel Art, recommended), `stroked-toon`, or `pixel-stroke`.
2. **Model Sourcing Gate**: `hybrid` (recommended), `internet-full`, or `authored-only`. Commercial-use + modification + scene redistribution license verification is mandatory (`SOURCES.md` + `CREDITS.md`); NC, ND, editorial, ripped, or unstated licenses are hard stops.

## 3. Windows & Registry Update Notes

- **Playwright QA on Windows**: Pass Chrome explicitly when running `templates/qa/*.mjs` if auto-detection misses:
  ```powershell
  $env:CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
  $env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
  ```
- **Upgrade from npm Registry** (never clone GitHub; run from a temporary scratch folder so root `package.json` stays untouched):
  ```powershell
  npx --yes @sloemo/diorama@latest "c:\Users\ASUS\Documents\Web Dev\improving\agentic AI\skills\diorama" --force
  node scripts/sync-global-and-spoke.js
  ```
  Add `--media` only if you specifically want the 20 MB `@sloemo/diorama-media` reference demo clips.
