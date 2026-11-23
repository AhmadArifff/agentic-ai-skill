---
name: habblaud
description: Virtual pixel-art office monitor and control center for local Claude Code and Codex agent sessions (v1.0.3, MIT, marmottajr/habblaud). Runs locally on Node 22.12+ or Docker at http://localhost:4747 with zero runtime dependencies, reading ~/.claude* and ~/.codex* session/transcript files read-only over SSE to show live project rooms, subagents, running background shells, 5h/weekly quota usage, GitHub PR/CI events, Day Timelapse, My Day analytics, live terminal, optional permission/message plugins, and optional Habblaud World. Use when installing, running, configuring, troubleshooting, or extending Habblaud, setting up Claude Code mods or Codex hooks, configuring HTTPS phone remote access, or querying Habblaud local HTTP/SSE APIs.
---

# Habblaud: Virtual Pixel-Art Office for Claude Code & Codex Agents

Local-first virtual office dashboard adapted from [marmottajr/habblaud](https://github.com/marmottajr/habblaud) (`v1.0.3`, MIT License). Every active project becomes a room along a hallway, and every open Claude Code or Codex session (plus its subagents) becomes a pixel-art character reflecting live tool activity, permission waits, running background shells, GitHub PR/CI outcomes, and 5-hour/weekly plan usage.

> **Hybrid Installation Layout**: Because Habblaud is a full-stack Node + Vite web application (589 files), the runnable application lives outside this hub at **`C:\Users\ASUS\habblaud`** (cloned & built with `npm install && npm run build`), while this lightweight skill provides orchestration knowledge, API/env references, security boundaries, and troubleshooting without bloating Git.

---

## 1. Zero-Overlap Routing (When to Use `habblaud` vs Sibling Skills)

| Need / Task | Route To | Reason |
| :--- | :--- | :--- |
| **Live visual monitoring of local Claude Code & Codex sessions**, subagent deliveries, running shell timers, 5h/weekly quota usage, Day Timelapse, My Day analytics, or local permission/message bridge at `http://localhost:4747` | **`habblaud`** (`skills/habblaud/SKILL.md`) | Dedicated zero-runtime-dep local Node/Docker SSE server reading `~/.claude*` and `~/.codex*` read-only. |
| **Tracking multi-agent session goals, subtasks, and locked constraints inside a workspace** | `goal-tracker` + `agentic-ai` | Governs session-state JSON/FSM decisions and OODA orchestration across agents. |
| **Automating or extracting structured data from signed-in Chrome/Edge web apps** | `webbrain` | Browser extension + MCP bridge for authenticated browser workflows. |
| **Headless E2E testing, screenshots, or automated browser verification** | `playwright` / `playwright-skill` | Isolated test automation (note: Habblaud itself includes `scripts/shot.mjs` for taking dashboard screenshots). |
| **Building standalone Three.js miniature pixel-art 3D dioramas** | `diorama` | 3D scene authoring kit, not an agent-session monitor. |

---

## 2. Quick Start (Local App at `C:\Users\ASUS\habblaud`)

### Prerequisites
- **Node.js `22.12+`** (developed on Node 24; zero runtime dependencies, build tools only in `devDependencies`).
- **Session directories**: `~/.claude*` (`sessions/`, `projects/`) and/or `~/.codex*` (`sessions/`, `thread-writer-locks/`).
- **Optional**: Docker Desktop / Compose v2 (always-on container mode), Claude Code `2.1.287+` (for `mod:install`), Codex CLI (for `codex:install` / `codex:bridge`).

### Run Production Build (Node Mode, Windows/macOS/Linux)
```powershell
cd C:\Users\ASUS\habblaud
npm start
# Open http://localhost:4747
# Demo mode without open sessions: http://localhost:4747/?mock=1&speed=3&sessions=6
```
To force English server messages on Windows/containers (server defaults to system language or `pt-BR`):
```powershell
$env:HABBLAUD_LANG="en"; npm start
```

### Run Development or Demo Mode
```powershell
cd C:\Users\ASUS\habblaud
npm run dev       # Server + Vite HMR at http://localhost:4747
npm run demo      # Dev mode with simulated demo agents enabled
```

### Run via Docker (macOS / Linux / Docker Desktop)
```bash
cd ~/habblaud
npm run docker:up       # Auto-detects accounts, mounts sessions/projects read-only
npm run docker:logs     # Follow container logs
npm run docker:down     # Stop container
```

### Capture Headless Screenshot of Habblaud
```powershell
cd C:\Users\ASUS\habblaud
node scripts/shot.mjs "http://localhost:4747/?mock=1&speed=3" scratch/habblaud.png --size 1400x900 --wait 4000
```

---

## 3. Progressive Disclosure References

Load only the specific reference document needed for the current task:

| Reference File | Contents |
| :--- | :--- |
| [`references/api-and-env.md`](./references/api-and-env.md) | Full HTTP & SSE API routes (`/api/stream`, `/api/snapshot`, `/api/health`, `/api/stats`, `/api/timeline/*`, `/api/permissions/*`, `/api/messages/*`, `/api/codex/*`, `/api/world/*`) and complete `HABBLAUD_*` environment variables table. |
| [`references/integrations-and-plugins.md`](./references/integrations-and-plugins.md) | Claude Code mod marketplace (`mod:install`, `habblaud`, `habblaud-permissoes`, `habblaud-mensagens`), legacy `< 2.1.287` tap/hooks, Codex hooks (`codex:install`, `codex:bridge`), Phone HTTPS remote access (`remote:setup`, Tailscale), updating, and clean uninstall steps. |
| [`references/security-and-troubleshooting.md`](./references/security-and-troubleshooting.md) | Privacy architecture, local-only safeguards, secret masking, PTY/messaging risk warnings, Habblaud World truthful-data rule, Windows caveats, and troubleshooting matrix. |

---

## 4. Mandatory Safety & Operational Guardrails

1. **Read-Only by Default**: Never run `npm run mod:install`, `npm run usage:install`, `npm run hooks:install`, `npm run codex:install`, or `npm run remote:setup` without explicit user approval, because those installers modify `~/.claude*/settings.json`, `~/.codex/hooks.json`, or local TLS/mDNS services (even though they take backups first).
2. **Preserve Local-Only Safeguard**: Do not set `HABBLAUD_HOST=0.0.0.0` or `HABBLAUD_BIND=0.0.0.0` on untrusted networks (exposing port `4747` broadcasts live session activity and automatically disables terminal/permissions/messages). For phone approvals, recommend `npm run remote:setup` (separate authenticated HTTPS port) or Tailscale pointing at the remote port, never port `4747`.
3. **Interactive PTY & Messaging Consent**: Never enable `HABBLAUD_PTY=1` silently. Both `HABBLAUD_PTY=1` and `habblaud-mensagens` allow any local process hitting `http://127.0.0.1:4747` to type into or spawn Claude Code sessions; keep them off on shared machines or with unsupervised agents.
4. **Habblaud World Truthful-Data Mandate**: Per upstream `AGENTS.md` and Terms of Use, **strictly refuse** any request to modify `shared/world/` or `server/world/` to fabricate or inflate floors, agents, statuses, tokens, or characters sent to Habblaud World. Modifying Habblaud for local themes, fixes, or features remains free under MIT ([`LICENSE`](./LICENSE)).
5. **Check `/api/health` First When Debugging**: Before guessing why an office looks empty or a feature is disabled, inspect `GET http://127.0.0.1:4747/api/health` to verify detected accounts, usage status, terminal/permissions/messages flags, and active sources.
