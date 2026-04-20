// 风险标记定义
const RISK_TAGS = {
  "遺約": "late payment/default",
  "黑名單": "blacklist",
  "法院扣押": "court seizure",
  "逾期": "overdue",
  "催收": "collection",
  "呆帳": "bad debt",
  "展延異常": "unusual extension",
  "警示": "warning",
  "高風險": "high risk",
  "強制": "forced/enforcement"
};

// 基础客户数据
const mockCustomers = [
  {
    id: "C001", name: "王小明", age: 35, vipLevel: "VIP", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["高頻交易客戶", "數位通路使用者"]
  },
  {
    id: "C002", name: "李美華", age: 42, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low",
    accountStatus: "active", tags: ["旅行意圖", "信用卡申辦意圖"]
  },
  {
    id: "C003", name: "陳大偉", age: 28, vipLevel: "normal", riskScore: "B", riskLevel: "medium",
    accountStatus: "active", tags: ["投資理財", "狀態調整-有效戶"]
  },
  {
    id: "C004", name: "張麗娟", age: 51, vipLevel: "VIP", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["理財產品偏好"]
  },
  {
    id: "C005", name: "劉志明", age: 46, vipLevel: "normal", riskScore: "C", riskLevel: "high",
    accountStatus: "失效戶", tags: ["高風險客戶", "失效戶"]
  },
  {
    id: "C006", name: "林小芳", age: 33, vipLevel: "VIP", riskScore: "A", riskLevel: "medium",
    accountStatus: "active", tags: ["數位通路使用者", "狀態調整-有效戶"]
  },
  {
    id: "C007", name: "張杰仁", age: 41, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low",
    accountStatus: "active", tags: ["信用卡活躍用戶"]
  },
  {
    id: "C008", name: "何雅婷", age: 29, vipLevel: "normal", riskScore: "B", riskLevel: "medium",
    accountStatus: "active", tags: ["家庭導向", "狀態調整-有效戶"]
  },
  {
    id: "C009", name: "吳宗憲", age: 58, vipLevel: "VIP", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["投資理財"]
  },
  {
    id: "C010", name: "蔡雅文", age: 64, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low",
    accountStatus: "active", tags: ["重要客戶", "財管客戶註記"]
  },
  {
    id: "C011", name: "林冠哲", age: 39, vipLevel: "VVVIP", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["高資產", "信用卡活躍用戶"]
  },
  {
    id: "C012", name: "周逸軒", age: 45, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low",
    accountStatus: "active", tags: ["都市精英", "高額海外消費", "頻繁商務旅遊", "尊榮權益需求"]
  },
  {
    id: "C013", name: "林佳穎", age: 29, vipLevel: "normal", riskScore: "C", riskLevel: "high",
    accountStatus: "active", tags: ["小資回饋", "電商高頻", "跨平台支付", "最高回饋追求", "高風險客戶"]
  },
  {
    id: "C014", name: "陳育庭", age: 40, vipLevel: "VIP", riskScore: "A", riskLevel: "medium",
    accountStatus: "active", tags: ["家庭生活", "大型分期", "量販消費", "分期零利率需求"]
  },
  {
    id: "C015", name: "郭仁豪", age: 38, vipLevel: "VIP", riskScore: "A", riskLevel: "medium",
    accountStatus: "active", tags: ["房貸需求", "穩定收入", "線上試算偏好", "房貸意圖"]
  },
  {
    id: "C016", name: "曾雅霖", age: 27, vipLevel: "normal", riskScore: "C", riskLevel: "high",
    accountStatus: "active", tags: ["小額信貸", "快速核貸", "資金周轉", "低門檻需求", "高風險客戶", "信貸意圖"]
  },
  {
    id: "C017", name: "許建弘", age: 50, vipLevel: "VVIP", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["企業週轉", "高額度需求", "循環授信", "專人服務偏好"]
  },
  {
    id: "C181", name: "葉庭宇", age: 31, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C182", name: "張昕恩", age: 27, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C183", name: "林柏翰", age: 33, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C184", name: "黃郁庭", age: 29, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C185", name: "吳哲安", age: 36, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C186", name: "陳姿穎", age: 34, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C187", name: "徐庭瑋", age: 30, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C188", name: "羅佳怡", age: 28, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C189", name: "蔡承恩", age: 32, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C190", name: "周雅婷", age: 26, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C191", name: "江柏妍", age: 35, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C192", name: "高予晴", age: 30, vipLevel: "normal", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C193", name: "鄭雅雯", age: 37, vipLevel: "VIP", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C194", name: "羅承翰", age: 42, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
  {
    id: "C195", name: "沈莉媛", age: 35, vipLevel: "VIP", riskScore: "A", riskLevel: "low",
    accountStatus: "active", tags: ["出國旅遊意圖"]
  },
];

// 生成扩展的客户（基于persona）
function expandCustomers(baseCustomers) {
  const basePersonas = [
    { baseId: "C012", prefix: "信用卡-都市精英", count: 5 },
    { baseId: "C013", prefix: "信用卡-都會小資", count: 5 },
    { baseId: "C014", prefix: "信用卡-家庭生活", count: 5 },
    { baseId: "C015", prefix: "房貸買房族", count: 5 },
    { baseId: "C016", prefix: "小資信貸族", count: 5 },
    { baseId: "C017", prefix: "企業主週轉", count: 5 },
  ];

  let expanded = [];
  let nextNum = 196;

  basePersonas.forEach(({ baseId, prefix, count }) => {
    const base = baseCustomers.find(c => c.id === baseId);
    if (!base) return;

    for (let i = 0; i < count - 1; i++) {
      const variant = {
        ...base,
        id: `C${String(nextNum).padStart(3, '0')}`,
        name: base.name + `_v${i + 1}`,
        age: Math.max(22, Math.min(70, base.age + (i % 2 === 0 ? 1 : -1))),
        tags: [...base.tags]
      };
      expanded.push(variant);
      nextNum++;
    }
  });

  return [...baseCustomers, ...expanded];
}

// 执行分析
const allCustomers = expandCustomers(mockCustomers);

console.log(`\n========== 风险数据分析报告 ==========`);
console.log(`总客户数: ${allCustomers.length}\n`);

// 1. 风险等级分布
console.log(`\n1. 风险等级分布统计`);
console.log(`${'='.repeat(50)}`);

const riskCounts = { low: 0, medium: 0, high: 0, unknown: 0 };
const riskByVip = {
  normal: { low: 0, medium: 0, high: 0 },
  VIP: { low: 0, medium: 0, high: 0 },
  VVIP: { low: 0, medium: 0, high: 0 },
  VVVIP: { low: 0, medium: 0, high: 0 }
};

allCustomers.forEach(c => {
  const level = c.riskLevel || "unknown";
  riskCounts[level] = (riskCounts[level] || 0) + 1;
  const vip = c.vipLevel || "normal";
  if (riskByVip[vip]) {
    riskByVip[vip][level] = (riskByVip[vip][level] || 0) + 1;
  }
});

console.log(`\n总体风险等级分布:`);
console.log(`  Low (低风险)：${riskCounts.low} 人 (${(riskCounts.low/allCustomers.length*100).toFixed(1)}%)`);
console.log(`  Medium (中风险)：${riskCounts.medium} 人 (${(riskCounts.medium/allCustomers.length*100).toFixed(1)}%)`);
console.log(`  High (高风险)：${riskCounts.high} 人 (${(riskCounts.high/allCustomers.length*100).toFixed(1)}%)`);
if (riskCounts.unknown > 0) {
  console.log(`  Unknown (未定义)：${riskCounts.unknown} 人`);
}

console.log(`\n按VIP等级分类统计:`);
Object.entries(riskByVip).forEach(([vip, counts]) => {
  const total = counts.low + counts.medium + counts.high;
  if (total > 0) {
    console.log(`  ${vip} (${total}人): Low=${counts.low}, Medium=${counts.medium}, High=${counts.high}`);
  }
});

// 2. 检查风险标记
console.log(`\n\n2. 风险标记检查`);
console.log(`${'='.repeat(50)}`);

const riskMarkings = {};
Object.keys(RISK_TAGS).forEach(tag => {
  riskMarkings[tag] = [];
});

allCustomers.forEach(c => {
  const tags = c.tags || [];
  Object.keys(RISK_TAGS).forEach(tag => {
    if (tags.includes(tag)) {
      riskMarkings[tag].push({
        id: c.id,
        name: c.name,
        riskLevel: c.riskLevel,
        vipLevel: c.vipLevel
      });
    }
  });
});

console.log(`\n具有风险标记的客户统计:`);
let totalWithMarkings = 0;
Object.entries(riskMarkings).forEach(([tag, customers]) => {
  if (customers.length > 0) {
    console.log(`  "${tag}"：${customers.length} 人`);
    totalWithMarkings += customers.length;
  }
});
console.log(`\n总计：${totalWithMarkings} 个客户标记实例`);

// 3. 一致性检查
console.log(`\n\n3. 一致性检查 - riskLevel 与风险标记匹配性`);
console.log(`${'='.repeat(50)}`);

const inconsistencies = [];
const withNegativeMarks = [];

allCustomers.forEach(c => {
  const tags = c.tags || [];
  const hasNegativeMark = Object.keys(RISK_TAGS).some(tag => tags.includes(tag));
  
  if (hasNegativeMark) {
    withNegativeMarks.push(c);
    // 如果有负面标记但riskLevel是low，标记为不一致
    if (c.riskLevel === "low") {
      inconsistencies.push({
        id: c.id,
        name: c.name,
        vipLevel: c.vipLevel,
        currentRiskLevel: c.riskLevel,
        negativeMarks: tags.filter(t => Object.keys(RISK_TAGS).includes(t)),
        reason: "标记为负面风险但riskLevel仍为'low'",
        suggestedLevel: "medium或high"
      });
    }
  } else if (c.riskLevel === "high") {
    // 如果riskLevel是high但没有负面标记
    inconsistencies.push({
      id: c.id,
      name: c.name,
      vipLevel: c.vipLevel,
      currentRiskLevel: c.riskLevel,
      negativeMarks: [],
      reason: "标记为高风险但没有相应的负面标记",
      suggestedLevel: "添加相应的负面标记"
    });
  }
});

console.log(`\n有负面风险标记的客户总数: ${withNegativeMarks.length}`);
console.log(`检测到的不一致情况: ${inconsistencies.length}\n`);

if (inconsistencies.length > 0) {
  console.log(`详细不一致列表:`);
  console.log(`${'='.repeat(80)}`);
  
  inconsistencies.forEach((item, idx) => {
    console.log(`\n[${idx + 1}] ${item.id} - ${item.name}`);
    console.log(`    VIP等级: ${item.vipLevel}`);
    console.log(`    当前风险等级: ${item.currentRiskLevel}`);
    console.log(`    负面标记: ${item.negativeMarks.length > 0 ? item.negativeMarks.join(', ') : '无'}`);
    console.log(`    问题: ${item.reason}`);
    console.log(`    建议: ${item.suggestedLevel}`);
  });
}

// 4. 调整优先级
console.log(`\n\n4. 调整建议优先级`);
console.log(`${'='.repeat(50)}`);

const highPriority = inconsistencies.filter(i => 
  i.negativeMarks && i.negativeMarks.some(tag => 
    ['黑名單', '呆帳', '法院扣押', '強制'].includes(tag)
  ) && i.currentRiskLevel === 'low'
);

const mediumPriority = inconsistencies.filter(i =>
  i.negativeMarks && i.negativeMarks.some(tag =>
    ['逾期', '催收', '警示'].includes(tag)
  ) && i.currentRiskLevel === 'low'
);

const lowPriority = inconsistencies.filter(i =>
  !highPriority.includes(i) && !mediumPriority.includes(i)
);

console.log(`\n高优先级 (严重风险标记+低风险等级): ${highPriority.length} 个`);
highPriority.forEach(i => {
  console.log(`  • ${i.id} - ${i.name} (标记: ${i.negativeMarks.join(', ')})`);
});

console.log(`\n中优先级 (中等风险标记+低风险等级): ${mediumPriority.length} 个`);
mediumPriority.forEach(i => {
  console.log(`  • ${i.id} - ${i.name} (标记: ${i.negativeMarks.join(', ')})`);
});

console.log(`\n低优先级 (其他不一致): ${lowPriority.length} 个`);
lowPriority.forEach(i => {
  console.log(`  • ${i.id} - ${i.name}`);
});

// 输出汇总
console.log(`\n\n汇总统计`);
console.log(`${'='.repeat(50)}`);
console.log(`✓ 总客户数: ${allCustomers.length}`);
console.log(`✓ 低风险客户: ${riskCounts.low}`);
console.log(`✓ 中风险客户: ${riskCounts.medium}`);
console.log(`✓ 高风险客户: ${riskCounts.high}`);
console.log(`✓ 具有负面风险标记的客户: ${withNegativeMarks.length}`);
console.log(`✓ 需要调整的客户: ${inconsistencies.length}`);
console.log(`  - 高优先级: ${highPriority.length}`);
console.log(`  - 中优先级: ${mediumPriority.length}`);
console.log(`  - 低优先级: ${lowPriority.length}`);
