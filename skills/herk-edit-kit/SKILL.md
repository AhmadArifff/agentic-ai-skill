---
name: herk-edit-kit
description: "Post-production video editing suite for real camera / talking-head footage, Reels/YouTube Shorts (9:16), long-form visual storytelling, and BPM-locked motion showreels (built on FFmpeg + HyperFrames + GSAP). Covers silence/dead-air cutting (cut-silences), review-gated spoken mistake/stutter/retake removal (cut-mistakes), end-to-end footage editing (edit-video), short-form reels with caption/footage validators (short-form-edit), persistent-world storytelling (video-storytelling), and 120-130 BPM beat-grid showreels (motion-showreel). Use when editing real recorded footage, cutting silences or spoken mistakes from a transcript, turning raw video into Reels/Shorts, or building a BPM-locked sizzle showreel."
---

# Herk Edit Kit (Footage Post-Production, Storytelling & BPM Showreel Suite)

Adapted from Nate Herk's `herk-edit-kit` (v2.0) into a clean, zero-overlap modular skill suite for `agentic AI`.

## Zero-Overlap Role Boundary (Video Suite Routing)

Choose the right video skill before starting so workflows never collide:

| Need | Use Skill | Why |
| :--- | :--- | :--- |
| Edit real talking-head footage, cut silences/mistakes, turn raw recording into YouTube or 9:16 Reels/Shorts, or build a 120-130 BPM showreel | **`herk-edit-kit`** (paired with **`hyperframes`**) | Specialized word-level transcript cutting, EDL review, B-roll/caption validators, and beat-grid splicing |
| Build a code-only `<canvas>` promo/explainer with interactive frame-by-frame review notes (`selection.json`), reusable asset kits, and fast 4K WebCodecs render | **`motlab`** + **`motlab-assets`** | Deterministic canvas renderer + visual markup viewer + consistent asset kit |
| Direct brand concept, senior motion art direction, timing curves, and anti-slop critique (`look.py`, `lint.mjs`) | **`motionmaxxing`** | Creative direction, taste judgment, and scripted Mog Check quality gates |
| Build an interactive 3D machine/mechanism cutaway or exploded view simulator | **`teardown`** | Offline single-file Three.js 3D simulator + 60fps video capture |

---

## Sub-Workflow Router (Progressive Disclosure)

Load **only** the specific sub-workflow file needed for the user's request:

1. **Full Long-Form Footage Edit (`edit-video`)**:
   - Read [`workflows/edit-video/SKILL.md`](./workflows/edit-video/SKILL.md)
   - Runs end-to-end: transcription -> silence trimming -> review-gated mistake cuts -> visual storytelling -> HyperFrames motion graphics -> verified render.
2. **Cut Silences / Dead Air (`cut-silences`, Pipeline Agent 1)**:
   - Read [`workflows/cut-silences/SKILL.md`](./workflows/cut-silences/SKILL.md)
   - Script: `node skills/herk-edit-kit/workflows/cut-silences/scripts/cut-silences.mjs`
   - Trims dead air and pauses from a word-level transcript, outputs an EDL + re-timed transcript + optional FFmpeg cut. Never cuts spoken mistakes.
3. **Cut Spoken Mistakes, Stutters & Retakes (`cut-mistakes`, Pipeline Agent 2)**:
   - Read [`workflows/cut-mistakes/SKILL.md`](./workflows/cut-mistakes/SKILL.md)
   - Scripts: `workflows/cut-mistakes/scripts/find-cut-candidates.mjs` & `apply-cuts.mjs`
   - Review-gated: proposes every stutter, repeated word, false start, or retake with context and reason before rendering approved cuts via FFmpeg.
4. **Short-Form Reels & YouTube Shorts 9:16 (`short-form-edit`)**:
   - Read [`workflows/short-form-edit/SKILL.md`](./workflows/short-form-edit/SKILL.md)
   - References: `workflows/short-form-edit/references/` (`curiosity-and-entertainment.md`, `plan-schema.md`, `premium-motion-and-footage.md`, `quality-gates.md`, `reference-analysis.md`)
   - Validators: `workflows/short-form-edit/scripts/validate-plan.mjs` & `validate-footage.mjs`
5. **Long-Form Visual Storytelling (`video-storytelling`)**:
   - Read [`workflows/video-storytelling/SKILL.md`](./workflows/video-storytelling/SKILL.md)
   - References: `workflows/video-storytelling/reference/design-system.md` & `reference/patterns/wall-of-slots/`
   - Persistent world, camera grammar, spotlight rule, spatial open loops, and transcript timing.
6. **BPM-Locked Motion Showreel (`motion-showreel`)**:
   - Read [`workflows/motion-showreel/SKILL.md`](./workflows/motion-showreel/SKILL.md)
   - References: `workflows/motion-showreel/references/` (`chapter-library.md`, `reference-breakdown.md`)
   - Templates: `workflows/motion-showreel/templates/` (`hud.html`, `storyboard.md`)
   - Scripts: `analyze-reference.mjs`, `beatgrid.mjs`, `music-grid.mjs`, `splice-music.mjs`, `sfx.mjs`, `mix.mjs`, `kie.mjs`

---

## Shared Playbooks, Helper Scripts & Templates

* **Playbooks & Guides (`docs/`)**:
  * [`docs/EDITING-PLAYBOOK.md`](./docs/EDITING-PLAYBOOK.md): House editing rules, B-roll, captions, and sound principles.
  * [`docs/MOTION_PHILOSOPHY.md`](./docs/MOTION_PHILOSOPHY.md): Motion and transition vocabulary.
  * [`docs/WORKFLOW.md`](./docs/WORKFLOW.md) & [`docs/SHORT-FORM.md`](./docs/SHORT-FORM.md): Step-by-step walkthroughs.
  * [`docs/STORYTELLING-WORKBOOK.md`](./docs/STORYTELLING-WORKBOOK.md): Narrative planning guide.
  * [`docs/TOOLS-AND-API-KEYS.md`](./docs/TOOLS-AND-API-KEYS.md): Optional ElevenLabs Scribe, Whisper, and Kie.ai setup.
* **Cross-Pipeline Scripts (`scripts/`)**:
  * `scripts/transcribe-elevenlabs.mjs` (word-level transcription; requires user's `ELEVENLABS_API_KEY` or swap to local Whisper/supplied transcript)
  * `scripts/video-use-to-hyperframes-transcript.mjs`
  * `scripts/build-edl-review.mjs`
  * `scripts/validate-beat-sync.mjs`
  * `scripts/preflight.mjs`
* **Starter Scene Templates (`templates/`)**:
  * `templates/dark-graph-paper-template/` and `templates/left-glass-popout/` (see [`templates/README.md`](./templates/README.md))

---

## Prerequisites & Guardrails

* **Local requirements**: Node.js 22+, FFmpeg + FFprobe on PATH, Chrome/Chromium, and HyperFrames (`npx hyperframes` via [`../hyperframes/SKILL.md`](../hyperframes/SKILL.md)).
* **Never spend paid API credits silently**: Confirm explicitly with the user before calling ElevenLabs Scribe, ElevenLabs TTS, or Kie.ai. Local FFmpeg cutting, EDL review, Whisper/existing transcripts, and HyperFrames Studio preview require zero paid API keys.
* **Review-Gated Cuts**: Always present proposed mistake cuts (from `cut-mistakes`) or storyboard + beat sheet (from `motion-showreel`) for user confirmation before final rendering.
