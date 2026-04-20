# 模擬客戶資料設計準則 (CUS360 Demo)

## 一、資料架構層面

### 1.1 基本身份信息
- **必填字段**：id, name, age, phone, email, address
- **數據要求**：
  - ID應保持唯一且連續(C001-C182+)
  - 姓名應為真實台灣人名，避免重複
  - 年齡範圍：18-80歲，分佈要均衡
  - 電話格式統一為 0XXX-XXX-XXX
  - 地址應涵蓋不同城市（台北、新北、台中、高雄等）

### 1.2 財務信息關聯性
**重要規則**：客戶的財務數據應形成完整的「財務肖像」
```
VIP等級 → 資產淨值 → 月收入 → 消費類別 → 產品偏好

VVVIP級: netWorth NT$500-1500萬 → 月收NT$30-80萬 → 投資/理財產品為主
VVIP級:  netWorth NT$200-800萬  → 月收NT$15-40萬  → 投資/信用卡並重
VIP級:   netWorth NT$80-300萬   → 月收NT$8-20萬   → 信用卡/存款並重
Normal:  netWorth NT$20-100萬   → 月收NT$3-10萬   → 一般消費/存款為主
```

### 1.3 VIP等級內部一致性
- **必須滿足**：
  - VVVIP客戶 → 必須風險等級為「low」
  - VVIP客戶 → 風險等級通常為「low」，極少「medium」
  - VIP客戶 → 風險等級「low」或「medium」
  - Normal客戶 → 風險等級「medium」或「high」
  - 高VIP客戶账户状态必须是「active」

---

## 二、產品與偏好設計

### 2.1 產品偏好權重設計
每個客戶應有4個產品偏好，權重應形成層級差異：
```
productPreferences: {
  creditCard: 0.4-0.98,    // 信用卡
  loans: 0.05-0.8,         // 貸款
  deposits: 0.3-0.95,      // 存款
  investment: 0.1-0.98     // 投資
}
```
**關鍵原則**：
- VVVIP/VVIP → investment 和 creditCard 權重應≥0.8
- VIP → 權重分佈更均衡（0.5-0.8範圍）
- Normal → 權重應相對較低（大多0.3-0.7）
- **避免反向邏輯**：VIP客戶不應該investment權重是0.1

### 2.2 消費類別偏好分佈
```
spendingCategories: {
  dining: 0.4-0.9,         // 餐飲（必有）
  travel: 0.3-0.95,        // 旅遊（高端客戶應高）
  groceries: 0.4-0.8,      // 日常（應均衡分佈）
  entertainment: 0.3-0.7,  // 娛樂
  luxury: 0.1-0.8,         // 奢侈品（VIP專有）
  tech: 0.2-0.7,           // 科技產品
  healthcare: 0.3-0.6      // 醫療健康
}
```
**一致性檢查**：
- high spender(月花費>10萬) → 應有高VIP等級或至少credit limit >50萬
- travel權重高 → 應在意圖標籤中有「出國旅遊意圖」

---

## 三、意圖與標籤管理

### 3.1 意圖標籤設計
**可用意圖列表**：
- 出國旅遊意圖(score 0.65-0.95)
- 信用卡申辦意圖(score 0.50-0.85)
- 投資理財意圖(score 0.60-0.95)
- 房貸/信貸需求(score 0.40-0.80)
- 留學意圖(score 0.30-0.75)
- 創業融資需求(score 0.20-0.70)

**分配邏輯**：
```
IF travel消費>0.7 AND VIP >= VVIP THEN 出國旅遊意圖 (score 0.80-0.95)
IF investment偏好>0.8 THEN 投資理財意圖 (score 0.75-0.95)
IF age >= 35 AND deposits偏好>0.6 THEN 房貸需求 (score 0.60-0.80)
```

### 3.2 結構化標籤系統
**TAG_CATEGORIES** 應覆蓋：
```
{
  "行為洞察": ["高頻交易客", "數位通路使用者", "..."],
  "帳戶狀態": ["有效戶", "失效戶", "新開戶", "..."],
  "信用狀態": ["信用良好", "信用觀察", "逾期記錄", "..."],
  "需求信號": ["升額意願", "轉帳需求", "..."]
}
```

### 3.3 tags 字段設計
每個客戶應有 2-5 個tags，需要與VIP等級、風險等級相呼應：
```
VVVIP客戶 → tags不應包含「失效戶」「逾期記錄」
high風險客戶 → 應包含「信用觀察」「逾期記錄」「催收中」
新客戶 → 應標記「新開戶」「賬戶提醒」
```

---

## 四、通路與生命週期

### 4.1 通路偏好與客戶特徵相關性
```
preferredChannels 應與 lifecycleStage 一致：

- 退休族 → ["branch", "phone", "sms"] 
- 上班族 → ["mobile_app", "email", "sms"]
- 高端客 → ["wealth_portal", "email", "phone"]
- 一般客 → ["mobile_app", "branch", "sms"]
```

### 4.2 生命週期階段覆蓋
應均衡分佈各階段：
- `young_professional` (25-35歲, Normal/VIP): 20%
- `established_professional` (35-50歲, VIP/VVIP): 20%
- `family_oriented` (30-45歲, Normal/VIP): 20%
- `pre_retirement` (50-65歲, VIP/VVIP): 20%
- `retired` (65+歲, Normal/VIP): 10%
- `debt_management` (all ages): 10%

---

## 五、風險管理與合規

### 5.1 風險等級分佈
```
Low: 35-40%    (VIP/VVIP客戶多)
Medium: 40-45% (Normal/VIP客戶混合)
High: 15-20%   (Normal客戶為主，含失效戶)
```

