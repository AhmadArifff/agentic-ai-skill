# Habblaud Integrations, Plugins, Remote Access & Maintenance

Run all commands below inside the standalone Habblaud installation directory (`C:\Users\ASUS\habblaud`), **only after explicit user confirmation** when modifying Claude Code or Codex configuration files.

---

## 1. Claude Code Mod & Plugins (Claude Code 2.1.287+)

Habblaud ships a local Claude Code marketplace (`.claude-plugin/marketplace.json`) containing three modular plugins under `mod/`:
1. **`habblaud`** (read-only observer): Captures live 5-hour and weekly plan limits to `~/.habblaud/usage/<account>.json`, displays a "needs you" status line for other sessions, and provides `/habblaud`.
2. **`habblaud-permissoes`**: Installs a `PermissionRequest` hook (`permission-hook.mjs`) so you can Approve / Deny / Answer `AskUserQuestion` prompts from the office UI (first answer wins between terminal and office; default 5 min timeout, up to 24 h via `HABBLAUD_PERMISSION_TIMEOUT=86400` in account `settings.json`).
3. **`habblaud-mensagens`**: Polls `/api/mod/inbox` every 2 s and submits messages from the office into the session via `$.prompt.submit({ text, asUser: true })`.

```bash
# Install all three plugins into detected Claude Code accounts (backs up settings.json first)
npm run mod:install

# Optional flags to skip active-control plugins
npm run mod:install -- --sem-permissoes
npm run mod:install -- --sem-mensagens

# Inspect status or validate statically without running
npm run mod:status
claude plugin validate --strict mod/habblaud

# Reload in already-open Claude Code sessions
/reload-plugins
```

### Legacy Installers (Claude Code older than 2.1.287)
```bash
npm run usage:install -- --dry-run   # Preview statusLine tap change
npm run usage:install                # Wraps statusLine.command via scripts/statusline-tap.mjs
npm run hooks:install                # Adds PermissionRequest hook to settings.json
```

---

## 2. OpenAI Codex Integration

Without installing hooks, Habblaud reads `~/.codex/sessions/` and `~/.codex/thread-writer-locks/` passively (activities appear after each completed step). For real-time status and office approvals:
```bash
npm run codex:install     # Adds Habblaud hooks to ~/.codex/hooks.json (with backup)
npm run codex:status      # Verify installation
# Then open Codex and approve the new hooks inside /hooks
```
- **Sending messages to Codex in Docker mode**: Run `npm run codex:bridge` on the host so the container can forward queued messages to local `codex queue`.
- **Custom wait timeout**: `npm run codex:install -- --espera 45` (5 to 120 seconds).

---

## 3. Authenticated Phone Access over HTTPS

Instead of exposing port `4747` on LAN, configure a separate authenticated HTTPS port (`4748` or `443`) backed by a restricted local CA (`~/.habblaud/remote-tls`, only signs `localhost`, `.local`, custom LAN host, and private IPs):
```bash
npm run remote:setup              # Prompts for username, password (stored as scrypt hash), and .local hostname
npm run docker:up                 # Or start Node with HABBLAUD_REMOTE_PORT / TLS_DIR
# Disable later:
npm run remote:setup -- --off
```
- Control phone capabilities via `HABBLAUD_REMOTE_ALLOW=permissions,messages,terminal,spawn` (default `permissions`; interactive PTY never works from phone).
- **Away from home via Tailscale**: Point `tailscale serve --bg --https=443 https+insecure://127.0.0.1:<remote_port>` strictly at the authenticated remote port (never port `4747`), and add `<host>.<tailnet>.ts.net` to `HABBLAUD_ALLOWED_HOSTS`.

---

## 4. Updating & Clean Uninstall

### Updating `C:\Users\ASUS\habblaud`
```powershell
cd C:\Users\ASUS\habblaud
git pull
npm install
npm run build
# If using Claude Code mods in Node mode: npm run mod:install
# If using Docker: npm run docker:up
```

### Clean Uninstall (Run Plugin Uninstalls Before Deleting Folder!)
```bash
npm run mod:uninstall       # Removes marketplace and plugins so Claude Code does not complain
npm run codex:uninstall     # Removes Habblaud hooks from ~/.codex/hooks.json
npm run usage:uninstall     # Only if legacy statusline tap was used
npm run hooks:uninstall     # Only if legacy PermissionRequest hook was used
npm run docker:down         # If using Docker
```
Optional data cleanup: remove `~/.habblaud` (names, rooms, stats, timeline, usage cache) and Docker volume `habblaud_habblaud-data`.
