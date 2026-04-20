# 模擬客戶資料設計準則（CUS360 Demo）

> 本文件依據台灣金融市場實際情況制定，供開發與演示用途。所有資料均為虛構，不涉及真實個人資訊。

---

## 一、資料架構層面

### 1.1 基本身分資訊

- **必填欄位**：`id`、`name`、`age`、`phone`、`email`、`address`
- **資料規範**：
  - `id`：必須唯一且有序（C001–C999）
  - `name`：使用真實台灣人名，全資料集中不得重複
  - `age`：範圍 18–80 歲，各年齡層應均衡分佈
  - `phone`：格式統一為 `09XX-XXX-XXX`（台灣行動電話 10 碼制）
  - `address`：涵蓋台灣各主要城市（台北市、新北市、台中市、高雄市、桃園市等）
  - `idCard`：格式為 1 個英文字母 + 9 位數字（台灣身分證字號格式）

### 1.2 財務資訊關聯性

**重要原則**：客戶的財務資料應形成完整且前後一致的「財務輪廓」

參考台灣銀行業實際分層標準：

```
VIP 等級 → 可投資資產（AUM） → 月收入 → 消費偏好 → 產品偏好

VVVIP（私人銀行）：    AUM ≥ NT$3,000 萬      → 月收 NT$50–150 萬 → 投資/信託/理財為主
VVIP（財富管理VIP）：  AUM NT$1,000–2,999 萬  → 月收 NT$15–50 萬  → 投資/信用卡並重
VIP（理財優先客戶）：  AUM NT$300–999 萬      → 月收 NT$6–20 萬   → 信用卡/存款/基金並重
Normal（一般客戶）：   AUM NT$300 萬以下      → 月收 NT$3–8 萬    → 一般消費/定存為主
```

> 說明：台灣主要銀行（國泰世華、富邦、中信）的私人銀行門檻通常為可投資資產 NT$3,000 萬以上；財富管理 VIP 門檻為 NT$1,000 萬以上。

### 1.3 VIP 等級與風險一致性

**必須滿足的對應規則**：

| VIP 等級 | 風險等級要求 | 帳戶狀態 |
|----------|------------|--------|
| VVVIP    | 必須為 `low` | 必須為 `active` |
| VVIP     | 通常為 `low`，極少 `medium` | 必須為 `active` |
| VIP      | `low` 或 `medium` | 通常為 `active` |
| Normal   | `medium` 或 `high` | `active` 或 `失效戶` |

---

## 二、產品與偏好設計

### 2.1 產品偏好權重設計

每位客戶應具備 4 個產品偏好欄位，權重須反映其 VIP 等級差異：

```javascript
productPreferences: {
  creditCard: 0.4–0.98,  // 信用卡
  loans:      0.05–0.8,  // 貸款（房貸、信貸）
  deposits:   0.3–0.95,  // 存款（含定存、外幣存款）
  investment: 0.1–0.98   // 投資（基金、ETF、債券、信託）
}
```

**各等級設計原則**：

| VIP 等級 | investment | creditCard | 說明 |
|----------|-----------|-----------|------|
| VVVIP / VVIP | ≥ 0.85 | ≥ 0.75 | 以財富管理與高端卡權益為核心 |
| VIP | 0.5–0.8 | 0.5–0.8 | 均衡分佈，信用卡與基金並重 |
| Normal | 0.1–0.5 | 0.3–0.7 | 偏重基本消費與定存 |

- **避免反向邏輯**：VIP 以上客戶不應出現 `investment < 0.3`
- **台灣特色**：台灣民眾對保險與外幣定存接受度高，可反映於 `deposits` 較高權重

### 2.2 消費類別偏好分佈

```javascript
spendingCategories: {
  dining:        0.4–0.9,   // 餐飲（全客群必有）
  travel:        0.3–0.95,  // 旅遊（高端客戶應偏高）
  groceries:     0.4–0.8,   // 日常民生（均衡分佈）
  entertainment: 0.3–0.7,   // 娛樂
  luxury:        0.1–0.85,  // 精品奢侈品（VIP 以上專有）
  tech:          0.2–0.75,  // 科技產品（台灣科技業比例高）
  healthcare:    0.3–0.7,   // 醫療健康
  education:     0.3–0.9,   // 教育（子女教育投入高為台灣特色）
  overseas:      0.3–0.9    // 海外消費（出國旅遊意圖指標）
}
```

