# 客戶 360 戰情室 — CUS360 Demo

> IBM Demo · Customer Intelligence Platform · React 18 + Vite 5 + Tailwind CSS

---

## 專案說明

單頁 React 應用程式，模擬銀行客戶 360 度視圖戰情室，包含：

- **查詢客戶**：依客戶編號、信用卡號、帳號、姓名查詢，含格式驗證
- **篩選名單**：多條件 VIP / 風險等級 / 標籤群組篩選
- **儀表板**：AUM 趨勢、投資報酬率、客戶分群等圖表
- **客戶詳情**：基本資訊、聯絡資訊、資產配置、關係人、互動紀錄
- **智能小助手**：浮動對話視窗，支援本機生成或接 LLM API
- **權限管理**：主管 / 專員角色切換，敏感資料遮罩控制

---

## 快速啟動

```powershell
# 安裝相依套件
npm install

# 啟動開發伺服器（http://localhost:5173）
npm run dev
```

Demo 帳密：`demo / demo`

---

## 指令一覽

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動 Vite 開發伺服器 |
| `npm run build` | 建置 production 靜態檔到 `dist/` |
| `npm run preview` | 預覽 build 結果（port 5173） |
| `npm run electron:dev` | 以 Electron 桌面模式開發 |
| `npm run electron:build` | 打包 Windows 可攜式執行檔 |

---

## 技術架構

| 層次 | 技術 |
|------|------|
| UI 框架 | React 18（Hooks）|
| 建置工具 | Vite 5.4 |
| 樣式 | Tailwind CSS（utility-first）|
| 圖示 | lucide-react |
| 桌面打包 | Electron 26 + electron-builder |
| 套件管理 | npm / pnpm |

主要檔案：

```
src/
  CUS360Demo.jsx   # 主元件（全部邏輯與 UI，~13K 行）
  main.jsx         # React 入口
  index.css        # 全域樣式
index.html         # Vite HTML 入口
vite.config.js     # Vite 設定（含 Babel compact:false）
electron-main.js   # Electron 主程序
electron-preload.js
```

---

## 敏感資料遮罩

遮罩規則依 SENSITIVE_DATA_GUIDELINES.md，符合個資法 / PCI DSS：

| 資料類型 | 規則 | 範例 |
|----------|------|------|
| 身分證字號 | 保留首碼 + 後 4 碼 | `A*****6789` |
| 信用卡號 | 僅顯示後 4 碼 | `****-****-****-3456` |
| 存款帳號 | 保留前 5 + 後 4 碼數字 | `00001*******9012` |
| 手機號碼 | 保留前 4 + 後 3 碼 | `0912-***-456` |
| 電子郵件 | 保留首字 + 網域 | `j***@example.com` |

主管角色可切換顯示 / 遮罩；專員角色強制遮罩。

---

## 智能小助手 LLM 整合

小助手優先呼叫遠端 LLM，失敗時自動降版為本機啟發式生成器。

### 環境變數設定

複製 `.env.example` 為 `.env`（請勿提交真實金鑰）：

```bash
VITE_LLM_ENDPOINT=https://free.v36.cm/v1/chat/completions
VITE_LLM_API_KEY=sk-XXXXXXXXXXXXXXXX
VITE_LLM_MODEL=gpt-4o-mini
```

修改後重啟 dev server 讓 Vite 讀取環境變數。

### 安全注意事項

- **禁止提交** `.env` 至版本控制
- Production 環境應透過後端 proxy（`/api/llm`）轉發，避免在前端 bundle 暴露金鑰
- 定期輪換 API 金鑰，設定 rate limit

### 後端 Proxy 範例（Node.js / Express）

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
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: 'proxy_failed', detail: String(e) });
  }
});
app.listen(8787);
// 設定 VITE_LLM_ENDPOINT=http://localhost:8787/api/llm
```

---

## 系統需求

- Node.js >= 18
- npm >= 9（或 pnpm）
- Windows（Electron 打包限定）/ 其他平台可跑 Web 模式

---

*© 2026 IBM · Demo 用途，不含真實客戶資料*

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

