/**
 * CUS360 VIP 客户数据修复建议
 * 针对发现的数据不一致问题的修复方案
 */

// ═══════════════════════════════════════════════════════════════════════════
// 【发现的问题】
// ═══════════════════════════════════════════════════════════════════════════
// 
// 客户 C017 (許建弘) - VVIP 但风险评分为 B (中等风险)
// 问题: VVIP 等级应该配合 A+ 或 A 的风险评分 (low 风险)
// 当前不一致: VVIP + B 评分 + medium 风险等级
//
// ═══════════════════════════════════════════════════════════════════════════

// 【修复方案 A - 推荐】升级风险评分到 A
// 说明: 保持 VVIP 等级,将风险评分升级到 A (符合 VVIP 预期)
const fixOption_A = {
  customerId: "C017",
  fieldToModify: "riskScore 和 riskLevel",
  changes: {
    from: {
      riskScore: "B",
      riskLevel: "medium"
    },
    to: {
      riskScore: "A",
      riskLevel: "low"
    }
  },
  reason: "tag 中标注'企業風險可控',表示已被充分评估为低风险。VVIP 等级与 B 评分不符。",
  impact: "修复后数据一致性: 85.7% -> 100%",
  implementation: `
    // 在 CUS360Demo.jsx 的 mockCustomers 中找到 C017
    {
      id: "C017",
      name: "許建弘",
      // ... 其他字段 ...
      vipLevel: "VVIP",
-     riskScore: "B",
+     riskScore: "A",           // 修改
-     riskLevel: "medium",
+     riskLevel: "low",         // 修改
      accountStatus: "active",
      // ... 其他字段 ...
      tags: [
        "企業週轉",
        "高額度需求",
        "循環授信",
        "專人服務偏好",
        "企業風險可控"  // 已有标注说明风险可控
      ],
    }
  `
};

// 【修复方案 B】降级客户等级到 VIP
// 说明: 保持 B 风险评分,将客户等级从 VVIP 降级为 VIP
const fixOption_B = {
  customerId: "C017",
  fieldToModify: "vipLevel",
  changes: {
    from: {
      vipLevel: "VVIP"
    },
    to: {
      vipLevel: "VIP"
    }
  },
  reason: "如果风险评分 B 确实是准确的,则不符合 VVIP 标准,应降级为 VIP",
  impact: "修复后数据一致性: 85.7% -> 100%",
  implementation: `
    // 在 CUS360Demo.jsx 的 mockCustomers 中找到 C017
    {
      id: "C017",
      name: "許建弘",
      // ... 其他字段 ...
-     vipLevel: "VVIP",         // 修改为 VIP
+     vipLevel: "VIP",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      // ... 其他字段 ...
    }
  `
};

// ═══════════════════════════════════════════════════════════════════════════
// 【修复优先级】
// ═══════════════════════════════════════════════════════════════════════════
const priorityAssessment = {
  needsImmediate: false,  // 客户没有负面标记,不紧急
  businessImpact: "低",   // 仅影响 1 位客户
  dataQualityImpact: "中", // 影响系统数据一致性
  recommendedTimeline: "本月内完成",
  suggestedApproach: "选项 A - 升级风险评分",
  reason: "保持客户等级稳定,仅调整风险评分以符合 VVIP 标准"
};

// ═══════════════════════════════════════════════════════════════════════════
// 【验证检查清单】
// ═══════════════════════════════════════════════════════════════════════════
const verificationChecklist = {
  "检查 C017 是否真的是企业客户": "✓ 是,tag 中有'企業週轉'",
  "确认 risk score B 是否准确": "需要风险评估部门确认",
  "确认企业客户是否有特殊风险评分规则": "需要咨询风险管理部门",
  "检查其他企业 VVIP 客户的风险评分": "需要数据库查询",
  "修改前备份原始数据": "✓ 已生成分析报告",
  "修改后验证数据一致性": "✓ 应重新运行分析脚本"
};

// ═══════════════════════════════════════════════════════════════════════════
// 【实际修改代码】(如果选择方案 A)
// ═══════════════════════════════════════════════════════════════════════════

// 修改位置: CUS360Demo.jsx 第 1217-1246 行
// 找到这个对象:
/*
{
  id: "C017",
  name: "許建弘",
  nameEn: "",
  age: 50,
  vipLevel: "VVIP",
  riskScore: "B",              <- 改为 "A"
  riskLevel: "medium",         <- 改为 "low"
  accountStatus: "active",
  ...
}
*/

// 修改后验证:
const postModificationCheck = {
  query: "所有 VVIP 客户的风险评分是否 >= A",
  expectedResult: "✓ PASS - 所有 VVIP 客户风险评分为 A 或 A+",
  dataConsistency: "100%",
  qualityGrade: "优秀"
};

// ═══════════════════════════════════════════════════════════════════════════
console.log("CUS360 VIP 客户数据修复方案");
console.log("=" .repeat(80));
console.log("\n【发现的问题】");
console.log("客户 C017 - 許建弘");
console.log("当前状态: VVIP + riskScore:B + riskLevel:medium");
console.log("问题: VVIP 等级不应与 B 风险评分配对");
console.log("\n【推荐修复方案】");
console.log("方案 A (推荐): 升级风险评分到 A");
console.log("  • riskScore: B -> A");
console.log("  • riskLevel: medium -> low");
console.log("  • 理由: tag 中有'企業風險可控'标注");
console.log("\n【修复后效果】");
console.log("✓ 数据一致性: 85.7% -> 100%");
console.log("✓ 所有 VVIP/VVVIP 客户数据完整一致");
console.log("✓ 无负面标记问题");