**一致性規則**：
- `travel > 0.7` 且為 VVIP 以上 → 標籤應含「出國旅遊意圖」
- `education > 0.7` 且 age 30–45 → 標籤應含「留學意圖」或「教育金規劃需求」
- `luxury > 0.6` → 必須對應 VIP 以上等級，否則資料不一致

---

## 三、意圖與標籤管理

### 3.1 意圖標籤設計

**台灣市場常見意圖列表**：

| 意圖標籤 | 信心分數範圍 | 觸發條件 |
|---------|-----------|--------|
| 出國旅遊意圖 | 0.65–0.95 | `travel > 0.7` 或近期海外刷卡增加 |
| 信用卡申辦意圖 | 0.50–0.85 | 近期詢問卡片權益或刷卡額度不足 |
| 投資理財意圖 | 0.60–0.95 | `investment > 0.8` 或近期查閱基金/ETF |
| 房貸需求 | 0.40–0.80 | age ≥ 30 且 `deposits > 0.7` |
| 留學意圖 | 0.30–0.75 | `education > 0.7` 且 age 28–45 |
| 信貸需求 | 0.30–0.70 | `loans > 0.65` 且帳戶異常波動 |
| 創業融資需求 | 0.20–0.70 | 自雇者或小企業主標籤 |

**分配邏輯**：
```
IF travel > 0.7  AND vipLevel >= VVIP   → 出國旅遊意圖（0.80–0.95）
IF investment > 0.8                     → 投資理財意圖（0.75–0.95）
IF age >= 30 AND deposits > 0.7         → 房貸需求（0.60–0.80）
IF education > 0.7 AND age IN [28,45]  → 留學意圖（0.50–0.75）
```

### 3.2 結構化標籤系統

`TAG_CATEGORIES` 應涵蓋以下四大維度：

```javascript
{
  "行為洞察": ["高頻交易客戶", "數位通路使用者", "信用卡活躍用戶", "理財產品偏好"],
  "帳戶狀態": ["有效戶", "失效戶", "新開戶", "帳戶提醒", "狀態調整-有效戶"],
  "信用狀態": ["信用良好", "信用狀態觀察", "信用使用偏高", "逾期記錄", "催收中", "呆帳風險"],
  "需求信號": ["升額意願", "換匯需求", "教育金規劃需求", "財富管理需求", "退休規劃"]
}
```

### 3.3 標籤設計規則

每位客戶應有 **2–5 個**標籤，標籤需與 VIP 等級、風險等級相呼應：

```
VVVIP / VVIP 客戶 → 不得含「失效戶」「逾期記錄」「催收中」「呆帳風險」
high 風險客戶     → 必須含「信用狀態觀察」或「逾期記錄」
新開戶客戶        → 應標記「新開戶」「帳戶提醒」
Normal + high 風險 → 可含「失效戶」「催收中」
```

---

## 四、通路偏好與生命週期

### 4.1 通路偏好與客戶特徵對應

```
preferredChannels 應與 lifecycleStage 及年齡相符：

退休族（65+歲）      → ["branch", "phone", "sms"]
高齡熟齡族（55–65歲）→ ["branch", "phone", "email"]
高端財管客           → ["wealth_portal", "email", "phone"]
上班族（30–55歲）    → ["mobile_app", "email", "sms"]
年輕世代（18–30歲）  → ["mobile_app", "sms"]
一般客戶             → ["mobile_app", "branch", "sms"]
```

### 4.2 生命週期階段分佈

應均衡涵蓋各人生階段（參考台灣人口結構）：

