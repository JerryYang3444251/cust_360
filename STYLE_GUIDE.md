# CUS360 Demo UI — 設計風格規範

> 本文件從原始碼 `src/CUS360Demo.jsx` 掃描提取，並依實際開發決策持續更新。
> 設計師 / 開發者新增功能前，請先確認適用的模式區段（共用 / 單頁 / 分頁）。

---

## 目錄

- [0. 模式說明](#0-模式說明)
- [1. 設計基調](#1-設計基調)
- [2. 色彩系統](#2-色彩系統)
- [3. 間距與佈局（共用）](#3-間距與佈局共用)
- [4. 圓角與陰影（共用）](#4-圓角與陰影共用)
- [5. 字型排版（共用）](#5-字型排版共用)
- [6. 互動元件（共用）](#6-互動元件共用)
- [7. 圖表元件（共用）](#7-圖表元件共用)
- [8. 資料呈現模式（共用）](#8-資料呈現模式共用)
- [9. Mock 資料規範（共用）](#9-mock-資料規範共用)
- [10. 個資遮罩規範（共用）](#10-個資遮罩規範共用)
- [11. 動畫規範（共用）](#11-動畫規範共用)
- [12. 單頁模式專屬準則](#12-單頁模式專屬準則)
- [13. 分頁模式專屬準則](#13-分頁模式專屬準則)

---

## 0. 模式說明

本系統提供兩種客戶資料檢視模式，透過右上角切換按鈕選擇：

| 按鈕文字 | 模式識別碼 | 說明 |
|---------|-----------|------|
| **單頁檢視** | `onepage` | 所有資訊一次呈現於同一頁，資訊密度高，適合快速瀏覽 |
| **分頁檢視** | `tabs` | 資訊依類別分頁（基本/財務/業務…），適合深入單一主題 |

> **開發原則**：凡標示「共用」的規範，兩種模式皆須遵守。標示「單頁」或「分頁」者，僅適用於對應模式的 render function（`renderOnePageView` / `renderDetailView`）。

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

> **顏色選擇原則**：新功能優先使用 teal / cyan 系；語意色（成功 / 危險）才使用 green / red。

### 2.5 圖表調色盤（貢獻度、資產配置）

```
["#14b8a6", "#06b6d4", "#34d399", "#0ea5a4", "#7dd3fc"]
```
依序為 teal-500、cyan-500、emerald-400、teal-500 深、sky-300。

---

## 3. 間距與佈局（共用）

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

定義於 `CUS360Demo` 函式最頂部，所有子渲染直接引用字串變數。

| Token | Tailwind class | 用途 |
|-------|---------------|------|
| `CARD` | `bg-white p-4 rounded-lg shadow` | 主要區塊容器 |
| `SUBCARD` | `bg-white p-3 rounded-md shadow-sm` | 次要區塊、tab 內容 |
| `LEFT_BORDER` | `border-l-4 border-teal-500 pl-3` | 左側強調線 |
| `THEME_BG` | `bg-gradient-to-br from-teal-50 to-white` | 頁面底色 |
| `ACTIVE_BTN_CLASS` | `bg-gradient-to-r from-teal-500/60 to-cyan-400/60 text-white` | 選中按鈕 |

> 新增卡片：tab 內容優先使用 `SUBCARD`，獨立模組使用 `CARD`。

### 3.3 常用間距

| 用途 | class |
|------|-------|
| 卡片內部間距 | `p-4`（CARD）、`p-3`（SUBCARD） |
| 元件垂直堆疊 | `space-y-4`（區塊間）、`space-y-2`（子項） |
| 欄位水平排列 | `gap-2`（小）、`gap-4`（標準）、`gap-5`（寬） |
| 並排兩欄 | `grid grid-cols-2 gap-4` |
| 並排三欄（細節面板） | `grid grid-cols-3 gap-x-4 gap-y-1` |
| 並排四欄（統計列） | `grid grid-cols-4 gap-3` |

### 3.4 動態欄數 Grid

當欄數須依資料量決定（如產品分類數不固定），**不使用** hardcode `grid-cols-{n}`，改用 inline style：

```jsx
<div
  className="grid gap-2"
  style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
>
```

> 範例：`CustomerProductTree` 的 `layout="horizontal"` 模式，依 L1 產品類別數動態調整欄數。

---

## 4. 圓角與陰影（共用）

| 場合 | class |
|------|-------|
| 主卡片 | `rounded-lg shadow` |
| 次卡片 | `rounded-md shadow-sm` |
| Dashboard 大卡 | `rounded-2xl shadow-md hover:shadow-xl` |
| 徽章 / 計數圓 | `rounded-full` |
| 標籤 / 小碎片 | `rounded` 或 `rounded-sm` |

---

## 5. 字型排版（共用）

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

### 5.3 標籤 whitespace 規則

鍵值對（key-value）列表的 label 側，**無論 compact 或 full 模式**，均須加 `whitespace-nowrap`，防止中文標籤（如「通訊地址」）因容器寬度不足而換行。

```jsx
// compact mode
<div className="text-gray-500 whitespace-nowrap">{d.label}</div>
// full mode
<div className="text-gray-600 whitespace-nowrap">{d.label}</div>
```

---

## 6. 互動元件（共用）

### 6.1 按鈕

| 類型 | class |
|------|-------|
| 主要操作 | `px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700` |
| 資訊操作 | `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700` |
| 成功操作 | `px-4 py-2 bg-green-600 text-white rounded-lg` |
| 危險操作 | `px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600` |
| 選中狀態 | `ACTIVE_BTN_CLASS`（teal→cyan 漸層） |

**模式切換按鈕**（右上角）：

| value | 顯示文字 |
|-------|---------|
| `tabs` | 分頁檢視 |
| `onepage` | 單頁檢視 |

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

### 6.4 意圖卡片（Intent Card）間距規範

行動建議方案區塊內的卡片，使用精簡間距以節省版面：

| 區域 | class |
|------|-------|
| 區塊標題 margin | `mb-1.5` |
| 卡片頂部（意圖名稱列） | `px-2 py-1` |
| 卡片主體（推薦產品） | `px-2 py-1`，label `mb-0` |
| 卡片底部（查看話術列） | `px-2 py-0.5` |

---

## 7. 圖表元件（共用）

### 7.1 DonutInteractive

| 屬性 | 預設值 | 說明 |
|------|--------|------|
| `size` | 96 | SVG 像素尺寸（客戶貢獻度使用 140） |
| `innerRatio` | 0.55 | 中空比例 |
| `colors` | 圖表調色盤 | 各段顏色陣列 |
| `centerText` | null | `{ line1, line2 }` 在圓心顯示兩行文字 |

**SVG 文字置中**：`textAnchor="middle"` + `dominantBaseline="middle"`，`x=21`（圓心），`y` 主文字 `18.5`、副文字 `24`。

### 7.2 SVG 圖表 Padding 常數

| 常數 | 值 | 說明 |
|------|----|------|
| `PAD_LEFT` | `46` | 留給 Y 軸標籤 |
| `PAD_RIGHT` | `8` | 右側留白 |
| `PAD_TOP` | `10` | 頂部留白 |
| `PAD_BOTTOM` | `42` | 留給 X 軸旋轉標籤 |
| X 軸標籤 y 位置 | `CHART_BOTTOM + 26` | 搭配 `rotate(-45)` |

---

## 8. 資料呈現模式（共用）

### 8.1 鍵值對列表（Key-Value Row）

```jsx
// full mode
<div className="flex justify-between border-b pb-1">
  <div className="text-gray-600 whitespace-nowrap">{d.label}</div>
  <div className="font-medium text-right">{val}</div>
</div>

// compact mode（text-xs，用於聯絡資訊等密集欄位）
<div className="flex justify-between border-b border-gray-50 pb-0.5 last:border-0 text-xs">
  <div className="text-gray-500 whitespace-nowrap">{d.label}</div>
  <div className="font-medium text-right">{val}</div>
</div>
```

### 8.2 統計卡格（Stats Grid）

```jsx
<div className="bg-gray-50 rounded-lg p-3">
  <div className="text-xs text-gray-500 mb-1">標籤</div>
  <div className="font-semibold text-gray-800 text-sm">值</div>
</div>
```

### 8.3 細節面板（Detail Panel，產品展開內容）

```jsx
<div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
  <div className="flex flex-col">
    <span className="text-gray-400">欄位名稱</span>
    <span className="font-medium text-gray-800">值</span>
  </div>
</div>
```

### 8.4 地址多段式呈現

凡 label 含「地址」的欄位，值自動透過 `formatAddr()` 拆分為三行：

| 行 | 樣式 | 內容範例 |
|----|------|---------|
| 1 | `text-gray-400`（輔助色） | `中華民國（台灣）` |
| 2 | 一般內文色 | `台北市信義區` |
| 3 | 一般內文色 | `忠孝東路五段100號8樓` |

Regex 規則：行政區前綴允許 **1～4** 個 CJK 字元（含「北區」等單字首），避免「台中市北區」匹配失敗。

### 8.5 無資料佔位符

```jsx
<div className="flex items-center justify-center py-6">
  <span className="text-sm text-gray-400">無資料</span>
</div>
```

---

## 9. Mock 資料規範（共用）

### 9.1 虛構名稱規範

- **禁止** 使用真實公司、品牌、銀行名稱
- 商家：使用描述性虛構名稱（晨風便利商店、速達外送、文薈書店…）
- 保險公司：大成人壽、豐裕人壽、南峰人壽、中正人壽
- 聯名卡夥伴：翔泰航空、文薈書店、好家量販、優購電商
- ETF 名稱：`TA50` / `TA56` / `TA88` 開頭的虛構代碼

### 9.2 確定性亂數（LCG）

所有 mock 資料使用 `seedFromId(customer)` 作為種子，搭配 **LCG（線性同餘產生器）** 確保均勻分布：

```js
let rng = seedFromId(customer);
const next = () => {
  rng = (rng * 1664525 + 1013904223) & 0x7fffffff;
  return rng;
};
// 使用：next() % range
```

> ❌ **不使用** bit-shift 寫法 `(seed >> i%n) % range`，分布不均且有位元截斷問題。

### 9.3 交易資料生成規範

| 資料集 | 筆數 | 天數範圍 | 呼叫方式 |
|--------|------|----------|---------|
| 近一個月轉帳明細 | 20 | 30 天 | `generateRecentTransfers(c, 20, 30)` |
| 近三個月轉帳（合計用） | 60 | 90 天 | `generateRecentTransfers(c, 60, 90)` |
| 近一個月信用卡授權 | 25 | 30 天 | `generateRecentCardAuths(c, 25, 30)` |

- 產出依時間降冪排列（最新在前）
- 內部使用 `_ts` 排序後，最終 `map` 移除該欄位再回傳

---

## 10. 個資遮罩規範（共用）

### 10.1 自動遮罩（renderSection）

`renderSection` 內的 `maskValue(label, value)` 依 label 自動判斷遮罩類型：

| label 關鍵字 | 遮罩規則 | 範例 |
|-------------|---------|------|
| 郵件 / email | `maskEmail` | `w***@example.com` |
| 手機 / 電話 | `maskPhone` | `0912-***-678` |
| 地址 | `maskAddress`（數字替換為 `*`） | `忠孝東路***號***樓` |
| 證件號 / 身分證 | `maskId`（首碼 + `*****` + 後4碼） | `A*****5239` |
| 帳號 | `maskAccount`（前5 + 後4，中間 `*`） | `00001*****9012` |
| 信用卡 | `maskCard`（`**** **** **** XXXX`） | `**** **** **** 6789` |

### 10.2 module scope 元件的遮罩處理

定義在 `CUS360Demo` 函式之外的元件（如 `CustomerProductTree`）無法存取內部的 `maskValue`。解法：

1. 在 module scope 定義獨立 helper（如 `maskAcctNum`）
2. 透過 `masked` prop 傳入開關，由元件自行套用

```jsx
// 呼叫端傳入 prop
<CustomerProductTree products={allProds} masked={showMaskedData} />

// 元件內部
const displayVal = masked && isAcct ? maskAcctNum(d.value) : d.value;
```

> 信用卡號（`卡號` label）已在資料生成時預遮罩為 `**** **** **** XXXX`，元件內不須二次處理。

---

## 11. 動畫規範（共用）

### 11.1 入場動畫參數

| 參數 | 值 | 說明 |
|------|----|------|
| 時長 | `700ms` | 所有長條圖入場動畫 |
| 緩動函式 | ease-out cubic：`1 - (1-t)³` | 快入慢出，視覺自然 |
| 驅動方式 | `requestAnimationFrame` 手動計算 `animPct`（0→1） | 避免 CSS transition 與 SVG 相容問題 |

### 11.2 元件定義位置原則

**規則：凡含入場動畫的圖表元件，必須定義在 `CUS360Demo` 之外（module scope）。**

```
✅ 正確：module scope
const MyChart = ({ data }) => { ... };
const CUS360Demo = () => <MyChart data={...} />;

❌ 錯誤：父函式內部定義
const CUS360Demo = () => {
  const MyChart = () => { ... }; // 每次 re-render 都是新型別 → remount → 動畫重播
  return <MyChart />;
};
```

> 同理：定義在 module scope 的元件（如 `CustomerProductTree`）使用 `React.useState`，不 import `useState`。

### 11.3 動畫觸發條件

| 觸發時機 | dependency | 說明 |
|----------|-----------|------|
| 資料改變（切換客戶） | `[dataKey]` | `dataKey` 為資料字串指紋，如 `values.join(",")` |
| 每次 mount 都觸發 | `[]` | module scope 元件 tab 切換不 remount，故 `[]` 不重播 |

已套用元件：`MonthlyBarHover`（`[values.join(",")]`）、`AUMChart`（`[aumKey]`）

### 11.4 長條圖動畫實作模板

```jsx
const MyBarChart = ({ values }) => {
  const dataKey = values.join(",");
  const [animPct, setAnimPct] = React.useState(0);
  const animRef = React.useRef(null);

  React.useEffect(() => {
    setAnimPct(0);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 700, 1);
      setAnimPct(1 - Math.pow(1 - t, 3)); // ease-out cubic
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [dataKey]);

  const barHeight = (v / max) * innerH * animPct; // 乘以 animPct 實現動畫
};
```

---

## 12. 單頁模式專屬準則

> 適用範圍：`renderOnePageView()` 函式內的所有 JSX。

### 12.1 等高欄位佈局（Height-Matching Columns）

當同一 grid row 中，**左欄為固定內容 widget（決定行高）**，**右欄為可捲動列表（需填滿行高）** 時，使用以下 pattern：

```jsx
<div className="grid grid-cols-3 gap-3"> {/* 不加 items-start / items-stretch */}

  {/* 左欄：正常文件流，由內容撐開 row 高度 */}
  <div className={SUBCARD}>
    ...stats widget...
  </div>

  {/* 右欄：relative 包裝 → absolute inset-0 填滿行高 */}
  <div className="relative">
    <div className={`${SUBCARD} absolute inset-0 flex flex-col overflow-hidden`}>
      <h4 className="flex-shrink-0">標題</h4>
      <div className="flex-1 min-h-0 overflow-y-auto">
        ...列表（超出範圍 scroll）...
      </div>
    </div>
  </div>

</div>
```

**注意事項：**
- Grid wrapper **不加** `items-start` 或 `items-stretch`
- 右欄外層 `div` 僅做 `relative` 定位容器，不加任何 SUBCARD 樣式
- 列表容器：`flex-1 min-h-0 overflow-y-auto`（**不用** `max-h-[...]`）

### 12.2 可捲動交易列表（單頁）

```jsx
<div className="flex-1 min-h-0 overflow-y-auto space-y-0 text-xs">
  {items.map((t, i) => (
    <div key={i} className="grid border-b border-gray-50 py-0.5 last:border-0"
         style={{ gridTemplateColumns: '5rem 1fr auto', gap: '0.5rem' }}>
      <span className="text-gray-700 truncate">{t.merchant}</span>
      <span className="text-gray-400 truncate">{t.time}</span>
      <span className="font-medium tabular-nums text-right">{t.amount}</span>
    </div>
  ))}
</div>
```

### 12.3 區塊標題（SecHeader）

單頁模式各大區塊使用 `<SecHeader Icon={...} title="..." />` 統一樣式，不自行實作標題列。

---

## 13. 分頁模式專屬準則

> 適用範圍：`renderDetailView()` 函式內的所有 JSX，包含各 `activeTab` 條件區塊。

### 13.1 可捲動交易列表（分頁）

分頁模式欄位無需跟隨相鄰 widget 高度，使用固定最大高度限制：

```jsx
<div className={SUBCARD}>
  <div className="font-bold text-md mb-2 text-gray-800">近一個月轉帳明細</div>
  <div className="max-h-80 overflow-y-auto space-y-2 text-sm">
    {transfers.map((t, i) => (
      <div key={i} className={SUBCARD}>
        <div className="flex justify-between border-b pb-1">
          <div className="font-medium">{t.merchant}</div>
          <div className="text-right font-medium">{t.amount}</div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{t.time}</div>
      </div>
    ))}
  </div>
</div>
```

> `max-h-80`（320px）為標準值；若列表預期筆數較少可調整。

### 13.2 業務資料計算（分頁）

分頁模式 `activeTab === "business"` 區塊，所有計算需包在**單一 IIFE** 內，確保變數作用域一致：

```jsx
{activeTab === "business" && selectedCustomer && (() => {
  const transfers = generateRecentTransfers(selectedCustomer, 20, 30);
  const transfers3M = generateRecentTransfers(selectedCustomer, 60, 90);
  const transferTotal3M = transfers3M.reduce(...);
  const cards = generateRecentCardAuths(selectedCustomer, 25, 30);
  return (
    <div className="space-y-4">
      ...
    </div>
  );
})()}
```

> ❌ 不要將計算分散在多個內部 IIFE 中，會導致變數在兄弟 JSX 區塊中不可存取（`ReferenceError`）。

### 13.3 統計卡（分頁業務 tab）

分頁模式業務 tab 的統計列使用四欄 grid（比單頁更寬裕）：

```jsx
<div className="grid grid-cols-4 gap-3">
  {stats.map(st => (
    <div key={st.label} className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{st.label}</div>
      <div className="font-semibold text-gray-800 text-sm">{st.value}</div>
    </div>
  ))}
</div>
```

