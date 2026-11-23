# Habblaud HTTP / SSE API & Environment Reference

## 1. Local HTTP & SSE API (`http://127.0.0.1:4747`)

All JSON responses include `nosniff` and `Cross-Origin-Resource-Policy: same-origin` (no CORS). `Host` must be `localhost`, `*.localhost`, an IP, or listed in `HABBLAUD_ALLOWED_HOSTS` (DNS rebinding guard). `POST` / `PUT` / `DELETE` routes require `Content-Type: application/json` and local `Origin` (CSRF guard).

| Route | Method | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/stream` | `GET` | Standard | SSE stream emitting `snapshot`, `feed`, and `notice` events (15 s heartbeat). |
| `/api/snapshot` | `GET` | Standard | Current `OfficeSnapshot` (rooms, agents with last 8 activities, accounts, meta). |
| `/api/agents/:id` | `GET` | Standard | Full `AgentDetail` (up to 200 recent activities, tasks, subagents, stats). |
| `/api/agents/:id/terminal` | `GET` | Local-only | Live SSE (`init` last 500 entries + `append` every 400 ms) of conversation with masked secrets. |
| `/api/agents/:id/character` | `PUT` / `DELETE` | Local-only | Pin `{name, seed, parts}` character to project room (`names.json`), or revert to random. |
| `/api/sessions/recent` | `GET` | Local-only | Last 7 days of sessions across all accounts (up to 150). |
| `/api/sessions/:account/:sessionId/terminal` | `GET` | Local-only | Historical conversation SSE for a past session. |
| `/api/stats?day=YYYY-MM-DD&tz=<IANA>&source=real\|demo` | `GET` | Standard | My Day statistics (working vs waiting time, longest waits, tokens, cost, hourly/project/account charts). |
| `/api/stats/days?tz=<IANA>` | `GET` | Standard | Available days with recorded stats (last 30 days). |
| `/api/timeline/days` | `GET` | Standard | Recorded Day Timelapse days (last 7 days) with byte size and time range. |
| `/api/timeline/:day` | `GET` | Standard | JSONL (`application/x-ndjson`, gzip if accepted) timeline for `YYYY-MM-DD`. |
| `/api/health` | `GET` | Standard | Server version, demo/docker/terminal/permissions/messages flags, detected sources, and account usage status. |
| `/api/demo` | `POST` | Local-only | `{"enabled": true \| false}` toggles simulated agents alongside real sessions. |
| `/api/rooms/rename` | `POST` | Local-only | `{"id": roomId, "name": newName}` persists custom room name in `rooms.json` (empty resets to folder name). |
| `/api/mod/summary?account=&session=` | `GET` | Local-only | Summary for Claude Code `habblaud` mod (active counts + waiting agents excluding caller). |
| `/api/permissions`, `/api/permissions/:id/wait`, `/api/permissions/:id/decision` | `GET` / `POST` | Local-only (+ remote if allowed) | Permission hook registration, 25 s long-poll, and `allow`/`deny`/`terminal`/`answer` decisions. |
| `/api/messages`, `/api/messages/:id`, `/api/mod/inbox`, `/api/mod/inbox/ack` | `GET` / `POST` | Local-only (+ remote if allowed) | Message outbox queue and `habblaud-mensagens` plugin polling/acknowledgment. |
| `/api/codex/events`, `/api/codex/bridge/poll`, `/api/codex/bridge/ack` | `GET` / `POST` | Local-only | Codex hook events and `codex:bridge` message queue polling. |
| `/api/world/*` | `GET` / `POST` | Local-only | Habblaud World account, character, building uplink (`GET /api/world/last-uplink`), and city viewer. Disabled when `HABBLAUD_WORLD=0`. |

---

## 2. Environment Variables (`HABBLAUD_*`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `HABBLAUD_PORT` | `4747` | HTTP listening port (or published host port in Docker). |
| `HABBLAUD_HOST` | `127.0.0.1` | Server bind interface in Node mode. Non-loopback disables terminal, permissions, messages, and character editor. |
| `HABBLAUD_BIND` | `127.0.0.1` | Docker `.env` bind interface. `0.0.0.0` exposes read-only view to LAN and disables interactive features. |
| `HABBLAUD_CLAUDE_DIRS` | Auto-detect | Comma-separated Claude config folders (default scans `~/.claude`, `~/.claude*`, `CLAUDE_CONFIG_DIR`). |
| `HABBLAUD_CODEX_DIRS` | Auto-detect | Comma-separated Codex config folders (default scans `~/.codex*` and `CODEX_HOME`). |
| `HABBLAUD_CODEX` | `1` (on) | Set `0` to disable Codex integration completely. |
| `HABBLAUD_CODEX_BIN` | `codex` (`codex.exe` on Windows) | Binary used to deliver queued messages (`codex queue`). |
| `HABBLAUD_DATA_DIR` | `~/.habblaud` | Storage directory for `names.json`, `rooms.json`, `timeline/`, `stats/`, `usage/`, and `world.json`. |
| `HABBLAUD_USAGE_DIR` | `~/.habblaud/usage` | Directory where mod or statusline tap writes per-account usage JSON. |
| `HABBLAUD_TIMELINE` | `1` (on) | Set `0` to stop recording Day Timelapse snapshots (always on in Docker). |
| `HABBLAUD_DEMO` | `0` (off) | Set `1` to start with demo mode enabled. |
| `HABBLAUD_LANG` | System language (else `pt-BR`) | Server text language (`en`, `pt-BR`, `es`, `fr`). Set `HABBLAUD_LANG=en` for English server activities/logs. |
| `HABBLAUD_ALLOWED_HOSTS` | Empty | Extra hostnames allowed in HTTP `Host` header (e.g. `my-pc.local` or Tailscale `.ts.net`). |
| `HABBLAUD_TERMINAL` | `1` (local only) | Set `0` to permanently disable terminal, permission approvals, messages, and character editor. |
| `HABBLAUD_MENSAGENS` | `1` (with terminal) | Set `0` to disable sending messages from the office while keeping read-only terminal. |
| `HABBLAUD_PTY` | `0` (off) | Opt-in interactive PTY terminal (`node-pty` + `@xterm/headless`) and New Agent spawning (`claude --bg`). |
| `HABBLAUD_CLAUDE_BIN` | `claude` on PATH | Claude Code executable path for PTY / New Agent. |
| `HABBLAUD_REMOTE_ALLOW` | `permissions` | Comma-separated phone-port capabilities: `permissions`, `messages`, `terminal`, `spawn`, or `none`. |
| `HABBLAUD_REMOTE_PORT` / `HOST` / `TLS_DIR` | `4748` / `0.0.0.0` / `~/.habblaud/remote-tls/server` | Node-mode settings for authenticated HTTPS phone port. |
| `HABBLAUD_UPDATE_CHECK` | `1` (on) | Set `0` to disable 6-hourly anonymous GitHub releases check. |
| `HABBLAUD_ACCOUNTS` | Empty | JSON overrides for account display: `[{"id":".claude-work","name":"Work","short":"W","color":"#5cc97b"}]`. |
| `HABBLAUD_WORLD` | `1` (on, idle until sign-in) | Set `0` to completely disable Habblaud World routes and UI. |
| `HABBLAUD_WORLD_URL` | `https://server.habblaud.com` | World server URL (`https://` or `wss://` only unless `HABBLAUD_WORLD_DEV=1`). |
| `HABBLAUD_WORLD_DEV` | `0` (off) | Set `1` only for local dev World servers (`http://127.0.0.1:<port>` or `http://host.docker.internal:<port>`). |

---

## 3. Useful URL Query Parameters & Keyboard Shortcuts

- **Demo Mode**: `http://localhost:4747/?mock=1&speed=3&sessions=6`
- **Test Time of Day**: `http://localhost:4747/?hora=21:30`
- **World UI Preview (Demo)**: `?mock=1&world=approved&scene=city`
- **Shortcuts**: `/` search, `F` follow selected agent, `T` terminal, `L` timelapse, `M` my day, `P` next permission/question request, `O` or `0` overview, `Esc` clear selection, `[` toggle side panel, `]` toggle activity feed, arrows/WASD pan, `+`/`-` zoom, `?` help.
