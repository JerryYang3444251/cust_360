/**
 * 改进的数据质量检查脚本
 * 直接从源代码提取并分析mockCustomers
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/CUS360Demo.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

// 使用更精确的方法提取mockCustomers
// 查找 "const mockCustomers = [" 到第一个 "];" 
const mockStart = content.indexOf('const mockCustomers = [');
const mockEnd = content.indexOf('];', mockStart) + 2;
const mockSection = content.substring(mockStart, mockEnd);

// 提取所有客户ID和相关信息
const customerPattern = /\{\s*id:\s*"([^"]+)"[\s\S]*?vipLevel:\s*"([^"]+)"[\s\S]*?riskScore:\s*"([^"]+)"[\s\S]*?riskLevel:\s*"([^"]+)"[\s\S]*?accountStatus:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?tags:\s*\[([\s\S]*?)\]\s*,/g;

const customers = [];
let match;

while ((match = customerPattern.exec(mockSection)) !== null) {
  const [, id, vipLevel, riskScore, riskLevel, accountStatus, name, tagsStr] = match;
  
  // 解析tags
  const tags = tagsStr
    .split(',')
    .map(tag => tag.trim().replace(/["']/g, ''))
    .filter(tag => tag && tag.length > 0);
  
  customers.push({
    id,
    name,
    vipLevel,
    riskScore,
    riskLevel,
    accountStatus,
    tags
  });
}

console.log(`从mockCustomers中提取的客户总数: ${customers.length}\n`);

// 定义检查规则
const CONSISTENCY_RULES = {
  VVVIP: {
    riskScores: ['A', 'A+'],
    riskLevels: ['low'],
  },
  VVIP: {
    riskScores: ['A', 'A+'],
    riskLevels: ['low'],
  },
  VIP: {
    riskScores: ['A', 'A+', 'B'],
    riskLevels: ['low', 'medium'],
  },
  normal: {
    riskScores: ['A', 'A+', 'B', 'C'],
    riskLevels: ['low', 'medium', 'high'],
  }
};

// 负面标记关键词
const NEGATIVE_TAGS = ['遺約', '黑名單', '法院扣押', '逾期催收', '呆帳', '高風險客戶', '失效戶'];

const results = {
  totalCustomers: customers.length,
  consistency_issues: [],
  negative_tags_list: [],
  account_status_issues: [],
  financial_issues: [],
  issues_by_category: {
    vip_risk_consistency: 0,
    negative_marks: 0,
    account_status: 0,
    tags_inconsistency: 0,
  }
};

// 执行检查
console.log('开始数据质量检查...\n');
console.log('='*70);

let qualityScore = 100;

customers.forEach((customer, idx) => {
  const { id, name, vipLevel, riskScore, riskLevel, accountStatus, tags } = customer;
  
  // 1. 检查VIP等级 vs 风险评分/等级一致性
  const rule = CONSISTENCY_RULES[vipLevel] || CONSISTENCY_RULES.normal;
  
  let hasConsistencyIssue = false;
  let issues = [];
  
  if (!rule.riskScores.includes(riskScore)) {
    hasConsistencyIssue = true;
    issues.push(`风险评分不符: ${riskScore} (应为: ${rule.riskScores.join('/')}) [VIP: ${vipLevel}]`);
    results.issues_by_category.vip_risk_consistency++;
  }
  
  if (!rule.riskLevels.includes(riskLevel)) {
    hasConsistencyIssue = true;
    issues.push(`风险等级不符: ${riskLevel} (应为: ${rule.riskLevels.join('/')}) [VIP: ${vipLevel}]`);
    results.issues_by_category.vip_risk_consistency++;
  }
  
  if (hasConsistencyIssue) {
    results.consistency_issues.push({
      id,
      name,
      vipLevel,
      riskScore,
      riskLevel,
      issues: issues
    });
  }
  
  // 2. 检查负面标记
  const negativeTagsFound = tags.filter(tag => 
    NEGATIVE_TAGS.some(negTag => tag.includes(negTag))
  );
  
  if (negativeTagsFound.length > 0) {
    results.negative_tags_list.push({
      id,
      name,
      vipLevel,
      tags: negativeTagsFound,
      accountStatus: accountStatus
    });
    results.issues_by_category.negative_marks++;
  }
  
  // 3. 检查账户状态
  // VVVIP/VVIP应该都是active
  if ((vipLevel === 'VVVIP' || vipLevel === 'VVIP') && accountStatus !== 'active') {
    results.account_status_issues.push({
      id,
      name,
      vipLevel,
      currentStatus: accountStatus,
      issue: '高VIP等级客户(VVVIP/VVIP)账户状态应为active'
    });
    results.issues_by_category.account_status++;
  }
  
  // 有负面标记的账户应该检查
  if (negativeTagsFound.length > 0 && accountStatus !== '失效戶') {
    // 这可能是一个警告，但不一定是错误
  }
  
  // 4. 标签一致性检查
  // VVVIP应该有"高資產"或类似标签
  if (vipLevel === 'VVVIP') {
    const hasWealthTag = tags.some(tag => tag.includes('高資產') || tag.includes('財管客戶'));
    if (!hasWealthTag) {
      results.issues_by_category.tags_inconsistency++;
    }
  }
});

// 计算质量评分
const totalIssues = 
  results.consistency_issues.length * 3 +
  results.negative_tags_list.length * 2 +
  results.account_status_issues.length * 4;

qualityScore = Math.max(0, 100 - (totalIssues * 2));

// 输出结果
console.log('\n【数据质量检查报告】\n');

console.log('📊 总体统计:');
console.log(`  • 总客户数: ${results.totalCustomers}`);
console.log(`  • VIP等级分布:`);

const vipDistribution = {};
customers.forEach(c => {
  vipDistribution[c.vipLevel] = (vipDistribution[c.vipLevel] || 0) + 1;
});

Object.entries(vipDistribution).forEach(([level, count]) => {
  console.log(`    - ${level}: ${count}个`);
});

console.log(`\n  • 总体质量评分: ${qualityScore}/100 ${qualityScore >= 80 ? '✓ PASS' : '✗ FAIL'}`);
console.log(`\n问题分类统计:`);
console.log(`  • VIP等级 vs 风险评分/等级不一致: ${results.issues_by_category.vip_risk_consistency}项`);
console.log(`  • 客户有负面标记: ${results.issues_by_category.negative_marks}个`);
console.log(`  • 账户状态异常: ${results.issues_by_category.account_status}个`);
console.log(`  • 标签一致性问题: ${results.issues_by_category.tags_inconsistency}项`);

// 详细问题列表
if (results.consistency_issues.length > 0) {
  console.log('\n' + '='*70);
  console.log('【问题详情1】VIP等级 vs 风险评分/等级不一致:');
  console.log('='*70);
  
  results.consistency_issues.forEach((issue, idx) => {
    console.log(`\n${idx + 1}. ${issue.id} | ${issue.name}`);
    console.log(`   VIP等级: ${issue.vipLevel}`);
    console.log(`   当前风险评分: ${issue.riskScore} | 等级: ${issue.riskLevel}`);
    issue.issues.forEach(problem => {
      console.log(`   ⚠️  ${problem}`);
    });
  });
}

if (results.negative_tags_list.length > 0) {
  console.log('\n' + '='*70);
  console.log('【问题详情2】客户有负面标记:');
  console.log('='*70);
  
  results.negative_tags_list.forEach((issue, idx) => {
    console.log(`\n${idx + 1}. ${issue.id} | ${issue.name}`);
    console.log(`   VIP等级: ${issue.vipLevel}`);
    console.log(`   账户状态: ${issue.accountStatus}`);
    console.log(`   负面标记: ${issue.tags.join(', ')}`);
  });
}

if (results.account_status_issues.length > 0) {
  console.log('\n' + '='*70);
  console.log('【问题详情3】账户状态异常:');
  console.log('='*70);
  
  results.account_status_issues.forEach((issue, idx) => {
    console.log(`\n${idx + 1}. ${issue.id} | ${issue.name}`);
    console.log(`   VIP等级: ${issue.vipLevel}`);
    console.log(`   当前账户状态: ${issue.currentStatus}`);
    console.log(`   ⚠️  ${issue.issue}`);
  });
}

// 建议修正
console.log('\n' + '='*70);
console.log('【建议修正项】');
console.log('='*70);

const recommendations = [];

// 高优先级: VIP等级为VVVIP/VVIP但风险评分/等级不对
results.consistency_issues.forEach(issue => {
  if (issue.vipLevel === 'VVVIP') {
    recommendations.push({
      customerId: issue.id,
      priority: 'HIGH',
      action: `${issue.id} (${issue.name}): 修正风险评分/等级 ${issue.riskScore}/${issue.riskLevel} → A/A+/low`
    });
  } else if (issue.vipLevel === 'VVIP') {
    recommendations.push({
      customerId: issue.id,
      priority: 'HIGH',
      action: `${issue.id} (${issue.name}): 修正风险评分/等级 ${issue.riskScore}/${issue.riskLevel} → A/A+/low`
    });
  } else if (issue.vipLevel === 'VIP') {
    recommendations.push({
      customerId: issue.id,
      priority: 'MEDIUM',
      action: `${issue.id} (${issue.name}): 修正风险评分/等级 ${issue.riskScore}/${issue.riskLevel} → A/A+/B & low/medium`
    });
  }
});

// 账户状态问题
results.account_status_issues.forEach(issue => {
  recommendations.push({
    customerId: issue.id,
    priority: 'HIGH',
    action: `${issue.id} (${issue.name}): 修正账户状态 ${issue.currentStatus} → active`
  });
});

if (recommendations.length > 0) {
  const highPriority = recommendations.filter(r => r.priority === 'HIGH');
  const mediumPriority = recommendations.filter(r => r.priority === 'MEDIUM');
  
  if (highPriority.length > 0) {
    console.log(`\n【高优先级】 - 必须修正 (${highPriority.length}项)\n`);
    highPriority.forEach((rec, idx) => {
      console.log(`${idx + 1}. ${rec.action}`);
    });
  }
  
  if (mediumPriority.length > 0) {
    console.log(`\n【中等优先级】 - 建议修正 (${mediumPriority.length}项)\n`);
    mediumPriority.slice(0, 10).forEach((rec, idx) => {
      console.log(`${idx + 1}. ${rec.action}`);
    });
    if (mediumPriority.length > 10) {
      console.log(`... 及其他${mediumPriority.length - 10}项`);
    }
  }
} else {
  console.log('\n  ✓ 无需修正');
}

// 最终判定
console.log('\n' + '='*70);
console.log('【最终判定】');
console.log('='*70);

if (qualityScore >= 90) {
  console.log('✓ PASS - 数据质量优秀 (90-100)');
} else if (qualityScore >= 75) {
  console.log('⚠ PASS - 数据质量良好 (75-89)，存在少量问题');
} else if (qualityScore >= 60) {
  console.log('⚠ WARNING - 数据质量一般 (60-74)，存在多个问题');
} else {
  console.log('✗ FAIL - 数据质量不佳 (<60)，需要大量修正');
}

console.log(`\n质量评分: ${qualityScore}/100`);
console.log(`总问题数: ${results.consistency_issues.length + results.negative_tags_list.length + results.account_status_issues.length}`);

// 快速参考表
console.log('\n' + '='*70);
console.log('【完整客户参考表】');
console.log('='*70);
console.log('\nID\t\t名称\t\t\tVIP等级\t风险评\t风险等\t账户状態');
console.log('-'*70);

customers.slice(0, 30).forEach(c => {
  const name = (c.name || '').padEnd(16);
  console.log(`${c.id.padEnd(8)}\t${name}\t${c.vipLevel.padEnd(5)}\t${c.riskScore.padEnd(4)}\t${c.riskLevel.padEnd(4)}\t${c.accountStatus}`);
});

if (customers.length > 30) {
  console.log(`... 及其他${customers.length - 30}个客户`);
}

console.log('\n检查完毕。\n');
