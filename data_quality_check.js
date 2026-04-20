/**
 * 数据质量检查脚本
 * 对所有62个mockCustomers进行全面检查
 */

// 读取文件并提取mockCustomers
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/CUS360Demo.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

// 提取mockCustomers数组
const mockCustomersMatch = content.match(/const mockCustomers = \[([\s\S]*?)\];/);
if (!mockCustomersMatch) {
  console.error('无法找到mockCustomers数组');
  process.exit(1);
}

// 使用正则提取所有id
const idPattern = /id:\s*"([^"]+)"/g;
const ids = [];
let match;
while ((match = idPattern.exec(content)) !== null) {
  ids.push(match[1]);
}

// 去重并排序
const uniqueIds = [...new Set(ids)];
console.log(`总客户数: ${uniqueIds.length}`);
console.log(`客户ID列表: ${uniqueIds.join(', ')}\n`);

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

// 解析客户数据
function extractCustomerData(idStr) {
  // 创建一个完整的mockCustomers数组来模拟环境
  const getCustomerFromContent = (customerId) => {
    // 创建一个简单的正则来提取特定id的客户信息
    const customerPattern = new RegExp(
      `\\{\\s*id:\\s*"${customerId}"[^}]*?\\}`,
      's'
    );
    const match = content.match(customerPattern);
    if (!match) return null;
    
    try {
      // 这是一个简化的方法，实际上需要更好的JSON解析
      const customerStr = match[0];
      const vipLevelMatch = customerStr.match(/vipLevel:\s*"([^"]+)"/);
      const riskScoreMatch = customerStr.match(/riskScore:\s*"([^"]+)"/);
      const riskLevelMatch = customerStr.match(/riskLevel:\s*"([^"]+)"/);
      const accountStatusMatch = customerStr.match(/accountStatus:\s*"([^"]+)"/);
      const tagsMatch = customerStr.match(/tags:\s*\[([^\]]+)\]/);
      const nameMatch = customerStr.match(/name:\s*"([^"]+)"/);
      
      const tags = tagsMatch ? tagsMatch[1]
        .split(',')
        .map(t => t.trim().replace(/["']/g, ''))
        .filter(t => t)
        : [];
      
      return {
        id: customerId,
        name: nameMatch ? nameMatch[1] : '—',
        vipLevel: vipLevelMatch ? vipLevelMatch[1] : 'normal',
        riskScore: riskScoreMatch ? riskScoreMatch[1] : '—',
        riskLevel: riskLevelMatch ? riskLevelMatch[1] : '—',
        accountStatus: accountStatusMatch ? accountStatusMatch[1] : '—',
        tags: tags
      };
    } catch (e) {
      return null;
    }
  };
  
  return getCustomerFromContent(idStr);
}

// 执行检查
const results = {
  totalCustomers: uniqueIds.length,
  consistency_issues: [],
  negative_tags: [],
  account_status_issues: [],
  quality_score: 100,
  passed: true,
  issues_by_category: {
    vip_risk_consistency: 0,
    negative_marks: 0,
    account_status: 0,
    tags_inconsistency: 0,
  }
};

console.log('='*60);
console.log('开始检查所有客户数据质量...\n');

const customers = [];
uniqueIds.forEach((id, idx) => {
  const customer = extractCustomerData(id);
  if (!customer) {
    console.warn(`警告: 无法提取客户 ${id} 的数据`);
    return;
  }
  
  customers.push(customer);
  
  // 1. 检查VIP等级 vs 风险评分一致性
  const vipLevel = customer.vipLevel;
  const riskScore = customer.riskScore;
  const riskLevel = customer.riskLevel;
  
  const rule = CONSISTENCY_RULES[vipLevel];
  if (rule) {
    if (!rule.riskScores.includes(riskScore)) {
      results.consistency_issues.push({
        customerId: id,
        name: customer.name,
        type: '风险评分不匹配',
        expected: rule.riskScores.join('/'),
        actual: riskScore,
        vipLevel: vipLevel
      });
      results.issues_by_category.vip_risk_consistency++;
      results.passed = false;
    }
    
    if (!rule.riskLevels.includes(riskLevel)) {
      results.consistency_issues.push({
        customerId: id,
        name: customer.name,
        type: '风险等级不匹配',
        expected: rule.riskLevels.join('/'),
        actual: riskLevel,
        vipLevel: vipLevel
      });
      results.issues_by_category.vip_risk_consistency++;
      results.passed = false;
    }
  }
  
  // 2. 检查负面标记
  const hasNegativeTag = customer.tags.some(tag => 
    NEGATIVE_TAGS.some(negTag => tag.includes(negTag))
  );
  
  if (hasNegativeTag) {
    const negativeTags = customer.tags.filter(tag =>
      NEGATIVE_TAGS.some(negTag => tag.includes(negTag))
    );
    results.negative_tags.push({
      customerId: id,
      name: customer.name,
      tags: negativeTags
    });
    results.issues_by_category.negative_marks++;
  }
  
  // 3. 检查账户状态
  // VVVIP/VVIP应该都是active
  if ((vipLevel === 'VVVIP' || vipLevel === 'VVIP') && customer.accountStatus !== 'active') {
    results.account_status_issues.push({
      customerId: id,
      name: customer.name,
      vipLevel: vipLevel,
      status: customer.accountStatus,
      issue: '高VIP等级客户账户不应该是非active状态'
    });
    results.issues_by_category.account_status++;
    results.passed = false;
  }
  
  // 有负面标记的客户账户状态应该检查
  if (hasNegativeTag && customer.accountStatus === 'active') {
    results.account_status_issues.push({
      customerId: id,
      name: customer.name,
      vipLevel: vipLevel,
      status: customer.accountStatus,
      issue: '有负面标记的客户账户状态应该检查(当前为active)'
    });
  }
});

