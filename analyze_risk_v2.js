// 风险标记定义
const RISK_TAGS = {
  "遺約": { name: "遺約", severity: "high", type: "late payment/default" },
  "黑名單": { name: "黑名單", severity: "critical", type: "blacklist" },
  "法院扣押": { name: "法院扣押", severity: "critical", type: "court seizure" },
  "逾期": { name: "逾期", severity: "high", type: "overdue" },
  "催收": { name: "催收", severity: "high", type: "collection" },
  "呆帳": { name: "呆帳", severity: "critical", type: "bad debt" },
  "展延異常": { name: "展延異常", severity: "medium", type: "unusual extension" },
  "警示": { name: "警示", severity: "medium", type: "warning" },
  "高風險": { name: "高風險", severity: "high", type: "high risk" },
  "強制": { name: "強制", severity: "critical", type: "forced/enforcement" }
};

// 基础客户数据（从CUS360Demo.jsx中提取）
const mockCustomers = [
  { id: "C001", name: "王小明", age: 35, vipLevel: "VIP", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["高頻交易客戶", "數位通路使用者"] },
  { id: "C002", name: "李美華", age: 42, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low", accountStatus: "active", tags: ["旅行意圖", "信用卡申辦意圖"] },
  { id: "C003", name: "陳大偉", age: 28, vipLevel: "normal", riskScore: "B", riskLevel: "medium", accountStatus: "active", tags: ["投資理財", "狀態調整-有效戶"] },
  { id: "C004", name: "張麗娟", age: 51, vipLevel: "VIP", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["理財產品偏好"] },
  { id: "C005", name: "劉志明", age: 46, vipLevel: "normal", riskScore: "C", riskLevel: "high", accountStatus: "失效戶", tags: ["高風險客戶", "失效戶"] },
  { id: "C006", name: "林小芳", age: 33, vipLevel: "VIP", riskScore: "A", riskLevel: "medium", accountStatus: "active", tags: ["數位通路使用者", "狀態調整-有效戶"] },
  { id: "C007", name: "張杰仁", age: 41, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low", accountStatus: "active", tags: ["信用卡活躍用戶"] },
  { id: "C008", name: "何雅婷", age: 29, vipLevel: "normal", riskScore: "B", riskLevel: "medium", accountStatus: "active", tags: ["家庭導向", "狀態調整-有效戶"] },
  { id: "C009", name: "吳宗憲", age: 58, vipLevel: "VIP", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["投資理財"] },
  { id: "C010", name: "蔡雅文", age: 64, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low", accountStatus: "active", tags: ["重要客戶", "財管客戶註記"] },
  { id: "C011", name: "林冠哲", age: 39, vipLevel: "VVVIP", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["高資產", "信用卡活躍用戶"] },
  { id: "C012", name: "周逸軒", age: 45, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low", accountStatus: "active", tags: ["都市精英", "高額海外消費", "頻繁商務旅遊", "尊榮權益需求"] },
  { id: "C013", name: "林佳穎", age: 29, vipLevel: "normal", riskScore: "C", riskLevel: "high", accountStatus: "active", tags: ["小資回饋", "電商高頻", "跨平台支付", "最高回饋追求", "高風險客戶"] },
  { id: "C014", name: "陳育庭", age: 40, vipLevel: "VIP", riskScore: "A", riskLevel: "medium", accountStatus: "active", tags: ["家庭生活", "大型分期", "量販消費", "分期零利率需求"] },
  { id: "C015", name: "郭仁豪", age: 38, vipLevel: "VIP", riskScore: "A", riskLevel: "medium", accountStatus: "active", tags: ["房貸需求", "穩定收入", "線上試算偏好", "房貸意圖"] },
  { id: "C016", name: "曾雅霖", age: 27, vipLevel: "normal", riskScore: "C", riskLevel: "high", accountStatus: "active", tags: ["小額信貸", "快速核貸", "資金周轉", "低門檻需求", "高風險客戶", "信貸意圖"] },
  { id: "C017", name: "許建弘", age: 50, vipLevel: "VVIP", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["企業週轉", "高額度需求", "循環授信", "專人服務偏好"] },
  { id: "C181", name: "葉庭宇", age: 31, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C182", name: "張昕恩", age: 27, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C183", name: "林柏翰", age: 33, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C184", name: "黃郁庭", age: 29, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C185", name: "吳哲安", age: 36, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C186", name: "陳姿穎", age: 34, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C187", name: "徐庭瑋", age: 30, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C188", name: "羅佳怡", age: 28, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C189", name: "蔡承恩", age: 32, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C190", name: "周雅婷", age: 26, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C191", name: "江柏妍", age: 35, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C192", name: "高予晴", age: 30, vipLevel: "normal", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C193", name: "鄭雅雯", age: 37, vipLevel: "VIP", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C194", name: "羅承翰", age: 42, vipLevel: "VVIP", riskScore: "A+", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
  { id: "C195", name: "沈莉媛", age: 35, vipLevel: "VIP", riskScore: "A", riskLevel: "low", accountStatus: "active", tags: ["出國旅遊意圖"] },
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

// 检查标签中是否包含风险标记
function getRiskMarkingsFromTags(tags) {
  const foundMarks = [];
  (tags || []).forEach(tag => {
    Object.keys(RISK_TAGS).forEach(riskTag => {
      if (tag.includes(riskTag)) {
        foundMarks.push(riskTag);
      }
    });
  });
  return foundMarks;
}

// 执行分析
const allCustomers = expandCustomers(mockCustomers);

// 导出到文件
const fs = require('fs');
const reportLines = [];

const log = (text = '') => {
  console.log(text);
  reportLines.push(text);
};

log(`========== CUS360 客户风险数据分析报告 ==========`);
log(`报告生成时间: ${new Date().toLocaleString('zh-CN')}`);
log(`总客户数: ${allCustomers.length}\n`);

// 1. 风险等级分布
log(`\n1. 风险等级分布统计`);
log(`${'='.repeat(60)}`);

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

log(`\n1.1 总体风险等级分布:`);
log(`  • Low (低风险)：${riskCounts.low} 人 (${(riskCounts.low/allCustomers.length*100).toFixed(1)}%)`);
log(`  • Medium (中风险)：${riskCounts.medium} 人 (${(riskCounts.medium/allCustomers.length*100).toFixed(1)}%)`);
log(`  • High (高风险)：${riskCounts.high} 人 (${(riskCounts.high/allCustomers.length*100).toFixed(1)}%)`);

log(`\n1.2 按VIP等级分类统计:`);
log(`┌────────┬─────┬─────┬─────┬────┐`);
log(`│ VIP等级  │ Low │ Med │ High│ 合计│`);
log(`├────────┼─────┼─────┼─────┼────┤`);
Object.entries(riskByVip).forEach(([vip, counts]) => {
  const total = counts.low + counts.medium + counts.high;
  if (total > 0) {
    log(`│ ${String(vip).padEnd(6)} │ ${String(counts.low).padStart(3)} │ ${String(counts.medium).padStart(3)} │ ${String(counts.high).padStart(3)} │ ${String(total).padStart(2)} │`);
  }
});
log(`└────────┴─────┴─────┴─────┴────┘`);

// 2. 检查风险标记
log(`\n\n2. 风险标记检查`);
log(`${'='.repeat(60)}`);

const riskMarkings = {};
Object.keys(RISK_TAGS).forEach(tag => {
  riskMarkings[tag] = [];
});

allCustomers.forEach(c => {
  const marks = getRiskMarkingsFromTags(c.tags);
  marks.forEach(mark => {
    riskMarkings[mark].push({
      id: c.id,
      name: c.name,
      riskLevel: c.riskLevel,
      vipLevel: c.vipLevel,
      tags: c.tags
    });
  });
});

log(`\n2.1 具有风险标记的客户统计:`);
let markingsByTag = [];
Object.entries(riskMarkings).forEach(([tag, customers]) => {
  if (customers.length > 0) {
    const severity = RISK_TAGS[tag].severity;
    markingsByTag.push({ tag, count: customers.length, severity });
  }
});

if (markingsByTag.length > 0) {
  markingsByTag.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
  
  markingsByTag.forEach(item => {
    log(`  • "${item.tag}" (${item.severity}): ${item.count} 人`);
  });
} else {
  log(`  无风险标记 (系统未检测到相关标记标签)`);
}

log(`\n2.2 具有任何风险标记的客户总数: ${Object.values(riskMarkings).reduce((s, arr) => s + arr.length, 0)}`);

// 3. 一致性检查
log(`\n\n3. 一致性检查 - riskLevel 与风险标记匹配性`);
log(`${'='.repeat(60)}`);

const inconsistencies = [];
const withRiskMarks = [];

allCustomers.forEach(c => {
  const marks = getRiskMarkingsFromTags(c.tags);
  
  if (marks.length > 0) {
    withRiskMarks.push(c);
    // 如果有负面标记但riskLevel不是high，标记为不一致
    if (c.riskLevel !== "high") {
      inconsistencies.push({
        id: c.id,
        name: c.name,
        vipLevel: c.vipLevel,
        currentRiskLevel: c.riskLevel,
        riskScore: c.riskScore,
        negativeMarks: marks,
        accountStatus: c.accountStatus,
        reason: `有风险标记(${marks.join(', ')})但riskLevel为'${c.riskLevel}'`,
        suggestedLevel: "high",
        priority: "high"
      });
    }
  } else if (c.riskLevel === "high") {
    // 如果riskLevel是high但没有负面标记
    inconsistencies.push({
      id: c.id,
      name: c.name,
      vipLevel: c.vipLevel,
      currentRiskLevel: c.riskLevel,
      riskScore: c.riskScore,
      negativeMarks: [],
      accountStatus: c.accountStatus,
      reason: "标记为高风险但没有相应的风险标记标签",
      suggestedLevel: "添加相应的风险标记",
      priority: "medium"
    });
  }
});

log(`\n3.1 有风险标记的客户总数: ${withRiskMarks.length}`);
log(`3.2 检测到的不一致情况: ${inconsistencies.length}\n`);

if (inconsistencies.length > 0) {
  log(`3.3 详细不一致列表:`);
  log(`${'='.repeat(80)}`);
  
  inconsistencies.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return a.id.localeCompare(b.id);
  });
  
  inconsistencies.forEach((item, idx) => {
    log(`\n[${idx + 1}] ${item.id} - ${item.name}`);
    log(`    VIP等级: ${item.vipLevel} | 账户状态: ${item.accountStatus}`);
    log(`    RiskScore: ${item.riskScore} | 当前RiskLevel: ${item.currentRiskLevel}`);
    log(`    风险标记: ${item.negativeMarks.length > 0 ? item.negativeMarks.join(', ') : '无'}`);
    log(`    问题: ${item.reason}`);
    log(`    建议: 调整riskLevel为 '${item.suggestedLevel}'`);
  });
}

// 4. 调整优先级
log(`\n\n4. 调整建议优先级`);
log(`${'='.repeat(60)}`);

const criticalMarks = ['黑名單', '呆帳', '法院扣押', '強制'];
const highMarks = ['遺約', '逾期', '催收'];
const mediumMarks = ['警示', '展延異常'];

const criticalPriority = inconsistencies.filter(i =>
  i.negativeMarks && i.negativeMarks.some(tag => criticalMarks.includes(tag)) && i.currentRiskLevel !== 'high'
);

const highPriority = inconsistencies.filter(i =>
  !criticalPriority.includes(i) &&
  i.negativeMarks && i.negativeMarks.some(tag => highMarks.includes(tag)) && i.currentRiskLevel !== 'high'
);

const mediumPriority = inconsistencies.filter(i =>
  !criticalPriority.includes(i) && !highPriority.includes(i) &&
  i.negativeMarks && i.negativeMarks.some(tag => mediumMarks.includes(tag))
);

const lowPriority = inconsistencies.filter(i =>
  !criticalPriority.includes(i) && !highPriority.includes(i) && !mediumPriority.includes(i)
);

log(`\n【紧急处理】严重风险标记 + 风险等级不匹配: ${criticalPriority.length} 个`);
if (criticalPriority.length > 0) {
  criticalPriority.forEach(i => {
    log(`  ◆ ${i.id} - ${i.name} | VIP: ${i.vipLevel}`);
    log(`    标记: ${i.negativeMarks.join(', ')} | 当前等级: ${i.currentRiskLevel}`);
  });
}

log(`\n【高优先级】高危风险标记 + 风险等级不匹配: ${highPriority.length} 个`);
if (highPriority.length > 0) {
  highPriority.forEach(i => {
    log(`  ▲ ${i.id} - ${i.name} | VIP: ${i.vipLevel}`);
    log(`    标记: ${i.negativeMarks.join(', ')} | 当前等级: ${i.currentRiskLevel}`);
  });
}

log(`\n【中优先级】中等风险标记 + 风险等级不匹配: ${mediumPriority.length} 个`);
if (mediumPriority.length > 0) {
  mediumPriority.forEach(i => {
    log(`  ■ ${i.id} - ${i.name} | VIP: ${i.vipLevel}`);
    log(`    标记: ${i.negativeMarks.join(', ')} | 当前等级: ${i.currentRiskLevel}`);
  });
}

log(`\n【低优先级】其他不一致: ${lowPriority.length} 个`);
if (lowPriority.length > 0) {
  lowPriority.slice(0, 10).forEach(i => {
    log(`  ○ ${i.id} - ${i.name}`);
  });
  if (lowPriority.length > 10) {
    log(`  ... 及其他 ${lowPriority.length - 10} 个`);
  }
}

// 汇总统计
log(`\n\n汇总统计`);
log(`${'='.repeat(60)}`);
log(`✓ 总客户数: ${allCustomers.length}`);
log(`✓ 低风险客户: ${riskCounts.low} (${(riskCounts.low/allCustomers.length*100).toFixed(1)}%)`);
log(`✓ 中风险客户: ${riskCounts.medium} (${(riskCounts.medium/allCustomers.length*100).toFixed(1)}%)`);
log(`✓ 高风险客户: ${riskCounts.high} (${(riskCounts.high/allCustomers.length*100).toFixed(1)}%)`);
log(`✓ 具有风险标记的客户: ${withRiskMarks.length}`);
log(`✓ 需要调整的客户: ${inconsistencies.length}`);
log(`  ├─ 紧急处理: ${criticalPriority.length}`);
log(`  ├─ 高优先级: ${highPriority.length}`);
log(`  ├─ 中优先级: ${mediumPriority.length}`);
log(`  └─ 低优先级: ${lowPriority.length}`);

// 保存报告到文件
const reportContent = reportLines.join('\n');
fs.writeFileSync('./risk_analysis_report.txt', reportContent, 'utf-8');
log(`\n\n报告已保存到: risk_analysis_report.txt`);
