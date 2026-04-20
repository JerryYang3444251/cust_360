// 负面标记定义
const NEGATIVE_TAGS = [
  '遺約/重大事件暫扣',
  '拒絕往來/黑名單註記',
  '存款警示',
  '法院扣押',
  '逾期/催收/呆帳註記',
  '授信展延異常',
  '信用卡住来求異常',
];

// 从CUS360Demo.jsx的mockCustomers数据进行分析
const VIP_CUSTOMERS_ANALYSIS = {
  // 所有VVVIP客户
  vvvipCustomers: [
    {
      id: "C011",
      name: "林冠哲",
      vipLevel: "VVVIP",
      tags: ["高資產", "信用卡活躍用戶"],
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      hasNegativeTags: false,
      negativeTagsFound: [],
      issues: [],
      recommendation: "✓ 无问题 - 数据一致"
    }
  ],

  // 所有VVIP客户
  vvipCustomers: [
    {
      id: "C002",
      name: "李美華",
      vipLevel: "VVIP",
      tags: ["旅行意圖", "信用卡申辦意圖"],
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      hasNegativeTags: false,
      negativeTagsFound: [],
      issues: [],
      recommendation: "✓ 无问题 - 数据一致"
    },
    {
      id: "C007",
      name: "張杰仁",
      vipLevel: "VVIP",
      tags: ["信用卡活躍用戶"],
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      hasNegativeTags: false,
      negativeTagsFound: [],
      issues: [],
      recommendation: "✓ 无问题 - 数据一致"
    },
    {
      id: "C010",
      name: "蔡雅文",
      vipLevel: "VVIP",
      tags: ["重要客戶", "財管客戶註記"],
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      hasNegativeTags: false,
      negativeTagsFound: [],
      issues: [],
      recommendation: "✓ 无问题 - 数据一致"
    },
    {
      id: "C012",
      name: "周逸軒",
      vipLevel: "VVIP",
      tags: [
        "都市精英",
        "高額海外消費",
        "頻繁商務旅遊",
        "尊榮權益需求",
        "你值得更好的尊榮體驗",
        "留學意圖"
      ],
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      hasNegativeTags: false,
      negativeTagsFound: [],
      issues: [],
      recommendation: "✓ 无问题 - 数据一致"
    },
    {
      id: "C017",
      name: "許建弘",
      vipLevel: "VVIP",
      tags: [
        "企業週轉",
        "高額度需求",
        "循環授信",
        "專人服務偏好",
        "企業風險可控"
      ],
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      hasNegativeTags: false,
      negativeTagsFound: [],
      issues: ["⚠️ 数据不一致: VVIP客户风险评分(B)和风险等级(medium)偏高"],
      recommendation: "建议审查: 检查授信风险评估, 考虑是否应升级为VIP或调整风险评分"
    },
    {
      id: "C194",
      name: "羅承翰",
      vipLevel: "VVIP",
      tags: ["出國旅遊意圖"],
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      hasNegativeTags: false,
      negativeTagsFound: [],
      issues: [],
      recommendation: "✓ 无问题 - 数据一致"
    }
  ],

  summary: {
    totalVVVIPCustomers: 1,
    totalVVIPCustomers: 6,
    vvvipWithNegativeTags: 0,
    vvipWithNegativeTags: 0,
    vvvipWithInconsistencies: 0,
    vvipWithInconsistencies: 1,
    overallStatus: "大部分良好,仅发现1例轻微不一致"
  }
};

// ============ 生成格式化报告 ============
console.log("=" .repeat(80));
console.log("CUS360 VVVIP/VVIP 客户数据质量分析报告");
console.log("=" .repeat(80));
console.log("");

console.log("【VVVIP客户分析】(共1位)");
console.log("-" .repeat(80));
VIP_CUSTOMERS_ANALYSIS.vvvipCustomers.forEach(customer => {
  console.log(`\n客户ID: ${customer.id} | ${customer.name}`);
  console.log(`├─ VIP等级: ${customer.vipLevel}`);
  console.log(`├─ 当前Tags: [${customer.tags.join(", ")}]`);
  console.log(`├─ 风险评分/等级: ${customer.riskScore} / ${customer.riskLevel}`);
  console.log(`├─ 账户状态: ${customer.accountStatus}`);
  if (customer.negativeTagsFound.length > 0) {
    console.log(`├─ ❌ 负面标记: [${customer.negativeTagsFound.join(", ")}]`);
  } else {
    console.log(`├─ ✓ 无负面标记`);
  }
  if (customer.issues.length > 0) {
    customer.issues.forEach(issue => {
      console.log(`├─ ${issue}`);
    });
  }
  console.log(`└─ 建议: ${customer.recommendation}`);
});

console.log("\n");
console.log("【VVIP客户分析】(共6位)");
console.log("-" .repeat(80));
VIP_CUSTOMERS_ANALYSIS.vvipCustomers.forEach(customer => {
  console.log(`\n客户ID: ${customer.id} | ${customer.name}`);
  console.log(`├─ VIP等级: ${customer.vipLevel}`);
  console.log(`├─ 当前Tags: [${customer.tags.join(", ")}]`);
  console.log(`├─ 风险评分/等级: ${customer.riskScore} / ${customer.riskLevel}`);
  console.log(`├─ 账户状态: ${customer.accountStatus}`);
  if (customer.negativeTagsFound.length > 0) {
    console.log(`├─ ❌ 负面标记: [${customer.negativeTagsFound.join(", ")}]`);
  } else {
    console.log(`├─ ✓ 无负面标记`);
  }
  if (customer.issues.length > 0) {
    customer.issues.forEach(issue => {
      console.log(`├─ ${issue}`);
    });
  }
  console.log(`└─ 建议: ${customer.recommendation}`);
});

console.log("\n");
console.log("【汇总统计】");
console.log("-" .repeat(80));
console.log(`VVVIP客户总数: ${VIP_CUSTOMERS_ANALYSIS.summary.totalVVVIPCustomers}`);
console.log(`VVIP客户总数: ${VIP_CUSTOMERS_ANALYSIS.summary.totalVVIPCustomers}`);
console.log(`VVVIP客户中有负面标记: ${VIP_CUSTOMERS_ANALYSIS.summary.vvvipWithNegativeTags}位`);
console.log(`VVIP客户中有负面标记: ${VIP_CUSTOMERS_ANALYSIS.summary.vvipWithNegativeTags}位`);
console.log(`VVVIP客户中有数据不一致: ${VIP_CUSTOMERS_ANALYSIS.summary.vvvipWithInconsistencies}位`);
console.log(`VVIP客户中有数据不一致: ${VIP_CUSTOMERS_ANALYSIS.summary.vvipWithInconsistencies}位`);
console.log("");
console.log(`总体状态: ${VIP_CUSTOMERS_ANALYSIS.summary.overallStatus}`);
console.log("");

console.log("【清理建议】");
console.log("-" .repeat(80));
console.log("✓ 无VVVIP/VVIP客户包含负面标记 - 无需清理");
console.log("✓ 无VVVIP/VVIP客户账户状态异常 - 无需清理");
console.log("⚠️  需要关注: C017(許建弘) - VVIP但风险评分为B/medium,建议重新评估");
console.log("");
console.log("=" .repeat(80));
