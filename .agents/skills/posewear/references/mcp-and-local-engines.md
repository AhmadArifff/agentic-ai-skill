# PoseWear MCP Server, Local Workbench & Local Image Engines

All local runtime commands assume the standalone PoseWear checkout at **`C:\Users\ASUS\posewear`** (Node.js `22.12+`, production deps installed via `npm ci --omit=dev`).

---

## 1. Connecting the PoseWear MCP Server (`mcp/server.mjs`)

By default, `mcp/server.mjs` loads the live published catalog index from `https://posewear.pages.dev/` and verifies SHA-256 catalog fingerprints in memory.

### Standard Stdio MCP Config (Claude Desktop / Antigravity / Cursor / Any Stdio Client)
```json
{
  "mcpServers": {
    "posewear": {
      "command": "node",
      "args": ["C:/Users/ASUS/posewear/mcp/server.mjs"]
    }
  }
}
```

### Codex CLI Registration
```bash
codex mcp add posewear -- node "C:/Users/ASUS/posewear/mcp/server.mjs"
```

### Optional Environment Variables for MCP Server
| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `POSEWEAR_CATALOG_URL` | `https://posewear.pages.dev/` | Point to local preview (`http://127.0.0.1:8787/`) or a self-hosted site. |
| `POSEWEAR_ALLOW_ADULT` | Unset (hidden) | Set `1` only if explicitly requested to include adult-tagged entries. |

### Four Registered MCP Tools
| Tool Name | Key Parameters | Returns |
| :--- | :--- | :--- |
| `posewear_list_collections` | `{}` | All 12 collections with `zh`, `en`, `ja` names and visible item counts. |
| `posewear_search_references` | `{ query?, collection?, offset?, limit? }` (`limit` 1-40, default 8) | Ranked matching summaries (`collection`, `id`, `title`, `category`, `angleCount`) + `nextOffset`. |
| `posewear_get_reference` | `{ collection, id, angle?, language? }` (`en` or `zh`) | Exact image URL, available `angles[]` array, formatted prompt, and gallery page URL. |
| `posewear_compose_brief` | `{ references: [{collection, id, angle?}], prompt?, language? }` | Copy-ready `brief` string plus ordered `references: [{label, url}]`. |

---

## 2. Running the Local Web Workbench (`http://127.0.0.1:8787/`)

```powershell
cd C:\Users\ASUS\posewear
npm start
# Open http://127.0.0.1:8787/ (or http://127.0.0.1:8787/#studio for full workbench)
```
- Browsing, favorites, and prompt copying require no account and no API key.
- Favorites, API keys, and generation history stay strictly in your local browser storage / IndexedDB.

---

## 3. Connecting Local Image Generation Engines (Zero Cloud Upload)

### Option A: ComfyUI (`http://127.0.0.1:8188`)
1. Start ComfyUI locally (`127.0.0.1:8188`), then start PoseWear (`npm start`).
2. Open `http://127.0.0.1:8787/#studio`, select provider **ComfyUI**, test connection, and pick an installed checkpoint.
3. For custom multi-reference workflows (character + outfit + pose + expression), export your ComfyUI workflow as API JSON and launch PoseWear with:
   ```powershell
   $env:POSEWEAR_LOCAL_ENGINE="comfyui"
   $env:POSEWEAR_COMFY_WORKFLOW="C:\path\to\workflow-api.json"
   npm start
   ```
   Supported ComfyUI node titles:
   - `PoseWear Prompt`: receives final prompt text.
   - `PoseWear Image 1`, `PoseWear Image 2`, ...: bound in order (character, outfit, pose, expression, extras) to `LoadImage` nodes; count must match submitted references.
   - `PoseWear Output`: output image node.
   - `PoseWear Size` (optional): receives explicit `width` and `height`.
   - `PoseWear Seed` (optional): receives fresh random `seed`.

### Option B: `stable-diffusion.cpp` (`sd-server`, default `http://127.0.0.1:1234`)
```powershell
cd C:\Users\ASUS\posewear
$env:POSEWEAR_LOCAL_ENGINE="sd-cpp"
npm start
```
- Checks models via `/v1/models`; sends multi-reference edits via `/v1/images/edits` (`image[]`) or pure text prompts via `/v1/images/generations`.
- Override the loopback engine port for either ComfyUI or `sd-cpp` via `POSEWEAR_LOCAL_URL`.

---

## 4. Updating `C:\Users\ASUS\posewear`
```powershell
cd C:\Users\ASUS\posewear
git pull
npm ci --omit=dev
```
