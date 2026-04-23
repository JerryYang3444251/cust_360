# CUS360 Demo UI — 設計風格規範

> 本文件從原始碼 `src/CUS360Demo.jsx` 掃描提取，作為後續開發的一致性參考。

---

## 1. 設計基調

| 項目 | 說明 |
|------|------|
| 主題色系 | Teal（青綠）為主，Cyan 為輔 |
| 風格 | 企業金融 CRM，扁平 + 輕陰影，清晰層次 |
| 框架 | React + Tailwind CSS |
| 字型 | 系統預設（sans-serif），中文使用繁體 |

---

## 2. 色彩系統

### 2.1 主色（品牌色）

| 用途 | Tailwind class | Hex 近似值 |
|------|---------------|-----------|
| 主要強調、選中狀態 | `teal-500` / `teal-600` | `#14b8a6` / `#0d9488` |
| 淡背景（hover / 展開） | `teal-50` / `teal-100` | `#f0fdfa` / `#ccfbf1` |
| 邊框 | `teal-100` / `teal-200` | |
| 次要主色 | `cyan-400` / `cyan-500` | `#22d3ee` / `#06b6d4` |
| 頁面底色漸層 | `from-teal-50 to-white` | |

### 2.2 客戶等級色（VIP Tier）

| 等級 | 背景 | 文字 | 強調 |
|------|------|------|------|
| VVVIP（超級貴賓） | `bg-fuchsia-100` | `text-fuchsia-800` | `text-fuchsia-600` |
| VVIP（特級貴賓）  | `bg-purple-100`  | `text-purple-800`  | `text-purple-600`  |
| VIP（貴賓）       | `bg-blue-100`    | `text-blue-800`    | `text-blue-600`    |
| 一般              | `bg-gray-100`    | `text-gray-800`    | `text-gray-600`    |

### 2.3 產品類別色

| 類別 | Tailwind class |
|------|---------------|
| 存款  | `bg-teal-100 text-teal-800`  |
| 信用卡 | `bg-blue-100 text-blue-800`  |
| 貸款  | `bg-amber-100 text-amber-800` |
| 財管  | `bg-purple-100 text-purple-800` |

### 2.4 語意色（狀態）

| 語意 | class |
|------|-------|
| 成功 / 正向 | `bg-green-100 text-green-800` |
| 危險 / 刪除 | `bg-red-100 text-red-800` / `bg-red-500 text-white` |
| 資訊 | `bg-blue-600 text-white` |
| 中性 | `bg-gray-100 text-gray-700` |

### 2.5 圖表調色盤（貢獻度、資產配置）

```
["#14b8a6", "#06b6d4", "#34d399", "#0ea5a4", "#7dd3fc"]
```
依序為 teal-500、cyan-500、emerald-400、teal-500 深、sky-300。

---

## 3. 間距與佈局

### 3.1 版面結構

```
THEME_BG (頁面底色)
└── 左側導覽欄  (模組選單)
└── 主要內容區
    ├── CARD          (主層卡片)
    │   └── SUBCARD   (次層卡片)
    └── grid / flex 佈局
```

### 3.2 Layout Tokens

| Token | Tailwind class | 用途 |
|-------|---------------|------|
| `CARD` | `bg-white p-4 rounded-lg shadow` | 主要區塊容器 |
| `SUBCARD` | `bg-white p-3 rounded-md shadow-sm` | 次要區塊、tab 內容 |
| `LEFT_BORDER` | `border-l-4 border-teal-500 pl-3` | 左側強調線 |
| `THEME_BG` | `bg-gradient-to-br from-teal-50 to-white` | 頁面底色 |
| `ACTIVE_BTN_CLASS` | `bg-gradient-to-r from-teal-500/60 to-cyan-400/60 text-white` | 選中按鈕 |

### 3.3 常用間距

| 用途 | class |
|------|-------|
| 卡片內部間距 | `p-4`（CARD）、`p-3`（SUBCARD） |
| 元件垂直堆疊 | `space-y-4`（區塊間）、`space-y-2`（子項） |
| 欄位水平排列 | `gap-2`（小）、`gap-4`（標準）、`gap-5`（寬） |
| 並排兩欄 | `grid grid-cols-2 gap-4` |
| 並排三欄（細節面板） | `grid grid-cols-3 gap-x-4 gap-y-1` |
| 並排四欄（統計列） | `grid grid-cols-4 gap-3` |

---

## 4. 圓角與陰影

| 場合 | class |
|------|-------|
| 主卡片 | `rounded-lg shadow` |
| 次卡片 | `rounded-md shadow-sm` |
| Dashboard 大卡 | `rounded-2xl shadow-md hover:shadow-xl` |
| 徽章 / 計數圓 | `rounded-full` |
| 標籤 / 小碎片 | `rounded` 或 `rounded-sm` |

