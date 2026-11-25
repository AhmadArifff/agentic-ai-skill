---
name: posewear
description: Visual reference gallery, outfit try-on workbench, and MCP server (v1.3.2, atuizz/posewear, MIT code) covering 12 curated reference libraries (poses, paired depth-poses, outfits, anime outfits, historical dress, portraits, expressions, hairstyles, scenes, lighting, props, furniture) with bilingual EN/ZH prompts, exact angle/variant selection, and local ComfyUI or stable-diffusion.cpp integration. Use when picking, combining, or handing off visual references (posewear_list_collections, posewear_search_references, posewear_get_reference, posewear_compose_brief) to assemble structured image-generation briefs with exact reference image URLs.
---

# PoseWear (衣姿): Visual Reference Gallery & MCP Prompt Composer

Visual reference discovery and image-generation brief composer adapted from [atuizz/posewear](https://github.com/atuizz/posewear) (`v1.3.2`, MIT code). Connects agents to 12 curated visual reference libraries (including paired line-art pose + depth-map cards) via a lightweight Node 22+ MCP server and an optional local browser workbench (`http://127.0.0.1:8787/`) supporting cloud image APIs, ComfyUI, or `stable-diffusion.cpp`.

> **Hybrid Installation Layout**: The runnable MCP server and local workbench live standalone outside this hub at **`C:\Users\ASUS\posewear`** (`npm ci --omit=dev`, Node 22.12+), while this lightweight skill provides the official 4-tool workflow, 12-collection schema, ComfyUI/`sd-cpp` local engine setup, and asset licensing rules.

---

## 1. Official 4-Tool MCP Workflow

1. **Discover & Search**: For a request without a specific item ID, call `posewear_search_references` with the user's search terms (space-separated terms all match). Scope a query with the `collection` field, or call `posewear_list_collections` first to list all 12 libraries with Chinese, English, and Japanese names and visible counts.
2. **Inspect Angles & Variants**: Call `posewear_get_reference` for promising items. Check the returned `angles` array when camera viewpoint or hair/color variant matters, then pass the zero-based `angle` index (single-view items use `angle: 0`).
3. **Compose Structured Brief**: Call `posewear_compose_brief` with the ordered `{collection, id, angle}` array in the user's intended reference order. Set `language` to `en` or `zh`. Supply `prompt` to preserve custom wording, or omit it to combine catalog descriptions automatically.
4. **Hand Off to Image Generator**: The returned `brief` and ordered `references[].url` values are ready to pass directly into any reference-capable image generation model (or local ComfyUI / `stable-diffusion.cpp` workflow). Follow the user's model preference and obtain ordinary approval before any paid generation.

### Important Asset Handling Rules
- **Hotlinked Assets**: CharaDB hairstyles and some anime outfits remain hotlinked to their original host; always keep those image URLs at their original host rather than re-hosting them.
- **Local Personal Photos**: Uploaded personal try-on photos stay inside the user's local browser only; PoseWear MCP tools only read public catalog metadata and return URLs. Ask the user for a separate image attachment if a brief references a personal photo.
- **Adult Content Filter**: Adult-tagged items are hidden by default (`POSEWEAR_ALLOW_ADULT` unset). Never enable `POSEWEAR_ALLOW_ADULT=1` unless explicitly requested by the user.

---

## 2. The 12 Curated Reference Collections

| Collection ID | English | Chinese | Notes |
| :--- | :--- | :--- | :--- |
| `pose` | Poses | 姿势 | Line-art pose references; paired 1-to-1 with `depth` by card ID |
| `depth` | Depth poses | 深度姿势 | Paired depth maps matching `pose` camera angle & posture |
| `costume` | Outfits | 服装 | Modern / seasonal clothing outfits |
| `anime` | Anime outfits | 动画服装 | Stylized / anime costumes (some hotlinked via CharaDB) |
| `portrait` | Portraits | 人像 | Fictional AI portraits (CC0, avoid bulk verbatim reposting) |
| `expr` | Expressions | 表情 | Facial expressions (WaveSpeed AI / ICT FaceKit MIT) |
| `hair` | Hairstyles | 发型 | Hairstyles & color variants (CharaDB, hotlinked) |
| `dyn` | Historical dress | 历代服饰 | Traditional / historical costumes (CC0 1.0) |
| `scene` | Scenes | 场景 | Environments & backgrounds (CC0 1.0) |
| `light` | Lighting | 光影 | Studio & atmospheric lighting references (CC0 1.0) |
| `prop` | Props | 道具 | Handheld / character props (CC0 1.0) |
| `furn` | Furniture | 家具 | Interior furniture references (CC0 1.0) |

---

## 3. Zero-Overlap Routing (When to Use `posewear` vs Sibling Skills)

| User Need | Route / Pair With | Why |
| :--- | :--- | :--- |
| **Find concrete pose, depth-map, outfit, expression, hairstyle, scene, or lighting reference URLs & assemble a structured image-gen brief** | **`posewear`** (`skills/posewear/SKILL.md` + MCP `posewear_*`) | Dedicated 12-collection searchable catalog with exact angle indices and paired pose/depth maps. |
| **Generate final images from the assembled PoseWear brief** | `image-generator` subagent, ComfyUI, or `stable-diffusion.cpp` | PoseWear reads references and builds briefs; the image model performs rendering. |
| **Design UI/web design systems, color tokens, and art direction** | `design-dna` / `paint` / `frontend` | Web/app interface design systems rather than character pose/costume photography references. |
| **Build 3D rotatable Three.js dioramas or interactive 3D games** | `diorama` / `ohmygame-studio` | 3D scene/game authoring (can use PoseWear references during concept art prep). |
| **Animate code-rendered 2D videos or style-clone motion** | `code-animation-prompts` / `reelmimic` / `motlab` | Motion & video synthesis rather than still character/costume reference selection. |

---

## 4. Reference Docs, Security & Licensing Guardrails

- **MCP Client Setup, Local Workbench & ComfyUI / `stable-diffusion.cpp` Guide**: Read [`references/mcp-and-local-engines.md`](./references/mcp-and-local-engines.md).
- **Anti-Impersonation Security Warning**: Official PoseWear channels are strictly `https://posewear.pages.dev/` and `https://github.com/atuizz/posewear` (100% free, zero account registration, zero paid plans, no Windows `.exe` or Android `.apk` client). Warn users immediately against phishing lookalikes (`posewear.cn`, `posewear.art`, third-party installers) and never enter API keys into unofficial domains.
- **Strict Asset License Separation**: Code, UI copy, and build scripts are MIT ([`LICENSE`](./LICENSE)), **but image rights are independent of the code license**:
  - `pose`, `depth`, `costume`, `anime` (ギア / `@giaaibusi`): **Do NOT assume commercial or redistribution rights**; confirm directly with the upstream author before commercial use.
  - `portrait` (`@agi_aibusi`): CC0 (author requests no bulk verbatim re-upload).
  - `hair` & selected `anime` (CharaDB): CC0 tags, images hotlinked at original host.
  - `expr`: WaveSpeed AI Emotion Gallery / ICT FaceKit (MIT, USC ICT).
  - `dyn`, `scene`, `light`, `prop`, `furn` (Shisei / wquguru): CC0 1.0.
