---
name: openmotion
description: "Open-source Claude Motion & CapCut alternative: Visual Timeline Studio Editor + Motion.md brand-film recreation + 300+ online/local templates + BYOK Multimodal Model Gateway (fal.ai, Atlas Cloud, Codex Image, Suno v4, Seedance, Eleven v4) + HyperFrames ZIP import via MCP (`openmotion_*`). Use when the user asks for OpenMotion, wants to reverse-engineer a brand film into Motion.md and compare side-by-side in Studio, adapt an OpenMotion template, package a reusable Motion Package v0.2, or connect OpenMotion Studio and MCP."
---

# OpenMotion

Turn a reference film, a `Motion.md` template, or a creative brief into an editable HTML/GSAP video project inside the local OpenMotion Visual Studio (React + CodeMirror + Dockview timeline), with preview, version history, BYOK multimodal generation, and MP4 export through the same workspace.

Adapted from `nexu-io/openmotion` (Apache-2.0) as a unified, zero-overlap Master Hub skill (excluding `openmotion-game` to avoid overlap with `ohmygame-studio`).

---

## Connect Once (Studio & MCP Prerequisite)

1. Discover the current host's OpenMotion MCP tools first (`openmotion_*`). If connected, call `openmotion_get_project` to identify the workspace and resume existing work. Preserve existing projects, credentials, and host settings.
2. Installing this Skill alone copies instructions and specifications; it does **not** install the local Studio or connect MCP. When the user wants to run Studio or MCP tools (`openmotion_*`), follow [`docs/install.md`](./docs/install.md):
   - Source checkout (requires Git, npm, Node.js `>=22.18.0`, Chrome/Chromium, FFmpeg/FFprobe; no-LFS clone keeps checkout lightweight):
     ```bash
     git -c filter.lfs.process= -c filter.lfs.smudge= -c filter.lfs.required=false clone --depth 1 --single-branch --branch main https://github.com/nexu-io/openmotion.git
     cd openmotion && npm ci && npm run build:studio && npm start
     ```
   - Local stdio MCP entry: `node --experimental-strip-types /absolute/path/to/openmotion/mcp.ts` with `MOTION_DATA_DIR` pointing outside the checkout.
3. Installation alone does not trigger a film build, export, or paid BYOK generation.

---

## Specialist Workflows (Progressive Disclosure)

Load **only** the matching specialist workflow (from local `workflows/` or via MCP `resources/read`):

| User Intent | Local Workflow File | MCP Resource |
| :--- | :--- | :--- |
| Reverse-engineer a reference video into `Motion.md` & rebuild/compare side-by-side | [`workflows/recreate/SKILL.md`](./workflows/recreate/SKILL.md) | `openmotion://workflow/recreate/start` |
| Browse or adapt one of 300+ editable `Motion.md` templates | [`workflows/template-to-video/SKILL.md`](./workflows/template-to-video/SKILL.md) | `openmotion://workflow/template/start` |
| Direct an original brand film (narrative, motion, sound, creative review) | [`workflows/director/SKILL.md`](./workflows/director/SKILL.md) | `openmotion://workflow/director/start` |
| Package a project into a portable reusable template / Motion Package v0.2 | [`workflows/video-to-template/SKILL.md`](./workflows/video-to-template/SKILL.md) | `openmotion://workflow/video-to-template/start` |
| Scoped timeline edits, Studio preview, checks, troubleshooting, HyperFrames ZIP import, or MP4 export | [`workflows/production/SKILL.md`](./workflows/production/SKILL.md) | `openmotion://workflow/production/start` |
| Generate/poll/inspect BYOK image, video, speech, or music assets (`openmotion_media_use`, `openmotion_assets_use`) | [`workflows/media/SKILL.md`](./workflows/media/SKILL.md) | `openmotion://workflow/media/start` |

---

## Bundled Specifications & Guides (`docs/`)

| Topic | File |
| :--- | :--- |
| `Motion.md` format (shot order, timing, transitions, Brand Kit section) | [`docs/motion-md.md`](./docs/motion-md.md) |
| Motion Package v0.2 portable specification | [`docs/motion-package-spec.md`](./docs/motion-package-spec.md) |
| Public MCP tool contract (`openmotion_*`) | [`docs/mcp-phase1-tools.md`](./docs/mcp-phase1-tools.md) |
| BYOK Model Gateway (fal.ai, Atlas Cloud, Codex Image, Suno, Seedance, Eleven v4) | [`docs/model-gateway.md`](./docs/model-gateway.md) |
| HyperFrames composition engine & ZIP import notes | [`docs/hyperframes.md`](./docs/hyperframes.md) |
| Local Studio & MCP source installation guide | [`docs/install.md`](./docs/install.md) |

---

## Zero-Overlap Role Boundary (Agentic AI Media Suite)

- Use **`openmotion`** for Visual Timeline Studio editing (CapCut/Claude Motion alternative), `Motion.md` shot-by-shot brand-film recreation, 300+ online/local `Motion.md` templates, Motion Package v0.2 authoring, BYOK multimodal gateway generation, and importing HyperFrames ZIP projects into a visual editor.
- Use **`showtime`** for 100% offline/local video creation with zero cloud API keys (local Kokoro/Piper/Supertonic TTS, PR/release/recap/repro developer videos, Manim math, CSV/PDF data stories, audio-synced `xray`, interactive quiz HTML).
- Use **`hypit`** for word-anchored SVML viral UGC/ad cloning & multi-variant factories (tierboard, podcast split-screen, street interview).
- Use **`herk-edit-kit` + `hyperframes`** for real camera / talking-head post-production (`cut-silences`, review-gated `cut-mistakes`, Reels/Shorts 9:16, long-form storytelling, BPM-locked showreels).
- Use **`motlab` + `motlab-assets`** for pure HTML `<canvas>` code-as-video (zero AI video generation), frame-by-frame markup review (`selection.json`), reusable asset kits, and fast 4K WebCodecs exports.
- Use **`motionmaxxing`** for senior motion art direction, measured timing curves, and Mog Check anti-slop critique.
- Use **`ohmygame-studio`** for AI Game Studio projects, multiplayer rooms, and `game_use` playtesting.
- **BYOK Spending Guardrail**: Never invoke paid BYOK model generation (fal.ai, Atlas Cloud, Suno, ElevenLabs, Seedance) without explicit user confirmation; local HTML/GSAP authoring with user-supplied footage, images, and audio requires zero API charges.