---

## 5. 字型排版

### 5.1 層級

| 層級 | class | 用途 |
|------|-------|------|
| 頁面標題 | `text-lg font-semibold text-gray-800` | 模組大標 |
| 區塊標題 | `font-bold text-md text-gray-800` | 卡片 h4 |
| 子標題 | `font-medium text-gray-700 text-sm` | L2 樹狀節點 |
| 內文 | `text-sm text-gray-700` | 一般資料 |
| 輔助文字 | `text-xs text-gray-400` / `text-xs text-gray-500` | 標籤、日期、說明 |
| 數字強調 | `font-semibold tabular-nums` | 金額、百分比 |

### 5.2 金額格式

- 台幣：`NT$ {num.toLocaleString()}` 
- 百分比：`{pct}%`，右對齊搭配 `tabular-nums w-9 text-right`

---

## 6. 互動元件

### 6.1 按鈕

| 類型 | class |
|------|-------|
| 主要操作 | `px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700` |
| 資訊操作 | `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700` |
| 成功操作 | `px-4 py-2 bg-green-600 text-white rounded-lg` |
| 危險操作 | `px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600` |
| 選中狀態 | `ACTIVE_BTN_CLASS`（teal→cyan 漸層） |

### 6.2 展開列（Accordion）

- 未展開：`bg-gray-50 hover:bg-gray-100`
- 展開中：`bg-teal-50 border-b border-teal-200`（L1）/ `bg-teal-50/50`（L2）
- 子項選中：`bg-teal-600 text-white`
- 箭頭：純文字 `›`，`transition-transform duration-200`，展開時 `rotate(90deg)`

### 6.3 徽章 / 標籤

| 類型 | class |
|------|-------|
| 等級/類別圓形徽章 | `text-xs px-2 py-0.5 rounded-full font-semibold` + 對應色 |
| 計數圓（數字） | `inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold` |
| 行內標籤 | `text-xs px-1.5 py-0.5 rounded` + 對應色 |

---

## 7. 圖表元件（DonutInteractive）

| 屬性 | 預設值 | 說明 |
|------|--------|------|
| `size` | 96 | SVG 像素尺寸（客戶貢獻度使用 140） |
| `innerRatio` | 0.55 | 中空比例 |
| `colors` | 圖表調色盤 | 各段顏色陣列 |
| `centerText` | null | `{ line1, line2 }` 在圓心顯示兩行文字 |

**SVG 文字置中原則**：使用 `textAnchor="middle"` + `dominantBaseline="middle"`，`x=21`（SVG 圓心），`y` 分別設為 `18.5`（主文字）、`24`（副文字）。

---

## 8. 資料呈現模式

### 8.1 鍵值對列表（Key-Value Row）

```jsx
<div className="flex justify-between border-b pb-1">
  <div className="text-gray-600">標籤</div>
  <div className="font-medium text-right">值</div>
</div>
```

### 8.2 統計卡格（Stats Grid）

```jsx
<div className="bg-gray-50 rounded-lg p-3">
  <div className="text-xs text-gray-500 mb-1">標籤</div>
  <div className="font-semibold text-gray-800 text-sm">值</div>
</div>
```

### 8.3 細節面板（Detail Panel）

```jsx
<div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
  <div className="flex flex-col">
    <span className="text-gray-400">欄位名稱</span>
    <span className="font-medium text-gray-800">值</span>
  </div>
</div>
```

---

## 9. Mock 資料規範

- **禁止** 使用真實公司、品牌、銀行名稱
- 商家名稱：使用描述性虛構名稱（如「順豐便利商店」→「晨風便利商店」）
- 保險公司：使用虛構名稱（大成人壽、豐裕人壽、南峰人壽、中正人壽）
- 聯名卡夥伴：翔泰航空、文薈書店、好家量販、優購電商
- ETF 名稱：TA50 / TA56 / TA88 開頭的虛構代碼
- 所有 mock 資料使用 `seedFromId(customer)` 產生確定性亂數，確保每次渲染相同

---

## 10. 注意事項

1. 所有 **定義在 `CUS360Demo` 之外** 的元件（如 `CustomerProductTree`）的 state 使用 `React.useState`，不 import `useState`
2. Layout token（`CARD`、`SUBCARD` 等）定義在 `CUS360Demo` 函式最頂部，所有子渲染直接引用字串變數
3. 新增卡片：優先使用 `SUBCARD`（tab 內容），`CARD`（獨立模組）
4. 颜色選擇：新功能優先使用 teal/cyan 系；語意色（成功/危險）才使用 green/red
