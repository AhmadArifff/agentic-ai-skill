# ReelMimic as a style compiler — design

Status: stages 1–3 are implemented, tested and wired into the production line; the measurable part of stage 4 (agent
outputs checked, not just timestamped) is in; the rest of stage 4 and stage 5 are deliberately not built yet — see
[Decisions](#decisions-what-was-not-built-and-why). [Validation](#validation) says what was measured and what it showed,
including the parts that did not work.

## Why

Today the pipeline is open-loop: an agent writes engine code, another agent looks at screenshots and says whether it is
good. Nothing in the system *understands* what was built, and the only quantity we measure about the reference is one
averaged camera vector per shot plus a label (`push_in / slow`). What makes a reference film land — the shape of a push,
where a cut sits against the beat, how tension builds, holds its breath and hits — is a set of continuous, time-varying
signals, and we measure none of them.

The direction: treat ReelMimic as a **compiler** from a reference film to a new film.

```
reference video ──[1 perception]──▶ Style Fingerprint (time series + fitted curves)
                                          │
brief + plan ─────[LLM planning]───▶ Motion Score IR (typed scene graph, parametric curves, beat-anchored time)
                                          │   ▲
                                          │   └──[3 optimizer] tunes IR parameters against style_distance
                                          ▼
                              [2 backends] HyperFrames · canvas engines · …
                                          ▼
                                 render ──▶ perception again ──▶ feedback
```

## Stages

| # | Stage | What it adds | Where |
|---|---|---|---|
| 1 | **Perception** | Style Fingerprint: per-frame camera trajectory, fitted easing curves, local (in-frame) motion, tension curve with peak shapes, cut-vs-beat phase, colour arc, frame descriptors; `style_distance` between two fingerprints with readable findings | `.claude/skills/video-clone/scripts/perception/` |
| 2 | **Motion Score IR** | A typed scene description: shots, layers, rig references, keyframe tracks whose curves are parametric (bezier / spring / named ease) and whose times are musical (`beat 17 + 2f`). Agents emit and patch IR for camera, timing and easing; engines compile it. Drawing code stays agent-written (IR and free code coexist) | `ir/` (schema + validator), one backend per engine, HyperFrames first |
| 3 | **Closed-loop optimizer** | CMA-ES over IR parameters of the climax shots, objective = `style_distance` to the reference peak, multi-fidelity (low-res proxy renders of key frames → full render to confirm). The LLM decides structure; the optimizer decides numbers | `optimize/` |
| 4 | **Orchestration kernel** | Event-sourced job state (state = fold(events)), a typed task DAG with declared inputs/outputs, schema-validated agent outputs instead of mtime checks, content-addressed caching, one resource-aware scheduler (agent tokens, Chrome, CPU/GPU) instead of three ad-hoc locks | `app/server/kernel/` replacing `jobs.ts` |
| 5 | **Learned critic** | Pairwise preference model over fingerprint features + frame embeddings, trained on reviewer verdicts and user feedback, used to calibrate the LLM critic | later |

Order: perception first (every later stage consumes it), then IR (the largest piece), then the kernel (task types only
settle once the IR exists), then the optimizer and the learned critic.

## Stage 1 — Perception

### Signals

All signals are sampled on one clock (`fps`, default 24) so they line up frame for frame.

| Module | Signal | Method |
|---|---|---|
| `video.py` | frames | ffmpeg → raw BGR pipe at fixed fps and width, streamed (a 3-minute reference never sits in memory) |
| `camera.py` | global motion per frame: `dx, dy` (frame widths), `dz` (log scale), `dr` (radians), camera convention (camera right = +x, push in = +z) | Shi–Tomasi corners → pyramidal Lucas–Kanade with forward–backward check → RANSAC similarity on centred coordinates; low texture falls back to 0 with `ok=false` |
| | local motion energy | median residual of tracked points after removing the global similarity (characters moving vs. the camera moving) |
| | cuts | HSV histogram correlation + mean abs difference, or the cut list from `analyze.py` |
| `curves.py` | per-shot move: active window, amplitude per axis, duration, easing as CSS `cubic-bezier`, damped spring, overshoot, nearest GSAP ease name | least squares on the normalised progress curve (Newton-solved bezier x(s)=u); presets sampled from GSAP's formulas |
| `tension.py` | tension(t) ∈ [0,1] and peak shapes | robust-normalised mix of loudness, spectral flux, camera speed, local motion, cut density and luminance jumps; each peak described by build slope, breath (dip before the hit), rise frames, height, decay |
| `rhythm.py` | cut phase against the beat | signed frame offset to the nearest beat, on-beat ratio (±1 frame), circular mean phase (on the beat vs. on the "and") |
| `look.py` | colour arc | per-frame Lab mean/std and a per-shot Lab histogram |
| `distance.py` | `style_distance` | banded DTW on curves, sliced Wasserstein on Lab histograms, easing curve RMSE, log ratios of durations and amplitudes; every component maps to 0–100 and produces findings in words |

### What real footage taught (each one is handled and tested)

| Problem | Seen on | Handling |
|---|---|---|
| A static overlay (phone UI over a screen recording, watermark, letterbox) votes "the camera did not move" | `20261002-xqmlk`: TikTok UI down the right side | pre-pass at 4 fps: pixels that never change over the clip are masked out of corner detection (`video.static_mask`) |
| A character moving over a plain background is read as the camera moving | a real film: a head tilt over a flat gradient measured as a 2.5° camera roll | two-layer motion: the tracks that agree mark the subject; the background's own motion is measured from corners searched for outside it (faint detail like sparkles counts); with no trackable background, the camera stands still unless moving it explains the background better than not (`camera.background_motion`, `background_says_still`) |
| A burned-in caption is a strip of strong corners that never moves | a real film: a 26 % push on a bowl read as "still" because the caption held still | background tracks only count when they spread over ≥ 15 % of the frame |
| A camera that rests a few frames before a move looked like limited animation | found by rendering through the real engine | a held drawing needs a real change on both sides; the first frame and cuts do not count |
| A move the edit cuts into or out of is fitted as a longer move than the shot | a real reference: a 1.83 s shot showing part of a 3.57 s push | the move's on-screen share is measured (`visible`, `seen`, `cut_off`, `lead_in`); the transfer writes the whole curve and lets our cut interrupt it the same way (`"past_cut": true`) |
| A slow drift down and back up over twelve seconds was called a shake | a real reference shot | a shake must change direction ≥ 1.5 times a second; slower back-and-forth is segmented into moves |
| A shot list a frame off the real cut turns the cut into a huge fake camera move | plan cut at 7.92 s, picture cut one frame later: "14 % pan in one frame" | cuts are always detected; given cuts snap to a detected one within ±3 frames; every fit is **photometrically verified** — warping the previous frame must explain the current one (`camera.photometric_ok`) |
| Limited animation (drawings held for two frames) makes speed a comb: 0, 2v, 0, 2v | the reference: 31 % of moving frames are holds | held runs (≤ 3 frames inside motion) share the step that ends them; the hold ratio itself is reported as **cadence** (on ones / mixed / on twos / on threes) |
| A speed-threshold window clips an ease's slow tail and stretches the shape | power3.out measured as 0.72 s instead of 1.0 s | start, duration, amount, offset and ease are fitted **jointly** on the whole shot: `x(t) = B + A·E(clip((t − t0)/D))` |
| An ease fitted on log-scale is not the ease a builder types | power3.out zoom read as power4.out | zoom eases are fitted on scale (`exp z`), the quantity engines tween |
| One long shot holds several moves | ref shot 3: settle, then a 1.2 s back.in pan | moves are segmented by still stretches; the biggest is the shot's move, the rest are `other_moves` |
| Comparing moves on different axes (a pull-out against a pan) gives nonsense timings | "0.04 s vs 2.10 s" | timing/ease compared only on the same main axis; 1–2-frame moves are `snap` (jump cuts, impact jolts), not eases |

### Files

```
analysis/fingerprint.json   reference fingerprint (written by analyze.py)
analysis/fingerprint.png    tension, camera speed, cuts, beats, peaks on one time axis
out/check/fingerprint.json  our film's fingerprint (written by compare.py)
out/check/style_distance.json   scores per component and per mapped shot, plus findings
out/check/fingerprint_overlay.png   reference vs. ours, tension and camera speed overlaid
```

`fingerprint.json` is versioned (`"version"`); readers ignore fields they do not know.

### How it is used now

- `analyze.py` writes the reference fingerprint; the style and plan prompts can quote fitted eases and peak shapes
  instead of "slow push".
- `compare.py` adds `style_distance.json`; the final critic reads its findings ("s3 vs ref #4: the push is 38% slower
  and eases ≈ power1.out where the reference uses ≈ expo.out") as evidence next to the frames.

### Verification

`scripts/tests/` renders synthetic videos with known camera moves (a textured plate warped by a known similarity on a
known ease, with a cut) and checks that the trajectory, the fitted ease and the cut are recovered; curve fitting, DTW,
tension peaks and beat phase have analytic tests. Run: `python -m pytest .claude/skills/video-clone/scripts/tests`.

## Stage 2 — Motion Score IR

The camera and the timing of every shot as data instead of expressions buried in scene code
(`camBegin(lerp(925, 985, k), …)` with `k = ease(lt / dur)` and hit times typed as literals).

### Layers

```
authored score (build/score/film.json + shots/<id>.json)      ← director (from-ref, then edits), builders (their own shot file)
   │  score/model.py: parse time expressions, normalise eases, check, resolve
   ▼
resolved score (every time in seconds, every move a segment {t0, t1, v0, v1, ease})
   ├── assets/score/score.js   runtime the engines load (canvas kit and HyperFrames Kit share one camera model)
   └── score/runtime.py        the same evaluator in Python — tests/test_score.py runs both and compares
           │
           └── score/predict.py   camera → the trajectory perception would measure → compared with the reference
```

The front end does all parsing and checking, so the JS runtime is only evaluation (≈ 100 lines): the engines cannot
disagree with the tools about what a score means. One file per shot keeps parallel builders from colliding.

### Language

- **Time** (`score/timeexpr.py`): `B12` (beat 12), `S` / `E` (shot start / end), cue names, lengths in `s`, `b` (beats),
  `f` (frames): `"B12-2f"`, `"P1_hit+1b"`, `"S+0.25s"`. An instant has exactly one anchor; a length has none.
- **Camera**: `base {x, y, zoom, rot}` in stage coordinates (1920×1080, x/y = the world point at the frame centre) and
  `moves [{at, dur | until, to | by, ease}]`; zoom `by` multiplies. Moves on one channel run one after the other (a
  spring may be interrupted). `shakes [{at, amp, decay}]` use the kit's stable per-frame noise.
- **Eases**: GSAP names (the same formulas perception fits), `back.out(s)`, `{bezier: [...]}`, `{spring: {omega, zeta}}`,
  `hold`.
- **Tracks**: any other named number a shot animates (a reach, a lean) with the same moves. **Cadence**: 1–4 frames per
  drawing; `Score.held(id, t)` snaps time for limited animation.

Errors carry their place: `shots/S3.json.camera.moves[1]: x is still moving until 4.550s (moves[0]); start at or after it`.

### Motion transfer (`motion_score.py from-ref`)

Each move perception found in the mapped reference shot becomes a score move: same pace in seconds, amount converted
from frame widths to stage pixels at the current zoom, ease = the fitted curve (a GSAP name when it fits within 10 % of
the best model, else the cubic-bezier or spring) with *that model's own* start and duration. A scheduler places the
moves inside our (usually shorter) shot: as near as possible to where they happened, never overlapping, pace kept when
they fit, all compressed by one factor when they do not (recorded as `from_ref.compressed`). Cuts stay where the plan
put them; move starts snap to a beat only when that keeps them in place.

### Render-free prediction (`motion_score.py predict`)

The stage camera maps to perception's camera terms exactly (x += zoom·Δcx/W, z = ln zoom/zoom₀, r = −Δrot), so the
trajectory perception *would* measure is computed from the score and compared with the reference shot by the same
`camera_pair()` used on rendered films. Moves are compared on a model-free window — the curve between 5 % and 95 % of
the travel, read off the best-fitting model at 10× frame resolution — because "flat start + ease" and "later start +
another ease" are the same motion, and a fast move spans only a few frames.

On `20261002-xqmlk`: the delivered film's hand-written camera measures **10.4**; the transferred score predicts
**71.5** before a frame is rendered (73.3 after `optimize`). Across 18 projects see [Validation](#validation).

### Verification

`tests/test_score.py`: time expressions; resolving and its error messages; **the JS and Python runtimes agree** to 1e-9
on a score exercising every ease kind, shakes, tracks and cadence (it caught `%` on negative frame numbers differing
between the languages); **prediction = measurement** (the score's camera is filmed on the synthetic plate and perception
recovers the predicted kinds, amounts, duration and shape); **transfer closes the loop** (reference → measured →
score → predicted ≈ reference, score > 80, no major finding).

## Stage 3 — Closed-loop optimizer

`motion_score.py optimize <project> [--peaks] [--apply]` searches a score for the version closest to the reference,
render-free.

- **Search** (`optimize/cmaes.py`): CMA-ES in the unit box (Hansen's tutorial algorithm, boundary handling by
  projection + penalty), deterministic per seed. Tested on the sphere, Rosenbrock and an optimum outside the box.
- **Space** (`optimize/space.py`): per move its start (± 0.25 s), duration (× 2^±1) and curve (as a cubic-bezier,
  springs as ω, ζ); per shake amplitude and decay. **Amounts are locked** — they are the director's framing intent —
  unless `--tune-amounts`. A point is written back in the author's terms (an unchanged start keeps `B12`, an unchanged
  ease keeps its name) and every changed move records what it was (`"tuned": {"from": …}`).
- **Objective** (`optimize/objective.py`): per shot 100 − camera_pair against the mapped reference shot, read off the
  exact predicted trajectory sampled 10× finer than the frames (no fitting, vectorised evaluation: 1.8 ms an
  evaluation, 50× faster than the first version); plus staying near the author's values; with `--peaks`, the predicted
  tension at each plan peak against the reference peak's shape (one-sided: a deeper breath or a sharper hit than the
  reference costs nothing). Predicted tension is multi-fidelity: the film's own sound, the score's exact camera and
  cuts, in-frame motion from the last render.
- **Groups**: shots are independent for the camera, so each is searched alone; the shots around a plan peak are
  searched together. A group's result is kept only if it beats the author's version.

On `20261002-xqmlk`: 8 s for the whole film; with `--peaks` it proposes an 8 px shake on the chorus downbeat (which
the plan asked for) and moves the predicted climax onto the beat.

### Four ways the optimizer gamed its objective, and the fixes

Each was caught by checking a result some other way than the optimizer's own number.

1. **An invisible shake.** The first `--peaks` run "fixed" the climax with a 1.07 px shake: tension normalised each
   feature to the film's own range, so in a still film 1 px read as strong motion. Fix: just-noticeable floors per
   feature, perceptual dead zones for motion (`tension.JND`, `DEADZONE`), measured-but-constant features kept in the
   mix (dropping them made the weights jump), shakes under 4 px removed. Regression test: a ±1 px jitter changes
   tension by < 0.02, a real whip pan by > 0.08.
2. **Bent eases in a shortened shot.** When the plan makes a shot shorter than the reference's moves, the move must be
   faster — but the duration term compared absolute seconds, so the optimizer bent the curve to stretch its 5–95 %
   window, and a metric it never saw (the camera-speed profile) got worse (0.106 → 0.186). Fix: moves are expected to
   be as much faster as the shot is shorter (`distance.time_available`), the same rule the transfer schedules by.
   After it, that held-out metric improves too (table below).
3. **Curves no measurement describes.** The search reads shapes straight off the exact predicted curve; a rendered
   film is measured through fitted eases. With wide bezier bounds it found curves that score well on the exact curve
   and are unrecognisable once measured (88.8 predicted, 32.8 measured). Fix: eases bounded to readable curves
   (modest overshoot at most), and a **verification gate** — a group's result is kept only if it also wins measured
   the way a rendered film is (`Objective.verified_camera_costs`).
4. **Where in the shot.** Nothing in the comparison saw whether a move happens at the start or at the end of its
   shot; the optimizer moved one, and the held-out speed profile caught it. Fix: a placement term
   (`distance.placement_gap`), its expectation following the transfer's own time mapping.

## Validation

What was checked beyond unit tests, on the 18 projects with a reference and a delivered film (7 distinct references).
The scripts only read projects; results below are with the final code.

| Question | Method | Result |
|---|---|---|
| Does style_distance measure *style*? | split-half retrieval: 12 s windows of each reference find the other half of the same reference among all (balanced: ≤ 4 queries and candidates per reference, mean not max, ties count half) | **style** ranks the own reference **2.35** (chance 4.0): palette 2.12, pace 2.53, rhythm 3.00, frames 3.03; **tension 3.71 and peaks 3.74 ≈ chance** — they describe a stretch's content, not a style, so they only count as *structure* against the mapped window. Pace counts only *visible* camera motion (dead zone): with raw speed it partly measured each file's noise floor; removing that cost little (2.35 → 2.53), so it measures style |
| Do the delivered films (old pipeline) look like their references? | each film against every reference's best-matching window | palette **2.44**: colour was cloned; pace **3.22**, style 3.11: how the films *move* was barely cloned — the gap stages 1–3 target |
| Would following the score close that gap? | counterfactual: each film's measured camera replaced by its transferred score's camera, all else as measured | **per shot, yes**: camera_pair against the mapped reference shot **36.4 → 75.1** (median 24.9 → 83.0) over 202 shots, better in 73 % (the rest equal, mostly still against still). **Whole-film pace, no**: own-reference rank 3.22 → 3.39 — see the next row |
| Why not the whole film? | pace features of the delivered films against the stretch of reference they clone | the plans cut **1.6× as often** as their references' hard cuts (3.8 vs 2.4 per 10 s). First reading: a pacing gap made at planning. A real A/B run corrected it (below): references change scene *inside* their shots, so hard cuts undercount how often their picture changes, and holding a plan to them cost variety. `fingerprint.py plan-check` now only flags plans *slower* than the reference; the plan prompt asks for at least the reference's rate of scene changes (cuts + in-shot transitions) |
| Does the browser runtime do what the tools predict? | the engine kit renders a scene whose camera comes only from `Score.cam` in headless Chrome; perception measures it | camera_pair(measured, predicted) **99.2 / 99.6**; SVG camera = canvas camera to < 0.05 px (`tests/test_engine_render.py`) |
| Does optimizing help a *rendered* film, or only the number? | before/after cameras filmed on the textured plate, measured with full fitting (not the optimizer's path); plus a metric the optimizer never sees (DTW of camera-speed profiles) | from the transferred score (the production path): camera_pair **68.9 → 76.4**, held-out 0.052 → 0.051 (unchanged); from a hand-written camera (every move spread over the shot with a generic ease, as builders write today): **17.4 → 45.2**, held-out 0.105 → 0.124 — better on one shot, equal on one, worse on one whose reference move (already moving at the cut in, then still) cannot keep pace, placement and speed profile at once in a shorter shot. The optimizer proposes; the director applies |
| Do the tools work on projects made before them? | every command of the setup prompt run on a copy of a pre-perception HyperFrames project | yes, after making the reference fingerprint build itself when missing or stale (`ensure_reference`) |
| Cost | analysis adds the fingerprint | ≈ 20–40 s for a 30 s reference, ≈ 2.5 min for a 13 min one; optimize ≈ 8 s per film |

### Real productions (A/B)

The same reference, brief and inputs as two earlier projects, produced again end to end by real agents (Claude Code)
through the app with the new system; the earlier films are the baseline. Times are from `timeline.py`.

| | 30 s party MV (HyperFrames; old film: painted) | 15 s pixel story (pixel-art) |
|---|---|---|
| plan cutting vs reference | 1.12× (old plan 2.22×) | 1.07× |
| camera: the film follows the score? | yes — per shot measured ≈ predicted (S3 73.6 / 79.6, S6 36.8 / 36.8, S7 51.3 / 51.3) | mostly; an iris transition (a screen-space overlay) was read as a still background — see limits |
| measured vs reference | overall 30.2 → 36.4, style 13.9 → 21.0, camera 10.1 → 28.1 | — |
| final critic | 4 rounds, all 13 scores 4/5, both climaxes *beat* the reference | 4 rounds, climax 5/5, variety 5/5, both climaxes beat the reference (old critic had no climax check) |
| by eye | new: a clearer story (Clawd + Mimi), climaxes land; old: more varied compositions — the plan had been held to the reference's hard cuts (14 → 8 shots), the lesson behind the plan-check change | new clearly better: big expressive subject, a real reveal at the climax, a warm ending; old: tiny subject in wide shots |
| approve → done | 167 min (old 160) | 90 min (old 49) |
| where the time went | setup 13 (old 7), cast 19 (41), shots 65 (49), final 46 + one revise round (58) | setup 10 (4), cast 13 (20), shots 23 (33), final 42 (7) |

Production itself got faster on both (cast and shots); setup costs ≈ 6 min more (transfer, prediction, optimization);
the final review is where the time goes — the critic of this branch is much stricter (12 must-fix items in round 1 of
the pixel film against 1 for the old critic) and each round is ≈ 10–15 min. Found in these runs and fixed: a long
reference take mapped to several shots gave each shot the whole take (now each gets its part —
`fingerprint.reference_for`); the final review stopped at 9 → 3 must-fix items with a character still teleporting
(it now continues while the list halves or is ≤ 3); a contradictory finding ("holds still; ours holds still").

Limits: screen-space layers (an iris, a spotlight, a vignette) look like a background that does not move, so a push
behind them can be read as a still camera; and a single critic is still the final judge of quality.


## Decisions: what was not built, and why

- **Stage 4, event-sourced kernel.** Measured first: a `log()` rewrites job.json (≈ 260 KB) in 3.9 ms, and the busiest
  real minute had 82 events — 0.5 % of a core. Rewriting a working, tested orchestrator for that would be change for
  its own sake (main has since moved the event log out of job.json into `logs/events.jsonl`). What stage 4 was for
  that *does* fail in practice is in: agent outputs are checked against the contract (`app/server/contract.ts`), with
  one repair turn in the same conversation — otherwise a critique.json with a trailing comma reads as "nothing to fix"
  and a broken production.json builds nothing; and job.json is written atomically, after a full disk once truncated it
  to 0 bytes and the project could no longer be opened.
- **Stage 5, learned critic.** It needs labelled outcomes — which findings a director acted on, which the user agreed
  with — and there are 18 projects, judged only by an LLM critic. A model trained on that would learn the LLM critic
  and overfit. The data it needs is now produced for every film (`style_distance.json` next to `critique.json` and the
  user's notes); build it when there are a few hundred.