| lifecycleStage | 年齡區間 | 典型 VIP 等級 | 建議比例 |
|---------------|--------|------------|--------|
| `young_professional` | 22–34 歲 | Normal / VIP | 20% |
| `young_family` | 28–42 歲 | Normal / VIP | 20% |
| `established_professional` | 35–52 歲 | VIP / VVIP | 20% |
| `affluent` | 40–60 歲 | VVIP / VVVIP | 10% |
| `pre_retirement` | 50–65 歲 | VIP / VVIP | 15% |
| `retired` | 62 歲以上 | Normal / VIP | 10% |
| `debt_management` | 不限 | Normal | 5% |

---

## 五、風險管理

### 5.1 風險等級分佈目標

```
low（低風險）：   40–50%  → 以 VIP/VVIP/VVVIP 為主
medium（中風險）：35–45%  → Normal / VIP 混合
high（高風險）：  10–15%  → Normal 為主，含失效戶
```

> 台灣銀行實務中高風險客戶比例通常在 5–15%，比例過高會影響資料集整體可信度。

### 5.2 riskScore 與 riskLevel 對應規範

`riskScore` 是資料的**唯一權威來源**，`riskLevel` 必須由 `riskScore` 推導，不得獨立設定：

| riskScore | riskLevel | 意義 | 徽章顏色 |
|-----------|-----------|------|--------|
| `"A+"` | `"low"` | 信用優良，無違約紀錄 | 青綠色 |
| `"A"` | `"low"` | 信用良好 | 青綠色 |
| `"B"` | `"medium"` | 信用一般，需持續觀察 | 黃色 |
| `"C"` | `"high"` | 信用異常，有逾期或催收紀錄 | 紅色 |

**設計規則**：
- ✅ 設定 `riskScore` → `riskLevel` 由系統自動推導，禁止手動設定 `riskLevel`
- ✅ VIP/VVIP/VVVIP 客戶 → `riskScore` 只能為 `"A+"` 或 `"A"`
- ✅ `riskScore: "C"` 客戶 → `vipLevel` 不得為 `VVVIP` 或 `VVIP`
- ❌ 禁止 `riskScore: "A"` 但 `riskLevel: "high"` 的矛盾組合

### 5.3 風險等級對應欄位規範

```
riskLevel = "high" 時，必須滿足：
  - accountStatus：可為「失效戶」或「active」（異常觀察中）
  - tags：必須含「信用狀態觀察」或「逾期記錄」其中一項
  - vipLevel：不得為 VVVIP 或 VVIP
  - productPreferences.loans：應 ≤ 0.3（信用額度受限）

riskLevel = "low" 時，必須滿足：
  - accountStatus：必須為「active」
  - vipLevel：通常為 VIP 以上
  - tags：不得含任何信用異常標籤
```

---

## 六、資料一致性檢驗清單

新增或修改客戶資料時，依序確認以下項目：

- [ ] **riskScore 與 riskLevel 一致**：`riskLevel` 必須由 `riskScore` 推導（A+/A→low、B→medium、C→high），不得矛盾
- [ ] **VIP 與風險一致性**：VVVIP 必須 100% 為 `riskScore: A` 以上；VVIP 應 ≥ 90% 為 `riskScore: A` 以上
- [ ] **帳戶 ID 唯一性**：全資料集中 `id`、`idCard`、`creditCard`、`accountNumber` 均不重複
- [ ] **財務合理性**：`monthlyIncome` 與 AUM 比例合理（約 100:1 至 200:1）
- [ ] **產品偏好一致**：`investment` 權重與 VIP 等級正相關
- [ ] **消費與收入一致**：月消費估算應 ≤ 月收入的 60%
- [ ] **意圖與行為一致**：意圖標籤應與 `spendingCategories` 及 `productPreferences` 相符
- [ ] **標籤與等級一致**：`失效戶`、`逾期記錄` 等負向標籤不應出現於高 VIP 客戶
- [ ] **通路與年齡相符**：退休族優先 `branch/phone`；年輕族群優先 `mobile_app`
- [ ] **生命週期與年齡匹配**：`lifecycleStage` 應對應合理年齡區間
- [ ] **帳戶狀態合理性**：`失效戶` 通常應為 Normal 等級且 `riskLevel: high`