// 计算质量评分
const totalIssues = Object.values(results.issues_by_category).reduce((a, b) => a + b, 0);
results.quality_score = Math.max(0, 100 - totalIssues * 5);

// 输出结果
console.log('\n' + '='*60);
console.log('检查结果概览');
console.log('='*60);
console.log(`总客户数: ${results.totalCustomers}`);
console.log(`总体质量评分: ${results.quality_score}/100`);
console.log(`检查状态: ${results.passed ? '✓ PASS' : '✗ FAIL'}`);
console.log(`\n问题分类统计:`);
console.log(`  - VIP等级 vs 风险评分不一致: ${results.issues_by_category.vip_risk_consistency}`);
console.log(`  - 负面标记客户: ${results.issues_by_category.negative_marks}`);
console.log(`  - 账户状态问题: ${results.issues_by_category.account_status}`);

// 详细输出
if (results.consistency_issues.length > 0) {
  console.log('\n' + '-'*60);
  console.log('VIP等级 vs 风险评分/等级不一致的客户:');
  console.log('-'*60);
  results.consistency_issues.forEach(issue => {
    console.log(`\n${issue.customerId} | ${issue.name}`);
    console.log(`  VIP等级: ${issue.vipLevel}`);
    console.log(`  问题: ${issue.type}`);
    console.log(`  期望值: ${issue.expected}`);
    console.log(`  实际值: ${issue.actual}`);
  });
}

if (results.negative_tags.length > 0) {
  console.log('\n' + '-'*60);
  console.log('有负面标记的客户:');
  console.log('-'*60);
  results.negative_tags.forEach(item => {
    console.log(`\n${item.customerId} | ${item.name}`);
    console.log(`  负面标记: ${item.tags.join(', ')}`);
  });
}

if (results.account_status_issues.length > 0) {
  console.log('\n' + '-'*60);
  console.log('账户状态异常的客户:');
  console.log('-'*60);
  results.account_status_issues.forEach(issue => {
    console.log(`\n${issue.customerId} | ${issue.name}`);
    console.log(`  VIP等级: ${issue.vipLevel}`);
    console.log(`  账户状态: ${issue.status}`);
    console.log(`  问题: ${issue.issue}`);
  });
}

// 建议修正
console.log('\n' + '='*60);
console.log('建议修正项:');
console.log('='*60);

const recommendations = [];

results.consistency_issues.forEach(issue => {
  if (issue.type === '风险评分不匹配') {
    recommendations.push({
      customerId: issue.customerId,
      action: `修正风险评分: ${issue.actual} → ${issue.expected} (VIP等级: ${issue.vipLevel})`,
      priority: issue.vipLevel === 'VVVIP' || issue.vipLevel === 'VVIP' ? 'HIGH' : 'MEDIUM'
    });
  } else if (issue.type === '风险等级不匹配') {
    recommendations.push({
      customerId: issue.customerId,
      action: `修正风险等级: ${issue.actual} → ${issue.expected} (VIP等级: ${issue.vipLevel})`,
      priority: issue.vipLevel === 'VVVIP' || issue.vipLevel === 'VVIP' ? 'HIGH' : 'MEDIUM'
    });
  }
});

results.account_status_issues.forEach(issue => {
  if (issue.vipLevel === 'VVVIP' || issue.vipLevel === 'VVIP') {
    recommendations.push({
      customerId: issue.customerId,
      action: `修正账户状态: ${issue.status} → active (${issue.vipLevel}客户必须为active)`,
      priority: 'HIGH'
    });
  }
});

if (recommendations.length > 0) {
  const highPriority = recommendations.filter(r => r.priority === 'HIGH');
  const mediumPriority = recommendations.filter(r => r.priority === 'MEDIUM');
  
  if (highPriority.length > 0) {
    console.log('\n高优先级修正 (必须):');
    highPriority.forEach((rec, idx) => {
      console.log(`  ${idx + 1}. [${rec.customerId}] ${rec.action}`);
    });
  }
  
  if (mediumPriority.length > 0) {
    console.log('\n中等优先级修正 (建议):');
    mediumPriority.forEach((rec, idx) => {
      console.log(`  ${idx + 1}. [${rec.customerId}] ${rec.action}`);
    });
  }
} else {
  console.log('  无需修正');
}

// 总体判定
console.log('\n' + '='*60);
console.log('总体判定:');
console.log('='*60);
if (results.quality_score >= 90) {
  console.log('✓ PASS - 数据质量优秀');
} else if (results.quality_score >= 75) {
  console.log('⚠ PASS - 数据质量良好，存在少量问题');
} else if (results.quality_score >= 60) {
  console.log('⚠ WARNING - 数据质量一般，存在多个问题');
} else {
  console.log('✗ FAIL - 数据质量不佳，需要大量修正');
}

// 输出完整客户列表用于参考
console.log('\n' + '='*60);
console.log('完整客户数据参考:');
console.log('='*60);
console.log('ID\t\t名称\t\tVIP等级\t风险评分\t风险等级\t账户状态');
console.log('-'*60);
customers.forEach(c => {
  console.log(`${c.id}\t${c.name.padEnd(12)}\t${c.vipLevel.padEnd(6)}\t${c.riskScore.padEnd(6)}\t${c.riskLevel.padEnd(6)}\t${c.accountStatus}`);
});

console.log('\n检查完毕。');
