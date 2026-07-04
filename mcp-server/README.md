# WordComb MCP Server

Exposes the WordComb combination engine as a remote MCP server over SSE — any AI agent can connect to it over the internet.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/sse` | SSE connection — AI connects here |
| `POST` | `/messages?sessionId=...` | AI sends tool calls here |
| `GET` | `/health` | Health check for Railway |

## Tools

| Tool | Description |
|------|-------------|
| `generate_combinations` | Generate all permutations of characters at a given length |
| `count_combinations` | Count permutations instantly without generating |
| `check_word` | Check if a single word exists in EN or AR dictionary |
| `batch_check_words` | Check up to 50 words at once |

---

## Deploy to Railway

### 1. Push `mcp-server/` as its own repo (or subfolder)

```bash
cd mcp-server
git init
git remote add origin https://github.com/Yossof0/wordcomb-mcp.git
git add .
git commit -m "Initial MCP server"
git push -u origin main
```

### 2. Create a new Railway project

- Go to [railway.app](https://railway.app)
- New Project → Deploy from GitHub repo → select your repo
- Railway auto-detects `railway.json` and runs `npm run build && npm start`
- Set the `PORT` env variable if needed (Railway injects it automatically)

### 3. Get your public URL

Railway gives you a URL like `https://wordcomb-mcp-production.up.railway.app`

---

## Connect to Claude Desktop

Edit `claude_desktop_config.json`:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "wordcomb": {
      "type": "sse",
      "url": "https://your-app.up.railway.app/sse"
    }
  }
}
```

Restart Claude Desktop — WordComb tools appear automatically.

---

## Local dev

```bash
npm install
npm run dev
# Server on http://localhost:3000
```

## Example prompts once connected

> "Generate all 3-letter combinations of A, B, C, D, E"

> "How many combinations can you make from S, T, A, R using all 4 letters?"

> "Generate combinations of 1, 2, 3 then check which are real English words"

> "من كلمات ع، ل، م — ما التوليفات الممكنة من 3 حروف؟"