---

## 七、多維度覆蓋要求

### 7.1 VIP 等級分佈（以 200 人樣本池為例）

```
VVVIP（私人銀行）：   3–5%   → 6–10 人
VVIP（財富管理VIP）： 8–12%  → 16–24 人
VIP（理財優先）：     20–25% → 40–50 人
Normal（一般客戶）：  60–65% → 120–130 人
```

### 7.2 年齡分佈（200 人）

```
18–25 歲：8%  → 16 人
26–35 歲：25% → 50 人
36–45 歲：25% → 50 人
46–55 歲：20% → 40 人
56–65 歲：15% → 30 人
65 歲以上：7% → 14 人
```

### 7.3 地理分佈（台灣主要城市）

```
台北市：  28–32%（金融與商業中心）
新北市：  16–20%
台中市：  14–18%
桃園市：   8–12%
高雄市：  10–14%
其他縣市： 8–12%（台南、新竹、彰化等）
```

---

## 八、實務建議

### 8.1 資料生成流程

1. **第一步**：決定 VIP 分佈比例 → 確定年齡/生命週期 → 分配城市
2. **第二步**：依 VIP 等級估算 AUM → 推算合理月收入
3. **第三步**：依 age + VIP 設定 `productPreferences` 權重
4. **第四步**：依 `productPreferences` 設定 `spendingCategories`
5. **第五步**：依消費類別確認意圖標籤
6. **第六步**：依 VIP + risk + 行為設定 `tags`
7. **第七步**：逐一核對一致性檢驗清單

### 8.2 常見設計陷阱

- ❌ **陷阱 1**：Normal 客戶的 `investment` 權重 > 0.8 → 應壓低至 0.1–0.5
- ❌ **陷阱 2**：`riskLevel: high` 客戶的 VIP 等級為 VVVIP → 必須更正為 Normal 或 VIP
- ❌ **陷阱 3**：全體客戶月收均低於 NT$5 萬 → 應分化，私人銀行客戶應 NT$50 萬以上
- ❌ **陷阱 4**：意圖分數集中在 0.5 左右 → 應形成 0.3–0.95 的明顯差異
- ❌ **陷阱 5**：`失效戶` 客戶的信用額度仍維持原本高值 → 應相應調低
- ❌ **陷阱 6**：所有客戶有相同的 5 個標籤 → 應依 VIP / risk / 生命週期動態配置
- ❌ **陷阱 7**：同一 ID 段（如 C183–C192）出現重複 → 每次新增客戶群前必須確認 ID 唯一性

### 8.3 最佳實踐

- ✅ 每次新增客戶批次後，執行全資料集 ID 重複性檢查
- ✅ 建立 VIP 等級 → 產品偏好 → 消費類別 → 意圖標籤的標準映射表
- ✅ 每個 VIP 等級定義 2–3 個「典型客戶畫像」作為設計參照
- ✅ 確保高、中、低端客戶資料的比例符合台灣銀行業實際分佈
- ✅ 信用卡號、身分證字號、帳號等識別碼全程維持唯一性

---

## 九、與系統功能的適配

### 9.1 搜尋功能需求

- 客戶姓名應支援中英文混合搜尋（如英文名 `Lin Yi-Jun`）
- `id`、`idCard`、`creditCard`、`accountNumber` 必須全域唯一，支援精確比對
- 快速搜尋應能自動辨識輸入格式（中文 → 姓名；字母+9碼 → 身分證；16碼 → 信用卡）

### 9.2 篩選功能需求

- **VIP 等級篩選**：VVIP 以上樣本至少各 ≥ 15 人以供有意義篩選
- **風險等級篩選**：三個風險等級各至少 ≥ 15 人
- **意圖標籤篩選**：每個主要意圖至少有 8–10 位客戶
- **產品偏好篩選**：各產品類型應覆蓋高、中、低偏好客戶

### 9.3 報表與分析需求

- 高 VIP 客戶的終身價值（LTV）應明顯高於一般客戶
- 風險等級應與逾期率、信用使用率等指標正相關
- 意圖標籤應能預測對應產品的銷售傾向

