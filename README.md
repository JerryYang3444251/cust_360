# CUS360 Demo (Vite)

This workspace contains a Vite + React demo for the CUS360 component.

Quick start (PowerShell):

```powershell
# from project root (this folder)
npm install
npm run dev
```

Build for production:

```powershell
npm run build
npm run preview
```

Requirements:
- Node.js >= 16 (recommended >= 18)
- npm

Notes:
- Tailwind is configured via `tailwind.config.cjs` and `postcss.config.cjs`.
- The main component is `src/CUS360Demo.jsx` and entry is `src/main.jsx`.

## Live LLM Integration

The floating 智能對話小助手 can call a live LLM. It first tries the remote endpoint; if unavailable or failing, it falls back to the local heuristic generator.

### 1. Environment Variables

Copy `.env.example` to `.env` and populate values (do NOT commit real keys):

```bash
cp .env.example .env
```

Edit `.env`:

```bash
VITE_LLM_ENDPOINT=https://free.v36.cm/v1/chat/completions
VITE_LLM_API_KEY=sk-XXXXXXXXXXXXXXXX (your key)
VITE_LLM_MODEL=gpt-4o-mini
```

Restart dev server after changes so Vite picks up the vars.

### 2. How It Works

`generateAssistantReply` provides a structured marketing script. When env vars are set, `callLLM()` sends an OpenAI-compatible payload:

```jsonc
{
	"model": "gpt-4o-mini",
	"messages": [
		{ "role": "system", "content": "Banking assistant..." },
		{ "role": "user", "content": "問題: <prompt>\n資料: <customer-json>" }
	],
	"temperature": 0.7
}
```

Response text is appended to the chat. If any error occurs (HTTP or JSON), a local fallback is used.

### 3. Security Guidance

- Do NOT commit `.env` with real secrets.
- For production (web), proxy calls server-side (e.g. `/api/llm`) and omit the key from bundled front‑end code.
- Rotate keys periodically; monitor usage and apply rate limits.
- Electron builds: prefer storing secrets in OS keychain or using a secure preload bridge rather than shipping plain env vars.

### 4. Optional Backend Proxy (Outline)

If you add an Express proxy:

```js
// server/llmProxy.js
import express from 'express';
import fetch from 'node-fetch';
const app = express();
app.use(express.json());
app.post('/api/llm', async (req, res) => {
	try {
		const r = await fetch(process.env.LLM_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.LLM_API_KEY}`,
			},
			body: JSON.stringify(req.body),
		});
		const data = await r.json();
		res.json(data);
	} catch (e) {
		res.status(500).json({ error: 'proxy_failed', detail: String(e) });
	}
});
app.listen(8787, () => console.log('LLM proxy on 8787')); // then set VITE_LLM_ENDPOINT=http://localhost:8787/api/llm
```

### 5. Testing Prompts

Try:
- `給我一段行銷話術建議`
- `提供風險提示`
- `請先摘要再給話術`

### 6. Troubleshooting

- Empty response: Check console for `[Assistant] LLM call failed` warning.
- 401 errors: Verify key validity; ensure no extra spaces.
- CORS issues: Use backend proxy if the endpoint blocks direct browser calls.

