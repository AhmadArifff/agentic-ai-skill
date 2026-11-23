# Habblaud Security Boundaries, Windows Notes & Troubleshooting

## 1. Privacy & Security Model

- **Zero Credentials Read**: Habblaud never reads passwords, API keys, or OAuth tokens. From `.claude.json` it reads only email, organization, and `/usage` cache; from `~/.codex` it reads only `sessions/`, `archived_sessions/`, and `thread-writer-locks/` (never `auth.json`, `config.toml`, or `shell_snapshots/`).
- **Automatic Secret Masking**: Tokens and secrets matching common patterns (`Bearer`, `-u user:pass`, `TOKEN=`, `sk-...`, `ghp_...`, `AKIA...`, JWTs, URL credentials) are masked as `***` before leaving the server.
- **Strict Local-Only Enforcement**: Terminal streaming, permission decisions, message sending, character editing, room renaming, and World account mutations are enforced at the server boundary (`server/http/guard.ts`):
  - Requires loopback bind (`127.0.0.1` / `localhost`) AND local `Host` header.
  - Exposing `HABBLAUD_HOST=0.0.0.0` or `HABBLAUD_BIND=0.0.0.0` unconditionally turns off terminal, permissions, and messaging.
- **Risk Warning for Active Plugins / PTY**: Any local process able to connect to `http://127.0.0.1:4747` (including unsupervised agents running shell commands) can call `/api/messages` (if `habblaud-mensagens` is installed) or spawn/control sessions (if `HABBLAUD_PTY=1`). Leave both disabled on shared machines or unsupervised setups.
- **Minimal Read-Only Docker Mounts**: Only `<account>/sessions/`, `<account>/projects/`, and `~/.habblaud/usage/` are mounted read-only; container runs unprivileged with read-only rootfs and `no-new-privileges`.
- **Habblaud World Privacy & Anti-Spoofing**:
  - Idle until you explicitly sign up and log in; `HABBLAUD_WORLD=0` disables all routes and UI.
  - Never transmits file paths, project names, prompts, commands, code, cost, model, branch, or Claude account emails (only anonymized daily room code, theme, agent tool/status/appearance, and coarse token bands). Inspect exact last payload via `GET /api/world/last-uplink`.
  - **Hard Rule**: Never alter `shared/world/` or `server/world/` to send synthetic or inflated office telemetry; doing so violates Habblaud World Terms of Use and triggers account suspension.

---

## 2. Windows Operational Notes

- Upstream primarily tests on macOS and Linux, while Node mode (`npm run build && npm start` on Node `22.12+` / `24.x`) runs natively on Windows without Docker.
- `node-pty` is listed under `optionalDependencies`: if native PTY prebuilds are unavailable or `HABBLAUD_PTY` is left off (default), Habblaud cleanly keeps the read-only live terminal active and skips PTY.
- On Windows, set PowerShell environment variables before starting:
  ```powershell
  $env:HABBLAUD_LANG="en"
  $env:HABBLAUD_PORT="4747"
  npm start
  ```
- For custom Claude or Codex folders on Windows:
  ```powershell
  $env:HABBLAUD_CLAUDE_DIRS="$env:USERPROFILE\.claude"
  $env:HABBLAUD_CODEX_DIRS="$env:USERPROFILE\.codex"
  ```
- Legacy `statusline-tap.mjs` runs original commands through Git Bash on Windows, and `HABBLAUD_CODEX_BIN` defaults to `codex.exe`.

---

## 3. Troubleshooting Matrix

| Symptom | First Diagnostic | Resolution |
| :--- | :--- | :--- |
| **Office appears empty** | Open `http://localhost:4747/api/health` and inspect `sources` & `accounts` | Only currently open Claude Code / Codex sessions appear. Use `?mock=1` to verify UI rendering, or set `HABBLAUD_CLAUDE_DIRS` / `HABBLAUD_CODEX_DIRS` if accounts live in custom paths. |
| **Port 4747 already in use** | Check existing Node process or Docker container | Stop the running instance (`npm run docker:down` or terminate old Node server) or run with `HABBLAUD_PORT=4848`. |
| **Terminal button missing or returns 403** | Check `terminal` field in `/api/health` | Ensure `HABBLAUD_HOST` / `HABBLAUD_BIND` is `127.0.0.1`, `HABBLAUD_TERMINAL` is not `0`, and open strictly via `http://localhost:4747` (not LAN IP or proxy host). |
| **Usage shows "no data" or "outdated"** | Run `npm run mod:status` (or `npm run usage:status`) | Trigger one reply in an open session, run `/reload-plugins` in sessions opened before install, or run `/usage` to refresh the cache. |
| **Permission or message box missing** | Check `/api/health` (`permissions`, `messages`) and `npm run mod:status` | Verify `habblaud-permissoes` / `habblaud-mensagens` are installed and enabled, Claude Code is `2.1.287+`, and `"disableAllHooks": true` is not set in `settings.json`. |
| **Codex sessions delayed or missing** | Check startup log & `npm run codex:status` | Fresh Codex CLI sessions appear only after the first message records the project directory. Install and approve hooks in Codex `/hooks` for real-time status. |
| **Server labels show Portuguese unexpectedly** | Check `HABBLAUD_LANG` | Set `HABBLAUD_LANG=en` (Windows PowerShell or Docker `.env`) and restart server; UI language can also be pinned in `Settings > Language`. |