---

## 十、家庭關係設計規範

### 10.1 婚姻與配偶

- 約 **50%** 的客戶設定為已婚
- 已婚客戶均應有配偶資訊（至少包含姓名）
- 配偶若同為本行客戶，應可點擊進入其 Profile 頁面
- 未在配偶清單中登錄的已婚客戶，以種子值（seed）自動生成對應性別之姓名，確保結果可重現

### 10.2 子女

- 有配偶的客戶中，約 **50%** 有子女
- 有子女的客戶中，約 **30%** 的子女同為本行客戶（可供點擊進入 Profile）
- 互為配偶的本行客戶，**子女資訊應一致**（兩人共用同一組子女，避免資料矛盾）

### 10.3 一致性規則

```
已婚客戶                  → 必須有配偶姓名
配偶為本行客戶            → 兩筆客戶資料必須互相對應（A 的配偶為 B，B 的配偶為 A）
互為配偶的本行客戶有子女  → 雙方子女清單必須完全一致
子女若為本行客戶          → 子女資料中應可回溯到對應父/母客戶
```

---

## 十一、驗證函式範本（新增客戶時使用）

```javascript
const validateCustomerData = (customer) => {
  const issues = [];

  // 基本必填欄位
  if (!customer.id || !customer.name) issues.push("缺少 id 或 name");

  // ID 格式
  if (!/^C\d{3}$/.test(customer.id)) issues.push("id 格式應為 C001–C999");

  // 身分證字號格式
  if (customer.idCard && !/^[A-Z][0-9]{9}$/i.test(customer.idCard)) {
    issues.push("idCard 格式應為 1 英文字母 + 9 數字");
  }

  // riskScore 對應 riskLevel（riskScore 為唯一權威來源）
  if (customer.riskScore === "C" && ["VVVIP", "VVIP"].includes(customer.vipLevel)) {
    issues.push("riskScore C（高風險）不應為 VVVIP 或 VVIP 等級");
  }
  const expectedRiskLevel = { "A+": "low", "A": "low", "B": "medium", "C": "high" }[customer.riskScore];
  if (expectedRiskLevel && customer.riskLevel && customer.riskLevel !== expectedRiskLevel) {
    issues.push(`riskLevel(${customer.riskLevel}) 與 riskScore(${customer.riskScore}) 不一致，應為 ${expectedRiskLevel}`);
  }

  // VIP 與風險一致性（以 riskScore 為準）
  if (customer.vipLevel === "VVVIP" && !["A+", "A"].includes(customer.riskScore)) {
    issues.push(`VVVIP 的 riskScore 應為 A+ 或 A，目前為 ${customer.riskScore}`);
  }
  if (["VVVIP", "VVIP"].includes(customer.vipLevel) && customer.accountStatus !== "active") {
    issues.push(`${customer.vipLevel} 帳戶狀態必須為 active`);
  }

  // 高風險客戶標籤
  if (customer.riskScore === "C") {
    const hasCreditTag = customer.tags?.some(t => /信用|逾期|催收|呆帳/.test(t));
    if (!hasCreditTag) issues.push("riskScore C（高風險）客戶應含信用異常相關標籤");
  }

  // 高風險客戶不得為 VVVIP / VVIP
  if (customer.riskScore === "C" && ["VVVIP", "VVIP"].includes(customer.vipLevel)) {
    issues.push("riskScore C（高風險）不應為 VVVIP 或 VVIP 等級");
  }

  return { valid: issues.length === 0, issues };
};
```

---

## 更新紀錄

| 日期 | 版本 | 說明 |
|------|------|------|
| 2026-04-20 | v1.0 | 初版制定，基於 182 人客戶樣本 |
| 2026-04-21 | v1.1 | 依台灣金融市場實際情況修訂財務門檻；統一繁體中文用語；補充 ID 唯一性警示；新增驗證函式範本 |
| 2026-04-21 | v1.3 | 新增第十章「家庭關係設計規範」：婚姻比例、配偶一致性、子女共用規則 |

