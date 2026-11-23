# Template adaptation, dense outlines and partial previews

Load this guide when mapping a structured multi-section outline onto an editable template, cutting a shorter preview window before the full edit, or pairing those edits with media or voiceover updates. Unchanged template opening/export and simple local copy edits do not load this page.

## Preserve real scenes and choreography

Modify `index.html` and its `data-composition-src` composition files in place, keeping authored scene sections, UI chrome, camera moves, transitions and unchanged element IDs intact. Both repointing `index.html` to a new file and keeping the same `data-composition-src` path while rewriting, deleting or summarizing scenes into a multi-column text-card wall violate template preservation. Listing content dimensions, a multi-section outline or a short preview duration does not authorize discarding the template's layout; only an explicit request to drop the visual structure does.

Apply targeted edits and the pre-save structure check in [shared surgical editing](../../openmotion-production/references/edit.md#大文件原地修改与保存前结构核对) before saving.

## Partial-duration previews (for example "make a 10s preview first")

1. **Keep the full authored composition restorable**: Keep every scene section, animation script and primary composition structure intact. Apply only the requested copy updates, authorized media-slot replacements via [shared material policy](../../openmotion-production/references/materials.md), narration/caption updates via [caption sync](../../openmotion-production/references/sound.md#配音与可编辑字幕协同), and preview-window duration trims.
2. **Trim duration mechanically and record restoration values**: Trim the preview window through root `index.html` durations (root, composition clip, soundtrack and root timeline) plus any full-length media or audio clip durations inside the primary composition; narration-driven scene hold adjustments remain permitted per the narration rules and are recorded alongside the trimmed durations. Record every original duration in the shared continuation record from [shared edit workflow](../../openmotion-production/references/edit.md#让下一轮接着当前结果) (and in `TEMPLATE.md` when delivering a portable copy) so approval restores the full timeline cleanly.
3. **Distinguish hard duration caps from approximate preview targets, and coordinate with narration**:
   - **Approximate target** (for example "make a ~10s preview first"): preview a contiguous window from `0` and stop at the clean native motion/transition boundary nearest the requested length.
   - **Hard cap** (for example "at most 10s" / "≤ 10s"): never exceed the cap; choose the latest clean motion, transition or complete-sentence boundary at or before the cap (or tighten the preview script within scope), and verify no out-of-bounds clip truncation warning remains.
   - **Narration/TTS precedence**: generate TTS **only for the preview window**, never for the unrendered remainder of the outline. Choose a clean ending not earlier than the final preview sentence's completion unless constrained by a hard cap (in which case stop at an earlier complete sentence rather than cutting mid-word), verify final duration, final sentence audio and synced captions, and disclose any abrupt background-music cutoff.
4. **Never flatten an outline into a summary card wall**: Place the user's priority points in the native slots inside the preview window, and briefly explain which native scenes the preview covers and how the remaining outline maps onto later scenes once approved.

## Dense multi-dimension outlines on UI or kinetic templates

Translate structured checklists (pain points, AI actions, integrations, business value, guardrails) into the template's native visual slots — concise kinetic titles, realistic UI panels, sidebar items, typed prompts, workflow nodes, live result tables and planned image or video slots — instead of equal-width parallel text cards.

When talking points exceed the native slots inside the requested window, keep the default cut faithful to the template's visual grammar and ask the user before switching to a multi-chapter explainer or slideshow layout.
