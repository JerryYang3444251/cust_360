# VIP 等級配置系統 - 快速參考指南

## 🎯 核心概念

所有客戶等級相關的信息（標籤、顏色、財務範圍）現已集中管理在 **VIP_TIERS 常量** 中，避免硬編碼和不一致。

## 📍 配置位置

**文件**: `src/CUS360Demo.jsx`  
**行數**: 第 28-105 行

## 🔧 VIP_TIERS 配置結構

```javascript
const VIP_TIERS = {
  VVVIP: {
    key: "VVVIP",                          // 等級鍵值
    label: "VVVIP",                        // 英文標籤
    displayLabel: "VVVIP",                 // 顯示標籤
    chineseLabel: "超級貴賓",               // 中文標籤
    order: 4,                              // 排序順序（1=最低, 4=最高）
    bgColor: "bg-fuchsia-100",             // 背景色 (Tailwind)
    textColor: "text-fuchsia-800",         // 文字色 (Tailwind)
    accentColor: "text-fuchsia-600",       // 重點色 (Tailwind)
    borderColor: "border-fuchsia-300",     // 邊框色 (Tailwind)
    financialRange: {
      min: 5000000,                        // 最小淨資產
      max: 15000000,                       // 最大淨資產
      rangeWidth: 10000000,                // 範圍寬度 (max - min)
    },
  },
  // ... 其他等級配置
};
```

## 🛠️ 可用的工具函數

### 1. 獲取等級列表
```javascript
const getTiersList()
// 返回: 按 order 排序的所有等級配置陣列
// 用途: 遍歷所有等級用
// 例: getTiersList().map(tier => tier.displayLabel)
```

### 2. 獲取特定等級配置
```javascript
const getTierConfig(vipLevel)
// 參數: vipLevel (string) - 等級鍵值，如 "VIP", "VVVIP"
// 返回: 該等級的完整配置物件
// 例: getTierConfig("VVIP").chineseLabel → "特級貴賓"
```

### 3. 獲取 CSS 類名（顏色）
```javascript
const getTierBgClass(vipLevel)
// 參數: vipLevel (string)
// 返回: 背景色和文字色 CSS 類名
// 用途: 直接用於 className 屬性
// 例: className={`px-2 py-1 ${getTierBgClass(customer.vipLevel)}`}
```

### 4. 獲取顯示標籤
```javascript
const getTierDisplayLabel(vipLevel)
// 參數: vipLevel (string)
// 返回: 顯示用的標籤文本
// 例: getTierDisplayLabel("VVVIP") → "VVVIP"
```

### 5. 獲取中文標籤
```javascript
const getTierChineseLabel(vipLevel)
// 參數: vipLevel (string)
// 返回: 中文標籤
// 例: getTierChineseLabel("VVVIP") → "超級貴賓"
```

### 6. 獲取財務範圍
```javascript
const getTierFinancialRange(vipLevel)
// 參數: vipLevel (string)
// 返回: { min, max, rangeWidth } 物件
// 用途: 計算客戶淨資產範圍
// 例: getTierFinancialRange("VIP").min → 800000
```

## 📝 實際使用範例

### 範例 1：顯示客戶等級標籤
```jsx
<span className={`px-2 py-1 rounded-full ${getTierBgClass(customer.vipLevel)}`}>
  {getTierDisplayLabel(customer.vipLevel)}
</span>
```

### 範例 2：渲染等級下拉選單
```jsx
<select>
  <option value="">全部</option>
  {getTiersList().map((tier) => (
    <option key={tier.key} value={tier.key}>
      {tier.displayLabel}
    </option>
  ))}
</select>
```

### 範例 3：計算財務範圍
```javascript
const range = getTierFinancialRange(customer.vipLevel);
const netWorth = Math.round(range.min + (hash % range.rangeWidth));
```

### 範例 4：生成等級分布圖表
```javascript
const tiers = getTiersList().map((t) => t.key);
const labels = {};
getTiersList().forEach((config) => {
  labels[config.key] = config.displayLabel;
});
const counts = tiers.map(
  (t) => mockCustomers.filter((c) => (c.vipLevel || "normal") === t).length
);
```

## 📊 當前等級定義

| 等級 | 中文 | 顏色 | 順序 | 淨資產範圍 |
|------|------|------|------|-----------|
| VVVIP | 超級貴賓 | 粉紅色 🌸 | 4 | ¥5M - ¥15M |
| VVIP | 特級貴賓 | 紫色 💜 | 3 | ¥2M - ¥8M |
| VIP | 貴賓 | 藍色 💙 | 2 | ¥800K - ¥3M |
| normal | 一般客戶 | 灰色 | 1 | ¥200K - ¥1M |

## ✏️ 修改配置示例

### 修改 1：添加新等級
```javascript
const VIP_TIERS = {
  // ... 現有等級
  VVVVIP: {
    key: "VVVVIP",
    label: "VVVVIP",
    displayLabel: "VVVVIP",
    chineseLabel: "至尊貴賓",
    order: 5,  // 最高等級
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    accentColor: "text-yellow-600",
    borderColor: "border-yellow-300",
    financialRange: {
      min: 15000000,
      max: 50000000,
      rangeWidth: 35000000,
    },
  },
};
```

### 修改 2：更改顏色方案
```javascript
// 修改 VVVIP 的紫色為靛藍色
VVVIP: {
  // ...
  bgColor: "bg-indigo-100",      // 改為靛藍背景
  textColor: "text-indigo-800",  // 改為靛藍文字
  // ...
}
```

### 修改 3：調整財務範圍
```javascript
// 提高 VIP 的門檻
VIP: {
  // ...
  financialRange: {
    min: 1000000,      // 改為 ¥1M
    max: 5000000,      // 改為 ¥5M
    rangeWidth: 4000000,
  },
}
```

## 🔍 全局一致性檢查清單

修改配置後，以下地方會自動更新：

- ✅ 儀表板等級分布圖表
- ✅ 客戶搜索結果的等級標籤
- ✅ 客戶詳情頁面的等級顯示
- ✅ 篩選選單的等級選項
- ✅ 財務數據計算
- ✅ 所有其他顯示等級的位置

## ⚠️ 常見錯誤

❌ **不要** 在代碼中硬編碼等級值：
```javascript
// ❌ 錯誤
if (customer.vipLevel === "VVIP") {
  return "bg-purple-100 text-purple-800";
}
```

✅ **應該** 使用工具函數：
```javascript
// ✅ 正確
className={getTierBgClass(customer.vipLevel)}
```

❌ **不要** 在多個地方定義等級列表：
```javascript
// ❌ 錯誤
const tiers1 = ["normal", "VIP", "VVIP", "VVVIP"];
const tiers2 = ["normal", "VIP", "VVIP"];  // 不同步！
```

✅ **應該** 使用 getTiersList()：
```javascript
// ✅ 正確
const tiers = getTiersList().map(t => t.key);
```

## 🚀 最佳實踐

1. **使用工具函數** - 不要直接訪問 VIP_TIERS，除非需要特定屬性
2. **集中管理** - 所有等級相關的邏輯都應該參考配置
3. **保持同步** - 修改等級時同時更新所有相關屬性
4. **註解清楚** - 為新增的等級添加適當的註解
5. **測試驗證** - 修改後運行 `npm run build` 驗證

## 📞 如需幫助

查看 `CONSISTENCY_IMPROVEMENTS.md` 獲取詳細的改進報告和技術背景。