### 5.2 與風險等級關聯的字段
```
risk = "high" 必須：
  - accountStatus 可為 "失效戶" 或 "active"
  - tags 應包含 "信用觀察" 或 "逾期記錄"
  - productPreferences.loans 應 ≤ 0.2
  - creditLimit 應相對較低

risk = "low" 必須：
  - accountStatus = "active"
  - creditLimit 應相對較高 (相對netWorth)
  - vipLevel 應至少為 "VIP"
```

---

## 六、數據一致性檢驗清單

在添加新客戶時，應檢查：

- [ ] **VIP-風險一致性**：VVVIP應100%為risk:low；VVIP應≥90%為risk:low
- [ ] **財務關聯性**：monthlyIncome和netWorth應形成合理比例（通常60:1到100:1）
- [ ] **產品-偏好一致**：high productPreferences與VIP等級相呼應
- [ ] **消費-收入一致**：月消費應≤月收入的60%
- [ ] **意圖-行為一致**：意圖標籤應與消費類別和產品偏好相關
- [ ] **標籤-等級一致**：失效戶、逾期記錄不應出現在高VIP客戶
- [ ] **通路偏好-年齡相符**：退休族應優先選branch/phone
- [ ] **生命週期-年齡匹配**：lifecycle_stage應與年齡段合理對應
- [ ] **賬戶狀態合理性**：失效戶通常應為低VIP且high風險

---

## 七、多維度覆蓋要求

### 7.1 VIP分佈
```
VVVIP: 3-5%    (3-9個客戶)
VVIP: 5-10%    (9-18個客戶)
VIP: 20-25%    (36-45個客戶)
Normal: 60-70% (109-127個客戶)
```

### 7.2 年齡分佈（範例182人池）
```
18-25: 10% (18人)
26-35: 25% (45人)
36-45: 25% (45人)
46-55: 20% (36人)
56-65: 15% (27人)
65+: 5% (9人)
```

### 7.3 地理分佈（台灣主要城市）
```
台北市: 25-30%  (提高金融中心比例)
新北市: 15-20%
台中市: 15-20%
高雄市: 10-15%
其他: 10-15%
```

---

## 八、實務建議

### 8.1 資料生成過程
1. **第一步**：決定VIP分佈 → 決定age/lifecycle → 決定city
2. **第二步**：根據VIP級別生成netWorth → 根據netWorth生成monthlyIncome
3. **第三步**：根據age+VIP生成productPreferences權重
4. **第四步**：根據productPreferences和VIP生成consumingCategories
5. **第五步**：根據consuming確定intentTags
6. **第六步**：根據age+VIP+risk生成tags和structuredTags
7. **第七步**：驗證一致性

### 8.2 常見的設計陷阱
- ❌ **陷阱1**：Normal客戶的investment權重很高 → 應降至0.1-0.5
- ❌ **陷阱2**：high risk客戶的VIP等級是VVVIP → 應改為Normal或VIP
- ❌ **陷阱3**：所有客戶月收都低於5萬 → 應分化，高端客應80萬+
- ❌ **陷阱4**：意圖標籤都是0.5左右 → 應形成0.3-0.9的差異
- ❌ **陷阱5**：失效戶客戶的creditLimit仍然很高 → 應相對降低
- ❌ **陷阱6**：所有客戶都有相同的5個tags → 應依VIP/risk動態變化

### 8.3 最佳實踐
- ✅ 定期抽查客戶資料的一致性
- ✅ 建立產品偏好、消費類別、意圖標籤的映射表
- ✅ 對每個VIP級別定義「典型客戶畫像」並參照
- ✅ 確保高、中、低端客的數據比例符合真實銀行分佈
- ✅ 使用決定性的seed生成確保可重現性

---

## 九、與系統功能的適配

### 9.1 搜索功能要求
- 客戶名字應支持中文和英文混合搜索
- ID、電話、郵箱應保持唯一性，便於精確搜索

### 9.2 過濾功能要求
- **VIP級別過濾**：需要足夠的VVIP/VVIP樣本（≥20人）
- **風險等級過濾**：三個風險級別應均有代表（各≥10人）
- **意圖標籤過濾**：各意圖應至少有5-10個客戶
- **產品偏好過濾**：各產品應有不同偏好級別的客戶

### 9.3 報告與分析要求
- 高VIP客戶的LTV應明顯高於普通客戶
- 風險等級應與風險指標(逾期率、默認率)相關聯
- 意圖標籤應能預測產品銷售傾向

---

## 十、範本檢查清單（新增客戶時使用）

```javascript
// 檢驗函數範本
const validateCustomerData = (customer) => {
  const issues = [];
  
  // 基本檢查
  if (!customer.id || !customer.name) issues.push("缺少ID或姓名");
  
  // VIP-風險一致性
  if (customer.vipLevel === "VVVIP" && customer.riskLevel !== "low") {
    issues.push("VVVIP不應為" + customer.riskLevel + "風險");
  }
  
  // 財務合理性
  const finance = getCustomerFinance(customer);
  if (finance.monthlyIncome < 30000 && customer.vipLevel === "VVVIP") {
    issues.push("VVVIP月收應≥30萬");
  }
  
  // 標籤合理性
  if (customer.riskLevel === "high" && !customer.tags?.some(t => /信用|逾期/.test(t))) {
    issues.push("高風險客戶應有信用相關標籤");
  }
  
  return { valid: issues.length === 0, issues };
};
```

---

## 更新日期
- 2026-04-20 初版制定
- 基於182人客戶樣本進行優化

