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

// 基础客户数据
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

const fs = require('fs');

// 生成CSV格式的完整客户列表
let csvContent = '客户ID,客户名称,年龄,VIP等级,风险评分,风险等级,账户状态,风险标记,建议\n';

allCustomers.forEach(c => {
  const marks = getRiskMarkingsFromTags(c.tags);
  const hasMisMatch = (marks.length > 0 && c.riskLevel !== 'high') || (marks.length === 0 && c.riskLevel === 'high');
  const suggestion = hasMisMatch ? '需要调整' : '正常';
  
  csvContent += `"${c.id}","${c.name}",${c.age},"${c.vipLevel}","${c.riskScore}","${c.riskLevel}","${c.accountStatus}","${marks.join(', ')}","${suggestion}"\n`;
});

fs.writeFileSync('./customer_risk_list.csv', csvContent, 'utf-8');

// 生成风险等级分布表
const riskCounts = { low: 0, medium: 0, high: 0 };
const riskByVip = {
  normal: { low: 0, medium: 0, high: 0 },
  VIP: { low: 0, medium: 0, high: 0 },
  VVIP: { low: 0, medium: 0, high: 0 },
  VVVIP: { low: 0, medium: 0, high: 0 }
};

allCustomers.forEach(c => {
  const level = c.riskLevel;
  riskCounts[level]++;
  const vip = c.vipLevel || "normal";
  if (riskByVip[vip]) {
    riskByVip[vip][level]++;
  }
});

// 检查不一致的客户
const inconsistencies = [];
allCustomers.forEach(c => {
  const marks = getRiskMarkingsFromTags(c.tags);
  
  if (marks.length > 0 && c.riskLevel !== 'high') {
    inconsistencies.push({
      id: c.id,
      name: c.name,
      vipLevel: c.vipLevel,
      riskLevel: c.riskLevel,
      marks: marks,
      issue: `有风险标记但riskLevel为${c.riskLevel}`
    });
  } else if (marks.length === 0 && c.riskLevel === 'high') {
    inconsistencies.push({
      id: c.id,
      name: c.name,
      vipLevel: c.vipLevel,
      riskLevel: c.riskLevel,
      marks: [],
      issue: `标记为高风险但无相应风险标记`
    });
  }
});

// 生成HTML格式报告
const htmlReport = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CUS360 客户风险分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
        h2 { color: #0066cc; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #0066cc; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        tr:hover { background-color: #f9f9f9; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .stat-box { padding: 15px; background: #f0f8ff; border-left: 4px solid #0066cc; border-radius: 4px; }
        .stat-box h3 { margin: 0 0 10px 0; color: #0066cc; }
        .stat-box .number { font-size: 28px; font-weight: bold; color: #333; }
        .stat-box .percent { color: #666; font-size: 14px; }
        .warning { color: #d9534f; }
        .success { color: #5cb85c; }
        .info { color: #5bc0de; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏦 CUS360 客户风险数据分析报告</h1>
        <p><strong>报告生成时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
        <p><strong>分析客户总数:</strong> ${allCustomers.length} 人</p>
        
        <h2>1. 风险等级分布统计</h2>
        <div class="summary">
            <div class="stat-box">
                <h3>低风险</h3>
                <div class="number success">${riskCounts.low}</div>
                <div class="percent">${(riskCounts.low/allCustomers.length*100).toFixed(1)}% 的客户</div>
            </div>
            <div class="stat-box">
                <h3>中风险</h3>
                <div class="number info">${riskCounts.medium}</div>
                <div class="percent">${(riskCounts.medium/allCustomers.length*100).toFixed(1)}% 的客户</div>
            </div>
            <div class="stat-box">
                <h3>高风险</h3>
                <div class="number warning">${riskCounts.high}</div>
                <div class="percent">${(riskCounts.high/allCustomers.length*100).toFixed(1)}% 的客户</div>
            </div>
        </div>
        
        <h3>按VIP等级分类统计</h3>
        <table>
            <tr>
                <th>VIP等级</th>
                <th>低风险</th>
                <th>中风险</th>
                <th>高风险</th>
                <th>合计</th>
            </tr>
            ${Object.entries(riskByVip).map(([vip, counts]) => {
                const total = counts.low + counts.medium + counts.high;
                if (total === 0) return '';
                return `<tr>
                    <td><strong>${vip}</strong></td>
                    <td>${counts.low}</td>
                    <td>${counts.medium}</td>
                    <td>${counts.high}</td>
                    <td><strong>${total}</strong></td>
                </tr>`;
            }).join('')}
        </table>
        
        <h2>2. 风险标记检查</h2>
        <p>系统检测到的具有明确风险标记("高風險")的客户: <strong class="warning">${allCustomers.filter(c => getRiskMarkingsFromTags(c.tags).length > 0).length}</strong> 人</p>
        
        <h2>3. 一致性检查</h2>
        <p><strong>检测到的不一致情况:</strong> ${inconsistencies.length} 个</p>
        
        ${inconsistencies.length > 0 ? `
        <table>
            <tr>
                <th>客户ID</th>
                <th>客户名称</th>
                <th>VIP等级</th>
                <th>风险等级</th>
                <th>风险标记</th>
                <th>问题描述</th>
            </tr>
            ${inconsistencies.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.vipLevel}</td>
                <td>${item.riskLevel}</td>
                <td>${item.marks.length > 0 ? item.marks.join(', ') : '无'}</td>
                <td><span class="warning">${item.issue}</span></td>
            </tr>
            `).join('')}
        </table>
        ` : '<p class="success">✓ 所有客户的风险等级与标记完全一致，无需调整</p>'}
        
        <h2>4. 建议总结</h2>
        <ul>
            <li><strong>数据质量评分:</strong> ${inconsistencies.length === 0 ? '优秀 ✓' : '需要改进'}</li>
            <li><strong>需要调整的客户:</strong> ${inconsistencies.length} 个</li>
            <li><strong>数据完整性:</strong> ${(1 - inconsistencies.length / allCustomers.length) * 100 > 95 ? '良好' : '中等'}</li>
        </ul>
    </div>
</body>
</html>`;

fs.writeFileSync('./risk_analysis_report.html', htmlReport, 'utf-8');

console.log('✓ 分析完成！');
console.log(`✓ 生成文件:`);
console.log(`  - customer_risk_list.csv (完整客户列表)`);
console.log(`  - risk_analysis_report.html (HTML报告)`);
console.log(`\n汇总统计:`);
console.log(`  总客户数: ${allCustomers.length}`);
console.log(`  低风险: ${riskCounts.low} (${(riskCounts.low/allCustomers.length*100).toFixed(1)}%)`);
console.log(`  中风险: ${riskCounts.medium} (${(riskCounts.medium/allCustomers.length*100).toFixed(1)}%)`);
console.log(`  高风险: ${riskCounts.high} (${(riskCounts.high/allCustomers.length*100).toFixed(1)}%)`);
console.log(`  不一致情况: ${inconsistencies.length}`);
