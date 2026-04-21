import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  Shield,
  FileText,
  Eye,
  EyeOff,
  Download,
  Clock,
  Star,
  MessageCircle,
  Send,
  X,
  RotateCcw,
} from "lucide-react";

const CUS360Demo = () => {
  const [activeModule, setActiveModule] = useState("search");
  // Theme tokens used across the demo (centralized for easy tweaks)
  const CARD = "bg-white p-4 rounded-lg shadow";
  const SUBCARD = "bg-white p-3 rounded-md shadow-sm";
  const LEFT_BORDER = "border-l-4 border-teal-500 pl-3";
  const ACTIVE_BTN_CLASS =
    "bg-gradient-to-r from-teal-500/60 to-cyan-400/60 text-white";
  const THEME_BG = "bg-gradient-to-br from-teal-50 to-white";

  // ========== CENTRALIZED VIP TIER CONFIGURATION ==========
  // 統一管理客戶等級定義，確保跨頁面的一致性
  const VIP_TIERS = {
    VVVIP: {
      key: "VVVIP",
      label: "VVVIP",
      displayLabel: "VVVIP",
      chineseLabel: "超級貴賓",
      order: 4,
      bgColor: "bg-fuchsia-100",
      textColor: "text-fuchsia-800",
      accentColor: "text-fuchsia-600",
      borderColor: "border-fuchsia-300",
      // Financial wealth brackets (AUM, 符合台灣金融市場標準)
      // VVVIP: AUM ≥ NT$3,000萬
      financialRange: {
        min: 30000000,
        max: 100000000,
        rangeWidth: 70000000,
      },
    },
    VVIP: {
      key: "VVIP",
      label: "VVIP",
      displayLabel: "VVIP",
      chineseLabel: "特級貴賓",
      order: 3,
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      accentColor: "text-purple-600",
      borderColor: "border-purple-300",
      // VVIP: AUM NT$1,000萬-2,999萬
      financialRange: {
        min: 10000000,
        max: 29999999,
        rangeWidth: 20000000,
      },
    },
    VIP: {
      key: "VIP",
      label: "VIP",
      displayLabel: "VIP",
      chineseLabel: "貴賓",
      order: 2,
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      accentColor: "text-blue-600",
      borderColor: "border-blue-300",
      // VIP: AUM NT$300萬-999萬
      financialRange: {
        min: 3000000,
        max: 9999999,
        rangeWidth: 7000000,
      },
    },
    normal: {
      key: "normal",
      label: "一般",
      displayLabel: "一般",
      chineseLabel: "一般客戶",
      order: 1,
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      accentColor: "text-gray-600",
      borderColor: "border-gray-300",
      // 一般: AUM < NT$300萬
      financialRange: {
        min: 300000,
        max: 2999999,
        rangeWidth: 2700000,
      },
    },
  };

  // 取得所有等級的陣列（按等級排序）
  const getTiersList = () => {
    return Object.values(VIP_TIERS).sort((a, b) => a.order - b.order);
  };

  // 根據 vipLevel 取得配置
  const getTierConfig = (vipLevel) => {
    return VIP_TIERS[vipLevel] || VIP_TIERS.normal;
  };

  // 取得 CSS 類名（用於標籤背景和文字顏色）
  const getTierBgClass = (vipLevel) => {
    const config = getTierConfig(vipLevel);
    return `${config.bgColor} ${config.textColor}`;
  };

  // 取得顯示用的標籤文本
  const getTierDisplayLabel = (vipLevel) => {
    const config = getTierConfig(vipLevel);
    return config.displayLabel;
  };

  // 取得中文標籤
  const getTierChineseLabel = (vipLevel) => {
    const config = getTierConfig(vipLevel);
    return config.chineseLabel;
  };

  // 取得財務範圍
  const getTierFinancialRange = (vipLevel) => {
    const config = getTierConfig(vipLevel);
    return config.financialRange;
  };

  const renderDashboardModule = () => {
    // Scale metrics to represent a large bank (10,000,000 customers)
    // per request: override base total to 1,230,494
    const BASE_TOTAL = 1_230_494;
    // report range (month based) — controlled by top-level state
    const parseMonthStr = (s) => {
      const [y, m] = (s || "").split("-").map(Number);
      return new Date(y || new Date().getFullYear(), (m ? m : 1) - 1, 1);
    };
    const monthRange = (() => {
      let start = parseMonthStr(rangeStart);
      let end = parseMonthStr(rangeEnd);
      if (!(start instanceof Date) || isNaN(start))
        start = new Date(
          new Date().getFullYear(),
          new Date().getMonth() - 11,
          1
        );
      if (!(end instanceof Date) || isNaN(end)) end = new Date();
      if (start > end) {
        const t = start;
        start = end;
        end = t;
      }
      const out = [];
      const cur = new Date(start.getFullYear(), start.getMonth(), 1);
      // cap to 36 months to keep UI tidy
      for (let i = 0; cur <= end && i < 36; i++) {
        out.push(new Date(cur.getFullYear(), cur.getMonth(), 1));
        cur.setMonth(cur.getMonth() + 1);
      }
      return out;
    })();
    const totalSample = mockCustomers.length || 1;
    // derive proportions from sample and map to base
    const raw = {
      total: mockCustomers.length,
      activeDeposit: mockCustomers.filter(
        (c) => c.accountStatus === "active" && (c.totalAssets || 0) > 0
      ).length,
      activeCard: mockCustomers.filter((c) => (c.last3mCardSpend || 0) > 0)
        .length,
      activeLoan: mockCustomers.filter((c) => (c.totalLiabilities || 0) > 0)
        .length,
    };
    const pct = (n) => n / totalSample || 0;
    const scaled = {
      total: BASE_TOTAL,
      // override active customers to requested fixed value 521,027
      active: 521_027,
    };

    // revenue trend (synthetic series) and revenue KPIs
    const monthCount = Math.max(1, monthRange.length);
    const revSeries = Array.from({ length: monthCount }, (_, i) => {
      const finance = getCustomerFinance(mockCustomers[i % totalSample]);
      const base = 20000000 + (finance.monthlyIncome || 0) * 120;
      // seasonality (peak mid-year & year-end) + deterministic noise
      const season =
        0.85 +
        0.15 * Math.sin((i / 12) * Math.PI * 2) +
        0.1 * Math.sin((i / 6) * Math.PI * 2);
      const noiseSeed =
        mockCustomers[i % totalSample].id.charCodeAt(2) * (i + 7);
      const noise = ((noiseSeed % 1000) - 500) * 40; // +/-20k approx
      return Math.round(base * season + noise);
    });
    const monthLabels = monthRange.map((d) => `${d.getMonth() + 1}月`);

    // credit metrics scaled from sample heuristics
    let dpd30 = 0,
      dpd60 = 0,
      dpd90 = 0,
      npl = 0,
      defaults = 0,
      utilSum = 0,
      utilCount = 0;
    mockCustomers.forEach((c) => {
      const f = getCustomerFinance(c);
      if ((f.cardSpend3M || 0) === 0) dpd30++;
      if ((f.cardSpend3M || 0) < 1000) dpd60++;
      if ((f.cardSpend3M || 0) < 500) dpd90++;
      if ((f.loan || 0) > 0 && f.loan / (f.netWorth || 1) > 0.5) npl++;
      if ((f.loan || 0) > 500000) defaults++;
      if (f.creditLimit) {
        utilSum += f.creditUtilPct || 0;
        utilCount++;
      }
    });
    const credit = {
      // override DPD30 to requested 5%
      dpd30: 5,
      dpd60: Math.round((dpd60 / totalSample) * 100),
      dpd90: Math.round((dpd90 / totalSample) * 100),
      nplRate: Math.round((npl / totalSample) * 100),
      defaultRate: Math.round((defaults / totalSample) * 100),
      avgUtil: Math.round(utilCount ? utilSum / utilCount : 0),
    };

    // Recompute product share using aggregated productPreferences with smoothing to avoid extreme domination
    const prefAgg = mockCustomers.reduce(
      (acc, c) => {
        const pp = c.productPreferences || {};
        acc.credit += pp.creditCard || 0;
        acc.loans += pp.loans || 0;
        acc.deposits += pp.deposits || 0;
        acc.invest += pp.investment || 0;
        return acc;
      },
      { credit: 0, loans: 0, deposits: 0, invest: 0 }
    );
    // Apply exponent smoothing to compress outliers
    const smoothWeights = [
      prefAgg.credit,
      prefAgg.loans,
      prefAgg.deposits,
      prefAgg.invest,
    ].map((w) => Math.pow(Math.max(w, 0.0001), 0.9));
    const wSum = smoothWeights.reduce((s, x) => s + x, 0) || 1;
    let pctFloats = smoothWeights.map((w) => (w / wSum) * 100);
    // Enforce reasonable bounds (min 8%, max 55%) while keeping total 100
    const MIN = 8,
      MAX = 55;
    // First clamp extremes
    pctFloats = pctFloats.map((v) => Math.min(MAX, Math.max(MIN, v)));
    // Rebalance to sum 100 by proportional scaling (after clamping may drift)
    const afterClampSum = pctFloats.reduce((s, x) => s + x, 0);
    pctFloats = pctFloats.map((v) => (v / afterClampSum) * 100);
    // Integer rounding with fractional distribution
    const floors2 = pctFloats.map((v) => Math.floor(v));
    let sum2 = floors2.reduce((s, x) => s + x, 0);
    let rem2 = 100 - sum2;
    const frac2 = pctFloats
      .map((v, i) => ({ i, frac: v - floors2[i] }))
      .sort((a, b) => b.frac - a.frac);
    for (let k = 0; k < frac2.length && rem2 > 0; k++, rem2--)
      floors2[frac2[k].i]++;
    let [cardPct, loanPct, depositPct, investPct] = floors2;
    // Final safety: ensure still within bounds after integer rounding
    const adjustBounds = () => {
      let changed = false;
      const arr = [cardPct, loanPct, depositPct, investPct];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] < MIN) {
          const deficit = MIN - arr[i];
          arr[i] = MIN;
          changed = true;
          // subtract deficit from largest > MIN
          while (deficit > 0) {
            let idx = arr.reduce(
              (imax, v, j, a) => (v > a[imax] ? j : imax),
              0
            );
            if (arr[idx] - 1 > MIN) {
              arr[idx]--;
            } else break;
          }
        }
        if (arr[i] > MAX) {
          const excess = arr[i] - MAX;
          arr[i] = MAX;
          changed = true;
          for (let e = 0; e < excess; e++) {
            let idx = arr.reduce(
              (imin, v, j, a) => (v < a[imin] ? j : imin),
              0
            );
            if (arr[idx] + 1 < MAX) {
              arr[idx]++;
            }
          }
        }
      }
      const newSum = arr.reduce((s, x) => s + x, 0);
      // minor balancing if off by +/-1-2 due to bounds
      while (newSum > 100) {
        let idx = arr.reduce((imax, v, j, a) => (v > a[imax] ? j : imax), 0);
        if (arr[idx] > MIN) {
          arr[idx]--;
        } else break;
      }
      while (newSum < 100) {
        let idx = arr.reduce((imax, v, j, a) => (v >= a[imax] ? j : imax), 0);
        if (arr[idx] < MAX) {
          arr[idx]++;
        } else break;
      }
      [cardPct, loanPct, depositPct, investPct] = arr;
      if (changed) return true;
      return false;
    };
    adjustBounds();
    const productShare = {
      信用卡: cardPct,
      放款: loanPct,
      存款: depositPct,
      投資: investPct,
    };

    // Precompute cumulative cuts for productShare (used by conic-gradient)
    const productCuts = (() => {
      const entries = Object.entries(productShare);
      let acc = 0;
      return entries.map(([k, v]) => {
        const start = acc;
        acc += v;
        return { key: k, pct: v, start, end: acc };
      });
    })();
    // unified KPI number size for teal numbers
    const KPI_NUM = "text-2xl font-bold";
    return (
      <div className="space-y-4 relative">
        {/* 1s 載入動畫覆蓋層 — 固定高度遮罩，內容模糊隱藏在下方 */}
        {dashLoading ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="16" stroke="#99f6e4" strokeWidth="4" />
              <path d="M36 20a16 16 0 0 0-16-16" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="mt-4 text-base font-semibold text-teal-700">資料更新中…</div>
            <div className="mt-1 text-xs text-gray-400">請稍候</div>
          </div>
        ) : (<>
        {/* 報表區間選單 */}
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-teal-50">
          <div className="text-sm font-bold text-teal-700">報表區間</div>
          <div className="flex items-center gap-2 ml-1">
            <input
              type="month"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="px-2 py-1 border border-teal-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <span className="text-gray-400 font-medium">—</span>
            <input
              type="month"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="px-2 py-1 border border-teal-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div className="text-xs text-gray-400 ml-2">所有圖表依月份區間更新</div>
        </div>
        <div className="grid grid-cols-6 gap-4">
          <div
            className="col-span-2 rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            style={{ background: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)", border: "1px solid #99f6e4" }}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">總客戶數</div>
                <div className="text-4xl font-extrabold text-teal-700 leading-none">
                  {scaled.total.toLocaleString()}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-teal-100">
                <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">活躍客戶（最近 3 個月有交易）</div>
                <div className="text-3xl font-extrabold text-cyan-600 leading-none">
                  {scaled.active.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-gray-400">佔總客戶 {Math.round(scaled.active / scaled.total * 100)}%</div>
              </div>
            </div>
          </div>
          <div
            className="col-span-2 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-teal-50 p-4"
          >
            <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">收益與 KPI</div>
            <div className="text-[11px] font-semibold text-gray-400 mb-1">收益趨勢（月）</div>
            <MonthlyBarHover
              values={revSeries}
              color="#0d9488"
              height={72}
              labels={monthLabels}
            />
          </div>
          <div
            className="col-span-2 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-teal-50 p-4"
          >
            <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">產品收益佔比</div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <DonutInteractive
                  data={Object.entries(productShare).map(([label, value]) => ({ label, value }))}
                  colors={["#0d9488", "#06b6d4", "#34d399", "#7dd3fc"]}
                  size={140}
                />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {Object.entries(productShare).map(([k, v], idx) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ["#0d9488","#06b6d4","#34d399","#7dd3fc"][idx % 4] }} />
                      <div>
                        <div className="text-[11px] text-gray-500 leading-none">{k}</div>
                        <div className="text-xl font-extrabold text-teal-700 leading-none mt-0.5">{v}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-3 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-teal-50 bg-white p-4">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">授信與風險重點</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "DPD30", value: `${credit.dpd30}%`, sub: "逰期30日" },
                { label: "不良率", value: `${credit.nplRate}%`, sub: "NPL Rate" },
                { label: "平均使用率", value: `${credit.avgUtil}%`, sub: "Avg. Util." },
              ].map((item) => (
                <div key={item.label} className="bg-gradient-to-b from-teal-50 to-white rounded-xl p-3">
                  <div className="text-[10px] font-bold text-teal-500 uppercase tracking-wide">{item.label}</div>
                  <div className="text-3xl font-extrabold text-teal-700 mt-1 leading-none">{item.value}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-3 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-teal-50 p-4">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">授信活動趨勢（月）</div>
            <MonthlyBarHover
              values={Array.from({ length: monthCount }, (_, i) =>
                Math.round(1000 + 200 * Math.sin((i / 12) * 2 * Math.PI) + i * 10)
              )}
              color="#0f766e"
              height={72}
              labels={monthLabels}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-teal-50 p-4">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">客戶等級分布</div>
            <div className="mt-1">
              {/* compute counts and render pie */}
              {(() => {
                // 使用集中管理的 VIP 等級配置
                const tiers = getTiersList().map((t) => t.key);
                const labels = {};
                getTiersList().forEach((config) => {
                  labels[config.key] = config.displayLabel;
                });
                const counts = tiers.map(
                  (t) =>
                    mockCustomers.filter((c) => (c.vipLevel || "normal") === t)
                      .length
                );
                const total = counts.reduce((s, x) => s + x, 0);
                const rawPct = counts.map((c) =>
                  total ? (c / total) * 100 : 0
                );
                // Integer distribution that sums to 100
                const floors = rawPct.map((v) => Math.floor(v));
                let sumFloors = floors.reduce((s, x) => s + x, 0);
                let remainder = 100 - sumFloors;
                const frac = rawPct
                  .map((v, i) => ({ i, frac: v - floors[i] }))
                  .sort((a, b) => b.frac - a.frac);
                for (
                  let k = 0;
                  k < frac.length && remainder > 0;
                  k++, remainder--
                )
                  floors[frac[k].i]++;
                // Safety adjust if any floor became 0 while counts>0
                for (let i = 0; i < floors.length; i++) {
                  if (counts[i] > 0 && floors[i] === 0) {
                    floors[i] = 1;
                    const idx = floors.reduce(
                      (imax, v, j, a) => (v > a[imax] ? j : imax),
                      0
                    );
                    if (floors[idx] > 1) floors[idx]--;
                  }
                }
                let acc = 0;
                const segs = floors.map((p, i) => {
                  const start = acc;
                  const end = acc + p;
                  acc = end;
                  return {
                    key: tiers[i],
                    pct: p,
                    start,
                    end,
                    label: labels[tiers[i]],
                    count: counts[i],
                  };
                });
                const colors = ["#0d9488", "#06b6d4", "#34d399", "#7dd3fc"];
                return (
                  <div className="flex items-center gap-3">
                    <DonutInteractive
                      data={segs.map((s) => ({ label: s.label, value: s.pct }))}
                      colors={colors}
                      size={140}
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {segs.map((s, i) => (
                          <div key={s.key} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                            <div>
                              <div className="text-[11px] text-gray-500 leading-none">{s.label}</div>
                              <div className="text-xl font-extrabold text-teal-700 leading-none mt-0.5">{s.pct}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-teal-50 p-4">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">近 3 個月互動趨勢</div>
            <MonthlyBarHover
              values={Array.from(
                { length: 3 },
                (_, i) =>
                  (getCustomerFinance(mockCustomers[i % mockCustomers.length]).monthlyIncome || 0) + i * 500
              )}
              color="#0ea5a3"
              height={72}
              labels={["1月", "2月", "3月"]}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-teal-50 p-4">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">重點指標快覽</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "本月新戶", value: Math.round(BASE_TOTAL * 0.002).toLocaleString() },
                { label: "本月貸款申請", value: Math.round(BASE_TOTAL * 0.004).toLocaleString() },
                { label: "月均刷卡額", value: `NT$ ${Math.round(revSeries.reduce((a,b)=>a+b,0)/Math.max(1,revSeries.length)/1000).toLocaleString()}` },
                { label: "預估流失率", value: `${Math.round(((mockCustomers.length*0.02)/totalSample)*100)}%` },
              ].map((item) => (
                <div key={item.label} className="bg-teal-50/60 rounded-xl p-2">
                  <div className="text-[10px] text-gray-500 font-medium">{item.label}</div>
                  <div className="text-lg font-extrabold text-teal-700 leading-tight mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>)}
      </div>
    );
  };
  const mockCustomers = [
    {
      id: "C001",
      name: "王小明",
      nameEn: "",
      age: 35,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-345-678",
      idCard: "A123456789",
      creditCard: "4559-XX-XXXX-1001",
      accountNumber: "004-1234567-1",
      tags: ["高頻交易客戶", "數位通路使用者"],
      email: "wangxm@example.com",
      address: "台北市信義區忠孝東路五段",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.85,
        loans: 0.2,
        deposits: 0.6,
        investment: 0.75,
      },
      spendingCategories: {
        dining: 0.9,
        travel: 0.6,
        groceries: 0.4,
        entertainment: 0.7,
        luxury: 0.3,
        overseas: 0.5,
      },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C002",
      name: "李美華",
      nameEn: "",
      age: 42,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0923-456-789",
      idCard: "B987654321",
      creditCard: "4559-XX-XXXX-1002",
      accountNumber: "004-2345678-2",
      tags: ["旅行意圖", "信用卡申辦意圖"],
      email: "li.mh@example.com",
      address: "新北市板橋區文化路",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "phone"],
      marketingChannels: {
        email: true,
        appPush: false,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.95,
        loans: 0.1,
        deposits: 0.4,
        investment: 0.9,
      },
      spendingCategories: { travel: 0.95, luxury: 0.7, dining: 0.6 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C003",
      name: "陳大偉",
      nameEn: "",
      age: 28,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0934-567-890",
      idCard: "C111223334",
      creditCard: "4559-XX-XXXX-1003",
      accountNumber: "004-3456789-3",
      tags: ["投資理財", "狀態調整-有效戶", "信用使用偏高", "帳戶提醒"],
      email: "chen.dw@example.com",
      address: "台中市西屯區",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["mobile_app"],
      marketingChannels: {
        email: false,
        appPush: true,
        linePush: false,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.4,
        loans: 0.6,
        deposits: 0.5,
        investment: 0.8,
      },
      spendingCategories: { tech: 0.6, groceries: 0.5, entertainment: 0.7 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C004",
      name: "張麗娟",
      nameEn: "",
      age: 51,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0911-222-333",
      idCard: "D222334445",
      creditCard: "4559-XX-XXXX-1004",
      accountNumber: "004-4567890-4",
      tags: ["理財產品偏好"],
      email: "zhang.lj@example.com",
      address: "高雄市鼓山區",
      city: "高雄市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["phone", "branch"],
      marketingChannels: {
        email: false,
        appPush: false,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.6,
        loans: 0.3,
        deposits: 0.9,
        investment: 0.7,
      },
      spendingCategories: { groceries: 0.6, utilities: 0.8, healthcare: 0.7 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "gold",
    },
    {
      id: "C005",
      name: "劉志明",
      nameEn: "",
      age: 46,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0933-444-555",
      idCard: "E333445556",
      creditCard: "4559-XX-XXXX-1005",
      accountNumber: "004-5678901-5",
      tags: ["高風險客戶", "失效戶", "逾期記錄", "催收中"],
      email: "liu.zm@example.com",
      address: "台北市大安區",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: {
        email: false,
        appPush: false,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.2,
        loans: 0.05,
        deposits: 0.3,
        investment: 0.1,
      },
      spendingCategories: { bills: 0.8, essentials: 0.7 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C006",
      name: "林小芳",
      nameEn: "",
      age: 33,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0922-111-222",
      idCard: "F444556667",
      creditCard: "4559-XX-XXXX-1006",
      accountNumber: "004-6789012-6",
      tags: ["數位通路使用者", "狀態調整-有效戶", "信用狀態觀察"],
      email: "lin.xf@example.com",
      address: "台南市中西區",
      city: "台南市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.7,
        loans: 0.2,
        deposits: 0.8,
        investment: 0.5,
      },
      spendingCategories: { groceries: 0.5, dining: 0.6, travel: 0.4 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
    },
    {
      id: "C007",
      name: "張杰仁",
      nameEn: "",
      age: 41,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0966-123-456",
      idCard: "G555667778",
      creditCard: "4559-XX-XXXX-1007",
      accountNumber: "004-7890123-7",
      tags: ["信用卡活躍用戶"],
      email: "zhang.jr@example.com",
      address: "台北市中山區",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app", "wealth_portal"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.98,
        loans: 0.05,
        deposits: 0.6,
        investment: 0.98,
      },
      spendingCategories: { entertainment: 0.9, travel: 0.9, luxury: 0.8 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C008",
      name: "何雅婷",
      nameEn: "",
      age: 29,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0977-234-567",
      idCard: "H666778889",
      creditCard: "4559-XX-XXXX-1008",
      accountNumber: "004-8901234-8",
      tags: ["家庭導向", "狀態調整-有效戶", "分期額度超額"],
      email: "he.yt@example.com",
      address: "桃園市中壢區",
      city: "桃園市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["sms", "mobile_app"],
      marketingChannels: {
        email: false,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.5,
        loans: 0.4,
        deposits: 0.7,
        investment: 0.3,
      },
      spendingCategories: { family: 0.8, groceries: 0.7, childcare: 0.9 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "silver",
    },
    {
      id: "C009",
      name: "吳宗憲",
      nameEn: "",
      age: 58,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0988-345-678",
      idCard: "I777889990",
      creditCard: "4559-XX-XXXX-1009",
      accountNumber: "004-9012345-9",
      tags: ["投資理財"],
      email: "wu.zx@example.com",
      address: "台中市北區",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: {
        email: true,
        appPush: false,
        linePush: false,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.6,
        loans: 0.4,
        deposits: 0.9,
        investment: 0.85,
      },
      spendingCategories: { investments: 0.9, travel: 0.5 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "gold",
    },
    {
      id: "C010",
      name: "蔡雅文",
      nameEn: "",
      age: 64,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0900-456-789",
      idCard: "J888990001",
      creditCard: "4559-XX-XXXX-1010",
      accountNumber: "004-0123456-0",
      tags: ["重要客戶", "財管客戶註記"],
      email: "cai.yw@example.com",
      address: "台北市大同區",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "branch"],
      marketingChannels: {
        email: true,
        appPush: false,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.7,
        loans: 0.2,
        deposits: 0.95,
        investment: 0.99,
      },
      spendingCategories: { wealth: 0.9, philanthropy: 0.6 },
      lifecycleStage: "high_net_worth",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C011",
      name: "林冠哲",
      nameEn: "",
      age: 39,
      vipLevel: "VVVIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0918-222-111",
      idCard: "K999112223",
      creditCard: "4559-XX-XXXX-1011",
      accountNumber: "004-1122334-1",
      tags: ["高資產", "信用卡活躍用戶"],
      email: "lin.gz@example.com",
      address: "新竹市東區",
      city: "新竹市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.9,
        loans: 0.15,
        deposits: 0.8,
        investment: 0.95,
      },
      spendingCategories: { tech: 0.8, travel: 0.7, luxury: 0.6 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "diamond",
    },
    // Persona: 信用卡客戶 1 都市精英 – 高資產、高消費、重視權益
    {
      id: "C012",
      name: "周逸軒",
      nameEn: "",
      age: 45,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-888-012",
      idCard: "L123456780",
      creditCard: "4559-XX-XXXX-1012",
      accountNumber: "004-2233445-2",
      tags: [
        "都市精英",
        "高額海外消費",
        "頻繁商務旅遊",
        "尊榮權益需求",
        "你值得更好的尊榮體驗",
        "留學意圖",
      ],
      email: "zhou.yx@example.com",
      address: "台北市信義區松高路",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app", "wealth_portal"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.97,
        loans: 0.25,
        deposits: 0.65,
        investment: 0.9,
      },
      spendingCategories: {
        travel: 0.95,
        luxury: 0.85,
        dining: 0.7,
        overseas: 0.9,
      },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "diamond",
    },
    // Persona: 信用卡客戶 2 都會小資消費族 – 高回饋導向
    {
      id: "C013",
      name: "林佳穎",
      nameEn: "",
      age: 29,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0920-123-013",
      idCard: "M234567891",
      creditCard: "4559-XX-XXXX-1013",
      accountNumber: "004-3344556-3",
      tags: [
        "小資回饋",
        "電商高頻",
        "跨平台支付",
        "最高回饋追求",
        "高風險客戶",
        "多次逾期",
        "催收異常",
      ],
      email: "lin.jy@example.com",
      address: "新北市三重區重新路",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "sms"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.9,
        loans: 0.15,
        deposits: 0.5,
        investment: 0.3,
      },
      spendingCategories: {
        ecommerce: 0.85,
        delivery: 0.7,
        dining: 0.6,
        smallPurchases: 0.8,
      },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "bronze",
    },
    // Persona: 信用卡客戶 3 家庭生活型 – 穩健消費、重視分期與回饋
    {
      id: "C014",
      name: "陳育庭",
      nameEn: "",
      age: 40,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0935-456-014",
      idCard: "N345678902",
      creditCard: "4559-XX-XXXX-1014",
      accountNumber: "004-4455667-4",
      tags: [
        "家庭生活",
        "大型分期",
        "量販消費",
        "分期零利率需求",
        "家庭消費更輕鬆易管理",
        "分期額度監控",
      ],
      email: "chen.yt@example.com",
      address: "桃園市桃園區中平路",
      city: "桃園市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "sms"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.75,
        loans: 0.35,
        deposits: 0.8,
        investment: 0.4,
      },
      spendingCategories: {
        family: 0.9,
        groceries: 0.8,
        appliances: 0.7,
        insurance: 0.6,
      },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
    },
    // Persona: 貸款客戶 1 房貸買房族 – 穩定收入、重視利率與服務
    {
      id: "C015",
      name: "郭仁豪",
      nameEn: "",
      age: 38,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0976-222-015",
      idCard: "O456789013",
      creditCard: "4559-XX-XXXX-1015",
      accountNumber: "004-5566778-5",
      tags: ["房貸需求", "穩定收入", "線上試算偏好", "房貸意圖", "負債比率監控"],
      email: "guo.rh@example.com",
      address: "台中市南屯區公益路",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "branch", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.6,
        loans: 0.8,
        deposits: 0.85,
        investment: 0.55,
      },
      spendingCategories: { housing: 0.4, family: 0.6, insurance: 0.5 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    // Persona: 貸款客戶 2 小資信貸族 – 資金周轉、偏好快速審核
    {
      id: "C016",
      name: "曾雅霖",
      nameEn: "",
      age: 27,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0958-333-016",
      idCard: "P567890124",
      creditCard: "4559-XX-XXXX-1016",
      accountNumber: "004-6677889-6",
      tags: [
        "小額信貸",
        "快速核貸",
        "資金周轉",
        "低門檻需求",
        "高風險客戶",
        "信貸意圖",
        "頻繁申貸",
        "呆帳風險",
      ],
      email: "zeng.yl@example.com",
      address: "高雄市左營區自由路",
      city: "高雄市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["sms", "mobile_app"],
      marketingChannels: {
        email: false,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.6,
        loans: 0.9,
        deposits: 0.4,
        investment: 0.2,
      },
      spendingCategories: { smallPurchases: 0.7, education: 0.5, travel: 0.4 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    // Persona: 貸款客戶 3 企業主 / SOHO 資金週轉 – 彈性授信、重視額度
    {
      id: "C017",
      name: "許建弘",
      nameEn: "",
      age: 50,
      vipLevel: "VVIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0931-444-017",
      idCard: "Q678901235",
      creditCard: "4559-XX-XXXX-1017",
      accountNumber: "004-7788990-7",
      tags: [
        "企業週轉",
        "高額度需求",
        "循環授信",
        "專人服務偏好",
        "企業風險可控",
      ],
      email: "xu.jh@example.com",
      address: "新竹縣竹北市光明六路",
      city: "新竹縣",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "branch", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.65,
        loans: 0.95,
        deposits: 0.6,
        investment: 0.55,
      },
      spendingCategories: { business: 0.9, inventory: 0.8, travel: 0.5 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "platinum",
    },

    // 12 customers: 喜歡旅遊刷優惠信用卡 (符合篩選: 通路互動=經常關注信用卡優惠與權益 + 意圖標籤=出國旅遊意圖)
    {
      id: "C181",
      name: "葉庭宇",
      nameEn: "",
      age: 31,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-181",
      idCard: "R111111111",
      creditCard: "4559-XX-XXXX-1181",
      accountNumber: "004-1810000-1",
      tags: ["出國旅遊意圖"],
      email: "ye.ty@example.com",
      address: "台北市南港區",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.92,
        loans: 0.1,
        deposits: 0.65,
        investment: 0.7,
      },
      spendingCategories: { travel: 0.9, dining: 0.7, overseas: 0.8 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C182",
      name: "張昕恩",
      nameEn: "",
      age: 27,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-182",
      idCard: "R222222222",
      creditCard: "4559-XX-XXXX-1182",
      accountNumber: "004-1820000-2",
      tags: ["出國旅遊意圖"],
      email: "zhang.xe@example.com",
      address: "新北市永和區",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.94,
        loans: 0.08,
        deposits: 0.6,
        investment: 0.6,
      },
      spendingCategories: { travel: 0.9, ecommerce: 0.7 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C183",
      name: "林柏翰",
      nameEn: "",
      age: 33,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-183",
      idCard: "R333333333",
      creditCard: "4559-XX-XXXX-1183",
      accountNumber: "004-1830000-3",
      tags: ["出國旅遊意圖"],
      email: "lin.bh@example.com",
      address: "桃園市平鎮區",
      city: "桃園市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.93,
        loans: 0.12,
        deposits: 0.58,
        investment: 0.65,
      },
      spendingCategories: { travel: 0.85, luxury: 0.6 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C184",
      name: "黃郁庭",
      nameEn: "",
      age: 29,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-184",
      idCard: "R444444444",
      creditCard: "4559-XX-XXXX-1184",
      accountNumber: "004-1840000-4",
      tags: ["出國旅遊意圖"],
      email: "huang.yt@example.com",
      address: "台中市西區",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.91,
        loans: 0.1,
        deposits: 0.62,
        investment: 0.62,
      },
      spendingCategories: { travel: 0.88, dining: 0.7 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C185",
      name: "吳哲安",
      nameEn: "",
      age: 36,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-185",
      idCard: "R555555555",
      creditCard: "4559-XX-XXXX-1185",
      accountNumber: "004-1850000-5",
      tags: ["出國旅遊意圖"],
      email: "wu.za@example.com",
      address: "高雄市苓雅區",
      city: "高雄市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.92,
        loans: 0.15,
        deposits: 0.6,
        investment: 0.68,
      },
      spendingCategories: { travel: 0.9, entertainment: 0.6 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C186",
      name: "陳姿穎",
      nameEn: "",
      age: 34,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-186",
      idCard: "R666666666",
      creditCard: "4559-XX-XXXX-1186",
      accountNumber: "004-1860000-6",
      tags: ["出國旅遊意圖"],
      email: "chen.zy@example.com",
      address: "台南市東區",
      city: "台南市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.95,
        loans: 0.06,
        deposits: 0.63,
        investment: 0.66,
      },
      spendingCategories: { travel: 0.9, groceries: 0.5 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C187",
      name: "徐庭瑋",
      nameEn: "",
      age: 30,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-187",
      idCard: "R777777777",
      creditCard: "4559-XX-XXXX-1187",
      accountNumber: "004-1870000-7",
      tags: ["出國旅遊意圖"],
      email: "xu.tw@example.com",
      address: "新竹市東區",
      city: "新竹市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.9,
        loans: 0.1,
        deposits: 0.6,
        investment: 0.6,
      },
      spendingCategories: { travel: 0.88, tech: 0.6 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C188",
      name: "羅佳怡",
      nameEn: "",
      age: 28,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-188",
      idCard: "R888888888",
      creditCard: "4559-XX-XXXX-1188",
      accountNumber: "004-1880000-8",
      tags: ["出國旅遊意圖"],
      email: "luo.jy@example.com",
      address: "彰化縣彰化市",
      city: "彰化縣",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.93,
        loans: 0.08,
        deposits: 0.61,
        investment: 0.63,
      },
      spendingCategories: { travel: 0.9, luxury: 0.55 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C189",
      name: "蔡承恩",
      nameEn: "",
      age: 32,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-189",
      idCard: "R999999999",
      creditCard: "4559-XX-XXXX-1189",
      accountNumber: "004-1890000-9",
      tags: ["出國旅遊意圖"],
      email: "cai.ce@example.com",
      address: "台北市士林區",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.92,
        loans: 0.12,
        deposits: 0.62,
        investment: 0.64,
      },
      spendingCategories: { travel: 0.9, dining: 0.65 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C190",
      name: "周雅婷",
      nameEn: "",
      age: 26,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-190",
      idCard: "S000000000",
      creditCard: "4559-XX-XXXX-1190",
      accountNumber: "004-1900000-0",
      tags: ["出國旅遊意圖"],
      email: "zhou.yt@example.com",
      address: "新北市板橋區",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.94,
        loans: 0.07,
        deposits: 0.6,
        investment: 0.6,
      },
      spendingCategories: { travel: 0.92, ecommerce: 0.7 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C191",
      name: "江柏妍",
      nameEn: "",
      age: 35,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-191",
      idCard: "S111111111",
      creditCard: "4559-XX-XXXX-1191",
      accountNumber: "004-1910000-1",
      tags: ["出國旅遊意圖"],
      email: "jiang.by@example.com",
      address: "台中市北屯區",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.91,
        loans: 0.1,
        deposits: 0.62,
        investment: 0.66,
      },
      spendingCategories: { travel: 0.9, groceries: 0.5 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C192",
      name: "高予晴",
      nameEn: "",
      age: 30,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-111-192",
      idCard: "S222222222",
      creditCard: "4559-XX-XXXX-1192",
      accountNumber: "004-1920000-2",
      tags: ["出國旅遊意圖"],
      email: "gao.yq@example.com",
      address: "台北市中山區",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.93,
        loans: 0.09,
        deposits: 0.6,
        investment: 0.62,
      },
      spendingCategories: { travel: 0.9, entertainment: 0.6 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    // 出國旅遊客戶：符合 (風險=低, 帳戶=有效戶, 交易互動=刷卡金額顯著成長, 意圖=出國旅遊意圖, 通路互動=近期想換匯者)
    {
      id: "C193",
      name: "鄭雅雯",
      nameEn: "",
      age: 37,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-193-000",
      idCard: "T333333333",
      creditCard: "4559-XX-XXXX-1193",
      accountNumber: "004-1930000-3",
      tags: ["出國旅遊意圖"],
      email: "zheng.yw@example.com",
      address: "台北市大安區復興南路",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.96,
        loans: 0.08,
        deposits: 0.7,
        investment: 0.8,
      },
      spendingCategories: { travel: 0.9, luxury: 0.6, dining: 0.7 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "gold",
    },
    {
      id: "C194",
      name: "羅承翰",
      nameEn: "",
      age: 42,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-194-000",
      idCard: "T444444444",
      creditCard: "4559-XX-XXXX-1194",
      accountNumber: "004-1940000-4",
      tags: ["出國旅遊意圖"],
      email: "luo.ch@example.com",
      address: "新北市新店區北新路",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "mobile_app"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.97,
        loans: 0.05,
        deposits: 0.68,
        investment: 0.85,
      },
      spendingCategories: { travel: 0.92, overseas: 0.85, dining: 0.6 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C195",
      name: "沈莉媛",
      nameEn: "",
      age: 35,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-195-000",
      idCard: "T555555555",
      creditCard: "4559-XX-XXXX-1195",
      accountNumber: "004-1950000-5",
      tags: ["出國旅遊意圖"],
      email: "shen.ly@example.com",
      address: "台中市西屯區市政北一路",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "mobile_app", "email"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.95,
        loans: 0.1,
        deposits: 0.66,
        investment: 0.75,
      },
      spendingCategories: { travel: 0.9, entertainment: 0.6, luxury: 0.55 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "gold",
    },
    // Persona: 新手媽媽 - 為孩子規劃出國留學基金
    {
      id: "C196",
      name: "林怡君",
      nameEn: "Lin Yi-Jun",
      age: 32,
      industry: "外商行銷企劃",
      nationality: "中華民國",
      maritalStatus: "已婚",
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-196-000",
      idCard: "U666666666",
      creditCard: "4559-XX-XXXX-1196",
      accountNumber: "004-1960000-6",
      email: "lin.yj@example.com",
      address: "台北市信義區復興南路",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "wealth_portal"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.55,
        loans: 0.25,
        deposits: 0.9,
        investment: 0.6,
      },
      spendingCategories: {
        childcare: 0.95,
        education: 0.9,
        family: 0.85,
        groceries: 0.8,
        healthcare: 0.75,
        dining: 0.7,
        essentials: 0.75,
        wealth: 0.8,
        investments: 0.7,
        overseas: 0.6,
      },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
      tags: [
        "新手媽媽",
        "家庭導向",
        "教育金規劃需求",
        "留學意圖",
        "數位通路使用者",
        "有效戶",
      ],
    },
    {
      id: "C197",
      name: "曾建文",
      nameEn: "",
      age: 52,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0956-789-012",
      idCard: "J197197197",
      creditCard: "4559-XX-XXXX-0183",
      accountNumber: "004-9901234-0",
      tags: ["有投資經驗用戶", "投資意圖", "高淨值客戶", "財富管理需求"],
      email: "zeng.jw@example.com",
      address: "台北市信義區威秀廣場",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.65,
        loans: 0.15,
        deposits: 0.7,
        investment: 0.95,
      },
      spendingCategories: { 
        investments: 0.92,
        luxury: 0.75, 
        dining: 0.65, 
        travel: 0.7 
      },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C198",
      name: "吳燕如",
      nameEn: "",
      age: 45,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0945-678-901",
      idCard: "K999001112",
      creditCard: "4559-XX-XXXX-0184",
      accountNumber: "004-0012345-1",
      tags: ["有投資經驗用戶", "投資意圖", "理財規劃用戶", "數位通路使用者"],
      email: "wu.yr@example.com",
      address: "新北市新店區七張路",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "wealth_portal"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.6,
        loans: 0.2,
        deposits: 0.65,
        investment: 0.88,
      },
      spendingCategories: { 
        investments: 0.85,
        entertainment: 0.55, 
        dining: 0.6, 
        healthcare: 0.5 
      },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C199",
      name: "蔡明珠",
      nameEn: "",
      age: 58,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0967-890-123",
      idCard: "L111112223",
      creditCard: "4559-XX-XXXX-0185",
      accountNumber: "004-1234567-2",
      tags: ["有投資經驗用戶", "投資意圖", "穩健投資者", "退休規劃"],
      email: "cai.mz@example.com",
      address: "台中市西屯區惠來路",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["phone", "branch", "email"],
      marketingChannels: {
        email: true,
        appPush: false,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.55,
        loans: 0.1,
        deposits: 0.75,
        investment: 0.82,
      },
      spendingCategories: { 
        investments: 0.80,
        utilities: 0.65, 
        healthcare: 0.7, 
        travel: 0.45 
      },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "gold",
    },
    {
      id: "C200",
      name: "邱德財",
      nameEn: "",
      age: 48,
      vipLevel: "VVVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0978-901-234",
      idCard: "M222223334",
      creditCard: "4559-XX-XXXX-0186",
      accountNumber: "004-2345678-3",
      tags: ["有投資經驗用戶", "投資理財", "高淨值客戶", "財富管理需求"],
      email: "qiu.dc@example.com",
      address: "台北市中山區敬業三路",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.72,
        loans: 0.08,
        deposits: 0.68,
        investment: 0.98,
      },
      spendingCategories: { 
        investments: 0.95,
        luxury: 0.82, 
        dining: 0.78, 
        travel: 0.85 
      },
      lifecycleStage: "affluent",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C201",
      name: "黃思涵",
      nameEn: "",
      age: 41,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0989-012-345",
      idCard: "N333334445",
      creditCard: "4559-XX-XXXX-0187",
      accountNumber: "004-3456789-4",
      tags: ["有投資經驗用戶", "投資意圖", "創業融資需求", "業績成長客"],
      email: "huang.sh@example.com",
      address: "高雄市前金區中山一路",
      city: "高雄市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "wealth_portal"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.7,
        loans: 0.45,
        deposits: 0.6,
        investment: 0.85,
      },
      spendingCategories: { 
        investments: 0.80,
        tech: 0.75, 
        dining: 0.65, 
        travel: 0.6 
      },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C202",
      name: "廖俊宇",
      nameEn: "",
      age: 32,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0912-456-789",
      idCard: "O444445556",
      creditCard: "4559-XX-XXXX-0188",
      accountNumber: "004-4567890-5",
      tags: ["有投資經驗用戶", "投資意圖", "自雇者", "狀態調整-有效戶"],
      email: "liao.jy@example.com",
      address: "台北市東區忠孝東路",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: {
        email: false,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.45,
        loans: 0.65,
        deposits: 0.55,
        investment: 0.75,
      },
      spendingCategories: { 
        tech: 0.8,
        investments: 0.65,
        dining: 0.5,
        entertainment: 0.6
      },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C203",
      name: "鄭美玲",
      nameEn: "",
      age: 47,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0923-567-890",
      idCard: "P555556667",
      creditCard: "4559-XX-XXXX-0189",
      accountNumber: "004-5678901-6",
      tags: ["有投資經驗用戶", "投資意圖", "家庭導向", "教育金規劃"],
      email: "zheng.ml@example.com",
      address: "台中市逢甲大學附近",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "branch"],
      marketingChannels: {
        email: true,
        appPush: false,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.5,
        loans: 0.25,
        deposits: 0.85,
        investment: 0.80,
      },
      spendingCategories: { 
        investments: 0.75,
        utilities: 0.7,
        healthcare: 0.65,
        family: 0.8
      },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
    },
    {
      id: "C204",
      name: "林昊天",
      nameEn: "",
      age: 55,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0934-678-901",
      idCard: "Q666667778",
      creditCard: "4559-XX-XXXX-0190",
      accountNumber: "004-6789012-7",
      tags: ["有投資經驗用戶", "投資意圖", "企業主", "財務顧問客"],
      email: "lin.ht@example.com",
      address: "新北市板橋縣民大道",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "phone"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.68,
        loans: 0.12,
        deposits: 0.7,
        investment: 0.92,
      },
      spendingCategories: { 
        investments: 0.88,
        luxury: 0.7,
        dining: 0.75,
        travel: 0.8
      },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C205",
      name: "王素娥",
      nameEn: "",
      age: 63,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0945-789-012",
      idCard: "R777778889",
      creditCard: "4559-XX-XXXX-0191",
      accountNumber: "004-7890123-8",
      tags: ["有投資經驗用戶", "投資意圖", "退休族", "穩健投資者"],
      email: "wang.se@example.com",
      address: "高雄市鳳山區文山路",
      city: "高雄市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["phone", "branch"],
      marketingChannels: {
        email: false,
        appPush: false,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.35,
        loans: 0.05,
        deposits: 0.95,
        investment: 0.70,
      },
      spendingCategories: { 
        investments: 0.68,
        healthcare: 0.8,
        utilities: 0.75,
        dining: 0.4
      },
      lifecycleStage: "retired",
      lifetimeValueTier: "silver",
    },
    {
      id: "C206",
      name: "陳俊傑",
      nameEn: "",
      age: 38,
      vipLevel: "VIP",
      riskScore: "B+",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0956-890-123",
      idCard: "S888889990",
      creditCard: "4559-XX-XXXX-0192",
      accountNumber: "004-8901234-9",
      tags: ["有投資經驗用戶", "投資意圖", "信用使用偏高", "高風險偏好"],
      email: "chen.jj@example.com",
      address: "台中市西屯區朝馬路",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: true,
        sms: false,
      },
      productPreferences: {
        creditCard: 0.75,
        loans: 0.55,
        deposits: 0.40,
        investment: 0.88,
      },
      spendingCategories: { 
        investments: 0.85,
        entertainment: 0.8,
        dining: 0.75,
        tech: 0.7
      },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C207",
      name: "樊亦璿",
      nameEn: "",
      age: 54,
      vipLevel: "VVVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-000-100",
      idCard: "T001639233",
      creditCard: "4559-XX-XXXX-0300",
      accountNumber: "004-0000207-7",
      tags: ["科技業CEO", "高淨值客戶"],
      email: "su207@example.com",
      address: "新北市汐止區福德一路234號",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: { email: true, appPush: false, linePush: true, sms: false },
      productPreferences: { creditCard: 0.94, loans: 0.14, deposits: 0.85, investment: 0.94 },
      spendingCategories: { luxury: 0.75, travel: 0.72, dining: 0.7, overseas: 0.67, investments: 0.95 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C208",
      name: "温嘉宜",
      nameEn: "",
      age: 61,
      vipLevel: "VVVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0923-000-107",
      idCard: "U001647152",
      creditCard: "4559-XX-XXXX-0301",
      accountNumber: "004-0000208-8",
      tags: ["建設業主", "高資產客戶", "財富管理需求"],
      email: "han208@example.com",
      address: "台中市沙鹿區彰化路119號",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: { email: true, appPush: false, linePush: true, sms: false },
      productPreferences: { creditCard: 0.94, loans: 0.05, deposits: 0.73, investment: 0.98 },
      spendingCategories: { luxury: 0.75, travel: 0.77, dining: 0.82, overseas: 0.77, investments: 0.86 },
      lifecycleStage: "high_net_worth",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C209",
      name: "沈凱婷",
      nameEn: "",
      age: 48,
      vipLevel: "VVVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0934-000-114",
      idCard: "V001655071",
      creditCard: "4559-XX-XXXX-0302",
      accountNumber: "004-0000209-9",
      tags: ["生技產業", "創業家", "高淨值客戶", "投資理財意圖"],
      email: "ge209@example.com",
      address: "台中市沙鹿區彰化路3號",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: { email: true, appPush: false, linePush: true, sms: false },
      productPreferences: { creditCard: 0.94, loans: 0.14, deposits: 0.91, investment: 0.95 },
      spendingCategories: { luxury: 0.76, travel: 0.82, dining: 0.65, overseas: 0.88, investments: 0.79 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C210",
      name: "謝睿哲",
      nameEn: "",
      age: 57,
      vipLevel: "VVVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0911-000-121",
      idCard: "W001662990",
      creditCard: "4559-XX-XXXX-0303",
      accountNumber: "004-0000210-0",
      tags: ["傳產製造業", "企業主"],
      email: "wei210@example.com",
      address: "台中市沙鹿區彰化路114號",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: { email: true, appPush: false, linePush: true, sms: false },
      productPreferences: { creditCard: 0.94, loans: 0.07, deposits: 0.81, investment: 0.95 },
      spendingCategories: { luxury: 0.76, travel: 0.88, dining: 0.53, overseas: 0.92, investments: 0.94 },
      lifecycleStage: "high_net_worth",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C211",
      name: "孟玲瑄",
      nameEn: "",
      age: 52,
      vipLevel: "VVVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0922-000-128",
      idCard: "X001670909",
      creditCard: "4559-XX-XXXX-0304",
      accountNumber: "004-0000211-1",
      tags: ["航運業", "高資產客戶", "私人銀行"],
      email: "gong211@example.com",
      address: "台中市清水區中央路229號",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: { email: true, appPush: false, linePush: true, sms: false },
      productPreferences: { creditCard: 0.93, loans: 0.12, deposits: 0.77, investment: 0.98 },
      spendingCategories: { luxury: 0.77, travel: 0.93, dining: 0.7, overseas: 0.82, investments: 0.87 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C212",
      name: "姚子慧",
      nameEn: "",
      age: 45,
      vipLevel: "VVVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0933-000-135",
      idCard: "Y001678828",
      creditCard: "4559-XX-XXXX-0305",
      accountNumber: "004-0000212-2",
      tags: ["科技業高管", "股票投資", "財富管理需求", "高淨值客戶"],
      email: "fang212@example.com",
      address: "台中市清水區中央路256號",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: { email: true, appPush: false, linePush: true, sms: false },
      productPreferences: { creditCard: 0.93, loans: 0.08, deposits: 0.95, investment: 0.94 },
      spendingCategories: { luxury: 0.78, travel: 0.92, dining: 0.82, overseas: 0.71, investments: 0.78 },
      lifecycleStage: "high_net_worth",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C213",
      name: "容秉澤",
      nameEn: "",
      age: 41,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0944-000-142",
      idCard: "Z001686747",
      creditCard: "4559-XX-XXXX-0306",
      accountNumber: "004-0000213-3",
      tags: ["建築師", "專業人士"],
      email: "lai213@example.com",
      address: "高雄市鳳山區中山路141號",
      city: "高雄市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.88, loans: 0.16, deposits: 0.65, investment: 0.91 },
      spendingCategories: { luxury: 0.78, travel: 0.87, dining: 0.64, overseas: 0.61, investments: 0.94 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C214",
      name: "任詩涵",
      nameEn: "",
      age: 60,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0955-000-149",
      idCard: "A001694666",
      creditCard: "4559-XX-XXXX-0307",
      accountNumber: "004-0000214-4",
      tags: ["科技業工程師", "數位通路使用者", "信用卡活躍用戶"],
      email: "xie214@example.com",
      address: "高雄市鳳山區中山路25號",
      city: "高雄市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.88, loans: 0.15, deposits: 0.7, investment: 0.93 },
      spendingCategories: { luxury: 0.79, travel: 0.82, dining: 0.53, overseas: 0.7, investments: 0.87 },
      lifecycleStage: "high_net_worth",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C215",
      name: "史雯婷",
      nameEn: "",
      age: 45,
      vipLevel: "VVIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0966-000-156",
      idCard: "B001702585",
      creditCard: "4559-XX-XXXX-0308",
      accountNumber: "004-0000215-5",
      tags: ["醫師", "高收入專業人士", "信用卡活躍用戶", "投資理財意圖"],
      email: "ke215@example.com",
      address: "高雄市小港區小港路92號",
      city: "高雄市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.87, loans: 0.13, deposits: 0.85, investment: 0.83 },
      spendingCategories: { luxury: 0.79, travel: 0.76, dining: 0.71, overseas: 0.8, investments: 0.78 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C216",
      name: "方家豪",
      nameEn: "",
      age: 39,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0977-000-163",
      idCard: "C001710504",
      creditCard: "4559-XX-XXXX-0309",
      accountNumber: "004-0000216-6",
      tags: ["大學教授", "穩健投資者"],
      email: "pan216@example.com",
      address: "高雄市小港區小港路207號",
      city: "高雄市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.87, loans: 0.19, deposits: 0.6, investment: 0.95 },
      spendingCategories: { luxury: 0.8, travel: 0.71, dining: 0.82, overseas: 0.9, investments: 0.93 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C217",
      name: "艾佳穎",
      nameEn: "",
      age: 51,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0988-000-170",
      idCard: "D001718423",
      creditCard: "4559-XX-XXXX-0310",
      accountNumber: "004-0000217-7",
      tags: ["科技業VP", "高收入專業人士", "出國旅遊意圖"],
      email: "yuan217@example.com",
      address: "桃園市龍潭區中正路278號",
      city: "桃園市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.87, loans: 0.1, deposits: 0.75, investment: 0.89 },
      spendingCategories: { luxury: 0.8, travel: 0.66, dining: 0.64, overseas: 0.89, investments: 0.88 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C218",
      name: "賀妍慈",
      nameEn: "",
      age: 44,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0900-000-177",
      idCard: "E001726342",
      creditCard: "4559-XX-XXXX-0311",
      accountNumber: "004-0000218-8",
      tags: ["診所院長", "高收入專業人士", "財富管理需求", "信用狀態觀察"],
      email: "jiang218@example.com",
      address: "桃園市平鎮區廣泰路162號",
      city: "桃園市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.86, loans: 0.22, deposits: 0.79, investment: 0.87 },
      spendingCategories: { luxury: 0.81, travel: 0.69, dining: 0.54, overseas: 0.79, investments: 0.77 },
      lifecycleStage: "high_net_worth",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C219",
      name: "植宗憲",
      nameEn: "",
      age: 36,
      vipLevel: "VVIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0918-000-184",
      idCard: "F001734261",
      creditCard: "4559-XX-XXXX-0312",
      accountNumber: "004-0000219-9",
      tags: ["基金經理", "有投資經驗用戶"],
      email: "lv219@example.com",
      address: "桃園市平鎮區廣泰路47號",
      city: "桃園市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.86, loans: 0.06, deposits: 0.56, investment: 0.97 },
      spendingCategories: { luxury: 0.81, travel: 0.74, dining: 0.71, overseas: 0.68, investments: 0.92 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C220",
      name: "喬淑媛",
      nameEn: "",
      age: 58,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0929-000-191",
      idCard: "G001742180",
      creditCard: "4559-XX-XXXX-0313",
      accountNumber: "004-0000220-0",
      tags: ["連鎖餐飲業主", "創業家", "數位通路使用者"],
      email: "xue220@example.com",
      address: "台南市永康區中正路70號",
      city: "台南市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.86, loans: 0.25, deposits: 0.81, investment: 0.85 },
      spendingCategories: { luxury: 0.82, travel: 0.79, dining: 0.81, overseas: 0.62, investments: 0.89 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C221",
      name: "許恩慈",
      nameEn: "",
      age: 43,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0930-000-198",
      idCard: "H001750099",
      creditCard: "4559-XX-XXXX-0314",
      accountNumber: "004-0000221-1",
      tags: ["醫師", "高收入專業人士", "信用卡活躍用戶", "投資理財意圖"],
      email: "fan221@example.com",
      address: "台南市永康區中正路185號",
      city: "台南市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.85, loans: 0.07, deposits: 0.74, investment: 0.9 },
      spendingCategories: { luxury: 0.82, travel: 0.85, dining: 0.63, overseas: 0.72, investments: 0.76 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C222",
      name: "紀廷宇",
      nameEn: "",
      age: 55,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0931-000-205",
      idCard: "I001758018",
      creditCard: "4559-XX-XXXX-0315",
      accountNumber: "004-0000222-2",
      tags: ["大學教授", "穩健投資者"],
      email: "qian222@example.com",
      address: "新竹市北區中正路300號",
      city: "新竹市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.85, loans: 0.21, deposits: 0.61, investment: 0.94 },
      spendingCategories: { luxury: 0.83, travel: 0.9, dining: 0.54, overseas: 0.83, investments: 0.92 },
      lifecycleStage: "high_net_worth",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C223",
      name: "范欣盈",
      nameEn: "",
      age: 47,
      vipLevel: "VVIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0956-000-212",
      idCard: "J001765937",
      creditCard: "4559-XX-XXXX-0316",
      accountNumber: "004-0000223-3",
      tags: ["科技業VP", "高收入專業人士", "出國旅遊意圖"],
      email: "lu223@example.com",
      address: "嘉義市西區中山路184號",
      city: "嘉義市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.85, loans: 0.1, deposits: 0.87, investment: 0.82 },
      spendingCategories: { luxury: 0.83, travel: 0.95, dining: 0.72, overseas: 0.93, investments: 0.89 },
      lifecycleStage: "affluent",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C224",
      name: "石玉珊",
      nameEn: "",
      age: 49,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0967-000-219",
      idCard: "K001773856",
      creditCard: "4559-XX-XXXX-0317",
      accountNumber: "004-0000224-4",
      tags: ["診所院長", "高收入專業人士", "財富管理需求", "信用狀態觀察"],
      email: "xia224@example.com",
      address: "基隆市中正區中正路69號",
      city: "基隆市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.84, loans: 0.18, deposits: 0.68, investment: 0.94 },
      spendingCategories: { luxury: 0.84, travel: 0.9, dining: 0.81, overseas: 0.86, investments: 0.76 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C225",
      name: "惠承翰",
      nameEn: "",
      age: 38,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0978-000-226",
      idCard: "L001781775",
      creditCard: "4559-XX-XXXX-0318",
      accountNumber: "004-0000225-5",
      tags: ["基金經理", "有投資經驗用戶"],
      email: "ji225@example.com",
      address: "宜蘭縣宜蘭市中山路48號",
      city: "宜蘭縣",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.84, loans: 0.14, deposits: 0.67, investment: 0.9 },
      spendingCategories: { luxury: 0.84, travel: 0.85, dining: 0.63, overseas: 0.76, investments: 0.91 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C226",
      name: "盛玉蓮",
      nameEn: "",
      age: 53,
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0989-000-233",
      idCard: "M001789694",
      creditCard: "4559-XX-XXXX-0319",
      accountNumber: "004-0000226-6",
      tags: ["連鎖餐飲業主", "創業家", "數位通路使用者"],
      email: "yin226@example.com",
      address: "花蓮縣花蓮市中正路164號",
      city: "花蓮縣",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "wealth_portal", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: true, sms: false },
      productPreferences: { creditCard: 0.84, loans: 0.15, deposits: 0.88, investment: 0.86 },
      spendingCategories: { luxury: 0.85, travel: 0.8, dining: 0.55, overseas: 0.66, investments: 0.9 },
      lifecycleStage: "high_net_worth",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C227",
      name: "曹欣雯",
      nameEn: "",
      age: 48,
      vipLevel: "VIP",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0901-000-240",
      idCard: "N001797613",
      creditCard: "4559-XX-XXXX-0320",
      accountNumber: "004-0000227-7",
      tags: ["會計師", "專業人士", "投資理財意圖", "信用卡活躍用戶"],
      email: "zhu227@example.com",
      address: "彰化縣彰化市中正路279號",
      city: "彰化縣",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.69, loans: 0.36, deposits: 0.55, investment: 0.84 },
      spendingCategories: { travel: 0.46, dining: 0.65, deposits: 0.3, groceries: 0.64 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C228",
      name: "蒲宇軒",
      nameEn: "",
      age: 36,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0902-000-247",
      idCard: "O001805532",
      creditCard: "4559-XX-XXXX-0321",
      accountNumber: "004-0000228-8",
      tags: ["藥劑師", "醫療專業"],
      email: "luo228@example.com",
      address: "彰化縣彰化市中正路206號",
      city: "彰化縣",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.68, loans: 0.26, deposits: 0.68, investment: 0.6 },
      spendingCategories: { travel: 0.37, dining: 0.74, deposits: 0.57, groceries: 0.61, education: 0.64 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
    },
    {
      id: "C229",
      name: "韓佳穗",
      nameEn: "",
      age: 45,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0903-000-254",
      idCard: "P001813451",
      creditCard: "4559-XX-XXXX-0322",
      accountNumber: "004-0000229-9",
      tags: ["行銷主管", "數位通路使用者", "信用卡活躍用戶"],
      email: "kong229@example.com",
      address: "苗栗縣苗栗市中正路91號",
      city: "苗栗縣",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.68, loans: 0.42, deposits: 0.8, investment: 0.66 },
      spendingCategories: { travel: 0.32, dining: 0.54, investment: 0.6, groceries: 0.45 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C230",
      name: "岳惠玲",
      nameEn: "",
      age: 32,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0904-000-261",
      idCard: "Q001821370",
      creditCard: "4559-XX-XXXX-0323",
      accountNumber: "004-0000230-0",
      tags: ["半導體業工程師", "科技業", "高頻交易客戶", "投資理財意圖"],
      email: "lei230@example.com",
      address: "宜蘭縣宜蘭市中山路26號",
      city: "宜蘭縣",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.67, loans: 0.2, deposits: 0.48, investment: 0.78 },
      spendingCategories: { travel: 0.4, dining: 0.46, investment: 0.31, groceries: 0.31 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "gold",
    },
    {
      id: "C231",
      name: "邵宏儒",
      nameEn: "",
      age: 50,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0905-000-268",
      idCard: "R001829289",
      creditCard: "4559-XX-XXXX-0324",
      accountNumber: "004-0000231-1",
      tags: ["電商創業者", "數位通路使用者"],
      email: "shen231@example.com",
      address: "基隆市中正區中正路142號",
      city: "基隆市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.67, loans: 0.48, deposits: 0.75, investment: 0.52 },
      spendingCategories: { travel: 0.49, dining: 0.66, investment: 0.59, groceries: 0.47 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C232",
      name: "左芝穎",
      nameEn: "",
      age: 41,
      vipLevel: "VIP",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0906-000-275",
      idCard: "S001837208",
      creditCard: "4559-XX-XXXX-0325",
      accountNumber: "004-0000232-2",
      tags: ["護理師", "醫療專業", "家庭導向"],
      email: "teng232@example.com",
      address: "嘉義市西區中山路257號",
      city: "嘉義市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.66, loans: 0.16, deposits: 0.73, investment: 0.74 },
      spendingCategories: { travel: 0.57, dining: 0.74, deposits: 0.58, groceries: 0.63, education: 0.69 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
    },
    {
      id: "C233",
      name: "龐承惠",
      nameEn: "",
      age: 26,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0907-000-282",
      idCard: "T001845127",
      creditCard: "4559-XX-XXXX-0326",
      accountNumber: "004-0000233-3",
      tags: ["小企業主", "自雇者", "信用使用偏高", "創業融資需求"],
      email: "zou233@example.com",
      address: "新竹市東區光復路228號",
      city: "新竹市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.66, loans: 0.46, deposits: 0.5, investment: 0.7 },
      spendingCategories: { travel: 0.66, dining: 0.54, deposits: 0.32, groceries: 0.62 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C234",
      name: "盧明亮",
      nameEn: "",
      age: 56,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0908-000-289",
      idCard: "U001853046",
      creditCard: "4559-XX-XXXX-0327",
      accountNumber: "004-0000234-4",
      tags: ["進出口貿易商", "海外消費"],
      email: "ai234@example.com",
      address: "台南市中西區忠義路112號",
      city: "台南市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.66, loans: 0.22, deposits: 0.82, investment: 0.56 },
      spendingCategories: { travel: 0.75, dining: 0.46, deposits: 0.54, groceries: 0.46 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C235",
      name: "呂雅玲",
      nameEn: "",
      age: 39,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0909-000-296",
      idCard: "V001860965",
      creditCard: "4559-XX-XXXX-0328",
      accountNumber: "004-0000235-5",
      tags: ["保險業主管", "有投資經驗用戶", "財富管理需求"],
      email: "shang235@example.com",
      address: "台南市東區東門路4號",
      city: "台南市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.65, loans: 0.4, deposits: 0.66, investment: 0.82 },
      spendingCategories: { travel: 0.77, dining: 0.67, investment: 0.63, groceries: 0.3 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C236",
      name: "褚幸芝",
      nameEn: "",
      age: 44,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0910-000-303",
      idCard: "W001868884",
      creditCard: "4559-XX-XXXX-0329",
      accountNumber: "004-0000236-6",
      tags: ["IT主管", "數位通路使用者", "信用卡活躍用戶", "投資理財意圖"],
      email: "ni236@example.com",
      address: "桃園市桃園區中正路120號",
      city: "桃園市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.65, loans: 0.28, deposits: 0.57, investment: 0.62 },
      spendingCategories: { travel: 0.68, dining: 0.73, investment: 0.33, groceries: 0.46, education: 0.41 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "silver",
    },
    {
      id: "C237",
      name: "鄧柏丞",
      nameEn: "",
      age: 33,
      vipLevel: "VIP",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0913-000-310",
      idCard: "X001876803",
      creditCard: "4559-XX-XXXX-0330",
      accountNumber: "004-0000237-7",
      tags: ["農業主", "傳產"],
      email: "yan237@example.com",
      address: "桃園市八德區介壽路235號",
      city: "桃園市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.64, loans: 0.34, deposits: 0.89, investment: 0.64 },
      spendingCategories: { travel: 0.6, dining: 0.53, investment: 0.56, groceries: 0.61 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C238",
      name: "於婉君",
      nameEn: "",
      age: 47,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0914-000-317",
      idCard: "Y001884722",
      creditCard: "4559-XX-XXXX-0331",
      accountNumber: "004-0000238-8",
      tags: ["製造業廠長", "傳產製造業", "穩健投資者"],
      email: "ruan238@example.com",
      address: "桃園市八德區介壽路250號",
      city: "桃園市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.64, loans: 0.34, deposits: 0.58, investment: 0.81 },
      spendingCategories: { travel: 0.51, dining: 0.47, investment: 0.64, groceries: 0.63 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "gold",
    },
    {
      id: "C239",
      name: "樊雅晴",
      nameEn: "",
      age: 31,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0915-000-324",
      idCard: "Z001892641",
      creditCard: "4559-XX-XXXX-0332",
      accountNumber: "004-0000239-9",
      tags: ["品牌顧問", "自雇者", "數位通路使用者", "信用卡活躍用戶"],
      email: "pu239@example.com",
      address: "高雄市三民區民族路134號",
      city: "高雄市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.63, loans: 0.28, deposits: 0.64, investment: 0.55 },
      spendingCategories: { travel: 0.42, dining: 0.67, deposits: 0.34, groceries: 0.47 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C240",
      name: "秦宇翔",
      nameEn: "",
      age: 55,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0916-000-331",
      idCard: "A001900560",
      creditCard: "4559-XX-XXXX-0333",
      accountNumber: "004-0000240-0",
      tags: ["幼兒園教師", "家庭導向"],
      email: "yue240@example.com",
      address: "高雄市前鎮區中山二路19號",
      city: "高雄市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.63, loans: 0.39, deposits: 0.84, investment: 0.71 },
      spendingCategories: { travel: 0.34, dining: 0.73, deposits: 0.52, groceries: 0.31, education: 0.67 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
    },
    {
      id: "C241",
      name: "滕思穎",
      nameEn: "",
      age: 42,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0917-000-338",
      idCard: "B001908479",
      creditCard: "4559-XX-XXXX-0334",
      accountNumber: "004-0000241-1",
      tags: ["科技業工程師", "數位通路使用者", "信用卡活躍用戶"],
      email: "ou241@example.com",
      address: "高雄市前鎮區中山二路98號",
      city: "高雄市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.62, loans: 0.23, deposits: 0.51, investment: 0.73 },
      spendingCategories: { travel: 0.35, dining: 0.53, deposits: 0.61, groceries: 0.45 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C242",
      name: "謝美蓮",
      nameEn: "",
      age: 28,
      vipLevel: "VIP",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0919-000-345",
      idCard: "C001916398",
      creditCard: "4559-XX-XXXX-0335",
      accountNumber: "004-0000242-2",
      tags: ["科技業工程師", "數位通路使用者", "信用卡活躍用戶", "出國旅遊意圖"],
      email: "guan242@example.com",
      address: "高雄市左營區文自路213號",
      city: "高雄市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.62, loans: 0.45, deposits: 0.71, investment: 0.53 },
      spendingCategories: { travel: 0.44, dining: 0.48, investment: 0.36, groceries: 0.6 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "gold",
    },
    {
      id: "C243",
      name: "鐘志遠",
      nameEn: "",
      age: 52,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0920-000-352",
      idCard: "D001924317",
      creditCard: "4559-XX-XXXX-0336",
      accountNumber: "004-0000243-3",
      tags: ["公務員", "穩健投資者"],
      email: "xiong243@example.com",
      address: "台中市太平區樹孝路272號",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.61, loans: 0.17, deposits: 0.76, investment: 0.79 },
      spendingCategories: { travel: 0.52, dining: 0.68, investment: 0.54, groceries: 0.64 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C244",
      name: "黎美惠",
      nameEn: "",
      age: 37,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0921-000-359",
      idCard: "E001932236",
      creditCard: "4559-XX-XXXX-0337",
      accountNumber: "004-0000244-4",
      tags: ["教師", "穩健投資者", "教育金規劃需求"],
      email: "long244@example.com",
      address: "台中市太平區樹孝路156號",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.61, loans: 0.49, deposits: 0.46, investment: 0.65 },
      spendingCategories: { travel: 0.61, dining: 0.72, investment: 0.67, groceries: 0.48, education: 0.66 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C245",
      name: "容瑩思",
      nameEn: "",
      age: 44,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0924-000-366",
      idCard: "F001940155",
      creditCard: "4559-XX-XXXX-0338",
      accountNumber: "004-0000245-5",
      tags: ["會計師", "專業人士", "投資理財意圖", "信用卡活躍用戶"],
      email: "shi245@example.com",
      address: "台中市豐原區中正路41號",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.6, loans: 0.19, deposits: 0.78, investment: 0.61 },
      spendingCategories: { travel: 0.69, dining: 0.52, investment: 0.37, groceries: 0.32 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C246",
      name: "古文彬",
      nameEn: "",
      age: 30,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0925-000-373",
      idCard: "G001948074",
      creditCard: "4559-XX-XXXX-0339",
      accountNumber: "004-0000246-6",
      tags: ["藥劑師", "醫療專業"],
      email: "zhong246@example.com",
      address: "台中市豐原區中正路76號",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.6, loans: 0.43, deposits: 0.69, investment: 0.83 },
      spendingCategories: { travel: 0.78, dining: 0.48, deposits: 0.5, groceries: 0.44 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C247",
      name: "史嘉芸",
      nameEn: "",
      age: 49,
      vipLevel: "VIP",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0926-000-380",
      idCard: "H001955993",
      creditCard: "4559-XX-XXXX-0340",
      accountNumber: "004-0000247-7",
      tags: ["行銷主管", "數位通路使用者", "信用卡活躍用戶"],
      email: "meng247@example.com",
      address: "台中市烏日區高鐵路192號",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.6, loans: 0.25, deposits: 0.53, investment: 0.57 },
      spendingCategories: { travel: 0.73, dining: 0.68, deposits: 0.64, groceries: 0.59 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C248",
      name: "方思瑩",
      nameEn: "",
      age: 35,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0927-000-387",
      idCard: "I001963912",
      creditCard: "4559-XX-XXXX-0341",
      accountNumber: "004-0000248-8",
      tags: ["半導體業工程師", "科技業", "高頻交易客戶", "投資理財意圖"],
      email: "jia248@example.com",
      address: "新北市土城區中央路294號",
      city: "新北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.59, loans: 0.37, deposits: 0.86, investment: 0.69 },
      spendingCategories: { travel: 0.65, dining: 0.72, deposits: 0.37, groceries: 0.65, education: 0.42 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
    },
    {
      id: "C249",
      name: "鄒世文",
      nameEn: "",
      age: 43,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0928-000-394",
      idCard: "J001971831",
      creditCard: "4559-XX-XXXX-0342",
      accountNumber: "004-0000249-9",
      tags: ["電商創業者", "數位通路使用者"],
      email: "cheng249@example.com",
      address: "新北市樹林區保安街178號",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.59, loans: 0.31, deposits: 0.62, investment: 0.75 },
      spendingCategories: { travel: 0.56, dining: 0.52, investment: 0.51, groceries: 0.49 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C250",
      name: "趙沛芳",
      nameEn: "",
      age: 38,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-000-401",
      idCard: "K001979750",
      creditCard: "4559-XX-XXXX-0343",
      accountNumber: "004-0000250-0",
      tags: ["護理師", "醫療專業", "家庭導向"],
      email: "fu250@example.com",
      address: "新北市樹林區保安街63號",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.58, loans: 0.31, deposits: 0.6, investment: 0.51 },
      spendingCategories: { travel: 0.47, dining: 0.49, investment: 0.69, groceries: 0.33 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "gold",
    },
    {
      id: "C251",
      name: "植怡君",
      nameEn: "",
      age: 34,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0923-000-408",
      idCard: "L001987669",
      creditCard: "4559-XX-XXXX-0344",
      accountNumber: "004-0000251-1",
      tags: ["小企業主", "自雇者", "信用使用偏高", "創業融資需求"],
      email: "mao251@example.com",
      address: "新北市樹林區保安街54號",
      city: "新北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.58, loans: 0.37, deposits: 0.87, investment: 0.77 },
      spendingCategories: { travel: 0.39, dining: 0.69, investment: 0.4, groceries: 0.43 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C252",
      name: "喬彥霖",
      nameEn: "",
      age: 46,
      vipLevel: "VIP",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0934-000-415",
      idCard: "M001995588",
      creditCard: "4559-XX-XXXX-0345",
      accountNumber: "004-0000252-2",
      tags: ["進出口貿易商", "海外消費"],
      email: "lu2252@example.com",
      address: "新北市淡水區中正路170號",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.57, loans: 0.25, deposits: 0.55, investment: 0.67 },
      spendingCategories: { travel: 0.3, dining: 0.71, deposits: 0.48, groceries: 0.58, education: 0.69 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "gold",
    },
    {
      id: "C253",
      name: "許美如",
      nameEn: "",
      age: 29,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0911-000-422",
      idCard: "N002003507",
      creditCard: "4559-XX-XXXX-0346",
      accountNumber: "004-0000253-3",
      tags: ["保險業主管", "有投資經驗用戶", "財富管理需求"],
      email: "wan253@example.com",
      address: "新北市淡水區中正路285號",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.57, loans: 0.43, deposits: 0.68, investment: 0.59 },
      spendingCategories: { travel: 0.38, dining: 0.51, deposits: 0.66, groceries: 0.66 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C254",
      name: "殷秀琳",
      nameEn: "",
      age: 53,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0922-000-429",
      idCard: "O002011426",
      creditCard: "4559-XX-XXXX-0347",
      accountNumber: "004-0000254-4",
      tags: ["IT主管", "數位通路使用者", "信用卡活躍用戶", "投資理財意圖"],
      email: "shi2254@example.com",
      address: "台北市文山區景美街200號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.56, loans: 0.19, deposits: 0.8, investment: 0.85 },
      spendingCategories: { travel: 0.47, dining: 0.49, deposits: 0.4, groceries: 0.5 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "platinum",
    },
    {
      id: "C255",
      name: "薛益丞",
      nameEn: "",
      age: 40,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0933-000-436",
      idCard: "P002019345",
      creditCard: "4559-XX-XXXX-0348",
      accountNumber: "004-0000255-5",
      tags: ["農業主", "傳產"],
      email: "jiang2255@example.com",
      address: "台北市文山區景美街84號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["email", "mobile_app"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.56, loans: 0.49, deposits: 0.48, investment: 0.59 },
      spendingCategories: { travel: 0.56, dining: 0.69, deposits: 0.47, groceries: 0.34 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "gold",
    },
    {
      id: "C256",
      name: "萬芝穎",
      nameEn: "",
      age: 27,
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0944-000-443",
      idCard: "Q002027264",
      creditCard: "4559-XX-XXXX-0349",
      accountNumber: "004-0000256-6",
      tags: ["製造業廠長", "傳產製造業", "穩健投資者"],
      email: "song256@example.com",
      address: "台北市文山區景美街32號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["mobile_app", "email", "branch"],
      marketingChannels: { email: true, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.55, loans: 0.16, deposits: 0.75, investment: 0.67 },
      spendingCategories: { travel: 0.64, dining: 0.71, investment: 0.72, groceries: 0.41, education: 0.63 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "silver",
    },
    {
      id: "C257",
      name: "惠品伶",
      nameEn: "",
      age: 22,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0955-000-450",
      idCard: "R002035183",
      creditCard: "4559-XX-XXXX-0350",
      accountNumber: "004-0000257-7",
      tags: ["失效戶", "呆帳風險", "高風險客戶", "逾期記錄"],
      email: "tang257@example.com",
      address: "台北市文山區景美街148號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.18, loans: 0.18, deposits: 0.39, investment: 0.17 },
      spendingCategories: { essentials: 0.88, bills: 0.8, groceries: 0.58 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C258",
      name: "儲裕鈞",
      nameEn: "",
      age: 55,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0966-000-457",
      idCard: "S002043102",
      creditCard: "4559-XX-XXXX-0351",
      accountNumber: "004-0000258-8",
      tags: ["催收中", "信用狀態觀察"],
      email: "xu258@example.com",
      address: "台北市文山區景美街263號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.18, loans: 0.08, deposits: 0.23, investment: 0.06 },
      spendingCategories: { essentials: 0.88, bills: 0.84, groceries: 0.57 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C259",
      name: "馬雯琦",
      nameEn: "",
      age: 31,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0977-000-464",
      idCard: "T002051021",
      creditCard: "4559-XX-XXXX-0352",
      accountNumber: "004-0000259-9",
      tags: ["高風險客戶", "逾期記錄", "催收中"],
      email: "zhai259@example.com",
      address: "台北市萬華區長沙街222號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.17, loans: 0.16, deposits: 0.45, investment: 0.15 },
      spendingCategories: { essentials: 0.87, bills: 0.78, groceries: 0.72 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C260",
      name: "蒲雯珊",
      nameEn: "",
      age: 48,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0988-000-471",
      idCard: "U002058940",
      creditCard: "4559-XX-XXXX-0353",
      accountNumber: "004-0000260-0",
      tags: ["失效戶", "呆帳風險", "高風險客戶", "逾期記錄"],
      email: "deng260@example.com",
      address: "台北市萬華區長沙街106號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.17, loans: 0.11, deposits: 0.34, investment: 0.13 },
      spendingCategories: { essentials: 0.87, bills: 0.72, groceries: 0.73 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C261",
      name: "蘇志強",
      nameEn: "",
      age: 27,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0900-000-478",
      idCard: "V002066859",
      creditCard: "4559-XX-XXXX-0354",
      accountNumber: "004-0000261-1",
      tags: ["催收中", "信用狀態觀察"],
      email: "bai261@example.com",
      address: "台北市萬華區長沙街10號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.17, loans: 0.13, deposits: 0.28, investment: 0.08 },
      spendingCategories: { essentials: 0.86, bills: 0.66, groceries: 0.57 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C262",
      name: "岳淑芳",
      nameEn: "",
      age: 60,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0918-000-485",
      idCard: "W002074778",
      creditCard: "4559-XX-XXXX-0355",
      accountNumber: "004-0000262-2",
      tags: ["高風險客戶", "逾期記錄", "催收中"],
      email: "ji2262@example.com",
      address: "台北市北投區公館路126號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.17, loans: 0.13, deposits: 0.49, investment: 0.19 },
      spendingCategories: { essentials: 0.86, bills: 0.6, groceries: 0.58 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C263",
      name: "邵莉仁",
      nameEn: "",
      age: 35,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0929-000-492",
      idCard: "X002082697",
      creditCard: "4559-XX-XXXX-0356",
      accountNumber: "004-0000263-3",
      tags: ["失效戶", "呆帳風險", "高風險客戶", "逾期記錄"],
      email: "yu263@example.com",
      address: "台北市北投區公館路241號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.16, loans: 0.11, deposits: 0.29, investment: 0.1 },
      spendingCategories: { essentials: 0.85, bills: 0.54, groceries: 0.73 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C264",
      name: "儲仁義",
      nameEn: "",
      age: 43,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0930-000-499",
      idCard: "Y002090616",
      creditCard: "4559-XX-XXXX-0357",
      accountNumber: "004-0000264-4",
      tags: ["催收中", "信用狀態觀察"],
      email: "wen264@example.com",
      address: "台北市中正區仁愛路244號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.16, loans: 0.16, deposits: 0.33, investment: 0.11 },
      spendingCategories: { essentials: 0.85, bills: 0.52, groceries: 0.72 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C265",
      name: "連凱婷",
      nameEn: "",
      age: 28,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0931-000-506",
      idCard: "Z002098535",
      creditCard: "4559-XX-XXXX-0358",
      accountNumber: "004-0000265-5",
      tags: ["高風險客戶", "逾期記錄", "催收中"],
      email: "qin265@example.com",
      address: "台北市中正區仁愛路128號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.16, loans: 0.08, deposits: 0.46, investment: 0.18 },
      spendingCategories: { essentials: 0.84, bills: 0.58, groceries: 0.57 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C266",
      name: "盧心妍",
      nameEn: "",
      age: 53,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0956-000-513",
      idCard: "A002106454",
      creditCard: "4559-XX-XXXX-0359",
      accountNumber: "004-0000266-6",
      tags: ["催收中", "信用狀態觀察", "失效戶", "多次逾期"],
      email: "zhao266@example.com",
      address: "台北市中正區仁愛路13號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.15, loans: 0.18, deposits: 0.24, investment: 0.07 },
      spendingCategories: { essentials: 0.84, bills: 0.64, groceries: 0.58 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C267",
      name: "呂仕恩",
      nameEn: "",
      age: 36,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0967-000-520",
      idCard: "B002114373",
      creditCard: "4559-XX-XXXX-0360",
      accountNumber: "004-0000267-7",
      tags: ["高風險客戶", "逾期記錄"],
      email: "he267@example.com",
      address: "台北市士林區天母西路104號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.15, loans: 0.06, deposits: 0.37, investment: 0.14 },
      spendingCategories: { essentials: 0.83, bills: 0.7, groceries: 0.73 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C268",
      name: "褚子慧",
      nameEn: "",
      age: 42,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0978-000-527",
      idCard: "C002122292",
      creditCard: "4559-XX-XXXX-0361",
      accountNumber: "004-0000268-8",
      tags: ["失效戶", "呆帳風險", "高風險客戶"],
      email: "ding268@example.com",
      address: "台北市士林區天母西路220號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.15, loans: 0.19, deposits: 0.41, investment: 0.14 },
      spendingCategories: { essentials: 0.83, bills: 0.76, groceries: 0.72 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C269",
      name: "翟若茵",
      nameEn: "",
      age: 29,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0989-000-534",
      idCard: "D002130211",
      creditCard: "4559-XX-XXXX-0362",
      accountNumber: "004-0000269-9",
      tags: ["催收中", "信用狀態觀察", "失效戶", "多次逾期"],
      email: "wang269@example.com",
      address: "台北市內湖區文德路266號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.15, loans: 0.07, deposits: 0.21, investment: 0.07 },
      spendingCategories: { essentials: 0.82, bills: 0.82, groceries: 0.57 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C270",
      name: "時文斌",
      nameEn: "",
      age: 51,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0901-000-541",
      idCard: "E002138130",
      creditCard: "4559-XX-XXXX-0363",
      accountNumber: "004-0000270-0",
      tags: ["高風險客戶", "逾期記錄"],
      email: "shi3270@example.com",
      address: "台北市內湖區文德路150號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.16, loans: 0.17, deposits: 0.42, investment: 0.18 },
      spendingCategories: { essentials: 0.81, bills: 0.82, groceries: 0.59 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C271",
      name: "商美玲",
      nameEn: "",
      age: 33,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0902-000-548",
      idCard: "F002146049",
      creditCard: "4559-XX-XXXX-0364",
      accountNumber: "004-0000271-1",
      tags: ["失效戶", "呆帳風險", "高風險客戶"],
      email: "cao271@example.com",
      address: "台北市松山區民生東路35號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.16, loans: 0.1, deposits: 0.36, investment: 0.11 },
      spendingCategories: { essentials: 0.81, bills: 0.76, groceries: 0.74 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C272",
      name: "秦妤婷",
      nameEn: "",
      age: 46,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0903-000-555",
      idCard: "G002153968",
      creditCard: "4559-XX-XXXX-0365",
      accountNumber: "004-0000272-2",
      tags: ["催收中", "信用狀態觀察", "失效戶", "多次逾期"],
      email: "ma272@example.com",
      address: "新北市永和區中正路82號",
      city: "新北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.16, loans: 0.14, deposits: 0.25, investment: 0.1 },
      spendingCategories: { essentials: 0.8, bills: 0.7, groceries: 0.71 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C273",
      name: "鄒奕任",
      nameEn: "",
      age: 25,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0904-000-562",
      idCard: "H002161887",
      creditCard: "4559-XX-XXXX-0366",
      accountNumber: "004-0000273-3",
      tags: ["高風險客戶", "逾期記錄"],
      email: "shao273@example.com",
      address: "新北市永和區中正路198號",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.16, loans: 0.12, deposits: 0.47, investment: 0.19 },
      spendingCategories: { essentials: 0.8, bills: 0.63, groceries: 0.56 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C274",
      name: "賴妍慈",
      nameEn: "",
      age: 58,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0905-000-569",
      idCard: "I002169806",
      creditCard: "4559-XX-XXXX-0367",
      accountNumber: "004-0000274-4",
      tags: ["失效戶", "呆帳風險", "高風險客戶"],
      email: "tian274@example.com",
      address: "新北市中和區景平路288號",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.17, loans: 0.12, deposits: 0.31, investment: 0.08 },
      spendingCategories: { essentials: 0.79, bills: 0.57, groceries: 0.59 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C275",
      name: "鐘若茵",
      nameEn: "",
      age: 39,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0906-000-576",
      idCard: "J002177725",
      creditCard: "4559-XX-XXXX-0368",
      accountNumber: "004-0000275-5",
      tags: ["催收中", "信用狀態觀察", "失效戶", "多次逾期"],
      email: "bo275@example.com",
      address: "新北市中和區景平路172號",
      city: "新北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.17, loans: 0.15, deposits: 0.3, investment: 0.13 },
      spendingCategories: { essentials: 0.79, bills: 0.51, groceries: 0.74 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C276",
      name: "黎銘澤",
      nameEn: "",
      age: 44,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0907-000-583",
      idCard: "K002185644",
      creditCard: "4559-XX-XXXX-0369",
      accountNumber: "004-0000276-6",
      tags: ["高風險客戶", "逾期記錄"],
      email: "xiang276@example.com",
      address: "新北市新店區七張路56號",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.17, loans: 0.09, deposits: 0.48, investment: 0.15 },
      spendingCategories: { essentials: 0.78, bills: 0.55, groceries: 0.71 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C277",
      name: "容恩慈",
      nameEn: "",
      age: 20,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0908-000-590",
      idCard: "L002193563",
      creditCard: "4559-XX-XXXX-0370",
      accountNumber: "004-0000277-7",
      tags: ["學生", "新開戶", "帳戶提醒"],
      email: "ren277@example.com",
      address: "新北市新店區七張路60號",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.3, loans: 0.52, deposits: 0.41, investment: 0.12 },
      spendingCategories: { dining: 0.54, groceries: 0.52, entertainment: 0.47, tech: 0.7 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C278",
      name: "古芸菁",
      nameEn: "",
      age: 23,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0909-000-597",
      idCard: "M002201482",
      creditCard: "4559-XX-XXXX-0371",
      accountNumber: "004-0000278-8",
      tags: ["上班族", "數位通路使用者", "信用卡活躍用戶", "有效戶"],
      email: "gu278@example.com",
      address: "台中市北區三民路176號",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.31, loans: 0.24, deposits: 0.55, investment: 0.41 },
      spendingCategories: { dining: 0.53, groceries: 0.59, entertainment: 0.51, tech: 0.58 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C279",
      name: "鐘志忠",
      nameEn: "",
      age: 19,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0910-000-604",
      idCard: "N002209401",
      creditCard: "4559-XX-XXXX-0372",
      accountNumber: "004-0000279-9",
      tags: ["外貿業務", "換匯需求"],
      email: "li279@example.com",
      address: "台中市西屯區朝馬路291號",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.32, loans: 0.59, deposits: 0.69, investment: 0.29 },
      spendingCategories: { dining: 0.52, groceries: 0.66, entertainment: 0.69, tech: 0.46 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C280",
      name: "賴嘉宜",
      nameEn: "",
      age: 21,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0913-000-611",
      idCard: "O002217320",
      creditCard: "4559-XX-XXXX-0373",
      accountNumber: "004-0000280-0",
      tags: ["餐飲業員工", "高頻小額消費", "電商偏好"],
      email: "yao280@example.com",
      address: "台中市西屯區朝馬路194號",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.32, loans: 0.22, deposits: 0.33, investment: 0.21 },
      spendingCategories: { dining: 0.51, groceries: 0.73, entertainment: 0.64, tech: 0.34 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C281",
      name: "鄒昱瑾",
      nameEn: "",
      age: 18,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0914-000-618",
      idCard: "P002225239",
      creditCard: "4559-XX-XXXX-0374",
      accountNumber: "004-0000281-1",
      tags: ["學生", "新開戶", "帳戶提醒", "信用卡申辦意圖"],
      email: "sun281@example.com",
      address: "台中市西屯區朝馬路78號",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.33, loans: 0.54, deposits: 0.63, investment: 0.5 },
      spendingCategories: { dining: 0.51, groceries: 0.8, entertainment: 0.46, tech: 0.38 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C282",
      name: "趙元宏",
      nameEn: "",
      age: 19,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0915-000-625",
      idCard: "Q002233158",
      creditCard: "4559-XX-XXXX-0375",
      accountNumber: "004-0000282-2",
      tags: ["學生", "新開戶"],
      email: "hong282@example.com",
      address: "台中市西屯區朝馬路38號",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.33, loans: 0.29, deposits: 0.61, investment: 0.2 },
      spendingCategories: { dining: 0.5, groceries: 0.73, entertainment: 0.51, tech: 0.5 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C283",
      name: "植欣雯",
      nameEn: "",
      age: 21,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0916-000-632",
      idCard: "R002241077",
      creditCard: "4559-XX-XXXX-0376",
      accountNumber: "004-0000283-3",
      tags: ["上班族", "數位通路使用者", "信用卡活躍用戶"],
      email: "yan2283@example.com",
      address: "高雄市鼓山區鼓山路154號",
      city: "高雄市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.34, loans: 0.48, deposits: 0.35, investment: 0.3 },
      spendingCategories: { dining: 0.49, groceries: 0.66, entertainment: 0.69, tech: 0.61 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C284",
      name: "時雯珊",
      nameEn: "",
      age: 20,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0917-000-639",
      idCard: "S002248996",
      creditCard: "4559-XX-XXXX-0377",
      accountNumber: "004-0000284-4",
      tags: ["外貿業務", "換匯需求", "出國旅遊意圖", "信用卡申辦意圖"],
      email: "pang284@example.com",
      address: "高雄市苓雅區中正路270號",
      city: "高雄市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.35, loans: 0.36, deposits: 0.71, investment: 0.41 },
      spendingCategories: { dining: 0.49, groceries: 0.6, entertainment: 0.63, tech: 0.67 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C285",
      name: "翟振隆",
      nameEn: "",
      age: 22,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0919-000-646",
      idCard: "T002256915",
      creditCard: "4559-XX-XXXX-0378",
      accountNumber: "004-0000285-5",
      tags: ["餐飲業員工", "高頻小額消費"],
      email: "lian285@example.com",
      address: "高雄市苓雅區中正路216號",
      city: "高雄市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.35, loans: 0.41, deposits: 0.53, investment: 0.11 },
      spendingCategories: { dining: 0.48, groceries: 0.53, entertainment: 0.46, tech: 0.55 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C286",
      name: "殷涵芸",
      nameEn: "",
      age: 18,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0920-000-653",
      idCard: "U002264834",
      creditCard: "4559-XX-XXXX-0379",
      accountNumber: "004-0000286-6",
      tags: ["自由接案者", "自雇者", "信用使用偏高"],
      email: "hui286@example.com",
      address: "高雄市三民區民族路100號",
      city: "高雄市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.36, loans: 0.42, deposits: 0.43, investment: 0.39 },
      spendingCategories: { dining: 0.47, groceries: 0.46, entertainment: 0.52, tech: 0.43 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C287",
      name: "薛欣潔",
      nameEn: "",
      age: 23,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0921-000-660",
      idCard: "V002272753",
      creditCard: "4559-XX-XXXX-0380",
      accountNumber: "004-0000287-7",
      tags: ["學生", "新開戶", "帳戶提醒", "信用卡申辦意圖"],
      email: "feng287@example.com",
      address: "桃園市八德區介壽路16號",
      city: "桃園市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.36, loans: 0.34, deposits: 0.79, investment: 0.32 },
      spendingCategories: { dining: 0.46, groceries: 0.41, entertainment: 0.69, tech: 0.31 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C288",
      name: "盧志忠",
      nameEn: "",
      age: 20,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0924-000-667",
      idCard: "W002280672",
      creditCard: "4559-XX-XXXX-0381",
      accountNumber: "004-0000288-8",
      tags: ["上班族", "數位通路使用者"],
      email: "pei288@example.com",
      address: "桃園市蘆竹區南崁路132號",
      city: "桃園市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.37, loans: 0.49, deposits: 0.45, investment: 0.18 },
      spendingCategories: { dining: 0.46, groceries: 0.48, entertainment: 0.63, tech: 0.41 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C289",
      name: "連承惠",
      nameEn: "",
      age: 21,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0925-000-674",
      idCard: "X002288591",
      creditCard: "4559-XX-XXXX-0382",
      accountNumber: "004-0000289-9",
      tags: ["外貿業務", "換匯需求", "出國旅遊意圖"],
      email: "yu2289@example.com",
      address: "桃園市蘆竹區南崁路248號",
      city: "桃園市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.38, loans: 0.28, deposits: 0.51, investment: 0.48 },
      spendingCategories: { dining: 0.45, groceries: 0.55, entertainment: 0.45, tech: 0.53 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C290",
      name: "儲珮妤",
      nameEn: "",
      age: 19,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0926-000-681",
      idCard: "Y002296510",
      creditCard: "4559-XX-XXXX-0383",
      accountNumber: "004-0000290-0",
      tags: ["餐飲業員工", "高頻小額消費", "電商偏好", "有效戶"],
      email: "gai290@example.com",
      address: "台南市安平區中興路238號",
      city: "台南市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.38, loans: 0.56, deposits: 0.73, investment: 0.23 },
      spendingCategories: { dining: 0.44, groceries: 0.62, entertainment: 0.52, tech: 0.65 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C291",
      name: "馬銘澤",
      nameEn: "",
      age: 22,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0927-000-688",
      idCard: "Z002304429",
      creditCard: "4559-XX-XXXX-0384",
      accountNumber: "004-0000291-1",
      tags: ["自由接案者", "自雇者"],
      email: "qiao291@example.com",
      address: "台南市永康區中正路122號",
      city: "台南市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.39, loans: 0.21, deposits: 0.37, investment: 0.27 },
      spendingCategories: { dining: 0.44, groceries: 0.69, entertainment: 0.7, tech: 0.63 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C292",
      name: "蒲幸芝",
      nameEn: "",
      age: 61,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0928-000-695",
      idCard: "A002312348",
      creditCard: "4559-XX-XXXX-0385",
      accountNumber: "004-0000292-2",
      tags: ["教師", "穩健投資者", "教育金規劃需求"],
      email: "shi4292@example.com",
      address: "新竹市北區中正路7號",
      city: "新竹市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.39, loans: 0.57, deposits: 0.59, investment: 0.43 },
      spendingCategories: { dining: 0.43, groceries: 0.76, healthcare: 0.67, utilities: 0.59 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C293",
      name: "蘇怡君",
      nameEn: "",
      age: 69,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-000-702",
      idCard: "B002320267",
      creditCard: "4559-XX-XXXX-0386",
      accountNumber: "004-0000293-3",
      tags: ["製造業廠長", "傳產製造業", "穩健投資者", "退休規劃"],
      email: "yu3293@example.com",
      address: "嘉義市東區林森路110號",
      city: "嘉義市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.4, loans: 0.26, deposits: 0.65, investment: 0.14 },
      spendingCategories: { dining: 0.42, groceries: 0.78, healthcare: 0.5, utilities: 0.48 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C294",
      name: "蒲奕任",
      nameEn: "",
      age: 58,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0923-000-709",
      idCard: "C002328186",
      creditCard: "4559-XX-XXXX-0387",
      accountNumber: "004-0000294-4",
      tags: ["品牌顧問", "自雇者"],
      email: "hua294@example.com",
      address: "基隆市信義區信義路226號",
      city: "基隆市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.41, loans: 0.51, deposits: 0.31, investment: 0.36 },
      spendingCategories: { dining: 0.41, groceries: 0.71, healthcare: 0.58, utilities: 0.42 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C295",
      name: "馬佳蓉",
      nameEn: "",
      age: 64,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0934-000-716",
      idCard: "D002336105",
      creditCard: "4559-XX-XXXX-0388",
      accountNumber: "004-0000295-5",
      tags: ["幼兒園教師", "家庭導向", "教育金規劃需求"],
      email: "huo295@example.com",
      address: "花蓮縣吉安鄉中正路260號",
      city: "花蓮縣",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.41, loans: 0.33, deposits: 0.67, investment: 0.34 },
      spendingCategories: { dining: 0.41, groceries: 0.64, healthcare: 0.75, utilities: 0.52 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C296",
      name: "儲柔嘉",
      nameEn: "",
      age: 56,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0911-000-723",
      idCard: "E002344024",
      creditCard: "4559-XX-XXXX-0389",
      accountNumber: "004-0000296-6",
      tags: ["上班族", "數位通路使用者", "信用卡活躍用戶", "有效戶"],
      email: "yin2296@example.com",
      address: "苗栗縣頭份市頭份路144號",
      city: "苗栗縣",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.42, loans: 0.44, deposits: 0.57, investment: 0.15 },
      spendingCategories: { dining: 0.4, groceries: 0.57, healthcare: 0.67, utilities: 0.63 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C297",
      name: "惠正豪",
      nameEn: "",
      age: 62,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0922-000-730",
      idCard: "F002351943",
      creditCard: "4559-XX-XXXX-0390",
      accountNumber: "004-0000297-7",
      tags: ["公務員", "穩健投資者"],
      email: "fan2297@example.com",
      address: "彰化縣和美鎮和美路28號",
      city: "彰化縣",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.42, loans: 0.39, deposits: 0.39, investment: 0.45 },
      spendingCategories: { dining: 0.39, groceries: 0.5, healthcare: 0.49, utilities: 0.73 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C298",
      name: "盧美蓮",
      nameEn: "",
      age: 58,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0933-000-737",
      idCard: "G002359862",
      creditCard: "4559-XX-XXXX-0391",
      accountNumber: "004-0000298-8",
      tags: ["教師", "穩健投資者", "教育金規劃需求"],
      email: "shang2298@example.com",
      address: "彰化縣和美鎮和美路88號",
      city: "彰化縣",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.43, loans: 0.37, deposits: 0.75, investment: 0.25 },
      spendingCategories: { dining: 0.39, groceries: 0.43, healthcare: 0.58, utilities: 0.66 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C299",
      name: "薛瑩思",
      nameEn: "",
      age: 67,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0944-000-744",
      idCard: "H002367781",
      creditCard: "4559-XX-XXXX-0392",
      accountNumber: "004-0000299-9",
      tags: ["製造業廠長", "傳產製造業", "穩健投資者", "退休規劃"],
      email: "zhi299@example.com",
      address: "花蓮縣吉安鄉中正路204號",
      city: "花蓮縣",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.44, loans: 0.46, deposits: 0.49, investment: 0.24 },
      spendingCategories: { dining: 0.38, groceries: 0.44, healthcare: 0.76, utilities: 0.56 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C300",
      name: "殷志宸",
      nameEn: "",
      age: 55,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0955-000-751",
      idCard: "I002375700",
      creditCard: "4559-XX-XXXX-0393",
      accountNumber: "004-0000300-0",
      tags: ["品牌顧問", "自雇者"],
      email: "gan300@example.com",
      address: "宜蘭縣蘇澳鎮蘇港路282號",
      city: "宜蘭縣",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.44, loans: 0.31, deposits: 0.47, investment: 0.46 },
      spendingCategories: { dining: 0.37, groceries: 0.51, healthcare: 0.66, utilities: 0.46 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C301",
      name: "翟瑩思",
      nameEn: "",
      age: 71,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0966-000-758",
      idCard: "J002383619",
      creditCard: "4559-XX-XXXX-0394",
      accountNumber: "004-0000301-1",
      tags: ["幼兒園教師", "家庭導向", "教育金規劃需求"],
      email: "fei301@example.com",
      address: "基隆市暖暖區碇興路166號",
      city: "基隆市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.45, loans: 0.53, deposits: 0.77, investment: 0.16 },
      spendingCategories: { dining: 0.36, groceries: 0.58, healthcare: 0.49, utilities: 0.45 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C302",
      name: "時子玲",
      nameEn: "",
      age: 56,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0977-000-765",
      idCard: "K002391538",
      creditCard: "4559-XX-XXXX-0395",
      accountNumber: "004-0000302-2",
      tags: ["上班族", "數位通路使用者", "信用卡活躍用戶", "有效戶"],
      email: "lian2302@example.com",
      address: "嘉義市東區林森路50號",
      city: "嘉義市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.45, loans: 0.24, deposits: 0.41, investment: 0.33 },
      spendingCategories: { dining: 0.36, groceries: 0.65, healthcare: 0.59, utilities: 0.55 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C303",
      name: "植仁義",
      nameEn: "",
      age: 63,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0988-000-772",
      idCard: "L002399457",
      creditCard: "4559-XX-XXXX-0396",
      accountNumber: "004-0000303-3",
      tags: ["公務員", "穩健投資者"],
      email: "ning303@example.com",
      address: "新竹市香山區中華路66號",
      city: "新竹市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.46, loans: 0.59, deposits: 0.55, investment: 0.37 },
      spendingCategories: { dining: 0.35, groceries: 0.71, healthcare: 0.76, utilities: 0.66 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C304",
      name: "趙柔嘉",
      nameEn: "",
      age: 60,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0900-000-779",
      idCard: "M002407376",
      creditCard: "4559-XX-XXXX-0397",
      accountNumber: "004-0000304-4",
      tags: ["教師", "穩健投資者", "教育金規劃需求"],
      email: "sheng304@example.com",
      address: "台南市學甲區中山路182號",
      city: "台南市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.47, loans: 0.23, deposits: 0.69, investment: 0.13 },
      spendingCategories: { dining: 0.34, groceries: 0.78, healthcare: 0.66, utilities: 0.74 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C305",
      name: "鄒佳蓉",
      nameEn: "",
      age: 68,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0918-000-786",
      idCard: "N002415295",
      creditCard: "4559-XX-XXXX-0398",
      accountNumber: "004-0000305-5",
      tags: ["製造業廠長", "傳產製造業", "穩健投資者", "退休規劃"],
      email: "chu305@example.com",
      address: "台南市學甲區中山路298號",
      city: "台南市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.47, loans: 0.54, deposits: 0.33, investment: 0.42 },
      spendingCategories: { dining: 0.34, groceries: 0.75, healthcare: 0.48, utilities: 0.64 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C306",
      name: "賴志強",
      nameEn: "",
      age: 57,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0929-000-793",
      idCard: "O002423214",
      creditCard: "4559-XX-XXXX-0399",
      accountNumber: "004-0000306-6",
      tags: ["品牌顧問", "自雇者"],
      email: "zuo306@example.com",
      address: "桃園市觀音區中山路188號",
      city: "桃園市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.48, loans: 0.3, deposits: 0.63, investment: 0.28 },
      spendingCategories: { dining: 0.33, groceries: 0.68, healthcare: 0.59, utilities: 0.53 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C307",
      name: "鐘怡君",
      nameEn: "",
      age: 72,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0930-000-800",
      idCard: "P002431133",
      creditCard: "4559-XX-XXXX-0400",
      accountNumber: "004-0000307-7",
      tags: ["幼兒園教師", "家庭導向", "教育金規劃需求"],
      email: "xing307@example.com",
      address: "桃園市觀音區中山路72號",
      city: "桃園市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.48, loans: 0.47, deposits: 0.61, investment: 0.21 },
      spendingCategories: { dining: 0.32, groceries: 0.61, healthcare: 0.77, utilities: 0.43 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C308",
      name: "黎幸芝",
      nameEn: "",
      age: 59,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0931-000-807",
      idCard: "Q002439052",
      creditCard: "4559-XX-XXXX-0401",
      accountNumber: "004-0000308-8",
      tags: ["上班族", "數位通路使用者", "信用卡活躍用戶", "有效戶"],
      email: "min308@example.com",
      address: "桃園市龜山區中興路44號",
      city: "桃園市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.49, loans: 0.36, deposits: 0.35, investment: 0.49 },
      spendingCategories: { dining: 0.31, groceries: 0.54, healthcare: 0.66, utilities: 0.48 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C309",
      name: "容裕鈞",
      nameEn: "",
      age: 65,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0956-000-814",
      idCard: "R002446971",
      creditCard: "4559-XX-XXXX-0402",
      accountNumber: "004-0000309-9",
      tags: ["公務員", "穩健投資者"],
      email: "kang309@example.com",
      address: "高雄市仁武區文武路160號",
      city: "高雄市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone", "sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.49, loans: 0.4, deposits: 0.71, investment: 0.19 },
      spendingCategories: { dining: 0.31, groceries: 0.47, healthcare: 0.48, utilities: 0.58 },
      lifecycleStage: "retired",
      lifetimeValueTier: "silver",
    },
    {
      id: "C310",
      name: "黎珮妤",
      nameEn: "",
      age: 34,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0967-000-821",
      idCard: "S002454890",
      creditCard: "4559-XX-XXXX-0403",
      accountNumber: "004-0000310-0",
      tags: ["單親家庭", "家庭導向", "教育金規劃需求"],
      email: "you310@example.com",
      address: "高雄市鳳山區中山路276號",
      city: "高雄市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.5, loans: 0.43, deposits: 0.53, investment: 0.3 },
      spendingCategories: { dining: 0.3, groceries: 0.4, childcare: 0.65, education: 0.66 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C311",
      name: "鐘慧雯",
      nameEn: "",
      age: 40,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0978-000-828",
      idCard: "T002462809",
      creditCard: "4559-XX-XXXX-0404",
      accountNumber: "004-0000311-1",
      tags: ["新婚夫妻", "年輕家庭", "房貸需求", "定存導向"],
      email: "rong311@example.com",
      address: "高雄市鳳山區中山路210號",
      city: "高雄市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.51, loans: 0.34, deposits: 0.43, investment: 0.4 },
      spendingCategories: { dining: 0.31, groceries: 0.47, entertainment: 0.57 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C312",
      name: "謝重光",
      nameEn: "",
      age: 47,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0989-000-835",
      idCard: "U002470728",
      creditCard: "4559-XX-XXXX-0405",
      accountNumber: "004-0000312-2",
      tags: ["農工家庭", "傳統客群"],
      email: "su312@example.com",
      address: "高雄市鳳山區中山路94號",
      city: "高雄市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.51, loans: 0.5, deposits: 0.79, investment: 0.1 },
      spendingCategories: { dining: 0.31, groceries: 0.54, healthcare: 0.65, utilities: 0.61 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C313",
      name: "鄒品伶",
      nameEn: "",
      age: 31,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0901-000-842",
      idCard: "V002478647",
      creditCard: "4559-XX-XXXX-0406",
      accountNumber: "004-0000313-3",
      tags: ["服務業", "數位通路使用者", "高頻交易客戶"],
      email: "han313@example.com",
      address: "台中市烏日區高鐵路23號",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.52, loans: 0.27, deposits: 0.45, investment: 0.39 },
      spendingCategories: { dining: 0.32, groceries: 0.6, healthcare: 0.47, utilities: 0.5 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C314",
      name: "秦涵芸",
      nameEn: "",
      age: 36,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0902-000-849",
      idCard: "W002486566",
      creditCard: "4559-XX-XXXX-0407",
      accountNumber: "004-0000314-4",
      tags: ["物流業", "上班族", "電商偏好", "信用卡活躍用戶"],
      email: "ge314@example.com",
      address: "台中市烏日區高鐵路138號",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.52, loans: 0.56, deposits: 0.51, investment: 0.31 },
      spendingCategories: { dining: 0.33, groceries: 0.67, entertainment: 0.37 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C315",
      name: "商宗翰",
      nameEn: "",
      age: 42,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0903-000-856",
      idCard: "X002494485",
      creditCard: "4559-XX-XXXX-0408",
      accountNumber: "004-0000315-5",
      tags: ["上班族", "數位通路使用者"],
      email: "wei315@example.com",
      address: "台中市豐原區中正路254號",
      city: "台中市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.27, loans: 0.05, deposits: 0.46, investment: 0.08 },
      spendingCategories: { essentials: 0.63, bills: 0.8, groceries: 0.78 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C316",
      name: "俞思穎",
      nameEn: "",
      age: 49,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0904-000-863",
      idCard: "Y002502404",
      creditCard: "4559-XX-XXXX-0409",
      accountNumber: "004-0000316-6",
      tags: ["外貿業務", "換匯需求", "出國旅遊意圖"],
      email: "gong316@example.com",
      address: "台中市豐原區中正路232號",
      city: "台中市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.54, loans: 0.57, deposits: 0.37, investment: 0.48 },
      spendingCategories: { dining: 0.34, groceries: 0.79, childcare: 0.7, education: 0.57 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C317",
      name: "翟欣雯",
      nameEn: "",
      age: 29,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0905-000-870",
      idCard: "Z002510323",
      creditCard: "4559-XX-XXXX-0410",
      accountNumber: "004-0000317-7",
      tags: ["餐飲業員工", "高頻小額消費", "電商偏好", "有效戶"],
      email: "fang317@example.com",
      address: "台中市豐原區中正路116號",
      city: "台中市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.54, loans: 0.26, deposits: 0.59, investment: 0.22 },
      spendingCategories: { dining: 0.35, groceries: 0.72, entertainment: 0.22 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C318",
      name: "褚世文",
      nameEn: "",
      age: 33,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0906-000-877",
      idCard: "A002518242",
      creditCard: "4559-XX-XXXX-0411",
      accountNumber: "004-0000318-8",
      tags: ["自由接案者", "自雇者"],
      email: "lai318@example.com",
      address: "新北市三重區重新路1號",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.55, loans: 0.5, deposits: 0.65, investment: 0.28 },
      spendingCategories: { dining: 0.36, groceries: 0.65, healthcare: 0.61, utilities: 0.68 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C319",
      name: "呂昱瑾",
      nameEn: "",
      age: 39,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0907-000-884",
      idCard: "B002526161",
      creditCard: "4559-XX-XXXX-0412",
      accountNumber: "004-0000319-9",
      tags: ["單親家庭", "家庭導向", "教育金規劃需求"],
      email: "xie319@example.com",
      address: "新北市三重區重新路116號",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.55, loans: 0.33, deposits: 0.31, investment: 0.43 },
      spendingCategories: { dining: 0.36, groceries: 0.58, healthcare: 0.78, utilities: 0.58 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C320",
      name: "盧嘉宜",
      nameEn: "",
      age: 45,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0908-000-891",
      idCard: "C002534080",
      creditCard: "4559-XX-XXXX-0413",
      accountNumber: "004-0000320-0",
      tags: ["新婚夫妻", "年輕家庭", "房貸需求", "定存導向"],
      email: "ke320@example.com",
      address: "新北市永和區中正路232號",
      city: "新北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.56, loans: 0.43, deposits: 0.67, investment: 0.13 },
      spendingCategories: { dining: 0.37, groceries: 0.51, entertainment: 0.42 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C321",
      name: "連文彬",
      nameEn: "",
      age: 25,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0909-000-898",
      idCard: "D002541999",
      creditCard: "4559-XX-XXXX-0414",
      accountNumber: "004-0000321-1",
      tags: ["農工家庭", "傳統客群"],
      email: "pan321@example.com",
      address: "新北市永和區中正路254號",
      city: "新北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.57, loans: 0.4, deposits: 0.57, investment: 0.37 },
      spendingCategories: { dining: 0.38, groceries: 0.44, entertainment: 0.41, tech: 0.33 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C322",
      name: "儲心妍",
      nameEn: "",
      age: 38,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0910-000-905",
      idCard: "E002549918",
      creditCard: "4559-XX-XXXX-0415",
      accountNumber: "004-0000322-2",
      tags: ["服務業", "數位通路使用者", "高頻交易客戶"],
      email: "yuan322@example.com",
      address: "新北市中和區景平路138號",
      city: "新北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.57, loans: 0.37, deposits: 0.39, investment: 0.34 },
      spendingCategories: { dining: 0.39, groceries: 0.42, childcare: 0.66, education: 0.47 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C323",
      name: "馬恩慈",
      nameEn: "",
      age: 44,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0913-000-912",
      idCard: "F002557837",
      creditCard: "4559-XX-XXXX-0416",
      accountNumber: "004-0000323-3",
      tags: ["物流業", "上班族", "電商偏好", "信用卡活躍用戶"],
      email: "jiang323@example.com",
      address: "新北市中和區景平路22號",
      city: "新北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.58, loans: 0.47, deposits: 0.75, investment: 0.16 },
      spendingCategories: { dining: 0.39, groceries: 0.49, entertainment: 0.59 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C324",
      name: "岳志遠",
      nameEn: "",
      age: 51,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0914-000-919",
      idCard: "G002565756",
      creditCard: "4559-XX-XXXX-0417",
      accountNumber: "004-0000324-4",
      tags: ["上班族", "數位通路使用者"],
      email: "lv324@example.com",
      address: "台北市中山區南京東路94號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.58, loans: 0.3, deposits: 0.49, investment: 0.46 },
      spendingCategories: { dining: 0.4, groceries: 0.56, healthcare: 0.64, utilities: 0.74 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C325",
      name: "蘇若茵",
      nameEn: "",
      age: 27,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0915-000-926",
      idCard: "H002573675",
      creditCard: "4559-XX-XXXX-0418",
      accountNumber: "004-0000325-5",
      tags: ["外貿業務", "換匯需求", "出國旅遊意圖"],
      email: "xue325@example.com",
      address: "台北市大安區忠孝東路210號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.3, loans: 0.18, deposits: 0.3, investment: 0.1 },
      spendingCategories: { essentials: 0.68, bills: 0.7, groceries: 0.51 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C326",
      name: "蒲詩涵",
      nameEn: "",
      age: 35,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0916-000-933",
      idCard: "I002581594",
      creditCard: "4559-XX-XXXX-0419",
      accountNumber: "004-0000326-6",
      tags: ["上班族", "數位通路使用者", "信用卡活躍用戶", "有效戶"],
      email: "fan326@example.com",
      address: "台北市大安區忠孝東路275號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.6, loans: 0.23, deposits: 0.77, investment: 0.25 },
      spendingCategories: { dining: 0.41, groceries: 0.7, entertainment: 0.39 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C327",
      name: "曹宇翔",
      nameEn: "",
      age: 26,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0917-000-940",
      idCard: "J002589513",
      creditCard: "4559-XX-XXXX-0420",
      accountNumber: "004-0000327-7",
      tags: ["上班族", "數位通路使用者"],
      email: "qian327@example.com",
      address: "台北市信義區松仁路160號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.6, loans: 0.6, deposits: 0.41, investment: 0.45 },
      spendingCategories: { dining: 0.42, groceries: 0.77, entertainment: 0.74, tech: 0.35 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C328",
      name: "儲妤婷",
      nameEn: "",
      age: 32,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0919-000-947",
      idCard: "K002597432",
      creditCard: "4559-XX-XXXX-0421",
      accountNumber: "004-0000328-8",
      tags: ["外貿業務", "換匯需求", "出國旅遊意圖"],
      email: "lu328@example.com",
      address: "台北市信義區松仁路44號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.61, loans: 0.23, deposits: 0.55, investment: 0.16 },
      spendingCategories: { dining: 0.43, groceries: 0.76, childcare: 0.68, education: 0.37 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C329",
      name: "惠美玲",
      nameEn: "",
      age: 38,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0920-000-954",
      idCard: "L002605351",
      creditCard: "4559-XX-XXXX-0422",
      accountNumber: "004-0000329-9",
      tags: ["餐飲業員工", "高頻小額消費", "電商偏好", "有效戶"],
      email: "xia329@example.com",
      address: "台北市信義區松仁路72號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.61, loans: 0.53, deposits: 0.69, investment: 0.34 },
      spendingCategories: { dining: 0.43, groceries: 0.69, entertainment: 0.21 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C330",
      name: "萬立宏",
      nameEn: "",
      age: 44,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0921-000-961",
      idCard: "M002613270",
      creditCard: "4559-XX-XXXX-0423",
      accountNumber: "004-0000330-0",
      tags: ["自由接案者", "自雇者"],
      email: "ji330@example.com",
      address: "台北市信義區松仁路188號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.62, loans: 0.3, deposits: 0.33, investment: 0.36 },
      spendingCategories: { dining: 0.44, groceries: 0.62, healthcare: 0.62, utilities: 0.66 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C331",
      name: "薛若茵",
      nameEn: "",
      age: 27,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0924-000-968",
      idCard: "N002621189",
      creditCard: "4559-XX-XXXX-0424",
      accountNumber: "004-0000331-1",
      tags: ["單親家庭", "家庭導向", "教育金規劃需求"],
      email: "yin331@example.com",
      address: "台北市信義區松仁路297號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.63, loans: 0.47, deposits: 0.63, investment: 0.13 },
      spendingCategories: { dining: 0.45, groceries: 0.55, healthcare: 0.8, utilities: 0.73 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C332",
      name: "殷子慧",
      nameEn: "",
      age: 35,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0925-000-975",
      idCard: "O002629108",
      creditCard: "4559-XX-XXXX-0425",
      accountNumber: "004-0000332-2",
      tags: ["新婚夫妻", "年輕家庭", "房貸需求", "定存導向"],
      email: "zhu332@example.com",
      address: "台北市大安區忠孝東路182號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.63, loans: 0.37, deposits: 0.61, investment: 0.43 },
      spendingCategories: { dining: 0.46, groceries: 0.49, entertainment: 0.4 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C333",
      name: "許明亮",
      nameEn: "",
      age: 41,
      vipLevel: "normal",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0926-000-982",
      idCard: "P002637027",
      creditCard: "4559-XX-XXXX-0426",
      accountNumber: "004-0000333-3",
      tags: ["農工家庭", "傳統客群"],
      email: "luo333@example.com",
      address: "台北市大安區忠孝東路66號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: false,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.64, loans: 0.4, deposits: 0.35, investment: 0.27 },
      spendingCategories: { dining: 0.46, groceries: 0.42, entertainment: 0.4, tech: 0.44 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
    {
      id: "C334",
      name: "喬心妍",
      nameEn: "",
      age: 48,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0927-000-989",
      idCard: "Q002644946",
      creditCard: "4559-XX-XXXX-0427",
      accountNumber: "004-0000334-4",
      tags: ["服務業", "數位通路使用者", "高頻交易客戶"],
      email: "kong334@example.com",
      address: "台北市大安區忠孝東路51號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.64, loans: 0.44, deposits: 0.71, investment: 0.22 },
      spendingCategories: { dining: 0.47, groceries: 0.45, childcare: 0.68, education: 0.32 },
      lifecycleStage: "young_family",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C335",
      name: "植欣盈",
      nameEn: "",
      age: 30,
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0928-000-996",
      idCard: "R002652865",
      creditCard: "4559-XX-XXXX-0428",
      accountNumber: "004-0000335-5",
      tags: ["物流業", "上班族", "電商偏好", "信用卡活躍用戶"],
      email: "lei335@example.com",
      address: "台北市中山區南京東路166號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: false,
      preferredChannels: ["sms"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.33, loans: 0.1, deposits: 0.34, investment: 0.19 },
      spendingCategories: { essentials: 0.73, bills: 0.61, groceries: 0.8 },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C336",
      name: "趙宏儒",
      nameEn: "",
      age: 37,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0912-001-003",
      idCard: "S002660784",
      creditCard: "4559-XX-XXXX-0429",
      accountNumber: "004-0000336-6",
      tags: ["上班族", "數位通路使用者"],
      email: "shen336@example.com",
      address: "台北市中山區南京東路282號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.65, loans: 0.5, deposits: 0.43, investment: 0.18 },
      spendingCategories: { dining: 0.48, groceries: 0.59, healthcare: 0.62, utilities: 0.59 },
      lifecycleStage: "pre_retirement",
      lifetimeValueTier: "silver",
    },
    {
      id: "C337",
      name: "沈淑媛",
      nameEn: "",
      age: 43,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0923-001-010",
      idCard: "T002668703",
      creditCard: "4559-XX-XXXX-0430",
      accountNumber: "004-0000337-7",
      tags: ["外貿業務", "換匯需求", "出國旅遊意圖"],
      email: "teng337@example.com",
      address: "台北市松山區民生東路204號",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.66, loans: 0.26, deposits: 0.79, investment: 0.31 },
      spendingCategories: { dining: 0.49, groceries: 0.66, healthcare: 0.45, utilities: 0.69 },
      lifecycleStage: "retired",
      lifetimeValueTier: "bronze",
    },
    {
      id: "C338",
      name: "賴淑芳",
      nameEn: "",
      age: 50,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0934-001-017",
      idCard: "U002676622",
      creditCard: "4559-XX-XXXX-0431",
      accountNumber: "004-0000338-8",
      tags: ["餐飲業員工", "高頻小額消費", "電商偏好", "有效戶"],
      email: "zou338@example.com",
      address: "台北市松山區民生東路88號",
      city: "台北市",
      preferredContact: "phone",
      marketingOptIn: true,
      preferredChannels: ["branch", "phone"],
      marketingChannels: { email: false, appPush: false, linePush: false, sms: true },
      productPreferences: { creditCard: 0.67, loans: 0.57, deposits: 0.45, investment: 0.39 },
      spendingCategories: { dining: 0.5, groceries: 0.73, entertainment: 0.41 },
      lifecycleStage: "debt_management",
      lifetimeValueTier: "silver",
    },
    {
      id: "C339",
      name: "史宇軒",
      nameEn: "",
      age: 28,
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0911-001-024",
      idCard: "V002684541",
      creditCard: "4559-XX-XXXX-0432",
      accountNumber: "004-0000339-9",
      tags: ["自由接案者", "自雇者"],
      email: "ai339@example.com",
      address: "台北市松山區民生東路29號",
      city: "台北市",
      preferredContact: "mobile",
      marketingOptIn: true,
      preferredChannels: ["mobile_app", "sms"],
      marketingChannels: { email: false, appPush: true, linePush: false, sms: true },
      productPreferences: { creditCard: 0.67, loans: 0.2, deposits: 0.51, investment: 0.11 },
      spendingCategories: { dining: 0.51, groceries: 0.8, entertainment: 0.74, tech: 0.53 },
      lifecycleStage: "young_professional",
      lifetimeValueTier: "silver",
    },
  ];

  // Ensure all customers have unique idCard values (letter + 9 digits). If duplicates are found, bump the numeric part.
  const ensureUniqueIdCards = (customers) => {
    const seen = new Set();
    const bump = (id, salt = 1) => {
      const m = /^([A-Za-z])([0-9]+)$/.exec(id || "");
      const prefix = m ? m[1] : "Z";
      const digits = m ? m[2] : "000000000";
      let n = parseInt(digits, 10);
      if (!Number.isFinite(n)) n = 0;
      n = (n + salt) % 1000000000; // keep 9 digits
      return prefix + String(n).padStart(digits.length, "0");
    };

    customers.forEach((c, idx) => {
      let id = c.idCard || `Z${String(idx).padStart(9, "0")}`;
      // normalize to letter+digits form with at least 9 digits
      const m = /^([A-Za-z])([0-9]+)$/.exec(id);
      if (!m) {
        const letter = /[A-Za-z]/.test(id?.[0]) ? id[0] : "Z";
        const rest = String(id).replace(/\D/g, "").padStart(9, "0").slice(-9);
        id = letter + rest;
      } else if (m[2].length < 9) {
        id = m[1] + m[2].padStart(9, "0");
      }
      while (seen.has(id)) {
        id = bump(id, idx + 1);
      }
      seen.add(id);
      c.idCard = id;
    });
  };

  ensureUniqueIdCards(mockCustomers);

  // Utility: ensure unique customers by id (guards UI lists against accidental duplicates)
  const uniqueById = (arr = []) => {
    const seen = new Set();
    return (arr || []).filter((c) => {
      const id = c && c.id;
      if (!id) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  // Expand persona samples to 5 entries each based on the defined personas above
  (() => {
    const basePersonas = [
      { baseId: "C012", prefix: "信用卡-都市精英", count: 5 },
      { baseId: "C013", prefix: "信用卡-都會小資", count: 5 },
      { baseId: "C014", prefix: "信用卡-家庭生活", count: 5 },
      { baseId: "C015", prefix: "房貸買房族", count: 5 },
      { baseId: "C016", prefix: "小資信貸族", count: 5 },
      { baseId: "C017", prefix: "企業主週轉", count: 5 },
    ];
    const findById = (id) => mockCustomers.find((c) => c.id === id);
    const nextId = (() => {
      const existing = new Set((mockCustomers || []).map((c) => c.id));
      const maxNum = Array.from(existing).reduce((max, id) => {
        const m = /^C(\d+)$/.exec(id || "");
        const num = m ? parseInt(m[1], 10) : 0;
        return Math.max(max, num);
      }, 0);
      let n = maxNum + 1; // start from next available id beyond current max (avoids overlaps like C193–C195)
      return () => {
        // ensure we skip any pre-existing ids just in case
        while (existing.has("C" + String(n).padStart(3, "0"))) n++;
        const id = "C" + String(n).padStart(3, "0");
        existing.add(id);
        n++;
        return id;
      };
    })();
    const mutate = (cust, idx, prefix) => {
      const id = nextId();
      // persona-specific realistic name pools
      const pools = {
        "信用卡-都市精英": ["張澄宇", "李承翰", "王柏霖", "周予騰", "陳昱安"],
        "信用卡-都會小資": ["林郁婕", "黃品妍", "陳若琳", "蔡怡廷", "吳佳蓉"],
        "信用卡-家庭生活": ["陳冠廷", "林郁庭", "張庭瑜", "許家宏", "楊育成"],
        房貸買房族: ["郭彥豪", "林建霖", "張庭豪", "蔡承恩", "周柏豪"],
        小資信貸族: ["曾雅婷", "林怡安", "黃柔妤", "吳品潔", "劉雅慧"],
        企業主週轉: ["許建國", "陳宏達", "張承恩", "楊柏廷", "羅嘉宏"],
      };
      const pool = pools[prefix] || [cust.name];
      const name = pool[idx % pool.length];
      const phone = cust.phone.replace(/(\d)$/, (m) =>
        String((Number(m) + idx) % 10)
      );
      const email = cust.email.replace("@", `${idx + 1}@`);
      const age = Math.max(
        22,
        Math.min(70, cust.age + (idx % 2 === 0 ? 1 : -1))
      );
      const productPreferences = { ...cust.productPreferences };
      // slight preference nudges per variant
      const nud = (v, d) => Math.max(0.05, Math.min(0.99, (v || 0) + d));
      productPreferences.creditCard = nud(
        productPreferences.creditCard,
        (idx - 2) * 0.02
      );
      productPreferences.loans = nud(
        productPreferences.loans,
        (2 - idx) * 0.02
      );
      productPreferences.deposits = nud(
        productPreferences.deposits,
        idx % 2 ? 0.01 : -0.01
      );
      productPreferences.investment = nud(
        productPreferences.investment,
        ((idx % 3) - 1) * 0.02
      );
      const preferredChannels = Array.from(
        new Set([...(cust.preferredChannels || [])])
      );
      const marketingChannels = { ...cust.marketingChannels };
      const accountStatus = cust.accountStatus;
      return {
        ...cust,
        id,
        name,
        phone,
        email,
        age,
        accountStatus,
        productPreferences,
        preferredChannels,
        marketingChannels,
        tags: [...(cust.tags || [])],
      };
    };
    const expanded = [];
    basePersonas.forEach(({ baseId, prefix, count }) => {
      const base = findById(baseId);
      if (!base) return;
      for (let i = 0; i < count - 1; i++) {
        // we already have 1 base; add 4 more
        expanded.push(mutate(base, i, prefix));
      }
    });
    mockCustomers.push(...expanded);
  })();

  // Re-run ID normalization/uniqueness after persona expansion to avoid duplicates
  ensureUniqueIdCards(mockCustomers);

  // basic demo detailedCustomerData (fallback used in several render helpers)
  const detailedCustomerData = {
    basic: {
      title: "客戶基本資訊",
      sections: [
        {
          name: "客戶名稱資訊",
          data: [
            { label: "客戶中文戶名", value: "王小明" },
            { label: "客戶英文戶名", value: "" },
          ],
        },
        {
          name: "客戶工作資訊",
          data: [
            { label: "任職單位", value: "科技股份有限公司" },
            { label: "職業別", value: "軟體工程師" },
          ],
        },
      ],
    },
    contact: {
      title: "客戶聯絡資訊",
      sections: [
        {
          name: "聯絡方式與地址",
          data: [
            { label: "手機號碼", value: "0912-***-678", masked: true },
            { label: "電子郵件", value: "wangxm@example.com", masked: false },
            {
              label: "通訊地址",
              value: "台北市信義區忠孝東路五段 100 號",
              masked: true,
            },
            { label: "城市", value: "台北市", masked: false },
            { label: "聯絡偏好", value: "行動 App / Email", masked: false },
            {
              label: "最後同意接收行銷時間",
              value: "2025-09-12T10:22:00",
              masked: false,
            },
          ],
        },
        {
          name: "緊急/替代聯絡人",
          data: [
            { label: "姓名", value: "林小紅" },
            { label: "關係", value: "配偶" },
            { label: "電話", value: "0919-111-222" },
          ],
        },
      ],
    },
    risk: {
      title: "客戶風險資訊",
      sections: [
        {
          name: "信用風險/信用評等",
          data: [{ label: "風險評分", value: "85分" }],
        },
      ],
    },
    financial: {
      title: "客戶財務資訊",
      sections: [
        {
          name: "客戶資產負債資訊",
          data: [{ label: "個人資產", value: "NT$ 5,200,000" }],
        },
      ],
    },
    business: {
      title: "業務往來資訊",
      sections: [
        {
          name: "客戶歸屬",
          data: [{ label: "客戶歸屬行", value: "信義分行" }],
        },
        {
          name: "客戶開辦業務",
          data: [{ label: "信用卡客戶註記", value: "是" }],
        },
        {
          name: "客戶業務往來累計",
          data: [{ label: "近三個月信用卡消費金額", value: "NT$ 45,000" }],
        },
      ],
    },
    rating: {
      title: "客戶評價資訊",
      sections: [
        {
          name: "客戶等級資訊",
          data: [
            {
              label: "VIP等級",
              value: VIP_TIERS.VIP.displayLabel, // 使用配置而非硬編碼
            },
          ],
        },
      ],
    },
    tags: {
      title: "客戶標籤資訊",
      sections: [
        {
          name: "意圖標籤",
          tags: [
            {
              name: "出國旅遊意圖",
              score: 0.85,
              source: "行為模型",
              lastUpdated: "2025-11-20",
            },
            {
              name: "信用卡申辦意圖",
              score: 0.72,
              source: "問卷/交易",
              lastUpdated: "2025-11-12",
            },
            {
              name: "投資意圖",
              score: 0.78,
              source: "投資行為",
              lastUpdated: "2025-10-30",
            },
            {
              name: "信貸意圖",
              score: 0.75,
              source: "授信行為",
              lastUpdated: "2025-11-18",
            },
            {
              name: "房貸意圖",
              score: 0.82,
              source: "房貸試算",
              lastUpdated: "2025-11-22",
            },
            {
              name: "留學意圖",
              score: 0.68,
              source: "跨境需求",
              lastUpdated: "2025-11-10",
            },
          ],
        },
        // Auto-rendered structured tags per category (客戶屬性 / 交易互動 / 產品屬性 / 通路互動)
      ],
    },
    preferences: {
      title: "客戶偏好資訊",
      sections: [
        {
          name: "產品偏好",
          preferences: [
            { product: "信用卡", score: "92%", note: "偏好高回饋現金卡" },
            { product: "投資理財", score: "88%", note: "偏好基金與境外股票" },
            { product: "存款", score: "70%", note: "偏好高利定存" },
          ],
        },
        {
          name: "通路偏好",
          preferences: [
            { channel: "行動銀行", score: "90%", note: "高互動頻率" },
            { channel: "電子郵件", score: "75%", note: "用於接收行銷與月報" },
            { channel: "臨櫃", score: "40%", note: "偶爾訪問" },
          ],
        },
        {
          name: "行銷同意",
          preferences: [
            { label: "行銷接收狀態", value: "允許", lastUpdated: "2025-09-12" },
            { label: "偏好頻率", value: "每月", lastUpdated: "2025-09-12" },
            {
              label: "偏好主題",
              value: "旅遊/高回饋卡/投資",
              lastUpdated: "2025-09-12",
            },
          ],
        },
        {
          name: "消費偏好",
          preferences: [
            { category: "餐飲", score: "90%" },
            { category: "旅遊", score: "65%" },
            { category: "科技/3C", score: "45%" },
          ],
        },
      ],
    },
    interactions: {
      title: "客戶互動",
      sections: [
        {
          name: "客戶事件紀錄",
          interactions: [
            {
              channel: "定存到期",
              time: "2025/12/15 09:00",
              detail: "您的台幣定存將於 12/15 到期，請留意續存或轉存。",
              status: "提醒",
            },
            {
              channel: "人生大事",
              time: "2025/08/20 10:30",
              detail: "恭喜結婚！系統已更新婚姻狀態並提供相關金融方案。",
              status: "已發生",
            },
            {
              channel: "人生大事",
              time: "2024/05/03 08:20",
              detail: "新生兒登記完成，我們已為您整理教育基金方案。",
              status: "已發生",
            },
          ],
        },
      ],
    },
  };

  // Tag taxonomy from attachment: categories and tag names
  const TAG_CATEGORIES = {
    客戶屬性: [
      "有投資經驗用戶",
      "有近期投資行銷回應紀錄",
      "頻繁聯絡客服",
      "高比例使用網行銀通路交易者",
      "低收益客戶",
    ],
    交易互動: [
      "活存存入金額增加",
      "大額單筆活存存入",
      "外幣活存存入金額增加",
      "大額單筆活存轉出",
      "增加活存轉出金額",
      "外幣活存轉出次數增加",
      "定期投資金額增加",
      "定期投資頻率增加",
      "頻繁調整定期投資設定",
      "頻繁轉換投資標的",
      "頻繁贖回投資",
      "刷卡金額顯著成長",
      "單日大量刷卡消費",
      "大額傢俱家電消費者",
      "大額運動用品消費者",
      "頻繁預借現金",
      "近期首次產生循環利息",
      "長期信卡循環利息",
      "信用卡相關費用減免",
      "經常使用信用卡權益者",
      "頻繁動用理財型房貸額度",
      "房貸信貸經常提前還款",
      "房貸信貸一次性清償",
    ],
    產品屬性: [
      "以優惠利率辦理外幣定存",
      "已填寫KYC但無投資行為",
      "經常登錄信用卡優惠活動",
      "高累計現金與點數回饋",
      "經常在信卡額度上限邊緣",
      "刷卡經常額度不足",
      "信卡臨時額度上調",
      "貸款即將結清",
    ],
    通路互動: [
      "高黏著數位使用者",
      "近期貸款試算紀錄",
      "近期想換匯者",
      "經常關注信用卡優惠與權益",
    ],
  };

  // Collect actual intent tags present in mock data (names containing '意圖')
  const INTENT_TAGS = (() => {
    const set = new Set();
    mockCustomers.forEach((c) =>
      (c.tags || []).forEach((t) => {
        if (typeof t === "string" && t.includes("意圖")) set.add(t);
      })
    );
    // include demo-level intent tags if not already present
    const demoIntents = (
      (
        detailedCustomerData.tags.sections.find((s) =>
          s.name.includes("意圖標籤")
        ) || {}
      ).tags || []
    ).map((t) => t.name);
    demoIntents.forEach((n) => set.add(n));
    return Array.from(set);
  })();

  // Helper: assign sample tags by category to each customer
  const attachStructuredTags = (customer) => {
    const seed = seedFromId(customer) + 777;
    const pick = (arr, n = 2) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push(arr[(seed + i * 3) % arr.length]);
      }
      return Array.from(new Set(out));
    };
    const structured = [];
    structured.push(
      ...pick(TAG_CATEGORIES["客戶屬性"], 2).map((t) => ({
        category: "客戶屬性",
        name: t,
      }))
    );
    structured.push(
      ...pick(TAG_CATEGORIES["交易互動"], 2).map((t) => ({
        category: "交易互動",
        name: t,
      }))
    );
    structured.push(
      ...pick(TAG_CATEGORIES["產品屬性"], 1).map((t) => ({
        category: "產品屬性",
        name: t,
      }))
    );
    structured.push(
      ...pick(TAG_CATEGORIES["通路互動"], 1).map((t) => ({
        category: "通路互動",
        name: t,
      }))
    );
    // Persona-aligned tag augmentation: map persona traits to existing taxonomy tags
    const personaTagMap = {
      C012: [
        { category: "交易互動", name: "經常使用信用卡權益者" },
        { category: "產品屬性", name: "高累計現金與點數回饋" },
        { category: "通路互動", name: "經常關注信用卡優惠與權益" },
        { category: "通路互動", name: "高黏著數位使用者" },
      ],
      C013: [
        { category: "產品屬性", name: "高累計現金與點數回饋" },
        { category: "產品屬性", name: "經常在信卡額度上限邊緣" },
        { category: "產品屬性", name: "刷卡經常額度不足" },
      ],
      C014: [
        { category: "交易互動", name: "房貸信貸經常提前還款" },
        { category: "通路互動", name: "高黏著數位使用者" },
      ],
      C015: [
        { category: "產品屬性", name: "貸款即將結清" },
        { category: "交易互動", name: "房貸信貸一次性清償" },
      ],
      C016: [
        { category: "通路互動", name: "近期貸款試算紀錄" },
        { category: "通路互動", name: "高黏著數位使用者" },
      ],
      C017: [
        // Use closest existing proxy in taxonomy
        { category: "產品屬性", name: "經常在信卡額度上限邊緣" },
      ],
      C193: [
        { category: "交易互動", name: "刷卡金額顯著成長" },
        { category: "通路互動", name: "近期想換匯者" },
        { category: "通路互動", name: "高黏著數位使用者" },
      ],
      C194: [
        { category: "交易互動", name: "刷卡金額顯著成長" },
        { category: "通路互動", name: "近期想換匯者" },
        { category: "通路互動", name: "高黏著數位使用者" },
      ],
      C195: [
        { category: "交易互動", name: "刷卡金額顯著成長" },
        { category: "通路互動", name: "近期想換匯者" },
        { category: "通路互動", name: "高黏著數位使用者" },
      ],
    };
    const aug = personaTagMap[customer.id] || [];
    // If intent includes 出國旅遊意圖, ensure 通路互動: 經常關注信用卡優惠與權益 is present
    if ((customer.tags || []).includes("出國旅遊意圖")) {
      aug.push({ category: "通路互動", name: "經常關注信用卡優惠與權益" });
      // Also likely to log into card promos frequently
      aug.push({ category: "產品屬性", name: "經常登錄信用卡優惠活動" });
    }
    const merged = [...structured];
    aug.forEach((t) => {
      if (
        TAG_CATEGORIES[t.category] &&
        TAG_CATEGORIES[t.category].includes(t.name)
      ) {
        // avoid duplicates
        if (!merged.some((x) => x.category === t.category && x.name === t.name))
          merged.push(t);
      } else {
        // For C017 fallback, map to closest existing tag without adding new categories
        if (customer.id === "C017") {
          const proxy = {
            category: "交易互動",
            name: "經常在信卡額度上限邊緣",
          };
          if (
            !merged.some(
              (x) => x.category === proxy.category && x.name === proxy.name
            )
          )
            merged.push(proxy);
        }
      }
    });
    customer.structuredTags = merged;
  };

  const handleSearch = () => {
    // Smart search: try exact identifier (idCard/creditCard/accountNumber),
    // otherwise fallback to name substring (Chinese/English). If a single
    // match is found, open the detail view.
    const normalize = (s) =>
      (s || "")
        .toString()
        .replace(/[^0-9A-Za-z]/g, "")
        .toLowerCase();
    const qRaw = (searchQuery || "").toString().trim();
    if (!qRaw) {
      setSearchPerformed(true);
      setSearchResults([]);
      setSelectedCustomer(null);
      return;
    }

    // Auto-detect search type based on input content
    let autoSearchType = "name";
    const hasChinese = /[\u4E00-\u9FFF]/.test(qRaw);
    const qNorm = qRaw.replace(/[-\s]/g, "");

    if (hasChinese) {
      // 含中文 → 姓名
      autoSearchType = "name";
    } else if (/^\d{10,16}$/.test(qNorm)) {
      // 10~16 位純數字 → 信用卡號或帳號
      // 信用卡號通常 16 位；帳號通常含分隔符
      autoSearchType = qRaw.includes("-") && qNorm.length <= 12 ? "accountNumber" : "creditCard";
    } else if (/^[A-Z][0-9]{9}$/i.test(qNorm)) {
      // 1 英文字母 + 9 數字 → 身分證
      autoSearchType = "idCard";
    } else if (/^\d{3}-\d{7}-\d$/.test(qRaw) || /^\d{11,12}$/.test(qNorm)) {
      // 帳號格式
      autoSearchType = "accountNumber";
    } else if (/[A-Za-z]/.test(qRaw)) {
      // 含英文但不符合身分證格式 → 姓名（英文名）
      autoSearchType = "name";
    }

    // Exact match against the selected identifier field only (no fuzzy fallback)
    const fieldMap = {
      idCard: "idCard",
      creditCard: "creditCard",
      accountNumber: "accountNumber",
      name: "name",
    };
    const field = fieldMap[autoSearchType] || "name";
    
    // For name search, use fuzzy matching (supports both Chinese and English); for others, use exact match
    const found = mockCustomers.filter((c) => {
      if (field === "name") {
        // Support both Chinese names and English names with partial matching
        const nameValue = (c[field] || "").toString();
        const queryLower = qRaw.toLowerCase();
        const nameValueLower = nameValue.toLowerCase();
        // Direct substring match for Chinese and mixed text
        return nameValueLower.includes(queryLower);
      } else {
        const q = normalize(qRaw);
        return normalize(c[field]) === q;
      }
    });
    
    setSearchPerformed(true);
    setSearchResults(found);

    if (found && found.length === 1) {
      // auto-open detail for single exact match
      setSelectedCustomer(found[0]);
      setActiveModule("detail");
    } else {
      setSelectedCustomer(null);
      setActiveModule("search");
    }
  };

  // Export helpers and modal
  const downloadCSV = (rows = [], filename = "export.csv") => {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0] || {});
    const escape = (v) => {
      if (v === null || v === undefined) return "";
      const s = v.toString();
      // double-quote and escape existing quotes
      return `"${s.replace(/"/g, '""')}"`;
    };
    const bom = "\uFEFF"; // UTF-8 BOM for Excel-friendly CSV with CJK
    const csv =
      bom +
      [
        keys.join(","),
        ...rows.map((r) => keys.map((k) => escape(r[k])).join(",")),
      ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const renderExportModal = () => {
    const source =
      exportScope === "all"
        ? mockCustomers
        : filterResults === null
        ? mockCustomers
        : filterResults;
    const rows = source.map((c) => {
      const masked = exportMasked;
      return {
        id: c.id,
        name: c.name,
        phone: masked ? maskPhone(c.phone) : c.phone || "",
        email: masked ? maskEmail(c.email) : c.email || "",
        accountNumber: masked
          ? maskDigitsKeepLast(c.accountNumber)
          : c.accountNumber || "",
        creditCard: masked
          ? maskDigitsKeepLast(c.creditCard)
          : c.creditCard || "",
        vipLevel: c.vipLevel,
        riskLevel: c.riskLevel,
      };
    });

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white p-4 rounded-lg w-full max-w-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">匯出名單</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">範圍</label>
              <div className="flex gap-2 mt-2">
                <label
                  className={`px-3 py-2 rounded-lg border ${
                    exportScope === "filtered"
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={exportScope === "filtered"}
                    onChange={() => setExportScope("filtered")}
                  />{" "}
                  篩選後結果
                </label>
                <label
                  className={`px-3 py-2 rounded-lg border ${
                    exportScope === "all" ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={exportScope === "all"}
                    onChange={() => setExportScope("all")}
                  />{" "}
                  全部客戶
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700">格式</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="csv">CSV 檔案</option>
                <option value="json">JSON 檔案</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700">敏感欄位</label>
              <label className="mt-2 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportMasked}
                  onChange={(e) => setExportMasked(e.target.checked)}
                />
                <span>匯出時遮罩敏感欄位 (電話/Email/帳號/卡號)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3 py-1 rounded-lg border"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (exportFormat === "csv") {
                    downloadCSV(
                      rows,
                      `cus_export_${new Date().toISOString().slice(0, 10)}.csv`
                    );
                  } else {
                    const blob = new Blob([JSON.stringify(rows, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `cus_export_${new Date()
                      .toISOString()
                      .slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }
                  setShowExportModal(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                下載
              </button>
            </div>
            {/* modal is rendered at top-level when needed */}
          </div>
        </div>
      </div>
    );
  };

  // centralized logout behavior
  const performLogout = () => {
    setIsLoggedIn(false);
    setSelectedCustomer(null);
    setActiveModule("search");
    setLoginUser("");
    setLoginPass("");
    setLoginError("");
    setShowExportModal(false);
    setShowLogoutConfirm(false);
    setQueryHistory([]);
  };

  const renderLogoutConfirm = () => (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-4 rounded-lg w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-2">確認登出</h3>
        <p className="text-sm text-gray-700">
          您確定要登出嗎？登出後將回到登入畫面。
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="px-3 py-1 rounded border"
          >
            取消
          </button>
          <button
            onClick={performLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            確定登出
          </button>
        </div>
      </div>
    </div>
  );

  // Top function bar (header) similar to reference design
  const renderTopBar = () => (
    <div className="mb-6">
      <div className="rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-700 to-cyan-600 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold">即時客戶 360 戰情室</div>
            <div className="hidden md:flex gap-2">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      activeModule === module.id
                        ? "bg-gradient-to-r from-teal-500/60 to-cyan-400/60 text-white"
                        : "bg-white bg-opacity-10 text-white/90 hover:bg-white/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="font-medium">{module.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 px-6">
            <div className="max-w-xl mx-auto flex gap-2">
              <input
                className="flex-1 rounded-full px-4 py-2 bg-white bg-opacity-20 placeholder-white/80 border border-white/10 text-white"
                placeholder="快速搜尋：姓名、證號、卡號或帳號…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white text-sm border border-white/20 transition-all"
              >
                搜尋
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-white/90">
              {currentRole === "specialist" ? "楊專員（理財專員）" : "林經理 (008)"}
            </div>
            <div className="text-sm bg-white bg-opacity-10 px-3 py-1 rounded-full">
              即時
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="ml-2 px-3 py-2 bg-red-500 hover:bg-red-600 rounded text-white text-sm"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Grouped Tag Conditions helpers (supports (A AND B) OR (C NOT D) ...)
  const addTagGroup = () => setTagGroups([...tagGroups, { join: 'OR', not: false, conditions: [{ op: 'AND', category: '', tag: '' }] }]);
  const removeTagGroup = (gIdx) => {
    const arr = [...tagGroups]; arr.splice(gIdx,1); setTagGroups(arr);
  };
  const addTagCondition = (gIdx) => {
    const arr = [...tagGroups];
    arr[gIdx].conditions.push({ op: 'AND', category: '', tag: '' });
    setTagGroups(arr);
  };
  const updateTagCondition = (gIdx, cIdx, updates) => {
    const arr = [...tagGroups];
    arr[gIdx].conditions[cIdx] = { ...arr[gIdx].conditions[cIdx], ...updates };
    setTagGroups(arr);
  };
  const removeTagCondition = (gIdx, cIdx) => {
    const arr = [...tagGroups];
    arr[gIdx].conditions.splice(cIdx,1);
    setTagGroups(arr);
  };

  const evaluateTagGroup = (customer, group) => {
    if (!group || !Array.isArray(group.conditions) || group.conditions.length === 0) return true;
    let result = null;
    for (const cond of group.conditions) {
      let has = false;
      if (cond.category === '意圖標籤') {
        // Check both tags and structured tags for intent
        has = (customer.tags || []).some(n => n === cond.tag) ||
              (customer.structuredTags || []).some(t => t.category === '意圖標籤' && t.name === cond.tag);
      } else if (cond.category === '客戶屬性') {
        // For customer attributes, check both tags field and structuredTags
        has = (customer.tags || []).some(n => n === cond.tag) ||
              (customer.structuredTags || []).some(t => t.category === '客戶屬性' && t.name === cond.tag);
      } else {
        // For other categories, check structuredTags
        has = (customer.structuredTags || []).some(t => (!cond.category || t.category === cond.category) && t.name === cond.tag);
      }
      const val = cond.op === 'NOT' ? !has : has;
      if (customer.id === 'C183') {
        console.log(`[DEBUG] C183 condition:`, { category: cond.category, tag: cond.tag, op: cond.op, has, val });
      }
      if (result === null) result = val;
      else if (cond.op === 'OR') result = result || val;
      else result = result && val; // AND or NOT treated in evaluation
    }
    return Boolean(result);
  };

  const evaluateTagConditions = (customer) => {
    if (!tagGroups || tagGroups.length === 0) return true;
    let overall = null;
    for (const group of tagGroups) {
      let gVal = evaluateTagGroup(customer, group);
      // When group.join is NOT, invert this group's result; combine via AND by default
      if (group.join === 'NOT' || group.not) gVal = !gVal;
      if (overall === null) overall = gVal;
      else if (group.join === 'OR') overall = overall || gVal;
      else overall = overall && gVal; // AND or NOT (treated as AND after inversion)
    }
    const result = Boolean(overall);
    // Debug for specific customers
    if (customer.id === 'C183') {
      console.log(`[DEBUG] Customer ${customer.id} tags:`, customer.tags);
      console.log(`[DEBUG] tagGroups:`, JSON.stringify(tagGroups));
      console.log(`[DEBUG] Filter result for ${customer.id}:`, result);
    }
    return result;
  };

  // Build a compact summary string for current grouped tag conditions
  const summarizeTagGroups = () => {
    if (!tagGroups || tagGroups.length === 0) return '(無條件)';
    const labelFor = (cond) => {
      const c = cond.category || '';
      const t = cond.tag || '';
      if (!c && !t) return '—';
      return `${c}:${t}`;
    };
    const parts = tagGroups.map((g) => {
      const inner = (g.conditions || []).map((c, idx) => {
        const base = labelFor(c);
        if (idx === 0) return c.op === 'NOT' ? `NOT ${base}` : base;
        if (c.op === 'OR') return `OR ${c.op === 'NOT' ? 'NOT ' : ''}${base}`.replace('OR NOT', 'OR NOT');
        if (c.op === 'NOT') return `AND NOT ${base}`;
        return `AND ${base}`;
      }).join(' ');
      const groupText = `(${inner || '—'})`;
      const isNot = g.join === 'NOT' || g.not;
      return isNot ? `NOT ${groupText}` : groupText;
    });
    // join groups by their group join operator (use AND default)
    let out = parts[0] || '';
    for (let i = 1; i < parts.length; i++) {
      const join = (tagGroups[i].join || 'AND').toUpperCase();
      out = `${out} ${join} ${parts[i]}`;
    }
    return out;
  };

  // UI module buttons (top-level navigation)
  const modules = [
    { id: "search", name: "查詢客戶", icon: Search, color: "bg-teal-600" },
    { id: "filter", name: "篩選名單", icon: Filter, color: "bg-cyan-600" },
    {
      id: "dashboard",
      name: "儀表板",
      icon: TrendingUp,
      color: "bg-emerald-600",
    },
    { id: "permission", name: "權限管理", icon: Shield, color: "bg-teal-500" },
  ];

  // Auth + UI state
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState("manager"); // "manager" | "specialist"
  const [queryHistory, setQueryHistory] = React.useState([]); // max 5 entries
  const [loginUser, setLoginUser] = React.useState("");
  const [loginPass, setLoginPass] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState("csv");
  const [exportScope, setExportScope] = React.useState("filtered"); // 'filtered' | 'all'
  const [exportMasked, setExportMasked] = React.useState(true);
  // Primary UI state used across modules
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [searchResults, setSearchResults] = useState([]);
  const [showMaskedData, setShowMaskedData] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [pendingAnchor, setPendingAnchor] = useState(null); // { anchorId } — scroll after tab render
  const [insightModal, setInsightModal] = useState(null); // { type, data } — insight popup
  const [filters, setFilters] = useState({
    vipLevel: "",
    riskLevel: "",
    accountStatus: "",
    idType: "",
  });
  // Grouped tag filters: array of groups; each group has join ('AND'|'OR') across groups and conditions with op ('AND'|'OR'|'NOT')
  const [tagGroups, setTagGroups] = useState([
    { join: 'AND', conditions: [{ op: 'AND', category: '', tag: '' }] }
  ]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filterResults, setFilterResults] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedInteractionItem, setSelectedInteractionItem] = useState(null);
  // Floating assistant UI state
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([
    { role: "assistant", content: "您好，我是智能小助手。可根據此客戶資料提供分析與行銷話術建議。" },
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const assistantListRef = useRef(null);
  useEffect(() => {
    const el = assistantListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [assistantMessages, assistantOpen]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const resetAssistantCore = () => {
    setAssistantMessages([
      {
        role: "assistant",
        content:
          "您好，我是智能小助手。可根據此客戶資料提供分析與行銷話術建議。",
      },
    ]);
  };
  
  // helper to send prompt with a short typing animation (~2s)
  const sendAssistant = async (q) => {
    const text = (q || "").trim();
    if (!text) return;
    // push user message
    setAssistantMessages((prev) => [...prev, { role: 'user', content: text }]);
    setAssistantInput('');
    // prepare full response then stream by sections
    const llmText = await callLLM(text, selectedCustomer);
    const resp = llmText || generateAssistantReply(text, selectedCustomer);
    const parts = resp.split(/\n{2,}/);
    const isHeader = (s) => /^[🧩🎯👋✅🗣️🤔🤝⚖️]/.test((s || '').trim());
    const blocks = [];
    for (let i = 0; i < parts.length; i++) {
      const cur = (parts[i] || '').trim();
      if (!cur) continue;
      if (isHeader(cur) && i + 1 < parts.length) {
        const next = parts[i + 1];
        blocks.push(cur + '\n\n' + next);
        i++;
      } else {
        blocks.push(cur);
      }
    }
    // fallback if parsing failed
    if (!blocks.length) blocks.push(resp);
    // emit each block with its own typing bubble (~2s each)
    for (const block of blocks) {
      const typingId = Date.now() + Math.random();
      setAssistantMessages((prev) => [
        ...prev,
        { role: 'assistant', typing: true, _id: typingId },
      ]);
      await new Promise((r) => setTimeout(r, 2000));
      setAssistantMessages((prev) => {
        const idx = prev.findIndex((m) => m.typing && m._id === typingId);
        const next = [...prev];
        if (idx !== -1) next.splice(idx, 1, { role: 'assistant', content: block });
        else next.push({ role: 'assistant', content: block });
        return next;
      });
    }
  };

  // Force assistant to use local generation only (skip live LLM)
  const ASSISTANT_LOCAL_ONLY = String(
    import.meta?.env?.VITE_ASSISTANT_LOCAL_ONLY ?? "true"
  ) === "true";
  const LLM_ENDPOINT = import.meta?.env?.VITE_LLM_ENDPOINT || "";
  const LLM_API_KEY = import.meta?.env?.VITE_LLM_API_KEY || "";

  const callLLM = async (prompt, customer) => {
    if (ASSISTANT_LOCAL_ONLY) return null;
    if (!LLM_ENDPOINT || !LLM_API_KEY) return null;
    const context = {
      customer: {
        id: customer?.id,
        name: customer?.name,
        age: customer?.age,
        vipLevel: customer?.vipLevel,
        riskLevel: customer?.riskLevel,
        nationality: customer?.nationality,
        preferences: customer?.preferences || null,
        tags: customer?.tags || [],
      },
      instruction:
        "You are a helpful banking assistant. Generate realistic, compliance-friendly marketing scripts tailored to the customer based on preferences, intent, and finance. Respond in Traditional Chinese.",
    };
    const doFetch = () => fetch(LLM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          // OpenAI-compatible payload shape; adapt server-side if different
          model: import.meta?.env?.VITE_LLM_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: context.instruction },
            { role: "user", content: `問題：${prompt}\n資料：${JSON.stringify(context.customer)}` },
          ],
          temperature: 0.7,
        }),
      });
    try {
      const timeoutMs = 6000;
      const resp = await Promise.race([
        doFetch(),
        new Promise((_, rej) => setTimeout(() => rej(new Error("LLM timeout")), timeoutMs)),
      ]);
      if (!resp.ok) throw new Error(`LLM HTTP ${resp.status}`);
      const data = await resp.json();
      const text = data?.choices?.[0]?.message?.content || data?.output || data?.text || "";
      return text || null;
    } catch (e) {
      console.warn("[Assistant] LLM call failed, fallback to local reply", e);
      return null;
    }
  };
  // Dashboard month range (default: last 12 months)
  const _now = new Date();
  const _startInit = new Date(_now.getFullYear(), _now.getMonth() - 11, 1);
  const [rangeStart, setRangeStart] = useState(
    `${_startInit.getFullYear()}-${String(_startInit.getMonth() + 1).padStart(
      2,
      "0"
    )}`
  );
  const [rangeEnd, setRangeEnd] = useState(
    `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}`
  );

  // Dashboard refresh animation state (1 second spinner on load/range change/tab switch)
  const [dashLoading, setDashLoading] = useState(true);
  useEffect(() => {
    if (activeModule !== "dashboard") return;
    setDashLoading(true);
    const t = setTimeout(() => setDashLoading(false), 1000);
    return () => clearTimeout(t);
  }, [activeModule, rangeStart, rangeEnd]);

  // Scroll to top on every module/tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeModule, activeTab]);

  // After tab change renders, scroll to a pending anchor (deferred so scroll-to-top fires first)
  useEffect(() => {
    if (!pendingAnchor) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(pendingAnchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingAnchor(null);
    }, 80);
    return () => clearTimeout(timer);
  }, [pendingAnchor, activeTab]);

  // Track query history: record each time a customer detail is viewed (max 5)
  useEffect(() => {
    if (!selectedCustomer) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setQueryHistory((prev) => {
      if (prev.length > 0 && prev[0].customerId === selectedCustomer.id) return prev;
      const entry = { timestamp, customerId: selectedCustomer.id, name: selectedCustomer.name };
      return [entry, ...prev].slice(0, 5);
    });
  }, [selectedCustomer]);

  // Detail view tabs — align with keys in `detailedCustomerData`
  const tabs = [
    { id: "basic", name: "基本資訊", icon: FileText },
    { id: "contact", name: "聯絡資訊", icon: FileText },
    { id: "risk", name: "風險資訊", icon: Shield },
    { id: "financial", name: "財務狀況", icon: TrendingUp },
    { id: "business", name: "業務往來", icon: Star },
    { id: "interactions", name: "互動紀錄", icon: Clock },
    { id: "rating", name: "評價資訊", icon: Star },
    { id: "tags", name: "標籤資訊", icon: Filter },
    { id: "preferences", name: "偏好資訊", icon: Users },
  ];

  // parse percent-like strings (e.g. '92%') or numeric values
  const parsePercent = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    const s = v.toString();
    const m = s.match(/-?\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  };

  // Map a percent/score value to a human label used in preference badges
  const getPreferenceLabel = (v) => {
    const pct = parsePercent(v);
    if (pct >= 80) return "高";
    if (pct >= 60) return "中";
    return "低";
  };

  // get the top preference item for a customer by category and metric field
  const getTopPreference = (categoryName, metricField, customer) => {
    try {
      if (customer && customer.preferences) {
        // customer.preferences may be an object keyed by categoryName
        const group = customer.preferences[categoryName];
        if (Array.isArray(group) && group.length > 0) {
          let top = null;
          for (const it of group) {
            if (!top) {
              top = it;
              continue;
            }
            const cur = parsePercent(it[metricField]);
            const topv = parsePercent(top[metricField]);
            if (cur > topv) top = it;
          }
          if (top) return top;
        }

        // some mocks use a nested structure: preferences.sections[0].preferences
        if (Array.isArray(customer.preferences.sections)) {
          const prefs =
            (customer.preferences.sections[0] &&
              customer.preferences.sections[0].preferences) ||
            [];
          const grp = prefs.find((p) => p.category === categoryName);
          if (grp && Array.isArray(grp.items)) {
            let top = null;
            for (const it of grp.items) {
              if (!top) {
                top = it;
                continue;
              }
              const cur = parsePercent(it[metricField]);
              const topv = parsePercent(top[metricField]);
              if (cur > topv) top = it;
            }
            if (top) return top;
          }
        }
      }

      // fallback to demo-level detailedCustomerData structure
      const sections =
        (detailedCustomerData &&
          detailedCustomerData.preferences &&
          detailedCustomerData.preferences.sections) ||
        [];
      // match by section name when categoryName is human label (e.g., '產品偏好' / '通路偏好')
      const section = sections.find((s) =>
        (s.name || "").includes(categoryName)
      );
      const arr =
        section && Array.isArray(section.preferences)
          ? section.preferences
          : [];
      if (!arr.length) return null;
      let top = null;
      for (const it of arr) {
        // support both product/channel objects and generic {name, score}
        const val = parsePercent(it[metricField]);
        if (!top) {
          top = it;
          continue;
        }
        const topVal = parsePercent(top[metricField]);
        if (val > topVal) top = it;
      }
      return top || null;
    } catch (e) {
      return null;
    }
  };

  const getTopPreferenceForCustomer = (categoryName, metricField, customer) => {
    // Prefer dynamically enriched preferences if available
    if (customer && customer.preferences) {
      const parseVal = (v) => {
        if (v == null) return 0;
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const num = parseFloat(v.replace("%", ""));
          return isNaN(num) ? 0 : num;
        }
        return 0;
      };
      let arr = [];
      if (categoryName === "產品偏好")
        arr = customer.preferences.products || [];
      else if (categoryName === "通路偏好")
        arr = customer.preferences.channels || [];
      else if (categoryName === "標籤" && customer.enrichedTags)
        arr = customer.enrichedTags;
      if (arr.length) {
        let top = arr[0];
        for (let i = 1; i < arr.length; i++) {
          if (parseVal(arr[i].score) > parseVal(top.score)) top = arr[i];
        }
        return top;
      }
    }
    // Fallback to legacy detailed data preference extraction
    return getTopPreference(categoryName, metricField, customer);
  };

  // Localize channel keys to Chinese for display consistency
  const channelLabel = (key) => {
    const map = {
      email: "電子郵件",
      mobile_app: "行動銀行",
      wealth_portal: "財富管理網",
      branch: "臨櫃",
      phone: "電話",
      sms: "手機簡訊",
      appPush: "App 推播",
      linePush: "Line 推播",
      web: "網銀",
      online_banking: "網銀",
    };
    if (!key) return "";
    return map[key] || key;
  };

  // Customer-specific assistant configuration
  const getCustomerAssistantConfig = (customer) => {
    if (!customer) return null;
    
    // Special configuration for customer C196 (林怡君 - education fund planning)
    if (customer.id === "C196") {
      return {
        age: 32,
        segment: "家庭客／成長型客群",
        income: "中等穩定收入",
        industry: "外商行銷企劃",
        preferredChannels: ["財富管理網", "理專面對面諮詢"],
        pastProducts: ["存款", "定存", "基礎型保險"],
        behaviorInsights: ["新手媽媽（小孩 6 個月）", "對「子女未來教育」主動關心", "偏好穩健、不希望一次投入過高金額"],
        objective: "推薦「子女出國留學教育基金 — 長期分階段投資規劃方案」\n（結合：穩健型投資＋教育金目標模擬，不強調短期報酬）",
        mainOpening: `${customer.name || '林怡君'}您好，我這邊有一個專為家庭客戶設計的「子女教育基金規劃方案」想跟您分享。不少有孩子的家長會在這個階段開始規劃，現在開始投入的金額彈性最高，長期下來累積的空間也最大。今天可以一起看看是否符合您的想法。`,
        shortOpening: "您好，我有一個「教育基金長期規劃方案」想跟您分享，金額彈性、風險相對穩健，要不要花幾分鐘一起評估看看？",
        whyRecommend: [
          "這個階段開始規劃，未來可備用的金額空間最大、每月投入壓力也最小",
          "教育基金目標通常需要 10～18 年長期累積，分期定額模式可增大長期複利效果",
          "方案以穩健型為主，分期投入、長期複利為核心，不需一次投入大筆資金，適合各種生活節奏",
          "許多家長都擔心「要從何時開始」，其實越早開始，每月負擔越少、就越容易長期執行",
        ],
        script: `${customer.name || '林怡君'}您好，很多家長在孩子還小的時候會開始思考「未來教育基金」這個問題。教育基金的重點在於「越早開始、每月負擔越少」，早點起步，長期複利的空間就越大。我幫您設計的是一個每月金額彈性、可以長期累積的教育基金規劃。我們可以直接在財富管理網模擬給您看，不是馬上決定，而是先看看「如果現在開始，未來大概可以準備到多少」，再一起調整到您安心的節奏。`,
        objections: [
          {
            question: "「我會不會現在規劃太早？」",
            answer: "其實現在開始反而壓力最小，金額可以很彈性，等孩子長大再開始，投入金額通常會高很多。",
          },
          {
            question: "「我怕風險，萬一虧錢怎麼辦？」",
            answer: "我們是以穩健型為主，而且是長期目標，不是短期進出，系統也會定期檢視、調整比例，讓風險在可控範圍內。",
          },
          {
            question: "「我現在育兒花費很多，怕負擔不了。」",
            answer: "沒關係，我們可以從一個不影響生活的小金額開始，之後如果收入或狀況改變，再調整也很彈性。",
          },
        ],
        closing: `不如我先幫您模擬三種不同投入方案，今天不一定要決定，但可以先把「孩子未來教育基金的輪廓」建立起來。如果您覺得其中一個方式適合，我可以直接在財富管理網幫您設定，流程很簡單，之後也都有提醒與檢視頻率，可以隨時調整。`,
        plans: [
          {
            type: "保守型",
            monthlyAmount: "NT$3,000",
            targetYears: 18,
            estimatedTotal: "約 NT$90 萬（含保守預期報酬）",
            note: "以定存、短期債券為主，波動最低，適合不接受任何風險的家庭。",
          },
          {
            type: "穩健型（建議）",
            monthlyAmount: "NT$5,000",
            targetYears: 18,
            estimatedTotal: "約 NT$180 萬（預期年化報酬 3-5%）",
            note: "搭配定期定額基金＋部分保單，長期複利效果佳，兼顧風險保障，為最推薦方案。",
            recommended: true,
          },
          {
            type: "成長型",
            monthlyAmount: "NT$8,000",
            targetYears: 18,
            estimatedTotal: "約 NT$320 萬（預期年化報酬 6-8%）",
            note: "較高比例配置股票型基金，長期報酬潛力高，但需承擔短期波動，適合風險接受度較高者。",
          },
        ],
        compliance: "提醒您，本次說明僅為理財規劃建議，非保證收益；相關產品內容與費用將以正式說明文件與公告為準。本次諮詢將依規定進行紀錄。",
      };
    }
    
    return null;
  };

  // === Quick-action generators ===

  const buildCustomerSummaryBlock = (customer) => {
    if (!customer) return "目前未選擇客戶。請先在左側選擇或搜尋客戶。";
    const f = getCustomerFinance(customer);
    const vip = customer.vipLevel || "normal";
    const seg = (() => {
      const ls = customer.lifecycleStage || '';
      if (ls.includes('retire')) return '退休族';
      if (ls.includes('family')) return '家庭客';
      if (ls.includes('net_worth') || ls.includes('affluent')) return '高資產族';
      if (ls.includes('professional')) return '上班族';
      return (vip === 'VIP' || vip === 'VVIP' || vip === 'VVVIP') ? 'VIP 客' : '一般客';
    })();
    const income = f.monthlyIncome ? `NT$${Math.round(f.monthlyIncome / 1000)}k` : '—';
    const industry = getCustomerIndustry(customer);
    const topChannel = getTopPreferenceForCustomer("通路偏好", "score", customer);
    const chText = topChannel
      ? channelLabel(topChannel.channel || topChannel.name)
      : (customer.preferredChannels?.[0] || '—');
    const pp = customer.productPreferences || {};
    const nameMap = { creditCard: '信用卡', loans: '貸款', investment: '投資', deposits: '存款' };
    const pastPref = Object.entries(pp).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>nameMap[k]||k).join('/');
    const intent = getTopIntentTag(customer);
    const tags = (customer.tags || []).filter(t => !/有效戶|帳戶/.test(t)).slice(0,3);
    const behav = intent ? intent.name : (tags.join('、') || '—');
    const riskLabel = { low: '低', medium: '中', high: '高' }[customer.riskLevel || 'medium'] || '中';
    // Recent records: merge events + channel interactions, sort by date desc, take top 3
    const _evts = generateCustomerEvents(customer) || [];
    const _ints = generateCustomerInteractions(customer) || [];
    const _allRec = [..._evts, ..._ints]
      .map(r => ({ ...r, _d: new Date(r.time) }))
      .filter(r => !isNaN(r._d))
      .sort((a, b) => b._d - a._d)
      .slice(0, 3);
    const recentLines = _allRec.length
      ? _allRec.map(r => {
          const dateStr = r._d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
          const badge = r.status ? `【${r.status}】` : '';
          return `• ${dateStr} ${r.channel}${badge}：${r.detail}`;
        }).join('\n')
      : '—';
    return [
      '🧩 客戶摘要',
      [
        `姓名：${customer.name || '—'}（${customer.age || '—'}歲）`,
        `等級：${vip}｜族群：${seg}`,
        `風險：${riskLabel}（${customer.riskScore || '—'}）｜帳戶：${customer.accountStatus || '—'}`,
        `收入 / 行業：${income}／${industry}`,
        `偏好通路：${chText}`,
        `過去使用產品：${pastPref || '—'}`,
        `行為洞察：${behav}`,
        `近期重要事件：\n${recentLines}`,
      ].join('\n'),
    ].join('\n\n');
  };

  const buildGreetingScript = (customer) => {
    if (!customer) return "目前未選擇客戶。請先在左側選擇或搜尋客戶。";
    const name = customer.name || '客戶';
    const lastName = name.charAt(0);
    const vip = customer.vipLevel || 'normal';
    const isVIP = vip === 'VVVIP' || vip === 'VVIP';
    const ls = customer.lifecycleStage || '';
    const tags = customer.tags || [];
    const intent = getTopIntentTag(customer);
    const intentName = intent ? intent.name : '';
    const topChannel = getTopPreferenceForCustomer("通路偏好", "score", customer);
    const ch = topChannel
      ? channelLabel(topChannel.channel || topChannel.name)
      : (customer.preferredChannels?.[0] || '電話');
    // Internal context signal — for advisor reference only, not spoken to customer
    const contextSignal = (() => {
      if (/旅遊|出國/.test(intentName)) return '近期有旅遊相關行為訊號';
      if (/房貸|房屋/.test(intentName)) return '近期有房貸相關需求訊號';
      if (/投資|理財/.test(intentName)) return '近期有投資理財關注訊號';
      if (/信用卡/.test(intentName)) return '近期有信用卡申辦意圖訊號';
      if (tags.some(t => /新婚/.test(t))) return '生命事件：新婚（建議主動關心）';
      if (tags.some(t => /教育/.test(t))) return '有子女教育金規劃需求訊號';
      if (ls.includes('retire')) return '退休族群，正值規劃關鍵期';
      if (ls.includes('family')) return '家庭族群，家庭財務規劃需求高';
      if (ls.includes('young_professional')) return '年輕上班族，理財升級潛力高';
      return '帳戶近期有互動，建議定期維繫';
    })();
    // Natural opener — casual check-in, does not reveal data collection
    const openers = [
      `有一陣子沒跟您聯繫了，想說打個招呼，也順便跟您分享一些資訊。`,
      `最近在整理一些方案的時候，第一個想到您，想說趁這個機會跟您說幾句話。`,
      `前陣子有個方案讓我馬上想到您，一直想找機會跟您分享。`,
    ];
    const opener = openers[(customer.name || '').charCodeAt(0) % openers.length];
    // Natural transition into product — curiosity-based, not data-revealing
    const transition = (() => {
      if (/旅遊|出國/.test(intentName)) return `不知道您最近是否有出國的計畫？我這邊剛好有一個旅遊相關的方案，想說趁機跟您分享一下，花不到幾分鐘，合適再說。`;
      if (/房貸/.test(intentName)) return `不知道您最近是否有在考慮房屋或資產規劃方面的事情？如果有，我可以先幫您試算一下現在的優惠方案，完全沒有壓力。`;
      if (/投資|理財/.test(intentName)) return `我這邊剛好有一個和您的狀況很搭的理財方案，想說有沒有機會花幾分鐘跟您說明，不合適也完全沒關係。`;
      if (/信用卡/.test(intentName)) return `我這邊有一張您可能會有興趣的信用卡，回饋設計和日常消費很搭，想先讓您參考看看。`;
      if (tags.some(t => /新婚/.test(t))) return `首先恭喜您！成家之後財務規劃也是很重要的一塊，我這邊有一些適合的方案，有沒有機會跟您聊聊？`;
      if (ls.includes('retire')) return `我這邊有一個很穩健的退休規劃方案，想說花幾分鐘跟您分享，可以依您的步調慢慢規劃，完全不急。`;
      if (ls.includes('family')) return `我這邊有一些家庭財務規劃的方案，從教育基金到保障都有，有沒有機會跟您聊聊？`;
      return `如果您近期有任何資金規劃或產品需求，很歡迎跟我說，我們一起討論最適合您的方式。`;
    })();
    const nameCall = isVIP ? `${lastName}先生／女士` : name;
    const mainScript = isVIP
      ? `${nameCall}您好，我是您的專屬理財顧問。${opener}\n\n${transition}\n\n您現在方便說幾句話嗎？`
      : `${nameCall}您好，我是行服人員，${opener}\n\n${transition}\n\n不知道您現在方便嗎？`;
    const lineVersion = isVIP
      ? `【${nameCall}您好 👋】最近剛好有一個方案想和您分享，方便的話歡迎來電或直接回覆，謝謝您。`
      : `【${nameCall}您好 👋】有個方案想和您分享，若方便的話歡迎回覆或致電，謝謝您。`;
    return [
      '👋 問候話術',
      `【聯繫觸點（行員參考）】\n${contextSignal}，建議主動安排問候。`,
      `【完整問候話術（電話 / 當面）】\n${mainScript}`,
      `【簡版（LINE / SMS）】\n${lineVersion}`,
      `【溝通小技巧】\n• 開場先寒暄，不要太快切入產品推薦\n• 語氣輕鬆自然，讓客戶感覺在聊天而非被推銷\n• 以「不知道您最近是否有...」引導，讓客戶主動表達需求\n• 若客戶不方便，主動提出預約時間再聊\n• VIP 客戶建議以姓氏稱呼，展現個人化服務`,
    ].join('\n\n');
  };

  // Generate a concise assistant reply using available customer signals
  const generateAssistantReply = (prompt, customer) => {
    if (!customer) return "目前未選擇客戶。請先在左側選擇或搜尋客戶。";

    // Quick-action shortcut dispatch
    const _trimmed = (prompt || '').trim();
    if (_trimmed === '客戶摘要') return buildCustomerSummaryBlock(customer);
    if (_trimmed === '問候話術') return buildGreetingScript(customer);
    const _isProdRec = _trimmed === '產品推薦' || _trimmed.startsWith('產品推薦:');
    // Parse prefix: '產品推薦:intent:XXX' | '產品推薦:product:XXX' | '產品推薦:spending:XXX' | '產品推薦:XXX' (legacy intent)
    const _prodRecPayload = _trimmed.startsWith('產品推薦:') ? _trimmed.slice(5).trim() : null;
    const _forcedType   = _prodRecPayload && _prodRecPayload.startsWith('intent:')   ? 'intent'
                        : _prodRecPayload && _prodRecPayload.startsWith('product:')  ? 'product'
                        : _prodRecPayload && _prodRecPayload.startsWith('spending:') ? 'spending'
                        : _prodRecPayload ? 'intent' : null; // legacy: treat bare name as intent
    const _forcedLabel  = _prodRecPayload
      ? _prodRecPayload.replace(/^(intent|product|spending):/, '').trim()
      : null;
    // Keep _forcedIntentName for backward compat
    const _forcedIntentName = _forcedType === 'intent' ? _forcedLabel : null;
    
    // Check for customer-specific configuration
    const customConfig = getCustomerAssistantConfig(customer);
    if (customConfig) {
      // Generate response using customer-specific config variables
      const out = [];
      if (!_isProdRec) {
        out.push('🧩 客戶摘要');
        out.push(
          [
            `年齡／族群：${customConfig.age}／${customConfig.segment}`,
            `收入 & 產業：${customConfig.income}；${customConfig.industry}`,
            `偏好通路：${customConfig.preferredChannels.join('、')}`,
            `過去使用產品：${customConfig.pastProducts.join('／')}`,
            `行為洞察：\n\n${customConfig.behaviorInsights.join('\n')}`,
          ].join('\n')
        );
      }

      out.push('🎯 溝通目標');
      out.push(customConfig.objective);
      
      out.push('👋 客製化開場白（主開場／簡版）');
      out.push(`主開場：\n\n${customConfig.mainOpening}`);
      out.push(`簡版開場：\n\n${customConfig.shortOpening}`);
      
    out.push(`💡 為何推薦\n${customConfig.whyRecommend.join('\n')}`);
      
      out.push('🗣️ 主推話術（可直接口說）');
      out.push(customConfig.script);
      
      out.push('🤔 客戶可能回應 + 應對');
      out.push(customConfig.objections.map(o => `${o.question}\n→ ${o.answer}`).join('\n'));
      
      out.push('🤝 成交引導（Closing）');
      out.push(customConfig.closing);
      
      // Show plan simulation if available
      if (customConfig.plans && customConfig.plans.length > 0) {
        out.push('📊 個人化方案模擬（三種選擇）');
        out.push(customConfig.plans.map(p => {
          const badge = p.recommended ? ' ⭐ 建議方案' : '';
          return `【${p.type}${badge}】\n每月投入：${p.monthlyAmount} ｜ 目標年限：${p.targetYears} 年\n預估累積：${p.estimatedTotal}\n說明：${p.note}`;
        }).join('\n\n'));
      }
      
      out.push('⚖️ 法遵提示');
      out.push(customConfig.compliance);
      
      return out.join('\n\n');
    }
    
    const topChannel = getTopPreferenceForCustomer("通路偏好", "score", customer);
    const topProduct = getTopPreferenceForCustomer("產品偏好", "score", customer);
    const topConsumption = getTopPreferenceForCustomer("消費偏好", "score", customer);
    const intent = getTopIntentTag(customer);
    const f = getCustomerFinance(customer);
    const vip = customer.vipLevel || "normal";
    const risk = customer.riskLevel || "medium";
    const nat = customer.nationality || "";
    const personType = nat === "中華民國" ? "本國人" : (nat ? "外國人" : "");
    const chText = topChannel ? channelLabel(topChannel.channel || topChannel.name) : "慣用通路";
    // Derive a single, consistent primary product for the whole recommendation
    let prodText = topProduct ? (topProduct.product || topProduct.name) : "核心產品";
    const intentName = _forcedIntentName || (intent ? intent.name : "");
    const normalizeProd = (s) => (s || "").toLowerCase();

    // If a specific intent was forced (clicked from modal), derive prodText from that intent
    if (_forcedType === 'intent' && _forcedIntentName) {
      if (/投資|理財/.test(_forcedIntentName)) prodText = customer.vipLevel === 'VVVIP' || customer.vipLevel === 'VVIP' ? '私人銀行信託方案' : '穩健型基金定期定額';
      else if (/信用卡/.test(_forcedIntentName)) prodText = '高回饋現金回饋卡';
      else if (/旅遊|出國/.test(_forcedIntentName)) prodText = '信用卡旅遊權益方案';
      else if (/房貸/.test(_forcedIntentName)) prodText = '房貸試算方案';
      else if (/信貸/.test(_forcedIntentName)) prodText = '個人信用貸款';
      else if (/留學/.test(_forcedIntentName)) prodText = '留學教育貸款';
    } else if (_forcedType === 'product' && _forcedLabel) {
      // Triggered from 產品偏好 card — map product preference name to a specific plan
      if (/信用卡/.test(_forcedLabel)) prodText = '高回饋現金回饋卡';
      else if (/投資|理財/.test(_forcedLabel)) prodText = customer.vipLevel === 'VVVIP' || customer.vipLevel === 'VVIP' ? '私人銀行信託方案' : '穩健型基金定期定額';
      else if (/存款/.test(_forcedLabel)) prodText = '台幣定期存款 / 外幣定存';
      else if (/貸款/.test(_forcedLabel)) prodText = '個人信用貸款 / 房貸試算方案';
      else prodText = _forcedLabel;
    } else if (_forcedType === 'spending' && _forcedLabel) {
      // Triggered from 消費類別偏好 card — map spending category to best-fit product
      if (/旅遊/.test(_forcedLabel)) prodText = '旅遊聯名信用卡';
      else if (/精品/.test(_forcedLabel)) prodText = '精品百貨聯名卡 / 分期零利率精品專案';
      else if (/餐飲/.test(_forcedLabel)) prodText = '餐飲回饋信用卡';
      else if (/科技|3C/.test(_forcedLabel)) prodText = '3C 分期購物信用卡';
      else if (/教育/.test(_forcedLabel)) prodText = '教育儲蓄專案 / 留學教育貸款';
      else if (/醫療/.test(_forcedLabel)) prodText = '醫療保障方案 / 醫療信用貸款';
      else if (/娛樂/.test(_forcedLabel)) prodText = '娛樂消費回饋卡';
      else if (/海外/.test(_forcedLabel)) prodText = '海外消費信用卡 / 外幣帳戶';
      else if (/投資|財富/.test(_forcedLabel)) prodText = '穩健型基金定期定額';
      else if (/育兒|家庭/.test(_forcedLabel)) prodText = '教育基金規劃方案';
      else prodText = `${_forcedLabel}相關回饋方案`;
    } else {
      const isTravelIntent = /旅遊|出國/.test(intentName || "");
      const prefersCard = normalizeProd(prodText).includes("card") || /信用卡|卡|card/.test(prodText);
      if (isTravelIntent && !prefersCard) prodText = "信用卡旅遊權益方案";
    }
    // If deposits/wealth intent conflicts with loans, keep deposits/wealth consistent for low risk
    const isWealthLike = /投資|基金|wealth|理財/.test(prodText);
    if (risk === 'low' && /貸款|loan/.test(prodText)) prodText = isWealthLike ? prodText : "穩健理財/定存加值";
    // When triggered from spending card, override consText with the actual clicked category
    const consText = (_forcedType === 'spending' && _forcedLabel)
      ? _forcedLabel
      : topConsumption ? (topConsumption.category || topConsumption.name) : "主要消費類別";
    const intentText = intent ? intent.name : "近期需求";

    const lower = (prompt || "").toLowerCase();
    const wantScript = /話術|script|怎麼說|推銷|推薦/.test(prompt || "");
    const wantRisk = /風險|risk/.test(lower);
    const wantSummary = /摘要|summary|概況|overview/.test(lower);

    // Determine product type for coherent messaging
    const prodLower = (prodText || '').toLowerCase();
    const isCreditCard = /信用卡|聯名卡|回饋卡|card/.test(prodText) || prodLower.includes('card');
    const isLoan = /貸款|loan/.test(prodText) && !/聯名卡|回饋卡/.test(prodText);
    const isWealth = /理財|投資|基金|wealth/.test(prodText) && !isCreditCard;
    const primaryType = isCreditCard ? 'card' : isLoan ? 'loan' : isWealth ? 'wealth' : 'other';

    // Personalized headline and snapshot
    const incomeBand = (() => {
      const inc = f.monthlyIncome || 0;
      if (inc >= 120000) return '高';
      if (inc >= 60000) return '中';
      return '低';
    })();
    const seg = (() => {
      if ((customer.lifecycleStage||'').includes('retire')) return '退休族';
      if ((customer.lifecycleStage||'').includes('family')) return '家庭客';
      if ((customer.lifecycleStage||'').includes('professional')) return '上班族';
      return vip === 'VIP' || vip === 'VVIP' ? 'VIP 客' : '一般客';
    })();
    const pastPref = (() => {
      const pp = customer.productPreferences || {};
      const ranked = Object.entries(pp).sort((a,b)=>b[1]-a[1]).map(([k])=>k);
      const map = {creditCard:'信用卡', loans:'貸款', investment:'投資', deposits:'存款', insurance:'保險'};
      return ranked.slice(0,2).map(k=>map[k]||k).join('/');
    })();
    const behav = intentText || (topConsumption?topConsumption.name:'') || '';
    
    // 獲取客戶行業和更詳細的收入信息
    const customerIndustry = getCustomerIndustry(customer);
    const monthlyIncomeFormatted = f.monthlyIncome ? `NT$${(f.monthlyIncome/1000).toFixed(0)}k` : '—';

    const riskLine = (
      primaryType === 'wealth' || primaryType === 'loan'
        ? `風險：目前等級為${risk}，將依適合度評估與風險揭露進行分段配置。`
        : `適配：此方案著重於權益與回饋，不涉及投資風險配置，使用上簡單清楚。`
    );
    const vipOpen = vip === 'VIP' || vip === 'VVIP'
      ? `開場：${customer.name?customer.name+'您好':''}，您是${vip}客戶，我們特別在${chText}為您準備一個依照您的使用習慣與興趣打造的專屬方案。`
      : `開場：您好${customer.name?`，${customer.name}`:''}，我們在${chText}為您準備一個依照您的使用習慣與興趣量身打造的方案。`;
    // Standardized output format per request
    const out = [];
    if (!_isProdRec) {
      out.push('🧩 客戶摘要');
      out.push(
        [
          `年齡/族群：${customer.age||'—'}／${seg}／${vip}`,
          `收入/行業：${monthlyIncomeFormatted}／${customerIndustry}`,
          `偏好通路：${chText}`,
          `過去使用產品：${pastPref||'—'}`,
          `行為洞察：${behav||'—'}`,
        ].join('\n')
      );
    }

    out.push('🎯 溝通目標');
    const objective = (() => {
      if (_forcedType === 'spending' && _forcedLabel) return `推薦「${prodText}」（${_forcedLabel}情境）`;
      if (_forcedType === 'product' && _forcedLabel) return `推薦${_forcedLabel}相關方案`;
      if (_forcedType === 'intent' && _forcedLabel) return `跟進「${_forcedLabel}」，推薦「${prodText}」`;
      return `推薦「${prodText}」`;
    })();
    out.push(objective);

    out.push('👋 客製化開場白（主開場/簡版）');
    out.push(`主開場：${vipOpen.replace(/^開場：/, '')}`);
    out.push(`簡版開場：您好，我這邊有一個「${prodText}」方案想跟您分享，可以在${chText}快速了解，不用花太多時間，方便嗎？`);

    const reasons = [
      `「${prodText}」非常適合有${intentName || behav || '近期規劃'}需求的客戶，功能與權益直接對應。`,
      primaryType==='card' ? `這張卡在「${consText}」情境有加碼回饋設計，日常使用起來直接有感。` : `方案門檻彈性、可依生活節奏調整，不造成額外財務壓力。`,
      primaryType!=='card' ? `我們會依您的需求與適合度評估，提供最合適的配置建議。` : `此方案重點在權益與回饋，不涉及投資風險配置。`,
    ];
    out.push(`💡 為何推薦\n${reasons.filter(Boolean).join('\n')}`);

    out.push('🗣️ 主推話術（可直接口說）');
    const nameForCall = customer.name ? `，${customer.name}` : '';
    let spoken = '';
    if (primaryType === 'card') {
      spoken = `您好${nameForCall}，我這邊有一張「${prodText}」想跟您分享。這張卡在${consText}與海外消費都有加碼回饋，權益集中、使用簡單。如果您有興趣，我可以在${chText}幫您一次設定，流程不用幾分鐘。`;
    } else if (primaryType === 'loan') {
      spoken = `您好${nameForCall}，我這邊有個方案想跟您分享。「${prodText}」的條件很彈性，費用與期數我會先說清楚，也會依適合度幫您試算。現在我可在${chText}替您送出預審，幾分鐘就好，您覺得如何？`;
    } else if (primaryType === 'wealth') {
      spoken = `您好${nameForCall}，我整理了一個穩健的「${prodText}」方案，重點是透明、可調整；有任何變動我會即時通知您。如果方便，我可在${chText}帶您看看，過程很簡單。`;
    } else {
      spoken = `您好${nameForCall}，我有一個「${prodText}」方案想跟您分享，可配合您想用的${chText}完成設定，之後在「${consText}」情境有加碼回饋。現在幫您處理，方便嗎？`;
    }
    out.push(spoken);

    out.push('🤔 客戶可能回應 + 應對');
    const objections = [
      '「我再想想」→ 理解，您可先以基礎權益/低門檻方案開始，之後再加值也很方便。',
      `「我沒有時間」→ 我可以在您習慣的${chText}一次完成設定，全程不複雜。`,
      primaryType==='card' ? '「怕不划算」→ 我們會依您的常見情境加碼，確保日常/旅遊都能享有實際回饋。' : '「我現在沒需求」→ 無妨，先協助預留名額，之後您要啟用也可以。',
    ];
    out.push(objections.join('\n'));

    out.push('🤝 成交引導（Closing）');
    out.push(`那我幫您做申請，${chText}會跳出確認，不到 1 分鐘。若您方便，我現在先幫您預留名額，之後您看要不要啟用也可以。`);

    out.push('⚖️ 法遵提示');
    out.push(primaryType==='card' ? '提醒：本次通話將進行錄音；權益以公告為準，請依條款使用。' : '提醒：請完成錄音、費用揭露與同意確認；依適合度評估執行。');

    const formatted = out.join('\n\n');

    const riskNote = wantRisk
      ? (
          primaryType === 'wealth' || primaryType === 'loan'
            ? `風險提示：目前風險等級為 ${risk}；請先完成適合度評估與風險揭露，並依您的投資屬性設定安全界線。`
            : `風險提示：此建議著重於權益與回饋，並不涉及投資型風險配置。`
        )
      : "";

    // Return standardized format, optionally appending risk note when explicitly requested
    return [formatted, riskNote].filter(Boolean).join('\n\n');
  };

  // Sensitive data masking helpers (enabled when showMaskedData is true)
  // Factory for masking functions with consistent error handling
  const makeMaskFunction = (maskFn) => (s) => {
    if (!s) return "";
    return maskFn(String(s));
  };
  const maskPhone = makeMaskFunction((s) => {
    const digits = s.replace(/\D/g, "");
    if (digits.length < 7) return "*".repeat(Math.max(3, digits.length));
    const head = digits.slice(0, 4);
    const tail = digits.slice(-3);
    return `${head}-***-${tail}`;
  });
  const maskEmail = makeMaskFunction((s) => {
    const parts = s.split("@");
    if (parts.length < 2) return "***";
    const local = parts[0];
    const domain = parts.slice(1).join("@");
    const prefix = local.length > 1 ? local.slice(0, 1) : "";
    return `${prefix}***@${domain}`;
  });
  const maskId = makeMaskFunction((s) => {
    if (s.length <= 5) return s[0] + "***";
    const head = s.slice(0, 3);
    const tail = s.slice(-2);
    return `${head}${"*".repeat(Math.max(3, s.length - 5))}${tail}`;
  });
  const maskAddress = makeMaskFunction((s) =>
    s.replace(/[0-9０-９]+/g, (m) => "*".repeat(Math.min(4, m.length)))
  );
  const maskDigitsKeepLast = (s, keep = 4) => {
    if (!s) return "";
    const chars = String(s).split("");
    let digitCount = 0;
    for (let i = chars.length - 1; i >= 0; i--) {
      const ch = chars[i];
      if (/\d/.test(ch)) {
        digitCount++;
        if (digitCount > keep) chars[i] = "*";
      }
    }
    return chars.join("");
  };
  const maskValue = (label, value, force = false) => {
    // When masking is disabled, always return raw value regardless of force flag
    if (!showMaskedData) return value;
    if (!value) return value;
    const l = label || "";
    if (/郵件|email/i.test(l)) return maskEmail(value);
    if (/手機|電話/.test(l)) return maskPhone(value);
    if (/地址/.test(l)) return maskAddress(value);
    if (/證件號|身分證|ID|idCard/i.test(l)) return maskId(value);
    return value;
  };

  // get highest-confidence intent tag from detailedCustomerData
  const getTopIntentTag = (customer) => {
    try {
      // Derive intent from the actual customer's tags array first
      if (customer) {
        const sp = customer.spendingCategories || {};
        const pp = customer.productPreferences || {};
        // Score each intent tag found in the customer's tags string array
        const intentScorer = (name) => {
          if (/旅遊|出國/.test(name))
            return Math.max(sp.travel || 0, sp.overseas || 0) * 0.9 + (pp.creditCard || 0) * 0.1;
          if (/信用卡/.test(name)) return pp.creditCard || 0;
          if (/投資|理財/.test(name)) return pp.investment || 0;
          if (/房貸/.test(name)) return (pp.loans || 0) * 0.8 + (sp.groceries || 0) * 0.2;
          if (/信貸/.test(name)) return (pp.loans || 0) * 0.7;
          if (/留學/.test(name)) return sp.education || 0;
          if (/創業|融資/.test(name)) return 0.45;
          return 0.5;
        };
        const intentTags = (customer.tags || []).filter(
          (t) => typeof t === "string" && t.includes("意圖")
        );
        if (intentTags.length > 0) {
          const withScores = intentTags.map((name) => ({
            name,
            score: intentScorer(name),
          }));
          withScores.sort((a, b) => b.score - a.score);
          return withScores[0];
        }
        // No explicit intent tag — infer from strongest spending signal
        const inferred = [
          { name: "出國旅遊意圖", score: Math.max(sp.travel || 0, sp.overseas || 0) },
          { name: "投資理財意圖", score: pp.investment || 0 },
          { name: "信用卡申辦意圖", score: pp.creditCard || 0 },
          { name: "房貸需求", score: pp.loans || 0 },
        ].filter((t) => t.score >= 0.65);
        inferred.sort((a, b) => b.score - a.score);
        if (inferred.length > 0) return inferred[0];
        // No intent signal found for this real customer — do not fall back to demo data
        return null;
      }
      // Fallback: detailedCustomerData (C196 demo hardcoded profile)
      const sections =
        (detailedCustomerData &&
          detailedCustomerData.tags &&
          detailedCustomerData.tags.sections) ||
        [];
      const intentSec = sections.find(
        (s) => s.name && s.name.includes("意圖標籤")
      );
      const tags = (intentSec && intentSec.tags) || [];
      if (!tags.length) return null;
      let top = tags[0];
      for (let i = 1; i < tags.length; i++) {
        const sc =
          typeof tags[i].score === "number"
            ? tags[i].score
            : parseFloat(tags[i].score || "0");
        const topSc =
          typeof top.score === "number"
            ? top.score
            : parseFloat(top.score || "0");
        if (sc > topSc) top = tags[i];
      }
      return top;
    } catch (e) {
      return null;
    }
  };

  // Generate deterministic simulated finance data per-customer (fallback to demo-level)
  const getCustomerFinance = (customer) => {
    const key = (customer && customer.id) || "demo";
    let hash = 0;
    for (let i = 0; i < key.length; i++)
      hash = (hash * 31 + key.charCodeAt(i)) % 1000000;

    // VIP-tier based wealth brackets (使用集中配置)
    const vipLevel = (customer && customer.vipLevel) || "normal";
    const tierFinancial = getTierFinancialRange(vipLevel);
    const baseRange = tierFinancial.rangeWidth;
    const base = tierFinancial.min;
    
    const netWorth = Math.round(base + (hash % baseRange));

    const investPct = (hash % 50) / 100; // 0-0.49
    const liquidPct = ((hash >> 5) % 60) / 100; // 0-0.59
    let loanPct = ((hash >> 10) % 70) / 100; // 0-0.69

    // normalize so sum doesn't exceed 1.0
    let invest = Math.round(netWorth * investPct);
    let liquid = Math.round(netWorth * liquidPct);
    let loan = Math.round(netWorth * loanPct);
    let sum = invest + liquid + loan;
    if (sum > netWorth) {
      const scale = netWorth / sum;
      invest = Math.round(invest * scale);
      liquid = Math.round(liquid * scale);
      loan = Math.round(loan * scale);
      sum = invest + liquid + loan;
    }
    const other = Math.max(0, netWorth - sum);

    // 根据 VIP 等级提供更多样化的收入计算
    const getMonthlyIncomeByTier = () => {
      const tierIncomeRanges = {
        'VVVIP': { min: 300000, max: 800000 },
        'VVIP': { min: 150000, max: 400000 },
        'VIP': { min: 80000, max: 200000 },
        'normal': { min: 30000, max: 100000 }
      };
      const range = tierIncomeRanges[vipLevel] || tierIncomeRanges['normal'];
      const variance = ((hash % 100) / 100) * (range.max - range.min);
      return Math.round(range.min + variance);
    };
    
    const monthlyIncome = getMonthlyIncomeByTier();
    const avgMonthlySpend = Math.round(
      monthlyIncome * (0.25 + ((hash >> 7) % 50) / 200)
    );
    const creditLimit = Math.round(netWorth * 0.15 + ((hash >> 2) % 200000));
    const creditUtilPct = Math.round((hash % 80) + 10); // 10-89

    // compute derived card spend before using it in other signals
    const cardSpend3M = Math.round(
      avgMonthlySpend * (0.6 + ((hash >> 4) % 60) / 100)
    );

    // derive marketing signals
    const ltv = Math.round(netWorth * (0.05 + ((hash >> 6) % 20) / 100)); // rough lifetime value estimate
    const engagementScore = Math.round(
      ((creditUtilPct / 100) * 0.4 +
        (cardSpend3M / Math.max(1, avgMonthlySpend) / 5) * 0.6) *
        100
    );
    const marketingScore = Math.round(
      Math.log10(Math.max(1, netWorth)) * 10 * (1 + creditUtilPct / 200)
    );
    const isHighValue = netWorth >= 2000000 || marketingScore >= 60;

    return {
      netWorth,
      liquid,
      invest,
      loan,
      other,
      liquidPct: Math.round((liquid / netWorth) * 100),
      investPct: Math.round((invest / netWorth) * 100),
      loanPct: Math.round((loan / netWorth) * 100),
      otherPct: Math.max(
        0,
        100 -
          Math.round((liquid / netWorth) * 100) -
          Math.round((invest / netWorth) * 100) -
          Math.round((loan / netWorth) * 100)
      ),
      monthlyIncome,
      avgMonthlySpend,
      creditLimit,
      creditUtilPct,
      cardSpend3M,
      // marketing signals
      ltv,
      engagementScore: Math.max(0, Math.min(100, engagementScore)),
      marketingScore: Math.max(0, Math.min(100, marketingScore)),
      isHighValue,
    };
  };

  // 客户行业映射 - 基于客户 ID 进行确定性分配
  const getCustomerIndustry = (customer) => {
    // Use explicit industry field if set on the customer
    if (customer && customer.industry) return customer.industry;
    const industries = [
      "科技/軟體", "製造業", "金融服務", "零售/電商", "醫療/健康",
      "房地產", "教育", "物流/運輸", "能源", "媒體/傳播",
      "餐飲", "旅遊/飯店", "保險", "農業", "建築",
      "諮詢", "法律服務", "政府/公務", "非營利組織", "其他"
    ];
    const key = (customer && customer.id) || "demo";
    let hash = 0;
    for (let i = 0; i < key.length; i++)
      hash = (hash * 31 + key.charCodeAt(i)) % 1000000;
    return industries[hash % industries.length];
  };

  // deterministic generators for demo transactions / interactions / series
  const seedFromId = (customer) => {
    const key = (customer && (customer.id || customer.name)) || "demo";
    let s = 0;
    for (let i = 0; i < key.length; i++)
      s = (s * 131 + key.charCodeAt(i)) % 1000000007;
    return s;
  };

  const generateRecentTransfers = (customer, n = 5) => {
    const seed = seedFromId(customer);
    const merchants = [
      "臺灣銀行",
      "王大明",
      "李美華",
      "張三貿易",
      "電商平台",
      "房東",
      "旅行社",
      "薪資發放",
    ];
    const out = [];
    for (let i = 0; i < n; i++) {
      const dayOffset = (seed + i * 7) % 30;
      const date = new Date();
      date.setDate(date.getDate() - dayOffset - i);
      const amount = Math.round(((seed >> i % 10) % 90000) + 1000);
      const counterparty = merchants[(seed + i) % merchants.length];
      out.push({
        time: date.toLocaleString(),
        merchant: counterparty,
        amount: `NT$ ${amount.toLocaleString()}`,
      });
    }
    return out;
  };

  const generateRecentCardAuths = (customer, n = 5) => {
    const seed = seedFromId(customer) + 97;
    const merchants = [
      "全家便利商店",
      "星巴克",
      "台北101購物",
      "家樂福",
      "Uber Eats",
      "誠品書店",
      "MRT加值",
    ];
    const out = [];
    for (let i = 0; i < n; i++) {
      const dayOffset = (seed + i * 3) % 20;
      const date = new Date();
      date.setDate(date.getDate() - dayOffset - i);
      const amount = Math.round(((seed >> i % 8) % 8000) + 120);
      const merchant = merchants[(seed + i * 11) % merchants.length];
      out.push({
        time: date.toLocaleString(),
        merchant,
        amount: `NT$ ${amount.toLocaleString()}`,
      });
    }
    return out;
  };

  const generateCustomerInteractions = (customer, min = 3, max = 6) => {
    // C196 林怡君 — 固定顯示近期通路互動（行動銀行、網銀等，不含人生大事）
    if (customer && customer.id === "C196") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const sixWeeksAgo = new Date();
      sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return [
        { channel: "行動銀行", time: threeMonthsAgo.toLocaleString(), detail: "查詢定存利率方案" },
        { channel: "網銀", time: sixWeeksAgo.toLocaleString(), detail: "申請定存續存" },
        { channel: "行動銀行", time: twoWeeksAgo.toLocaleString(), detail: "查詢子女教育金試算" },
        { channel: "行動銀行", time: oneWeekAgo.toLocaleString(), detail: "查詢帳戶餘額與近期交易" },
        { channel: "行動銀行", time: fourDaysAgo.toLocaleString(), detail: "登入並查詢餘額" },
      ];
    }
    const seed = seedFromId(customer) + 201;
    const count = min + (seed % (max - min + 1));
    const channels = [
      "行動銀行",
      "網銀",
      "臨櫃",
      "專線客服",
      "聊天機器人",
      "Email",
    ];
    const details = [
      "登入並查詢餘額",
      "申請臨時額度",
      "申訴交易爭議",
      "查詢理專名單",
      "變更通訊地址",
      "查詢信用額度",
    ];
    const out = [];
    for (let i = 0; i < count; i++) {
      const days = (seed + i * 5) % 60;
      const date = new Date();
      date.setDate(date.getDate() - days - i);
      out.push({
        channel: channels[(seed + i) % channels.length],
        time: date.toLocaleString(),
        detail: details[(seed + i) % details.length],
      });
    }
    return out;
  };

  // Enrich customers with demographic and identification defaults
  (() => {
    const eduOptions = ["高中", "大學", "碩士", "博士", "專科"];
    const maritalOptions = ["未婚", "已婚", "離婚"];
    const nationalityOptions = ["中華民國", "外籍"];
    mockCustomers.forEach((c) => {
      // default 證件類別: 多數為身分證，少數分佈為護照/居留證
      if (!c.idType) {
        const s = seedFromId(c) % 20;
        c.idType = s === 0 ? "護照" : s === 1 ? "居留證" : "身分證";
      }
      if (!c.nationality)
        c.nationality =
          nationalityOptions[(seedFromId(c) >> 3) % nationalityOptions.length];
      if (!c.education)
        c.education = eduOptions[(seedFromId(c) >> 5) % eduOptions.length];
      if (!c.maritalStatus)
        c.maritalStatus =
          maritalOptions[(seedFromId(c) >> 7) % maritalOptions.length];
    });
  })();

  // Gender map (based on name convention for Taiwan)
  const GENDER_MAP = {
    C001:"male",C002:"female",C003:"male",C004:"female",C005:"male",
    C006:"female",C007:"male",C008:"female",C009:"male",C010:"female",
    C011:"male",C012:"male",C013:"female",C014:"male",C015:"male",
    C016:"female",C017:"male",
    C181:"male",C182:"female",C183:"male",C184:"female",C185:"male",
    C186:"female",C187:"male",C188:"female",C189:"male",C190:"female",
    C191:"female",C192:"female",C193:"female",C194:"male",C195:"female",
    C196:"female",C197:"male",C198:"female",C199:"female",C200:"male",
    C201:"female",C202:"male",C203:"female",C204:"male",C205:"female",C206:"male",
  };
  // Spouse map — exactly 22 entries ≈ 50% of 43 customers.
  // 4 cross-linked bank-customer pairs: C001↔C196, C203↔C204.
  const SPOUSE_MAP = {
    C001: { name: "林怡君",  customerId: "C196" },   // 本行客戶 ✓
    C002: { name: "趙志明",  customerId: null },
    C004: { name: "蕭建民",  customerId: null },
    C007: { name: "林玉芳",  customerId: null },
    C008: { name: "黃建宏",  customerId: null },
    C009: { name: "黃秀蘭",  customerId: null },
    C010: { name: "陳志鴻",  customerId: null },
    C011: { name: "吳思穎",  customerId: null },
    C012: { name: "劉佳慧",  customerId: null },
    C014: { name: "張玉蓉",  customerId: null },
    C017: { name: "張雅惠",  customerId: null },
    C185: { name: "林佳芬",  customerId: null },
    C193: { name: "呂建霖",  customerId: null },
    C194: { name: "許雅惠",  customerId: null },
    C196: { name: "王小明",  customerId: "C001" },   // 本行客戶 ✓
    C197: { name: "蔣淑華",  customerId: null },
    C198: { name: "謝承宏",  customerId: null },
    C199: { name: "楊志成",  customerId: null },
    C200: { name: "吳芳茹",  customerId: null },
    C203: { name: "林昊天",  customerId: "C204" },   // 本行客戶 ✓
    C204: { name: "鄭美玲",  customerId: "C203" },   // 本行客戶 ✓
    C205: { name: "黃世雄",  customerId: null },
  };
  // Enrich each customer with gender and spouseInfo
  mockCustomers.forEach((c) => {
    if (!c.gender) c.gender = GENDER_MAP[c.id] || "unknown";
    if (!c.spouseInfo && SPOUSE_MAP[c.id]) {
      c.spouseInfo = SPOUSE_MAP[c.id];
      // Customers with a spouse must be married
      if (c.maritalStatus !== "已婚") c.maritalStatus = "已婚";
    }
  });

  // Enrichment: derive riskLevel from riskScore (single source of truth), then accountStatus/preferences
  // A+/A → low, B → medium, C → high
  const deriveRiskLevelFromScore = (score) => {
    if (score === "A+" || score === "A") return "low";
    if (score === "B") return "medium";
    if (score === "C") return "high";
    return "medium"; // fallback
  };
  mockCustomers.forEach((c) => {
    // riskScore is the authoritative field; riskLevel is always derived from it
    if (!c.riskScore) c.riskScore = "A"; // default if missing
    c.riskLevel = deriveRiskLevelFromScore(c.riskScore);
    // Account status recalc based on interactions recency (30d)
    // Preserve 結清 / 失效戶 statuses (do not auto-reactivate)
    if (!["closed", "結清", "失效戶"].includes(c.accountStatus)) {
      const interactions = generateCustomerInteractions(c, 3, 6);
      const recent = interactions.some((it) => {
        const dt = new Date(it.time);
        return (Date.now() - dt.getTime()) / 86400000 <= 30;
      });
      c.accountStatus = recent ? "active" : "inactive";
    }
    // Preferences (products / channels)
    const pp = c.productPreferences || {};
    c.preferences = {
      products: [
        { name: "信用卡", score: Math.round((pp.creditCard || 0) * 100) + "%" },
        { name: "貸款", score: Math.round((pp.loans || 0) * 100) + "%" },
        { name: "存款", score: Math.round((pp.deposits || 0) * 100) + "%" },
        { name: "投資", score: Math.round((pp.investment || 0) * 100) + "%" },
      ],
      channels: (c.preferredChannels || []).map((ch) => ({
        name: ch,
        score: 60 + ((c.id.charCodeAt(0) + ch.length * 7) % 40) + "%",
      })),
    };
    // Tag scores
    c.enrichedTags = (c.tags || []).map((t, i) => ({
      name: t,
      score: (0.55 + (c.id.charCodeAt(i % c.id.length) % 40) / 100).toFixed(2),
    }));
    // Attach structured tags per taxonomy
    attachStructuredTags(c);
    // Consistency rule: strong engagement tags imply active status (unless 結清/失效戶)
    if (!["closed", "結清", "失效戶"].includes(c.accountStatus)) {
      const engagementTags = new Set([
        "經常使用信用卡權益者", // 交易互動
        "經常登錄信用卡優惠活動", // 產品屬性
        "經常關注信用卡優惠與權益", // 通路互動
        "高黏著數位使用者", // 通路互動
      ]);
      const hasEngagement = (c.structuredTags || []).some((t) =>
        engagementTags.has(t.name)
      );
      if (hasEngagement) c.accountStatus = "active";
    }

    // Overrides: persona customers always active (unless 結清/失效戶) and set low risk per request
    const personaIds = new Set([
      "C012",
      "C013",
      "C014",
      "C015",
      "C016",
      "C017",
      "C193",
      "C194",
      "C195",
    ]);
    if (personaIds.has(c.id) && !["結清", "失效戶"].includes(c.accountStatus))
      c.accountStatus = "active";
    if (personaIds.has(c.id)) {
      c.riskLevel = "low";
      if (!["A+", "A"].includes(c.riskScore)) c.riskScore = "A";
    }
  });

  // Post-process: ensure a small portion of customers are high risk (10%-20%), excluding personas and closed
  (() => {
    const personas = new Set(["C012", "C013", "C014", "C015", "C016", "C017"]);
    const candidates = mockCustomers.filter(
      (c) =>
        !personas.has(c.id) &&
        !["結清", "失效戶", "closed"].includes(c.accountStatus)
    );
    const targetMin = Math.ceil(mockCustomers.length * 0.1);
    const targetMax = Math.floor(mockCustomers.length * 0.2);
    let currentHigh = mockCustomers.filter(
      (c) => c.riskLevel === "high"
    ).length;
    if (currentHigh < targetMin) {
      // promote top composite risk candidates to high until targetMin
      const scored = candidates
        .map((c) => {
          const f = getCustomerFinance(c);
          const loanRatio = f.loan / Math.max(1, f.netWorth);
          const utilRatio = f.creditUtilPct / 100;
          const spendRatio = f.cardSpend3M / Math.max(1, f.avgMonthlySpend * 3);
          const composite =
            loanRatio * 0.5 + utilRatio * 0.3 + spendRatio * 0.2;
          return { c, composite };
        })
        .sort((a, b) => b.composite - a.composite);
      for (let i = 0; i < scored.length && currentHigh < targetMin; i++) {
        scored[i].c.riskLevel = "high";
        scored[i].c.riskScore = "C"; // keep riskScore in sync
        currentHigh++;
      }
    } else if (currentHigh > targetMax) {
      // demote lowest composite among non-persona highs down to medium
      const highs = candidates.filter((c) => c.riskLevel === "high");
      const scored = highs
        .map((c) => {
          const f = getCustomerFinance(c);
          const loanRatio = f.loan / Math.max(1, f.netWorth);
          const utilRatio = f.creditUtilPct / 100;
          const spendRatio = f.cardSpend3M / Math.max(1, f.avgMonthlySpend * 3);
          const composite =
            loanRatio * 0.5 + utilRatio * 0.3 + spendRatio * 0.2;
          return { c, composite };
        })
        .sort((a, b) => a.composite - b.composite);
      for (let i = 0; i < scored.length && currentHigh > targetMax; i++) {
        scored[i].c.riskLevel = "medium";
        scored[i].c.riskScore = "B"; // keep riskScore in sync
        currentHigh--;
      }
    }
  })();

  const generateCustomerServiceRecords = (customer, n = 4) => {
    const seed = seedFromId(customer) + 503;
    const channels = ["電話", "Email", "臨櫃", "線上客服"];
    const categories = [
      "交易問題",
      "帳務查詢",
      "信用卡爭議",
      "KYC文件不全",
      "理財諮詢",
    ];
    const out = [];
    for (let i = 0; i < n; i++) {
      const days = (seed + i * 9) % 90;
      const date = new Date();
      date.setDate(date.getDate() - days - i);
      out.push({
        time: date.toLocaleString(),
        channel: channels[(seed + i) % channels.length],
        category: categories[(seed + i) % categories.length],
        note: "客服紀錄",
      });
    }
    return out;
  };

  const generateMonthlySeries = (customer, months = 6) => {
    const seed = seedFromId(customer) + 997;
    const base = Math.max(
      10000,
      getCustomerFinance(customer).monthlyIncome || 20000
    );
    const out = [];
    for (let i = months - 1; i >= 0; i--) {
      const fluct = ((seed >> i % 10) % 2000) - 800; // -800..+1200
      const val = Math.max(0, base + Math.round(fluct * (1 + i / months)));
      out.push(val);
    }
    return out;
  };

  // Generate customer events: deposit maturity and life events
  const generateCustomerEvents = (customer, n = 4) => {
    // C001 王小明 — 固定顯示定存到期提醒（搭配消費爭議款處理中情境）
    if (customer && customer.id === "C001") {
      const now = new Date();
      const twoMonthsLater = new Date(now.getFullYear(), now.getMonth() + 2, 15);
      const past1 = new Date(now.getFullYear() - 2, 3, 20);
      const past2 = new Date(now.getFullYear() - 4, 8, 5);
      return [
        {
          channel: "定存到期",
          time: twoMonthsLater.toLocaleDateString("zh-TW") + " 09:00",
          detail: "您的台幣定存即將到期，建議評估續存/轉存與利率方案。",
          status: "提醒",
        },
        {
          channel: "人生大事",
          time: past1.toLocaleDateString("zh-TW") + " 10:00",
          detail: "結婚：婚姻狀態更新，提供家庭保險與房貸試算。",
          status: "已發生",
        },
        {
          channel: "人生大事",
          time: past2.toLocaleDateString("zh-TW") + " 09:30",
          detail: "購屋：購屋完成，提供房貸與保費整合建議。",
          status: "已發生",
        },
      ];
    }
    // C196 林怡君 — 固定顯示生子事件（寶寶 6 個月前）及定存即將到期
    if (customer && customer.id === "C196") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const twoMonthsLater = new Date();
      twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
      return [
        {
          channel: "人生大事",
          time: sixMonthsAgo.toLocaleString(),
          detail: "生子：新生兒相關教育基金與保險建議。",
          status: "已發生",
        },
        {
          channel: "定存到期",
          time: twoMonthsLater.toLocaleString(),
          detail: "您的定存即將到期，建議評估續存/轉存與利率方案。",
          status: "提醒",
        },
      ];
    }
    const seed = seedFromId(customer) + 1357;
    const events = [];
    const now = new Date();
    // Upcoming reminder — varied by seed (not always deposit maturity)
    const reminderType = seed % 5; // 0,1 → 定存到期; 2 → 保單續繳; 3 → 信用卡年費; 4 → 無提醒
    if (reminderType < 2) {
      const d1 = new Date(now.getFullYear(), now.getMonth() + ((seed % 3) + 1), (seed % 28) + 1);
      events.push({ channel: "定存到期", time: d1.toLocaleString(), detail: "您的定存即將到期，建議評估續存/轉存與利率方案。", status: "提醒" });
    } else if (reminderType === 2) {
      const d2 = new Date(now.getFullYear(), now.getMonth() + ((seed % 2) + 1), (seed % 20) + 1);
      events.push({ channel: "保單續繳", time: d2.toLocaleString(), detail: "壽險/醫療險保費即將到期，請確認繳費方式與保障內容是否需調整。", status: "提醒" });
    } else if (reminderType === 3) {
      const d3 = new Date(now.getFullYear(), now.getMonth() + 1, (seed % 25) + 1);
      events.push({ channel: "信用卡年費", time: d3.toLocaleString(), detail: "信用卡年費即將扣款，建議評估是否刷卡達標免年費或升級方案。", status: "提醒" });
    }
    // else reminderType === 4 → no upcoming reminder for this customer
    // Life events candidates
    const candidates = [
      {
        channel: "人生大事",
        label: "結婚",
        note: "婚姻狀態更新，提供家庭保險與房貸試算。",
      },
      {
        channel: "人生大事",
        label: "生子",
        note: "新生兒相關教育基金與保險建議。",
      },
      {
        channel: "人生大事",
        label: "購屋",
        note: "購屋完成，提供房貸與保費整合建議。",
      },
    ];
    for (let i = 0; i < n - 1; i++) {
      const c = candidates[(seed + i) % candidates.length];
      const past = new Date(
        now.getFullYear() - (1 + ((seed >> (i + 1)) % 2)),
        (seed >> (i + 2)) % 12,
        ((seed >> (i + 3)) % 28) + 1
      );
      events.push({
        channel: c.channel,
        time: past.toLocaleString(),
        detail: `${c.label}：${c.note}`,
        status: "已發生",
      });
    }
    return events;
  };

  // Ensure percentage arrays have no zeros and each slice >= minPct, integer-balanced to sum 100
  const normalizePercents = (rawArr = [], minPct = 6) => {
    const n = rawArr.length;
    if (n === 0) return [];
    // start with rounded values
    let vals = rawArr.map((v) => Math.round(Number(v) || 0));
    // enforce minimum
    vals = vals.map((v) => Math.max(minPct, v));
    // balance to 100 by decrementing/incrementing non-min items
    let sum = vals.reduce((s, x) => s + x, 0);
    // if sum > 100, reduce largest items greater than minPct first
    while (sum > 100) {
      let idx = vals.reduce((iMax, v, i, arr) => (v > arr[iMax] ? i : iMax), 0);
      if (vals[idx] > minPct) {
        vals[idx]--;
        sum--;
      } else break;
      // safety
      if (sum <= 100) break;
    }
    while (sum < 100) {
      // increment the largest item
      let idx = vals.reduce(
        (iMax, v, i, arr) => (v >= arr[iMax] ? i : iMax),
        0
      );
      vals[idx]++;
      sum++;
      if (sum >= 100) break;
    }
    return vals;
  };

  // Aggregate any time-series (months) into 4 quarters by averaging groups
  const aggregateToQuarters = (values = [], quarterCount = 4) => {
    if (!values || values.length === 0) return [];
    const len = values.length;
    const per = Math.floor(len / quarterCount) || 1;
    const out = [];
    for (let q = 0; q < quarterCount; q++) {
      const start = q * per;
      const slice = values.slice(start, start + per);
      if (slice.length === 0) out.push(0);
      else
        out.push(Math.round(slice.reduce((s, v) => s + v, 0) / slice.length));
    }
    return out;
  };

  // derive simple income sources (salary / investment / other) for marketing insights
  const generateIncomeSources = (customer) => {
    const f = getCustomerFinance(customer);
    const base = f.monthlyIncome || 20000;
    // deterministic split via seed
    const seed = seedFromId(customer) + 1234;
    const salaryPct = 60 + (seed % 20); // 60-79%
    const investPct = 10 + ((seed >> 3) % 20); // 10-29%
    const otherPct = Math.max(0, 100 - salaryPct - investPct);
    return [
      {
        name: "薪資/工作",
        amount: Math.round(base * (salaryPct / 100)),
        pct: salaryPct,
      },
      {
        name: "投資收益",
        amount: Math.round(base * (investPct / 100)),
        pct: investPct,
      },
      {
        name: "其他",
        amount: Math.round(base * (otherPct / 100)),
        pct: otherPct,
      },
    ];
  };

  // tiny inline sparkline renderer (simple polyline SVG)
  // Smoothed sparkline with optional month labels and value display
  const renderSparkline = (
    values = [],
    {
      width = 300,
      height = 56,
      stroke = "#2563eb",
      id = null,
      labels = null,
    } = {}
  ) => {
    if (!values || values.length === 0)
      return <div className="text-xs text-gray-500">無趨勢資料</div>;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const len = values.length;
    // horizontal padding to prevent endpoint clipping
    const PAD_X = 6;
    const innerW = width - PAD_X * 2;
    const points = values.map((v, i) => {
      const x = PAD_X + (i / Math.max(1, len - 1)) * innerW;
      const y =
        height - ((v - min) / Math.max(1, max - min || 1)) * (height - 10) - 5;
      return { x, y, v };
    });

    // build smooth cubic bezier path using simple smoothing (Catmull-Rom to Bezier approx)
    const toBezier = (pts) => {
      if (pts.length === 0) return "";
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(
          2
        )} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      }
      return d;
    };

    const pathD = toBezier(points);
    // close area using first/last x instead of full width to keep padding
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${
      points[0].x
    } ${height} Z`;
    const last = points[points.length - 1];
    const gradId =
      id ||
      `spark_grad_${Math.abs(
        (stroke + width + height)
          .split("")
          .reduce((s, c) => s + c.charCodeAt(0), 0)
      )}`;

    // default labels: last N months
    const monthLabels =
      labels ||
      (() => {
        const res = [];
        const now = new Date();
        for (let i = len - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          res.push(d.toLocaleString(undefined, { month: "short" }));
        }
        return res;
      })();

    return (
      <div>
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          height={height}
          className="block"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradId})`} />
          <path
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={last.x} cy={last.y} r="3" fill={stroke} />
        </svg>
        <div className="flex justify-between items-start text-xs mt-1 text-gray-600">
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="text-center"
              style={{ width: `${100 / Math.max(1, monthLabels.length)}%` }}
            >
              <div className="text-sm font-medium text-gray-800">
                {values[i].toLocaleString()}
              </div>
              <div className="text-gray-500">{m}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // Hover-only sparkline (no direct numeric labels; tooltip on hover)
  const SparklineHover = ({
    values = [],
    stroke = "#0d9488",
    height = 64,
    labels = [],
  }) => {
    const containerRef = React.useRef(null);
    const [w, setW] = React.useState(300);
    const [hoverIdx, setHoverIdx] = React.useState(null);
    const [interp, setInterp] = React.useState(null); // {x,y,value,label}
    const displayValueRef = React.useRef(null);
    const animRef = React.useRef(null);
    React.useEffect(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const ro = new ResizeObserver((e) => {
        for (const r of e) {
          const nw = Math.max(260, Math.round(r.contentRect.width));
          if (nw !== w) setW(nw);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [w]);
    if (!values || !values.length)
      return <div className="text-xs text-gray-500">無趨勢資料</div>;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const PAD_X = 6;
    const innerW = w - PAD_X * 2;
    const pts = values.map((v, i) => {
      const x = PAD_X + (i / Math.max(1, values.length - 1)) * innerW;
      const y =
        height - ((v - min) / Math.max(1, max - min)) * (height - 10) - 5;
      return { x, y, v };
    });
    const toBezier = (pts) => {
      if (pts.length === 0) return "";
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      return d;
    };
    const pathD = toBezier(pts);
    const handleMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const xRaw = e.clientX - rect.left;
      const x = Math.min(Math.max(xRaw, PAD_X), PAD_X + innerW);
      const ratio = (x - PAD_X) / Math.max(1, innerW);
      const idxFloat = ratio * (values.length - 1);
      const i0 = Math.floor(idxFloat);
      const i1 = Math.min(values.length - 1, i0 + 1);
      const t = idxFloat - i0;
      // linear interpolation for value
      const v = values[i0] + (values[i1] - values[i0]) * t;
      // y interpolation
      const y0 = pts[i0].y;
      const y1 = pts[i1].y;
      const y = y0 + (y1 - y0) * t;
      const label0 = labels[i0] || `${i0 + 1}月`;
      const label1 = labels[i1] || `${i1 + 1}月`;
      const interpLabel = t < 0.5 ? label0 : label1;
      setHoverIdx(i0); // keep nearest anchor for circle fade behavior
      setInterp({ x, y, value: v, label: interpLabel });
      // animate displayed value toward v
      const startVal =
        displayValueRef.current == null ? v : displayValueRef.current;
      const targetVal = v;
      const duration = 90; // ms
      const startTime = performance.now();
      cancelAnimationFrame(animRef.current);
      const step = (now) => {
        const prog = Math.min(1, (now - startTime) / duration);
        const eased = prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog; // easeInOutQuad
        const cur = startVal + (targetVal - startVal) * eased;
        displayValueRef.current = cur;
        if (prog < 1) animRef.current = requestAnimationFrame(step);
        else animRef.current = null;
        // force rerender by setting state reference (small hack):
        if (interp)
          setInterp((prev) => (prev ? { ...prev, value: cur } : prev));
      };
      animRef.current = requestAnimationFrame(step);
    };
    const handleLeave = () => {
      setHoverIdx(null);
      setInterp(null);
    };
    return (
      <div ref={containerRef} className="w-full">
        <div className="relative">
          <svg
            width="100%"
            viewBox={`0 0 ${w} ${height}`}
            height={height}
            className="block"
            preserveAspectRatio="none"
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
          >
            <defs>
              <linearGradient id="spark_grad_hover" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L ${pts[pts.length - 1].x} ${height} L ${
                pts[0].x
              } ${height} Z`}
              fill="url(#spark_grad_hover)"
            />
            <path
              d={pathD}
              fill="none"
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {interp && (
              <>
                <line
                  x1={interp.x}
                  y1={0}
                  x2={interp.x}
                  y2={height}
                  stroke={stroke}
                  strokeDasharray="3 3"
                />
                <circle cx={interp.x} cy={interp.y} r="5" fill={stroke} />
              </>
            )}
          </svg>
          {interp && (
            <div
              className="absolute z-10 px-2 py-1 bg-white border rounded shadow text-xs"
              style={{
                left: Math.min(Math.max(interp.x - 40, 0), w - 80),
                top: 4,
              }}
            >
              <div className="font-medium text-teal-700">
                {Math.round(interp.value).toLocaleString()}
              </div>
              <div className="text-gray-500">{interp.label}</div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-start text-xs mt-1 text-gray-600">
          {(labels && labels.length
            ? labels
            : values.map((_, i) => `${i + 1}月`)
          ).map((m, i) => (
            <div
              key={i}
              className="text-center"
              style={{ width: `${100 / Math.max(1, values.length)}%` }}
            >
              <div className="text-gray-500">{m}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // Responsive wrapper around renderSparkline that auto-fits parent width
  const SparklineResponsive = ({ values, options }) => {
    const containerRef = React.useRef(null);
    const [w, setW] = React.useState(300);
    React.useEffect(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const ro = new ResizeObserver((entries) => {
        for (const e of entries) {
          const newW = Math.max(260, Math.round(e.contentRect.width));
          if (newW !== w) setW(newW);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [w]);
    return (
      <div ref={containerRef} className="w-full">
        {renderSparkline(values, { ...(options || {}), width: w })}
      </div>
    );
  };
  // Monthly bar chart with stable hover zones
  const MonthlyBarHover = ({
    values = [],
    labels = [],
    height = 64,
    color = "#0d9488",
  }) => {
    const ref = React.useRef(null);
    const [w, setW] = React.useState(320);
    const [hover, setHover] = React.useState(null);
    // Animation: track a 0→1 progress that grows bars from the bottom
    const [animPct, setAnimPct] = React.useState(0);
    const animRef = React.useRef(null);
    const startAnim = React.useCallback(() => {
      setAnimPct(0);
      const start = performance.now();
      const dur = 700; // ms
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setAnimPct(eased);
        if (t < 1) animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    }, []);
    React.useEffect(() => {
      startAnim();
      return () => cancelAnimationFrame(animRef.current);
    }, [values.join(","), startAnim]);
    React.useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;
      const ro = new ResizeObserver((e) => {
        for (const r of e) {
          const nw = Math.max(260, Math.round(r.contentRect.width));
          if (nw !== w) setW(nw);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [w]);
    if (!values.length)
      return <div className="text-xs text-gray-500">無資料</div>;
    const max = Math.max(...values);
    const PAD_X = 8;
    const PAD_Y = 6;
    const innerW = w - PAD_X * 2;
    const innerH = height - PAD_Y * 2;
    const segW = innerW / values.length;
    const barW = Math.max(4, segW * 0.55);
    const baseY = height - PAD_Y;
    const bars = values.map((v, i) => {
      const fullH = (v / Math.max(1, max)) * (innerH - 4);
      const h = fullH * animPct;
      const x = PAD_X + i * segW + (segW - barW) / 2;
      const y = baseY - h;
      return { x, y, h, v, i };
    });
    return (
      <div ref={ref} className="w-full relative">
        <svg
          width="100%"
          viewBox={`0 0 ${w} ${height}`}
          height={height}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`barGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.45" />
            </linearGradient>
          </defs>
          {bars.map((b) => (
            <rect
              key={b.i}
              x={b.x}
              y={b.y}
              width={barW}
              height={Math.max(0, b.h)}
              rx={3}
              fill={hover === b.i ? color : `url(#barGrad-${color.replace('#','')})`}
              fillOpacity={hover === b.i ? 1 : 0.85}
            />
          ))}
          {bars.map((b) => (
            <rect
              key={"hz" + b.i}
              x={PAD_X + b.i * segW}
              y={0}
              width={segW}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(b.i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        {hover != null && (
          <div
            className="absolute z-10 px-2 py-1 bg-white border border-teal-100 rounded-lg shadow-md text-xs pointer-events-none"
            style={{
              left: Math.min(
                Math.max(bars[hover].x + barW / 2 - 40, 4),
                w - 84
              ),
              top: 2,
            }}
          >
            <div className="font-bold text-teal-700">
              {values[hover].toLocaleString()}
            </div>
            <div className="text-gray-400">
              {labels[hover] || `${hover + 1}月`}
            </div>
          </div>
        )}
        <div className="flex justify-between items-start text-xs mt-1">
          {(labels.length ? labels : values.map((_, i) => `${i + 1}月`)).map(
            (m, i) => (
              <div
                key={i}
                className="text-center"
                style={{ width: `${100 / values.length}%` }}
              >
                <div className="text-gray-400 text-[10px]">{m}</div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };
  // Interactive donut component (hover tooltip) used for product share & tier distribution
  const DonutInteractive = ({
    data = [],
    colors = [],
    size = 96,
    innerRatio = 0.55,
  }) => {
    const [hoverIdx, setHoverIdx] = React.useState(null);
    // Animation: 0→1 sweeps all segments from nothing to full size
    const [animPct, setAnimPct] = React.useState(0);
    const animRef = React.useRef(null);
    const startAnim = React.useCallback(() => {
      setAnimPct(0);
      const start = performance.now();
      const dur = 650;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setAnimPct(eased);
        if (t < 1) animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    }, []);
    React.useEffect(() => {
      startAnim();
      return () => cancelAnimationFrame(animRef.current);
    }, [data.map((d) => d.value).join(","), startAnim]);

    if (!data.length)
      return <div className="text-xs text-gray-500">無資料</div>;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const cx = 21;
    const cy = 21;
    const outerR = 15.9155;
    const innerR = outerR * innerRatio;
    // Build segments with animated angular span
    let acc = 0;
    const segments = data.map((d, i) => {
      const pct = d.value / total;
      const start = acc;
      const end = acc + pct;
      acc = end;
      return { ...d, pctFrac: pct, startFrac: start, endFrac: end, i };
    });
    const describeSeg = (startFrac, endFrac) => {
      // Scale the end angle toward start by animPct (grows from 0 to full)
      const animatedEnd = startFrac + (endFrac - startFrac) * animPct;
      if (Math.abs(animatedEnd - startFrac) < 0.0001) return "";
      const startAngle = startFrac * Math.PI * 2 - Math.PI / 2;
      const endAngle = animatedEnd * Math.PI * 2 - Math.PI / 2;
      const x0 = cx + outerR * Math.cos(startAngle);
      const y0 = cy + outerR * Math.sin(startAngle);
      const x1 = cx + outerR * Math.cos(endAngle);
      const y1 = cy + outerR * Math.sin(endAngle);
      const x2 = cx + innerR * Math.cos(endAngle);
      const y2 = cy + innerR * Math.sin(endAngle);
      const x3 = cx + innerR * Math.cos(startAngle);
      const y3 = cy + innerR * Math.sin(startAngle);
      const largeArcOuter = endAngle - startAngle > Math.PI ? 1 : 0;
      const largeArcInner = largeArcOuter;
      return `M ${x0} ${y0} A ${outerR} ${outerR} 0 ${largeArcOuter} 1 ${x1} ${y1} L ${x2} ${y2} A ${innerR} ${innerR} 0 ${largeArcInner} 0 ${x3} ${y3} Z`;
    };
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 42 42">
          {segments.map((s, i) => {
            const d = describeSeg(s.startFrac, s.endFrac);
            if (!d) return null;
            const color = colors[i % colors.length];
            return (
              <path
                key={s.label + i}
                d={d}
                fill={color}
                style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                opacity={hoverIdx != null && hoverIdx !== i ? 0.55 : 1}
              />
            );
          })}
        </svg>
        {hoverIdx != null && (
          <div className="absolute left-1 top-1 px-2 py-1 bg-white border border-teal-100 rounded-lg shadow-md text-xs pointer-events-none">
            <div className="font-bold text-teal-700">
              {segments[hoverIdx].label}
            </div>
            <div className="text-gray-400">
              {Math.round(segments[hoverIdx].pctFrac * 100)}%
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSearchModule = () => (
    <div className="space-y-3">
      <div className={CARD}>
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
          <Search className="w-5 h-5" />
          查詢客戶
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              選取檢索鍵值種類
            </label>
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="name">客戶姓名</option>
                <option value="idCard">證件號碼</option>
                <option value="creditCard">信用卡號</option>
                <option value="accountNumber">存款帳號</option>
              </select>

              <input
                type="text"
                placeholder={searchType === 'name' ? '輸入姓名 (支援模糊搜尋)' : '輸入選擇的識別號 (精準比對)'}
                className="flex-1 px-3 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                搜尋
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {searchType === 'name' ? '輸入客戶姓名進行查詢（支援部分字符匹配）' : '請選擇一種識別號並輸入完整號碼以查得客戶。'}
            </p>
          </div>
        </div>
      </div>

      <div className={CARD}>
        <h3 className="text-sm font-medium mb-2">搜尋結果</h3>
        <div className="space-y-1">
          {searchPerformed && searchResults && searchResults.length === 0 && (
            <div className="p-2 text-sm text-red-600">
              找不到符合的客戶，請確認識別號與類型是否正確。
            </div>
          )}

          {/* 若尚未查詢，顯示最近往來客戶前 10 筆（按最新互動日期排序） */}
          {!searchPerformed && (() => {
            const withRecent = mockCustomers.map((c) => {
              const interactions = generateCustomerInteractions(c, 3, 6);
              const latest = interactions.reduce((best, it) => {
                const t = new Date(it.time).getTime();
                return t > best ? t : best;
              }, 0);
              return { c, latest };
            });
            withRecent.sort((a, b) => b.latest - a.latest);
            const top10 = withRecent.slice(0, 10).map((x) => x.c);
            return (
              <div className="p-2 text-sm text-gray-600 font-medium">
                最近往來客戶（前 10 筆，點選以查看明細）
              </div>
            );
          })()}

          {uniqueById(
            searchPerformed
              ? (searchResults || [])
              : (() => {
                  const withRecent = mockCustomers.map((c) => {
                    const interactions = generateCustomerInteractions(c, 3, 6);
                    const latest = interactions.reduce((best, it) => {
                      const t = new Date(it.time).getTime();
                      return t > best ? t : best;
                    }, 0);
                    return { c, latest };
                  });
                  withRecent.sort((a, b) => b.latest - a.latest);
                  return withRecent.slice(0, 10).map((x) => x.c);
                })()
          ).map((customer) => (
            <div
              key={customer.id}
              onClick={() => {
                console.log("[CUS360Demo] sample/search click", customer);
                setSelectedCustomer(customer);
                setActiveModule("detail");
                setActiveTab("basic");
              }}
              className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-sm flex items-center gap-2">
                  <span>{customer.name}</span>
                </div>
                <div className="text-xs text-gray-600">
                  編號: {customer.id} | {customer.age}歲 |{" "}
                  {showMaskedData
                    ? maskPhone(customer.phone)
                    : customer.phone || ""}
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getTierBgClass(
                    customer.vipLevel
                  )}`}
                >
                  {getTierDisplayLabel(customer.vipLevel)}
                </span>
                {(() => {
                  const acct = customer.accountStatus;
                  const acctLabel =
                    acct === "active"
                      ? "有效戶"
                      : acct === "inactive"
                      ? "久未往來戶"
                      : acct === "closed"
                      ? "結清或失效戶"
                      : acct;
                  const lvl = customer.riskLevel;
                  const label =
                    lvl === "low"
                      ? "低風險"
                      : lvl === "medium"
                      ? "中風險"
                      : lvl === "high"
                      ? "高風險"
                      : lvl;
                  const riskCls =
                    lvl === "low"
                      ? "bg-green-100 text-green-800"
                      : lvl === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : lvl === "high"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700";
                  return (
                    <>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {acctLabel}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${riskCls}`}
                      >
                        {label}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFilterModule = () => {
    const displayedList =
      filterResults === null ? mockCustomers : filterResults;
    const noResults =
      Array.isArray(filterResults) && filterResults.length === 0;
    return (
      <div className={CARD}>
        <h2 className="text-md font-semibold mb-2 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          名單篩選模組
        </h2>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">VIP等級</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={filters.vipLevel}
                onChange={(e) =>
                  setFilters({ ...filters, vipLevel: e.target.value })
                }
              >
                <option value="">全部</option>
                {getTiersList()
                  .sort((a, b) => b.order - a.order)
                  .map((tier) => (
                    <option key={tier.key} value={tier.key.toLowerCase()}>
                      {tier.displayLabel}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">授信風險等級</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={filters.riskLevel}
                onChange={(e) =>
                  setFilters({ ...filters, riskLevel: e.target.value })
                }
              >
                <option value="">全部</option>
                <option value="low">低風險</option>
                <option value="medium">中風險</option>
                <option value="high">高風險</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">帳戶狀態</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={filters.accountStatus}
                onChange={(e) =>
                  setFilters({ ...filters, accountStatus: e.target.value })
                }
              >
                <option value="">全部</option>
                <option value="active">有效戶</option>
                <option value="inactive">久未往來戶</option>
                <option value="closed">結清或失效戶</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">身分類型</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={filters.idType}
                onChange={(e) =>
                  setFilters({ ...filters, idType: e.target.value })
                }
              >
                <option value="">全部</option>
                <option value="本國人">本國人</option>
                <option value="外國人">外國人</option>
              </select>
            </div>
          </div>
          {/* Grouped Tag conditions editor */}
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium mb-2">標籤條件群組 (支援多組 AND/OR/NOT，例如: (標籤一 AND 標籤二) OR (標籤一 OR 標籤二))</label>
            <div className="space-y-3">
              {tagGroups.map((group, gIdx) => (
                <div key={gIdx} className="p-2 border rounded-lg bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">群組連接</span>
                    <select value={group.join} onChange={(e)=>{
                      const arr = [...tagGroups]; arr[gIdx].join = e.target.value; setTagGroups(arr);
                    }} className="px-2 py-1 border rounded-lg">
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                      <option value="NOT">NOT</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                      <button onClick={()=> removeTagGroup(gIdx)} className="px-3 py-1.5 bg-red-500 text-white rounded-md">移除群組</button>
                      <button onClick={addTagGroup} className="px-3 py-1.5 bg-teal-600 text-white rounded-md">新增群組</button>
                    </div>
                  </div>
                  {group.conditions.map((cond, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2">
                      <select value={cond.op} onChange={(e)=> updateTagCondition(gIdx, cIdx, { op: e.target.value })} className="px-2 py-1 border rounded-lg">
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                        <option value="NOT">NOT</option>
                      </select>
                      <select value={cond.category || ''} onChange={(e)=> updateTagCondition(gIdx, cIdx, { category: e.target.value, tag: '' })} className="px-2 py-1 border rounded-lg">
                        <option value="">(選擇類別)</option>
                        {[...Object.keys(TAG_CATEGORIES), '意圖標籤'].map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                      <select value={cond.tag || ''} onChange={(e)=> updateTagCondition(gIdx, cIdx, { tag: e.target.value })} className="flex-1 px-3 py-1 border rounded-lg" disabled={!cond.category}>
                        <option value="">(選擇標籤)</option>
                        {(cond.category ? (cond.category==='意圖標籤' ? INTENT_TAGS : TAG_CATEGORIES[cond.category]) : []).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button onClick={()=> removeTagCondition(gIdx, cIdx)} className="px-3 py-1 bg-red-500 text-white rounded-lg">移除</button>
                    </div>
                  ))}
                  <div>
                    <button onClick={()=> addTagCondition(gIdx)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md">新增條件</button>
                  </div>
                </div>
              ))}
              {tagGroups.length === 0 && (
                <div className="p-3 border border-dashed rounded-lg bg-white flex items-center justify-between text-sm text-gray-600">
                  <div>目前沒有群組，點選「新增群組」開始設定條件。</div>
                  <button onClick={addTagGroup} className="px-3 py-1.5 bg-teal-600 text-white rounded-md">新增群組</button>
                </div>
              )}
              
              {/* Read-only compact summary preview */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="text-xs font-semibold text-teal-700 mb-1 tracking-wide">目前的篩選條件總覽</div>
                <div className="text-sm font-mono text-teal-900 break-words leading-relaxed">
                  {summarizeTagGroups(tagGroups) || '(未設定條件)'}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                // apply filters to mockCustomers including tag conditions
                const results = mockCustomers.filter((c) => {
                  if (filters.vipLevel && filters.vipLevel !== "all") {
                    if (filters.vipLevel === "vvip" && c.vipLevel !== "VVIP")
                      return false;
                    if (filters.vipLevel === "vip" && c.vipLevel !== "VIP")
                      return false;
                    if (
                      filters.vipLevel === "normal" &&
                      c.vipLevel !== "normal"
                    )
                      return false;
                  }
                  if (filters.riskLevel && filters.riskLevel !== "") {
                    if (filters.riskLevel === "low" && c.riskLevel !== "low")
                      return false;
                    if (
                      filters.riskLevel === "medium" &&
                      c.riskLevel !== "medium"
                    )
                      return false;
                    if (filters.riskLevel === "high" && c.riskLevel !== "high")
                      return false;
                  }
                  if (filters.accountStatus && filters.accountStatus !== "") {
                    if (
                      filters.accountStatus === "active" &&
                      c.accountStatus !== "active"
                    )
                      return false;
                    else if (
                      filters.accountStatus === "inactive" &&
                      c.accountStatus !== "inactive"
                    )
                      return false;
                    else if (
                      filters.accountStatus === "closed" &&
                      c.accountStatus !== "closed"
                    )
                      return false;
                  }
                  if (filters.idType && filters.idType !== "") {
                    const nat = (c.nationality || "").trim();
                    const personType = nat === "中華民國" ? "本國人" : (nat ? "外國人" : "");
                    if (personType !== filters.idType) return false;
                  }

                  // evaluate grouped tag conditions
                  if (tagGroups && tagGroups.length > 0) {
                    if (!evaluateTagConditions(c)) return false;
                  }

                  return true;
                });
                setFilterResults(results);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              套用篩選
            </button>
            <button
              onClick={() => {
                // reset all filter-related states to pristine initial view
                setFilters({
                  vipLevel: "",
                  riskLevel: "",
                  accountStatus: "",
                  idType: "",
                });
                setTagGroups([{ join: 'AND', conditions: [] }]);
                setFilterResults(null); // show all customers count
                setSelectedCustomer(null); // deselect any detail selection
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              清除條件
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              匯出名單
            </button>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              篩選結果: 共{" "}
              {filterResults === null
                ? mockCustomers.length
                : filterResults.length}{" "}
              位客戶符合條件
            </p>
          </div>

          {/* Filtered list */}
          <div className="mt-3 space-y-2">
            {noResults ? (
              <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                找不到符合條件的客戶。請調整篩選條件或點選下方的「顯示所有客戶」按鈕。
                <div className="mt-2">
                  <button
                    onClick={() => setFilterResults(null)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                  >
                    顯示所有客戶
                  </button>
                </div>
              </div>
            ) : (
              displayedList.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => {
                    console.log("[CUS360Demo] filtered list click", customer);
                    setSelectedCustomer(customer);
                    setActiveModule("detail");
                    setActiveTab("basic");
                  }}
                  className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-600">
                      編號: {customer.id} | {customer.age}歲 |{" "}
                      {showMaskedData
                        ? maskPhone(customer.phone)
                        : customer.phone || ""}
                    </div>
                    {/* Removed account status badge here; moved to right side with risk */}
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        customer.vipLevel === "VVIP"
                          ? "bg-purple-100 text-purple-800"
                          : customer.vipLevel === "VIP"
                          ? "bg-blue-100 text-blue-800"
                          : customer.vipLevel === "VVVIP"
                          ? "bg-fuchsia-100 text-fuchsia-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {customer.vipLevel === "normal"
                        ? "一般"
                        : customer.vipLevel}
                    </span>
                    {(() => {
                      const acct = customer.accountStatus;
                      const acctLabel =
                        acct === "active"
                          ? "有效戶"
                          : acct === "inactive"
                          ? "久未往來戶"
                          : acct === "closed"
                          ? "結清或失效戶"
                          : acct;
                      const lvl = customer.riskLevel;
                      const label =
                        lvl === "low"
                          ? "低風險"
                          : lvl === "medium"
                          ? "中風險"
                          : lvl === "high"
                          ? "高風險"
                          : lvl;
                      const riskCls =
                        lvl === "low"
                          ? "bg-green-100 text-green-800"
                          : lvl === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : lvl === "high"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-700";
                      return (
                        <>
                          <span className="px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                            {acctLabel}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${riskCls}`}
                          >
                            {label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // 旧版儀表板已移除，使用上方新版 `renderDashboardModule`。

  const renderPermissionModule = () => (
    <div className={CARD}>
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        權限管理模組
      </h2>
      <div className="space-y-4">
        <div>
          {/* Debug banner for diagnosing blank-panel issues (remove in prod) */}
          <div className="mb-2 p-2 text-xs bg-yellow-50 border border-yellow-100 rounded text-gray-800">
            除錯: 模組={activeModule} | 選取客戶=
            {selectedCustomer
              ? selectedCustomer.id + " / " + selectedCustomer.name
              : "null"}
          </div>
          <h3 className="font-semibold text-gray-800 mb-3">您的權限</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>當前角色: 客戶經理</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                已授權
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>資料管轄: 信義分行</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                區域限制
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            資料遮罩模組
            {currentRole === "specialist" ? (
              <button
                disabled
                className="ml-auto px-3 py-1 bg-gray-400 text-white rounded-lg text-sm flex items-center gap-2 cursor-not-allowed opacity-70"
              >
                <EyeOff className="w-4 h-4" />
                隱藏敏感資料（鎖定）
              </button>
            ) : (
              <button
                onClick={() => setShowMaskedData(!showMaskedData)}
                className="ml-auto px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                {showMaskedData ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                {showMaskedData ? "顯示完整資料" : "隱藏敏感資料"}
              </button>
            )}
          </h3>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              敏感資料遮罩功能已{showMaskedData ? "啟用" : "停用"}
              <br />
              受保護欄位: 身分證字號、地址、電話、電子信箱等個人隱私資料
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3">查詢歷程稽核</h3>
          {queryHistory.length === 0 ? (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">本次登入尚未查詢任何客戶。</div>
          ) : (
            <div className="space-y-2">
              {queryHistory.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-500 whitespace-nowrap">{entry.timestamp}</span>
                  <span className="text-gray-700">查詢客戶 <span className="font-medium">{entry.name}</span>（{entry.customerId}）</span>
                  <span className="ml-auto text-blue-600 whitespace-nowrap">{currentRole === "specialist" ? "楊專員" : "林經理"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFinancialCharts = () => {
    // Reorganized: separate NetWorth/Liabilities, Income Sources+3mo trend, and Asset Allocation
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            總資產 / 總負債
          </h4>
          {selectedCustomer ? (
            (() => {
              const f = getCustomerFinance(selectedCustomer);
              return (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">總資產</div>
                  <div className="text-2xl font-bold text-teal-600">
                    NT$ {f.netWorth.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">總負債</div>
                  <div className="text-2xl font-bold text-teal-500">
                    NT$ {f.loan.toLocaleString()}
                  </div>
                  {/* 移除貸款估算值顯示 */}
                </div>
              );
            })()
          ) : (
            <div className="text-sm text-gray-500">
              請選取客戶以顯示資產與負債數值。
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow col-span-1">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            收入來源 & 近期收入趨勢
          </h4>
          {selectedCustomer ? (
            (() => {
              const series = generateMonthlySeries(selectedCustomer, 6);
              const lastMonthAvg = series.length
                ? series[series.length - 1]
                : 0;
              const incomeSources = generateIncomeSources(selectedCustomer);
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">
                        最近 3 個月平均收入
                      </div>
                      <div className="text-2xl font-bold text-teal-600">
                        NT$ {lastMonthAvg.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">最近走勢 (月)</div>
                  </div>
                  <div>
                    <MonthlyBarHover
                      values={series}
                      labels={series.map((_, i) => `${i + 1}月`)}
                      height={64}
                      color="#0ea5a4"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {incomeSources.map((s, i) => (
                      <div
                        key={i}
                        className="p-2 bg-gray-50 rounded border text-sm"
                      >
                        <div className="text-xs text-gray-600">{s.name}</div>
                        <div className="font-medium">
                          NT$ {s.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{s.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-sm text-gray-500">
              請選取客戶以顯示收入來源與趨勢。
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">資產配置</h4>
          <div className="rounded-lg p-3 bg-gray-50 flex items-center gap-4">
            {selectedCustomer ? (
              (() => {
                const f = getCustomerFinance(selectedCustomer);
                // Deposit mix (some may be zero)
                const seed = seedFromId(selectedCustomer) + 2025;
                const baseDep = Math.max(0, f.liquid || 0);
                const fxRatio = (seed % 30) / 100;
                const twRatio = ((seed >> 3) % 40) / 100;
                const fxTime = Math.round(baseDep * fxRatio);
                const twTime = Math.round(baseDep * twRatio);
                const demand = Math.max(0, baseDep - fxTime - twTime);
                // Other asset classes
                const investAmt = Math.max(0, f.invest || 0);
                const loanAmt = Math.max(0, f.loan || 0);
                const otherAmt = Math.max(0, f.other || 0);
                const itemsAll = [
                  { label: "外幣定存", value: fxTime, color: "#14b8a6" },
                  { label: "台幣定存", value: twTime, color: "#06b6d4" },
                  { label: "台幣活存", value: demand, color: "#0ea5a4" },
                  { label: "投資資產", value: investAmt, color: "#34d399" },
                  { label: "貸款餘額", value: loanAmt, color: "#7dd3fc" },
                  { label: "其他", value: otherAmt, color: "#0f766e" },
                ].filter((it) => it.value > 0);
                const total = itemsAll.reduce((s, x) => s + x.value, 0) || 1;
                const data = itemsAll.map((it) => ({
                  label: it.label,
                  value: Math.max(1, Math.round((it.value / total) * 100)),
                }));
                // rebalance to 100 exactly
                let sum = data.reduce((s, x) => s + x.value, 0);
                for (let i = 0; sum > 100 && i < data.length; i++) {
                  if (data[i].value > 1) {
                    data[i].value--;
                    sum--;
                    i = -1;
                  }
                }
                for (let i = 0; sum < 100 && i < data.length; i++) {
                  data[i].value++;
                  sum++;
                }
                const colors = itemsAll.map((it) => it.color);
                return (
                  <div className="flex items-center gap-4 w-full">
                    <DonutInteractive data={data} colors={colors} size={96} />
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {itemsAll.map((it, i) => (
                          <div
                            key={it.label}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="w-3 h-3 rounded-sm"
                              style={{ background: colors[i] }}
                            ></span>
                            <div>
                              <div className="font-medium">{it.label}</div>
                              <div className="text-xs text-gray-600">
                                NT$ {it.value.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-gray-500">
                請選取客戶以顯示資產配置；或在搜尋欄輸入完整識別號以檢視明細。
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRelationships = () => {
    if (!selectedCustomer) return null;
    const c = selectedCustomer;
    const seed = seedFromId(c);
    // --- Spouse card ---
    const spouseCard = (() => {
      if (c.maritalStatus !== "已婚") return null;
      // Fallback: generate plausible opposite-gender spouse name for married customers without explicit spouseInfo
      const maleGivenNames = ["建宏", "志明", "俊傑", "哲宇", "承翰", "志遠", "嘉豪", "文彥"];
      const femaleGivenNames = ["雅惠", "佳芬", "美玲", "思婷", "怡婷", "淑華", "玫瑰", "素華"];
      const maleSurnames = ["陳", "林", "黃", "吳", "張", "李", "劉", "楊"];
      const femaleSurnames = ["陳", "林", "黃", "吳", "張", "李", "劉", "王"];
      const fallbackSpouseInfo = c.gender === "female"
        ? { name: `${maleSurnames[seed % 8]}${maleGivenNames[seed % 8]}`, customerId: null }
        : { name: `${femaleSurnames[(seed >> 3) % 8]}${femaleGivenNames[(seed >> 3) % 8]}`, customerId: null };
      const effectiveSpouseInfo = c.spouseInfo || fallbackSpouseInfo;
      const { name: spouseName, customerId: spouseCid } = effectiveSpouseInfo;
      const spouseCustomer = spouseCid ? mockCustomers.find((m) => m.id === spouseCid) : null;
      const isBankCustomer = !!spouseCid;
      const marriageYear = 2010 + (seed % 12);
      const marriageDate = `${marriageYear}/${String((seed % 12) + 1).padStart(2, "0")}/15`;
      return (
        <div
          key="spouse"
          className={`${SUBCARD} ${isBankCustomer ? "border border-teal-200 bg-teal-50/40 cursor-pointer hover:bg-teal-50 hover:shadow-md transition-all" : ""}`}
          onClick={isBankCustomer ? () => {
            setSelectedCustomer(spouseCustomer);
            setActiveTab("basic");
            window.scrollTo({ top: 0, behavior: "instant" });
          } : undefined}
          title={isBankCustomer ? `點擊查看 ${spouseName} 的客戶資料` : undefined}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Users className="w-5 h-5 text-pink-500 flex-shrink-0" />
                <span className="font-bold text-md">{spouseName}</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">配偶</span>
                {isBankCustomer && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-bold border border-teal-300">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    本行客戶
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm ml-7">
                {isBankCustomer && spouseCid && (
                  <div>
                    <span className="text-gray-500">客戶編號: </span>
                    <span className="font-medium text-teal-700">{spouseCid}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">關係起日: </span>
                  <span className="font-medium">{marriageDate}</span>
                </div>
                <div>
                  <span className="text-gray-500">關係狀態: </span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">有效</span>
                </div>
                {isBankCustomer && spouseCustomer && (
                  <div className="col-span-2 mt-1 text-xs text-teal-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    查看關係人資訊
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    })();

    // --- Children cards (deterministic based on seed, for family lifecycle stages) ---
    const childCards = (() => {
      // Curated children count for customers with spouses; others derive from seed
      const CHILDREN_COUNT_MAP = {
        C001: 1, C002: 2, C004: 2, C006: 1, C007: 2,
        C008: 1, C009: 2, C010: 2, C011: 1, C012: 2,
        C014: 2, C015: 1, C017: 2,
        C183: 1, C185: 1, C186: 1, C189: 1, C191: 1,
        C193: 1, C194: 2, C196: 1,
        C197: 2, C198: 2, C199: 2, C200: 2, C201: 1,
        C203: 2, C204: 2, C205: 2, C206: 1,
      };
      const familyStages = ["young_family", "pre_retirement", "affluent", "established_professional", "high_net_worth", "retired"];
      // Only show children if married and in a life stage that implies children
      if (c.maritalStatus !== "已婚" || !familyStages.includes(c.lifecycleStage)) return [];

      // Shared children for cross-linked bank-customer couples (both partners see identical children)
      const COUPLE_CHILDREN = {
        "C001-C196": [
          { name: "王品宸", isBoy: true, age: 0 },
        ],
        "C203-C204": [
          { name: "林承恩", isBoy: true, age: 20 },
          { name: "林子晴", isBoy: false, age: 17 },
        ],
      };
      const coupleKey = c.spouseInfo?.customerId
        ? [c.id, c.spouseInfo.customerId].sort().join("-")
        : null;
      const coupleChildren = coupleKey ? COUPLE_CHILDREN[coupleKey] : null;

      if (coupleChildren) {
        return coupleChildren.map((child, i) => {
          const childBirthYear = new Date().getFullYear() - child.age;
          const ageDisplay = `${child.age} 歲`;
          return (
            <div key={`child-${i}`} className={SUBCARD}>
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="font-bold text-md">{child.name}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">子女</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm ml-7">
                    <div><span className="text-gray-500">年齡: </span><span className="font-medium">{ageDisplay}</span></div>
                    <div><span className="text-gray-500">出生年份: </span><span className="font-medium">{childBirthYear} 年</span></div>
                    <div><span className="text-gray-500">受益人: </span><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">是</span></div>
                    <div><span className="text-gray-500">關係狀態: </span><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">有效</span></div>
                  </div>
                </div>
              </div>
            </div>
          );
        });
      }

      // Determine count: use map if defined, else derive from seed (1 or 2)
      const numChildren = c.id in CHILDREN_COUNT_MAP
        ? CHILDREN_COUNT_MAP[c.id]
        : (1 + (seed % 2));
      const maleChildNames = ["志豪", "承恩", "宸宇", "昊哲", "品豪"];
      const femaleChildNames = ["芸榕", "思妤", "子晴", "依庭", "柔嫣"];
      const spouseSurname = c.spouseInfo?.customerId
        ? (mockCustomers.find((m) => m.id === c.spouseInfo.customerId)?.name?.charAt(0) || c.name?.charAt(0))
        : c.name?.charAt(0) || "王";
      return Array.from({ length: numChildren }, (_, i) => {
        const childSeed = (seed + i * 31) % 97;
        const isBoy = (childSeed % 2) === 0;
        const childSurname = i === 0 && c.spouseInfo ? spouseSurname : (c.name?.charAt(0) || "王");
        const childGivenName = (isBoy ? maleChildNames : femaleChildNames)[childSeed % 5];
        const childName = `${childSurname}${childGivenName}`;
        const ageBase = c.age || 35;
        const childAge = Math.max(1, (ageBase - 26) - i * 3 + (childSeed % 3));
        const childBirthYear = new Date().getFullYear() - childAge;
        const ageDisplay = `${childAge} 歲`;
        return (
          <div key={`child-${i}`} className={SUBCARD}>
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-md">{childName}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">子女</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm ml-7">
                  <div><span className="text-gray-500">年齡: </span><span className="font-medium">{ageDisplay}</span></div>
                  <div><span className="text-gray-500">出生年份: </span><span className="font-medium">{childBirthYear} 年</span></div>
                  <div><span className="text-gray-500">受益人: </span><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">是</span></div>
                  <div><span className="text-gray-500">關係狀態: </span><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">有效</span></div>
                </div>
              </div>
            </div>
          </div>
        );
      });
    })();

    // --- Manager card (always shown) ---
    const managerNames = ["張麗雯", "林志傑", "陳慧芬", "吳俊賢", "黃佳慧"];
    const managerName = managerNames[seed % managerNames.length];
    const managerBranches = ["信義分行", "大安分行", "中山分行", "板橋分行", "新竹分行"];
    const managerBranch = managerBranches[(seed >> 2) % managerBranches.length];
    const managerCard = (
      <div key="manager" className={SUBCARD}>
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span className="font-bold text-md">{managerName}（E{String(10000 + (seed % 89999)).slice(0,5)}）</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">經管人員</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm ml-7">
              <div><span className="text-gray-500">經管分行: </span><span className="font-medium">{managerBranch}</span></div>
              <div><span className="text-gray-500">關係起日: </span><span className="font-medium">{2018 + (seed % 6)}/0{(seed % 9) + 1}/01</span></div>
              <div><span className="text-gray-500">在職狀況: </span><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">在職</span></div>
              <div><span className="text-gray-500">理專註記: </span><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">是</span></div>
            </div>
          </div>
        </div>
      </div>
    );

    const allCards = [spouseCard, ...childCards, managerCard].filter(Boolean);
    if (!allCards.length) return null;
    return (
      <div className={SUBCARD}>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">客戶關係人資訊</h4>
        <div className="space-y-3">{allCards}</div>
      </div>
    );
  };

  // Generic section renderer used in detail pages
  const renderSection = (section) => {
    if (!section) return <div className="text-sm text-gray-500">無資料</div>;
    // simple key/value list
    if (Array.isArray(section.data) && section.data.length > 0) {
      return (
        <div className="grid gap-2 text-sm">
          {section.data.map((d, i) => {
            const val = maskValue(d.label, d.value, Boolean(d.masked));
            return (
              <div key={i} className="flex justify-between border-b pb-1">
                <div className="text-gray-600">{d.label}</div>
                <div className="font-medium text-right">{val}</div>
              </div>
            );
          })}
        </div>
      );
    }

    // preferences block
    if (Array.isArray(section.preferences) && section.preferences.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {section.preferences.map((pref, pIdx) => (
            <div key={pIdx} className="p-2 bg-gray-50 rounded-md text-sm">
              <div className="font-medium mb-1">{pref.category}</div>
              {pref.items &&
                pref.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs text-gray-600"
                  >
                    <div>{it.name}</div>
                    <div>{it.usage || it.score || it.percentage || ""}</div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      );
    }

    // interactions
    if (
      Array.isArray(section.interactions) &&
      section.interactions.length > 0
    ) {
      return (
        <div className="space-y-1">
          <InteractionTimeline items={section.interactions} />
          {section.name === "客戶服務紀錄" && (
            <div className="text-[11px] text-gray-500">請點擊查看服務紀錄</div>
          )}
        </div>
      );
    }

    // tags (teal-themed by default; intensity follows tag.score)
    if (Array.isArray(section.tags) && section.tags.length > 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {section.tags.map((t, i) => {
            const score =
              typeof t.score === "number"
                ? t.score
                : t.score
                ? parseFloat(t.score)
                : 0;
            const cls =
              t.color ||
              (score >= 0.8
                ? "bg-teal-600 text-white"
                : score >= 0.6
                ? "bg-teal-400 text-white"
                : "bg-teal-50 text-teal-800");
            return (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}
              >
                {t.name}
              </span>
            );
          })}
        </div>
      );
    }

    return <div className="text-sm text-gray-500">無資料</div>;
  };

  // Horizontal timeline for interactions
  const InteractionTimeline = ({ items = [], onItemClick = null }) => {
    if (!items.length)
      return <div className="text-xs text-gray-500">無互動紀錄</div>;
    // Sort descending by time if parseable
    const parseTS = (s) => {
      const d = new Date(s.replace(/\//g, "-"));
      return isNaN(d) ? new Date() : d;
    };
    const data = [...items].sort((a, b) => parseTS(b.time) - parseTS(a.time));
    return (
      <div className="relative">
        {/* Axis passes exactly through bubble centers (24px bubble => center at 12px from row top) */}
        <div className="absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200 z-0" />
        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-6 min-w-max px-2">
            {data.map((it, idx) => {
              const status = it.status || (idx % 2 === 0 ? "處理中" : "已解決");
              const isWarn = status === "處理中" || status === "提醒";
              const isSuccess = status === "已解決" || status === "已發生";
              const statusColor = isWarn
                ? "bg-yellow-400"
                : isSuccess
                ? "bg-green-500"
                : "bg-teal-500";
              const badgeCls = isWarn
                ? "bg-yellow-100 text-yellow-800"
                : isSuccess
                ? "bg-green-100 text-green-800"
                : "bg-teal-100 text-teal-800";
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-xs w-44"
                >
                  {/* tick mark on axis */}
                  <div
                    className="w-px h-3 bg-teal-300"
                    style={{ position: "relative", top: "-6px" }}
                  ></div>
                  <div className="flex flex-col items-center">
                    <div className="text-[11px] text-gray-500 font-medium mb-1">
                      {it.time}
                    </div>
                    <div className="relative flex items-center justify-center z-10">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shadow ${statusColor} text-white font-bold`}
                      >
                        {idx + 1}
                      </div>
                    </div>
                    <div
                      className="mt-2 p-2 w-full rounded-lg bg-white shadow border border-teal-100 hover:shadow-md transition cursor-pointer"
                      onClick={() => {
                        if (onItemClick) onItemClick(it);
                      }}
                    >
                      <div className="font-medium text-gray-800 truncate mb-1 flex items-center gap-1">
                        <span>{it.channel}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeCls}`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className="text-gray-600 leading-snug line-clamp-3">
                        {it.detail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── Insight Modal helpers ────────────────────────────────────────────────
  // Build structured content for the insight popup based on type and payload.
  const SEASON_HINTS = (() => {
    const m = new Date().getMonth() + 1;
    if (m >= 6 && m <= 8) return { travel: '暑假旺季，出國旅遊需求高峰', dining: '夏日餐飲消費旺季', luxury: null };
    if (m >= 11 || m <= 1) return { travel: '年末年假出遊潮', luxury: '年末精品送禮旺季', dining: '年節餐聚旺季' };
    if (m >= 3 && m <= 5) return { travel: '春假出遊季', dining: null, luxury: null };
    return {};
  })();

  const buildIntentInsight = (tag, customer) => {
    const name = tag.name || '';
    const score = typeof tag.score === 'number' ? tag.score : parseFloat(tag.score || '0');
    const pp = customer?.productPreferences || {};
    const sp = customer?.spendingCategories || {};
    const vip = customer?.vipLevel || 'normal';
    const isHighVip = vip === 'VVVIP' || vip === 'VVIP';
    const recs = (() => {
      if (/旅遊|出國/.test(name)) return [
        { name: '旅遊聯名信用卡', reason: '刷卡回饋最高，海外手續費優惠，適合出國消費場景' },
        { name: '外幣活期存款帳戶', reason: '可預先換匯鎖定匯率，節省出國換匯成本' },
        isHighVip ? { name: '機場貴賓室尊享卡', reason: 'VIP 客戶專屬，提升旅行體驗' } : null,
      ].filter(Boolean);
      if (/信用卡/.test(name)) return [
        { name: '高回饋現金回饋卡', reason: '日常消費最高回饋，與現有消費習慣高度吻合' },
        { name: '分期零利率專案', reason: '大額消費可分期，降低一次性資金壓力' },
      ];
      if (/投資|理財/.test(name)) return [
        { name: isHighVip ? '私人銀行信託方案' : '穩健型基金定期定額', reason: '與客戶風險屬性相符，建議分批布局' },
        { name: '外幣定存', reason: '台幣以外資產配置，分散匯率風險' },
      ];
      if (/房貸/.test(name)) return [
        { name: '房貸試算方案', reason: '依客戶財力與收入估算，提供最優化的貸款條件' },
        { name: '理財型房貸', reason: '彈性動用額度，兼顧資產流動性' },
      ];
      if (/信貸/.test(name)) return [
        { name: '個人信用貸款', reason: '快速核撥，利率依信用評級調整' },
      ];
      if (/留學/.test(name)) return [
        { name: '留學教育貸款', reason: '專為海外就學設計，還款期間彈性' },
        { name: '外幣存款帳戶', reason: '可預存學費外幣，降低匯率波動風險' },
      ];
      return [{ name: '個人化理財諮詢', reason: '建議透過理專深入了解需求，提供客製方案' }];
    })();
    const dataBasis = (() => {
      if (/旅遊|出國/.test(name)) return `旅遊消費比例 ${Math.round((sp.travel || 0) * 100)}%、海外消費比例 ${Math.round((sp.overseas || 0) * 100)}%`;
      if (/信用卡/.test(name)) return `信用卡產品偏好 ${Math.round((pp.creditCard || 0) * 100)}%`;
      if (/投資|理財/.test(name)) return `投資產品偏好 ${Math.round((pp.investment || 0) * 100)}%`;
      if (/房貸/.test(name)) return `貸款產品偏好 ${Math.round((pp.loans || 0) * 100)}%`;
      return '依客戶行為模型推導';
    })();
    const timing = (() => {
      if (/旅遊|出國/.test(name) && SEASON_HINTS.travel) return SEASON_HINTS.travel + '，建議盡快聯繫';
      if (/信用卡/.test(name)) return '信用卡需求通常源於近期消費，建議本週內聯繫';
      if (/投資|理財/.test(name)) return '理財意圖持續升溫，建議月底前安排諮詢';
      if (/房貸/.test(name)) return '房貸決策週期長，建議先提供試算，建立信任';
      return '建議近期主動安排問候';
    })();
    const opening = (() => {
      if (/旅遊|出國/.test(name)) return '「不知道您最近有沒有出國的計畫？我剛好有一個旅遊相關的方案想跟您分享。」';
      if (/信用卡/.test(name)) return '「我有一張回饋設計很符合您消費習慣的卡，想花幾分鐘跟您介紹一下。」';
      if (/投資|理財/.test(name)) return '「最近市場有一些不錯的機會，我整理了一份符合您風險屬性的方案，方便聽我說說嗎？」';
      if (/房貸/.test(name)) return '「不知道您對房屋貸款有沒有規劃？我可以先幫您試算看看，完全沒有壓力。」';
      return '「最近剛好有一個方案想和您分享，不知道您現在方便嗎？」';
    })();
    return { title: name, score, dataBasis, timing, opening, recs };
  };

  const buildProductInsight = (item, customer) => {
    const prodName = item.product || item.name || '';
    const score = parsePercent(item.score);
    const pp = customer?.productPreferences || {};
    const vip = customer?.vipLevel || 'normal';
    const isHighVip = vip === 'VVVIP' || vip === 'VVIP';
    const tierAvg = { creditCard: { VVVIP: 90, VVIP: 85, VIP: 75, normal: 55 }, investment: { VVVIP: 95, VVIP: 88, VIP: 70, normal: 35 }, deposits: { VVVIP: 60, VVIP: 65, VIP: 72, normal: 80 }, loans: { VVVIP: 30, VVIP: 40, VIP: 55, normal: 60 } };
    const keyMap = { '信用卡': 'creditCard', '投資理財': 'investment', '存款': 'deposits', '貸款': 'loans' };
    const key = keyMap[prodName] || 'creditCard';
    const avg = (tierAvg[key] || {})[vip] || 60;
    const gap = score - avg;
    const plans = (() => {
      if (/信用卡/.test(prodName)) return [
        { name: '旅遊聯名卡', highlight: '海外消費 3% 回饋，機場貴賓室', fit: isHighVip ? '★★★' : '★★☆' },
        { name: '現金回饋卡', highlight: '日常消費最高 2.5% 回饋', fit: '★★★' },
        { name: '商務卡', highlight: '差旅費用管理，企業主專屬', fit: '★★☆' },
      ];
      if (/投資/.test(prodName)) return [
        { name: '全球股票型基金', highlight: '長期成長潛力，定期定額布局', fit: '★★★' },
        { name: '平衡型基金', highlight: '股債搭配，兼顧報酬與穩定', fit: '★★★' },
        { name: isHighVip ? '私人銀行信託' : '債券型基金', highlight: isHighVip ? '客製化資產管理' : '穩健固定收益', fit: isHighVip ? '★★★' : '★★☆' },
      ];
      if (/存款/.test(prodName)) return [
        { name: '台幣定期存款', highlight: '鎖定利率，到期提醒服務', fit: '★★★' },
        { name: '外幣定期存款', highlight: '美元/澳幣高息，分散匯率風險', fit: '★★☆' },
        { name: '數位帳戶活存', highlight: '高於一般活存利率，隨時領取', fit: '★★☆' },
      ];
      return [
        { name: '房屋貸款', highlight: '優惠利率，彈性還款期', fit: '★★☆' },
        { name: '個人信用貸款', highlight: '快速核撥，免擔保品', fit: '★★★' },
      ];
    })();
    return { title: prodName, score, avg, gap, plans };
  };

  const buildSpendingInsight = (item, customer) => {
    const cat = item.category || item.name || '';
    const score = parsePercent(item.score);
    const sp = customer?.spendingCategories || {};
    const intentTag = getTopIntentTag(customer);
    const intentName = intentTag ? intentTag.name : '';
    const crossRef = (/旅遊|出國/.test(intentName) && /旅遊/.test(cat)) ||
      (/信用卡/.test(intentName) && !/旅遊/.test(cat)) ? intentName : null;
    const seasonal = SEASON_HINTS[Object.keys(SEASON_HINTS).find(k => cat.includes({ travel: '旅遊', dining: '餐飲', luxury: '精品' }[k] || ''))] || null;
    const cards = (() => {
      if (/旅遊/.test(cat)) return ['旅遊聯名卡（機場貴賓室、海外刷卡回饋）', '外幣帳戶（預先換匯鎖率）'];
      if (/餐飲/.test(cat)) return ['餐飲回饋卡（指定通路最高 5% 回饋）', '訂位/外送平台優惠合作卡'];
      if (/精品/.test(cat)) return ['精品百貨聯名卡（VIP 貴賓通道）', '分期零利率精品專案'];
      if (/科技|3C/.test(cat)) return ['3C 分期購物卡', '科技消費回饋方案'];
      if (/教育/.test(cat)) return ['教育儲蓄專案', '留學貸款試算'];
      if (/醫療/.test(cat)) return ['醫療保障方案', '醫療信用貸款'];
      return ['日常消費回饋卡', '消費分期優惠'];
    })();
    return { title: cat, score, crossRef, seasonal, cards };
  };

  const getAdvisorSummary = (customer) => {
    if (!customer) return null;
    const topIntent = getTopIntentTag(customer);
    const sp = customer.spendingCategories || {};
    const pp = customer.productPreferences || {};
    const events = (generateCustomerEvents(customer) || []);
    const urgentEvent = events.find(e => e.status === '提醒');
    const intentScore = topIntent ? (typeof topIntent.score === 'number' ? topIntent.score : parseFloat(topIntent.score || '0')) : 0;
    const signals = [];
    if (topIntent && intentScore >= 0.75) signals.push({ icon: '🎯', text: `高信心度意圖：「${topIntent.name}」（${Math.round(intentScore * 100)}%）` });
    if (urgentEvent) signals.push({ icon: '📅', text: `即將到期事件：${urgentEvent.detail.slice(0, 30)}…` });
    const topSpend = Object.entries(sp).sort((a, b) => b[1] - a[1])[0];
    if (topSpend && topSpend[1] >= 0.8) {
      const label = { travel: '旅遊', dining: '餐飲', luxury: '精品', investment: '投資', tech: '科技', education: '教育', overseas: '海外消費' }[topSpend[0]] || topSpend[0];
      signals.push({ icon: '💡', text: `消費重心：${label}（${Math.round(topSpend[1] * 100)}%）` });
    }
    if (signals.length === 0) return null;
    const overlapHighlight = signals.length >= 2;
    return { signals, overlapHighlight, actionHint: topIntent ? `建議優先跟進「${topIntent.name}」相關產品推薦` : '建議安排定期維繫問候' };
  };

  const renderInsightModal = () => {
    if (!insightModal) return null;
    const { type, data, customer } = insightModal;
    const closeBtn = (
      <button onClick={() => setInsightModal(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">✕</button>
    );
    const sendToAssistant = (prompt) => {
      setInsightModal(null);
      setAssistantOpen(true);
      setTimeout(() => sendAssistant(prompt), 100);
    };
    let body = null;
    if (type === 'intent') {
      const { title, score, dataBasis, timing, opening, recs } = data;
      body = (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-semibold text-sm">{title}</span>
            <span className="text-gray-500 text-sm">信心度 {Math.round(score * 100)}%</span>
            {score >= 0.8 && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">高優先</span>}
          </div>
          <div className="bg-teal-50 rounded-lg p-3 text-sm">
            <div className="font-semibold text-teal-800 mb-1">數據依據</div>
            <div className="text-teal-700">{dataBasis}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-sm">
            <div className="font-semibold text-amber-800 mb-1">建議時機</div>
            <div className="text-amber-700">{timing}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2 text-sm">推薦產品</div>
            <div className="space-y-2">
              {recs.map((r, i) => (
                <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-teal-600 font-bold text-sm shrink-0">{i + 1}.</span>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <div className="font-semibold text-blue-800 mb-1">建議開場白</div>
            <div className="text-blue-700 italic">{opening}</div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => sendToAssistant('問候話術')} className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">生成問候話術</button>
            <button onClick={() => sendToAssistant(`產品推薦:${title}`)} className="flex-1 py-2 bg-teal-100 text-teal-800 rounded-lg text-sm font-medium hover:bg-teal-200">產品推薦分析</button>
          </div>
        </div>
      );
    } else if (type === 'product') {
      const { title, score, avg, gap, plans } = data;
      body = (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-semibold text-sm">{title}</span>
            <span className="text-gray-500 text-sm">偏好分數 {score}%</span>
          </div>
          <div className={`rounded-lg p-3 text-sm ${gap >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
            <div className={`font-semibold mb-1 ${gap >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
              {gap >= 0 ? '高於同等級均值' : '低於同等級均值'}
            </div>
            <div className={gap >= 0 ? 'text-green-700' : 'text-orange-700'}>
              同 VIP 等級均值約 {avg}%，此客戶{gap >= 0 ? `高出 ${gap}%，偏好明顯` : `低 ${Math.abs(gap)}%，可探索需求`}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2 text-sm">適合方案</div>
            <div className="space-y-2">
              {plans.map((p, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded-lg flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.highlight}</div>
                  </div>
                  <div className="text-xs text-amber-600 font-medium shrink-0">{p.fit}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => sendToAssistant(`產品推薦:product:${title}`)} className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">完整產品推薦分析</button>
          </div>
        </div>
      );
    } else if (type === 'spending') {
      const { title, score, crossRef, seasonal, cards } = data;
      body = (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-semibold text-sm">{title}</span>
            <span className="text-gray-500 text-sm">消費比例 {score}%</span>
          </div>
          {seasonal && (
            <div className="bg-amber-50 rounded-lg p-3 text-sm">
              <div className="font-semibold text-amber-800 mb-1">季節性提醒</div>
              <div className="text-amber-700">{seasonal}，現在是主動聯繫的好時機</div>
            </div>
          )}
          {crossRef && (
            <div className="bg-teal-50 rounded-lg p-3 text-sm">
              <div className="font-semibold text-teal-800 mb-1">與意圖標籤一致</div>
              <div className="text-teal-700">「{crossRef}」意圖與此消費偏好重疊，信號更強，建議優先跟進</div>
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-700 mb-2 text-sm">適合的產品 / 服務</div>
            <div className="space-y-2">
              {cards.map((c, i) => (
                <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="text-teal-600 shrink-0">•</span>
                  <span className="text-gray-700">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => sendToAssistant(`產品推薦:spending:${title}`)} className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">產品推薦分析</button>
            <button onClick={() => sendToAssistant('問候話術')} className="flex-1 py-2 bg-teal-100 text-teal-800 rounded-lg text-sm font-medium hover:bg-teal-200">問候話術建議</button>
          </div>
        </div>
      );
    }
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setInsightModal(null)}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {closeBtn}
          <div className="font-bold text-lg text-gray-800 mb-4 pr-6">行動建議卡</div>
          {body}
        </div>
      </div>
    );
  };

  const renderCustomerTags = () => {
    // Build a tags data structure from the actual selected customer, falling back to demo data
    const customer = selectedCustomer;
    const sp = (customer && customer.spendingCategories) || {};
    const pp = (customer && customer.productPreferences) || {};
    const intentScorer = (name) => {
      if (/旅遊|出國/.test(name)) return Math.max(sp.travel || 0, sp.overseas || 0) * 0.9 + (pp.creditCard || 0) * 0.1;
      if (/信用卡/.test(name)) return pp.creditCard || 0;
      if (/投資|理財/.test(name)) return pp.investment || 0;
      if (/房貸/.test(name)) return (pp.loans || 0) * 0.8 + (sp.groceries || 0) * 0.2;
      if (/信貸/.test(name)) return (pp.loans || 0) * 0.7;
      if (/留學/.test(name)) return sp.education || 0;
      if (/創業|融資/.test(name)) return 0.45;
      return 0.5;
    };
    // Build intent tags from customer.tags strings or infer from spending/product data
    let intentTagList;
    if (customer) {
      const explicitIntents = (customer.tags || [])
        .filter((t) => typeof t === "string" && t.includes("意圖"))
        .map((name) => ({
          name,
          score: intentScorer(name),
          source: "行為標籤",
          lastUpdated: "2025-11-20",
        }));
      if (explicitIntents.length > 0) {
        intentTagList = [...explicitIntents].sort((a, b) => b.score - a.score);
      } else {
        // Infer from spending/product signals
        const inferred = [
          { name: "出國旅遊意圖", score: Math.max(sp.travel || 0, sp.overseas || 0), source: "消費行為推導", lastUpdated: "2025-11-20" },
          { name: "投資理財意圖", score: pp.investment || 0, source: "資產配置推導", lastUpdated: "2025-11-20" },
          { name: "信用卡申辦意圖", score: pp.creditCard || 0, source: "刷卡行為推導", lastUpdated: "2025-11-20" },
          { name: "房貸需求", score: pp.loans || 0, source: "授信行為推導", lastUpdated: "2025-11-20" },
        ].filter((t) => t.score >= 0.5).sort((a, b) => b.score - a.score);
        intentTagList = inferred.length > 0 ? inferred : detailedCustomerData.tags.sections.find((s) => s.name.includes("意圖標籤"))?.tags || [];
      }
    } else {
      intentTagList = detailedCustomerData.tags.sections.find((s) => s.name?.includes("意圖標籤"))?.tags || [];
    }
    const tagsData = {
      ...detailedCustomerData.tags,
      sections: [
        { name: "意圖標籤", tags: intentTagList },
        ...detailedCustomerData.tags.sections.filter((s) => !s.name?.includes("意圖標籤")),
      ],
    };
    const categories = Object.keys(TAG_CATEGORIES);
    return (
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {tagsData.title}
        </h3>
        <div className="space-y-6">
          {tagsData.sections.map((section, idx) => (
            <div key={idx} id={section.name?.includes("意圖") ? "tag-intent" : `tag-section-${idx}`} className={SUBCARD}>
              <h4 className="font-bold text-lg mb-4 text-gray-800">
                {section.name}
              </h4>

              {section.tags && (
                <div className="space-y-4">
                  {section.name && section.name.includes("意圖標籤") ? (
                    <div className="space-y-3">
                      {[...section.tags]
                        .sort((a, b) => {
                          const scoreA = typeof a.score === 'number' ? a.score : (a.score ? parseFloat(a.score) : 0);
                          const scoreB = typeof b.score === 'number' ? b.score : (b.score ? parseFloat(b.score) : 0);
                          return scoreB - scoreA;
                        })
                        .map((tag, tagIdx) => {
                        const score =
                          typeof tag.score === "number"
                            ? tag.score
                            : tag.score
                            ? parseFloat(tag.score)
                            : 0;
                        const badgeCls =
                          tag.color ||
                          (score >= 0.8
                            ? "bg-teal-600 text-white"
                            : score >= 0.6
                            ? "bg-teal-400 text-white"
                            : "bg-teal-50 text-teal-800");
                        const isHighPriority = score >= 0.8;
                        return (
                          <div
                            key={tagIdx}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${isHighPriority ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}
                            onClick={() => setInsightModal({ type: 'intent', data: buildIntentInsight(tag, customer), customer })}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeCls}`}>
                                {tag.name}
                              </span>
                              {isHighPriority && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">優先</span>}
                              <span className="text-sm text-gray-600">
                                信心度:{" "}
                                {tag.confidence || Math.round(score * 100) + "%"}
                              </span>
                              <span className="text-xs text-teal-600 underline ml-auto">查看建議 →</span>
                            </div>
                            <div className="flex items-center gap-3 ml-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-teal-200 to-teal-600"
                                  style={{ width: `${Math.max(6, Math.round(score * 100))}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700 w-10 text-right">
                                {Math.max(6, Math.round(score * 100))}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {section.tags.map((tag, tagIdx) => {
                        const score =
                          typeof tag.score === "number"
                            ? tag.score
                            : tag.score
                            ? parseFloat(tag.score)
                            : 0;
                        const cls =
                          tag.color ||
                          (score >= 0.8
                            ? "bg-teal-600 text-white"
                            : score >= 0.6
                            ? "bg-teal-400 text-white"
                            : "bg-teal-50 text-teal-800");
                        return (
                          <span
                            key={tagIdx}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${cls} cursor-pointer hover:shadow-md transition-shadow`}
                          >
                            {tag.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* 依分類渲染結構化標籤；意圖標籤區塊保持原樣 */}
          {categories.map((cat) => {
            const names = (selectedCustomer?.structuredTags || [])
              .filter((t) => t.category === cat)
              .map((t) => t.name);
            return (
              <div key={`cat-${cat}`} className={SUBCARD}>
                <h4 className="font-bold text-lg mb-2 text-gray-800">{cat}</h4>
                <div className="flex flex-wrap gap-2">
                  {names.length > 0 ? (
                    names.map((n, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                      >
                        {n}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">無標籤</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCustomerPreferences = (customer) => {
    // 使用动态生成的preferences而非硬编码数据
    const dynamicPrefs = customer ? generateCustomerBasicInfo(customer).preferences : detailedCustomerData.preferences;
    const prefsData = dynamicPrefs || {
      title: "偏好資訊",
      sections: [],
    };

    return (
      <div className="space-y-4">
        <div className={CARD}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {prefsData.title}
          </h3>
          <div className="space-y-6">
            {prefsData.sections.map((section, sIdx) => {
              // Assign stable anchor id based on section name
              const anchorId = section.name.includes("產品") ? "pref-product"
                : section.name.includes("消費") ? "pref-spending"
                : section.name.includes("通路") ? "pref-channel"
                : section.name.includes("行銷") ? "pref-marketing"
                : `pref-section-${sIdx}`;
              // Normal rendering for all sections in order
              return (
                <div key={sIdx} id={anchorId} className={SUBCARD}>
                  <h4 className="font-bold text-lg mb-4 text-gray-800">
                    {section.name}
                  </h4>

                  {/* Product preferences */}
                  {section.preferences &&
                    section.preferences.length > 0 &&
                    section.name.includes("產品") && (
                      <div className="grid grid-cols-3 gap-2">
                        {section.preferences.map((item, i) => {
                          const sc = parsePercent(item.score);
                          const insight = buildProductInsight(item, customer);
                          const gapPositive = insight.gap >= 0;
                          const isProductPriority = gapPositive && sc >= 70;
                          return (
                          <div
                            key={i}
                            className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-all border ${
                              isProductPriority ? 'bg-amber-50 border-amber-100 hover:bg-amber-100' : 'bg-gray-50 border-transparent hover:bg-teal-50 hover:border-teal-100'
                            }`}
                            onClick={() => setInsightModal({ type: 'product', data: insight, customer })}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">
                                {item.product || item.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {isProductPriority && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">優先</span>
                                )}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  sc >= 80
                                    ? "bg-teal-100 text-teal-800"
                                    : sc >= 60
                                    ? "bg-teal-50 text-teal-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {getPreferenceLabel(item.score)}
                              </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-teal-200 to-teal-600"
                                  style={{ width: item.score || "0%" }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-600">
                                {item.score || ""}
                              </span>
                            </div>
                            {item.note && (
                              <div className="text-xs text-gray-500 mt-1">{item.note}</div>
                            )}
                            <div className={`mt-1.5 text-[10px] font-medium ${gapPositive ? 'text-green-600' : 'text-orange-500'}`}>
                              {gapPositive ? `↑ 高於同級均值 ${insight.avg}%` : `↓ 低於同級均值 ${insight.avg}%`} · 點擊查看方案
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    )}

                  {/* Spending category preferences */}
                  {section.preferences &&
                    section.preferences.length > 0 &&
                    section.name.includes("消費") && (
                      <div className="grid grid-cols-3 gap-2">
                        {section.preferences.map((item, i) => {
                          const catName = item.category || item.name || '';
                          const spInsight = buildSpendingInsight(item, customer);
                          const hasSignal = (spInsight.crossRef || spInsight.seasonal) && i < 3;
                          return (
                          <div
                            key={i}
                            className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-all border ${
                              hasSignal ? 'bg-amber-50 border-amber-100 hover:bg-amber-100' : 'bg-gray-50 border-transparent hover:bg-teal-50 hover:border-teal-100'
                            }`}
                            onClick={() => setInsightModal({ type: 'spending', data: spInsight, customer })}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">
                                {catName}
                              </span>
                              <div className="flex items-center gap-1">
                                {hasSignal && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">優先</span>
                                )}
                                <span className="text-xs text-gray-600">
                                  {item.score || item.percentage || ""}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-teal-200 to-teal-600"
                                style={{ width: item.score || item.percentage || "0%" }}
                              ></div>
                            </div>
                            <div className="mt-1.5 text-[10px] text-teal-600">點擊查看適合產品</div>
                            {item.amount && (
                              <div className="mt-0.5 text-[11px] text-gray-600">{item.amount}</div>
                            )}
                          </div>
                        );
                        })}
                      </div>
                    )}

                  {/* Channel affinity */}
                  {section.preferences &&
                    section.preferences.length > 0 &&
                    (section.name.includes("通路") ||
                      section.name.includes("Channel")) && (
                      <div className="grid grid-cols-3 gap-2">
                        {section.preferences.map((item, i) => (
                          <div
                            key={i}
                            className="p-2 bg-gray-50 rounded-md text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">
                                {channelLabel(item.channel || item.name)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-teal-200 to-teal-600"
                                  style={{
                                    width: item.score || item.usage || "0%",
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-600">
                                {item.score || item.usage || ""}
                              </span>
                            </div>
                            {item.note && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Marketing consent */}
                  {section.preferences &&
                    section.preferences.length > 0 &&
                    section.name.includes("行銷") && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {section.preferences.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">
                                {p.label || p.name}
                              </div>
                              {p.lastUpdated && (
                                <div className="text-xs text-gray-500">
                                  更新: {p.lastUpdated}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-700">
                              {p.value || p.status || ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}

            {/* Standalone Marketing Settings section (same hierarchy as other preference sections) */}
            {selectedCustomer && selectedCustomer.marketingChannels && (
              <div className={SUBCARD}>
                <h4 className="font-bold text-lg mb-4 text-gray-800">
                  行銷設定
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">通路狀態</div>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "email", label: "電子郵件" },
                      { key: "appPush", label: "App 推播" },
                      { key: "linePush", label: "Line 推播" },
                      { key: "sms", label: "手機簡訊" },
                    ].map((ch) => {
                      const on = Boolean(
                        selectedCustomer.marketingChannels[ch.key]
                      );
                      return (
                        <div
                          key={ch.key}
                          className="flex items-center gap-3 p-2 bg-white rounded-lg border"
                        >
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              on
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {on ? "開啟" : "未開啟"}
                          </div>
                          <div className="text-sm text-gray-700">
                            {ch.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 消费类别中英文映射表
  const SPENDING_CATEGORY_MAP = {
    travel: "旅遊",
    luxury: "精品消費",
    dining: "餐飲",
    tech: "科技/3C",
    groceries: "食品雜貨",
    entertainment: "娛樂",
    utilities: "公用事業",
    healthcare: "醫療保健",
    bills: "帳單",
    essentials: "生活必需品",
    family: "家庭",
    childcare: "育兒",
    investments: "投資",
    wealth: "財富管理",
    philanthropy: "慈善捐獻",
    education: "教育",
    ecommerce: "電子商務",
    overseas: "海外消費",
  };

  // 获取消费类别中文标签
  const getSpendingCategoryLabel = (category) => {
    return SPENDING_CATEGORY_MAP[category] || category;
  };

  // 为每个客户动态生成基本信息 - 在renderDetailView外部定义，以便renderCustomerPreferences可访问
  const generateCustomerBasicInfo = (customer) => {
    if (!customer) return {};
    return {
      basic: {
        title: "客戶基本資訊",
        sections: [
          {
            name: "客戶名稱資訊",
            data: [
              { label: "客戶中文戶名", value: customer.name || "—" },
              { label: "客戶英文戶名", value: customer.nameEn || "—" },
            ],
          },
          {
            name: "客戶工作資訊",
            data: [
              { label: "任職單位", value: "科技股份有限公司" },
              { label: "職業別", value: "軟體工程師" },
            ],
          },
        ],
      },
      contact: {
        title: "客戶联絡資訊",
        sections: [
          {
            name: "联絡方式與地址",
            data: [
              { label: "手機號碼", value: customer.phone || "—" },
              { label: "電子郵件", value: customer.email || "—" },
              { label: "通訊地址", value: customer.address || "—" },
              { label: "城市", value: customer.city || "—" },
              {
                label: "联絡偏好",
                value: customer.preferredContact === "mobile" ? "行動 App"
                  : customer.preferredContact === "email" ? "Email"
                  : customer.preferredContact === "phone" ? "電話"
                  : customer.preferredContact || "—",
              },
              {
                label: "行銷同意",
                value: customer.marketingOptIn ? "允許" : "拒絕",
              },
            ],
          },
        ],
      },
      risk: detailedCustomerData.risk,
      financial: detailedCustomerData.financial,
      rating: {
        title: "客戶評價資訊",
        sections: [
          {
            name: "客戶等級資訊",
            data: [
              {
                label: "VIP等級",
                value: getTierDisplayLabel(customer.vipLevel || "normal"),
              },
            ],
          },
        ],
      },
      preferences: {
        title: "客戶偏好資訊",
        sections: [
          {
            name: "產品偏好",
            preferences: [
              {
                product: "信用卡",
                score: `${Math.round((customer.productPreferences?.creditCard || 0) * 100)}%`,
                note: "根據客戶交易紀錄分析",
              },
              {
                product: "投資理財",
                score: `${Math.round((customer.productPreferences?.investment || 0) * 100)}%`,
                note: "根據客戶資產配置分析",
              },
              {
                product: "存款",
                score: `${Math.round((customer.productPreferences?.deposits || 0) * 100)}%`,
                note: "根據客戶存款行為分析",
              },
            ].sort((a, b) => {
              const scoreA = parseInt(a.score) || 0;
              const scoreB = parseInt(b.score) || 0;
              return scoreB - scoreA; // 从高到低排序
            }),
          },
          {
            name: "消費偏好",
            preferences: (() => {
              const entries = Object.entries(customer.spendingCategories || {});
              const total = entries.reduce((sum, [, v]) => sum + (v || 0), 0) || 1;
              return entries
                .map(([category, score]) => ({
                  category: getSpendingCategoryLabel(category),
                  score: `${Math.round(((score || 0) / total) * 100)}%`,
                }))
                .sort((a, b) => parseInt(b.score) - parseInt(a.score))
                .slice(0, 6);
            })(),
          },
          {
            name: "通路偏好",
            preferences: (() => {
              const chLabels = {
                mobile_app: "行動銀行",
                email: "電子郵件",
                branch: "臨櫃",
                phone: "電話",
                sms: "手機簡訊",
                wealth_portal: "財富管理網",
                web: "網銀",
                online_banking: "網銀",
                appPush: "App 推播",
                linePush: "Line 推播",
              };
              // Base interaction counts by channel type (simulating relative frequency)
              const chBase = {
                mobile_app: 45, wealth_portal: 40, email: 35,
                web: 30, online_banking: 30, phone: 25,
                appPush: 20, linePush: 20, sms: 15, branch: 10,
              };
              const channels = customer.preferredChannels || ["mobile_app"];
              const shown = channels.slice(0, 4);
              const rawCounts = shown.map(ch => chBase[ch] || 20);
              const totalCount = rawCounts.reduce((s, v) => s + v, 0) || 1;
              return shown.map((ch, i) => ({
                channel: chLabels[ch] || ch,
                score: `${Math.round((rawCounts[i] / totalCount) * 100)}%`,
                note: i === 0 ? "主要聯繫通路" : "次要通路",
              }));
            })(),
          },
          {
            name: "行銷同意",
            preferences: [
              {
                label: "行銷接收狀態",
                value: customer.marketingOptIn ? "允許" : "拒絕",
                lastUpdated: "2025-09-12",
              },
              { label: "偏好頻率", value: "每月", lastUpdated: "2025-09-12" },
              {
                label: "偏好主題",
                value: (() => {
                  const pp = customer.productPreferences || {};
                  const sp = customer.spendingCategories || {};
                  const spendMap = {
                    travel: "旅遊", dining: "餐飲", luxury: "精品", tech: "科技",
                    education: "教育", healthcare: "醫療", groceries: "生活消費",
                  };
                  const prodMap = { creditCard: "高回饋卡", investment: "投資理財", loans: "貸款", deposits: "存款" };
                  const topSpend = Object.entries(sp).sort((a, b) => b[1] - a[1]).slice(0, 1).map(([k]) => spendMap[k] || k);
                  const topProd = Object.entries(pp).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => prodMap[k] || k);
                  return [...new Set([...topSpend, ...topProd])].join("/") || "—";
                })(),
                lastUpdated: "2025-09-12",
              },
            ],
          },
        ],
      },
      interactions: {
        title: "客戶互動",
        sections: [
          {
            name: "客戶事件紀錄",
            interactions: generateCustomerEvents(customer),
          },
        ],
      },
    };
  };

  const renderDetailView = () => {
    if (!selectedCustomer)
      return (
        <div className="p-2 text-sm text-gray-500">
          請從左側或搜尋結果選擇客戶以檢視詳細資料。
        </div>
      );

    // 使用全局的generateCustomerBasicInfo函数
    const currentData = (generateCustomerBasicInfo(selectedCustomer)[activeTab] || detailedCustomerData[activeTab]) || {
      title: "",
      sections: [],
    };

    // compute top preferences for this selected customer
    const topChannel = getTopPreferenceForCustomer(
      "通路偏好",
      "score",
      selectedCustomer
    );
    const topProduct = getTopPreferenceForCustomer(
      "產品偏好",
      "score",
      selectedCustomer
    );
    const topConsumption = getTopPreferenceForCustomer(
      "消費偏好",
      "score",
      selectedCustomer
    );
    const topIntent = getTopIntentTag(selectedCustomer);
    // simulated finance and marketing signals
    const f = getCustomerFinance(selectedCustomer);

    try {
      return (
        <div className="space-y-2">
          {/* Insight Modal */}
          {renderInsightModal()}

          {/* Customer Header Card */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {selectedCustomer?.name?.charAt(0) ||
                    selectedCustomer?.id?.charAt(0) ||
                    "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedCustomer?.name ||
                      selectedCustomer?.id ||
                      "未命名客戶"}
                  </h2>
                  <p className="text-blue-100 mb-2 text-sm">
                    客戶編號: {selectedCustomer?.id || ""}
                  </p>
                  <div className="flex gap-2 items-end flex-wrap">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getTierBgClass(
                        selectedCustomer?.vipLevel
                      )}`}
                    >
                      {getTierDisplayLabel(selectedCustomer?.vipLevel)}
                    </span>
                    {(() => {
                      const lvl =
                        (selectedCustomer && selectedCustomer.riskLevel) || "";
                      const cls =
                        lvl === "high"
                          ? "bg-red-600 text-white shadow-md"
                          : lvl === "medium"
                          ? "bg-yellow-500 text-white"
                          : "bg-teal-500 text-white";
                      return (
                        <span
                          className={`px-2 py-1 ${cls} rounded-full text-sm font-medium self-end`}
                        >
                          風險評級: {selectedCustomer?.riskScore}
                        </span>
                      );
                    })()}
                    <span className="px-2 py-1 bg-teal-300 text-teal-900 rounded-full text-sm font-medium self-end">
                      {selectedCustomer?.age}歲
                    </span>
                    {(() => {
                      const prefs = generateCustomerBasicInfo(selectedCustomer).preferences;
                      const prodSection = prefs?.sections?.find(s => s.name.includes("產品"));
                      const spSection = prefs?.sections?.find(s => s.name.includes("消費"));
                      const productPriorityCount = prodSection?.preferences?.filter(item => {
                        const sc = parsePercent(item.score);
                        const insight = buildProductInsight(item, selectedCustomer);
                        return insight.gap >= 0 && sc >= 70;
                      }).length ?? 0;
                      const spendingPriorityCount = spSection?.preferences?.slice(0, 3).filter(item => {
                        const spInsight = buildSpendingInsight(item, selectedCustomer);
                        return spInsight.crossRef || spInsight.seasonal;
                      }).length ?? 0;
                      const intentScore = topIntent ? (typeof topIntent.score === 'number' ? topIntent.score : parseFloat(topIntent.score || '0')) : 0;
                      const hasIntentPriority = intentScore >= 0.8;
                      const custSeed = seedFromId(selectedCustomer);
                      const hasPendingInteraction = selectedCustomer.id === 'C001' || custSeed % 3 === 0;
                      const hasAlertEvent = (generateCustomerEvents(selectedCustomer) || []).some(e => e.status === '提醒');
                      const interactionAlertCount = (hasPendingInteraction ? 1 : 0) + (hasAlertEvent ? 1 : 0);
                      const hasInteractionAlert = interactionAlertCount > 0;
                      const CountBadge = ({ n, red }) => (
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold mr-1 ${red ? 'bg-red-300 text-red-900' : 'bg-teal-300 text-teal-900'}`}>{n}</span>
                      );
                      return (
                        <>
                          {productPriorityCount > 0 && (
                            <button
                              onClick={() => { setActiveTab("preferences"); setPendingAnchor("pref-product"); }}
                              className="flex items-center px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium self-end hover:bg-teal-200 transition-colors cursor-pointer"
                            >
                              <CountBadge n={productPriorityCount} />
                              產品偏好
                            </button>
                          )}
                          {spendingPriorityCount > 0 && (
                            <button
                              onClick={() => { setActiveTab("preferences"); setPendingAnchor("pref-spending"); }}
                              className="flex items-center px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium self-end hover:bg-teal-200 transition-colors cursor-pointer"
                            >
                              <CountBadge n={spendingPriorityCount} />
                              消費偏好
                            </button>
                          )}
                          {hasIntentPriority && (
                            <button
                              onClick={() => { setActiveTab("tags"); setPendingAnchor("tag-intent"); }}
                              className="flex items-center px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium self-end hover:bg-teal-200 transition-colors cursor-pointer"
                            >
                              <CountBadge n={1} />
                              意圖標籤
                            </button>
                          )}
                          {hasInteractionAlert && (
                            <button
                              onClick={() => { setActiveTab("interactions"); setPendingAnchor("interaction-pending"); }}
                              className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium self-end hover:bg-red-200 transition-colors cursor-pointer"
                            >
                              <CountBadge n={interactionAlertCount} red />
                              互動注意
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveModule("search")}
                className="px-3 py-1 bg-white text-teal-600 rounded-lg hover:bg-teal-50 text-sm"
              >
                返回搜尋
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className={SUBCARD}>
              <div className="text-sm text-gray-600 mb-1">總資產</div>
              <div className="text-xl font-bold text-teal-600">
                NT$ {f.netWorth.toLocaleString()}
              </div>
            </div>
            <div className={SUBCARD}>
              <div className="text-sm text-gray-600 mb-1">總負債</div>
              <div className="text-xl font-bold text-teal-500">
                NT$ {f.loan.toLocaleString()}
              </div>
            </div>
            <div className={SUBCARD}>
              <div className="text-sm text-gray-600 mb-1">預估月收入</div>
              <div className="text-xl font-bold text-teal-500">
                NT$ {f.monthlyIncome.toLocaleString()}
              </div>
            </div>
            <div className={SUBCARD}>
              <div className="text-sm text-gray-600 mb-1">行銷互動分數</div>
              <div className="text-xl font-bold text-teal-700">
                {f.marketingScore}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap flex items-center gap-2 text-sm ${
                    activeTab === tab.id
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Financial Charts - Show when financial tab is active */}
          {activeTab === "financial" && (
            <div className="space-y-4">
              <div className={SUBCARD}>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  財務狀況視覺化分析
                </h3>
                {renderFinancialCharts()}
              </div>
            </div>
          )}


          {/* Floating Assistant */}
          <>
            {/* Toggle Button */}
              <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-1">
                <button
                  aria-label="開啟智能小助手"
                  onClick={() => setAssistantOpen((v) => !v)}
                  className="w-12 h-12 rounded-full bg-teal-600 text-white shadow-lg flex items-center justify-center hover:bg-teal-700"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
                <div className="px-2 py-1 text-[11px] bg-white/90 text-gray-700 rounded-md shadow-sm border">
                  智能對話小助手
                </div>
              </div>

            {assistantOpen && (
              <div className="fixed bottom-24 right-5 z-50 w-[24rem] max-w-[92vw] bg-white border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="relative flex items-center justify-between px-3 py-2 bg-teal-600 text-white">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">智能對話小助手</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 rounded hover:bg-white/20"
                      onClick={() => setShowResetConfirm((v) => !v)}
                      aria-label="重置對話"
                      title="重置對話"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-white/20"
                      onClick={() => setAssistantOpen(false)}
                      aria-label="關閉"
                      title="關閉"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {showResetConfirm && (
                    <div className="absolute right-2 top-12 z-50 w-56 bg-white text-gray-800 border rounded-lg shadow-xl p-3">
                      <div className="text-sm font-semibold mb-2">重置對話？</div>
                      <div className="text-xs text-gray-600 mb-3">此操作將清空目前的對話記錄並回到歡迎訊息。</div>
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                          onClick={() => setShowResetConfirm(false)}
                        >
                          取消
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-700"
                          onClick={() => { resetAssistantCore(); setShowResetConfirm(false); }}
                        >
                          重置
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={assistantListRef} className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
                  {assistantMessages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-3 py-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                        {m.typing ? (
                          <div className="flex items-center gap-1 text-gray-500">
                            <span>思考中</span>
                            <span className="animate-bounce" style={{animationDelay:'0ms'}}>•</span>
                            <span className="animate-bounce" style={{animationDelay:'150ms'}}>•</span>
                            <span className="animate-bounce" style={{animationDelay:'300ms'}}>•</span>
                          </div>
                        ) : m.role === 'assistant' ? (
                          <div className="space-y-1">
                            {(m.content || '').split(/\n+/).map((line, i) => {
                              const parts = line.split(/[:：]/);
                              const isColonTitle = parts.length > 1 && parts[0].length <= 20 && /^(【.*】|開場|洞察|利益|產品串接|疑慮處理|行動|概況|摘要|風險提示)$/.
                                test(parts[0].trim());
                              const isEmojiHeader = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/u.test(line.trim());
                              if (isColonTitle) {
                                return (
                                  <div key={i} className="whitespace-pre-wrap">
                                    <span className="font-semibold text-gray-900">{parts[0].trim()}：</span>
                                    <span>{line.slice(line.indexOf('：') >= 0 ? line.indexOf('：') + 1 : line.indexOf(':') + 1).trim()}</span>
                                  </div>
                                );
                              }
                              if (isEmojiHeader) {
                                return (
                                  <div key={i} className="whitespace-pre-wrap font-semibold text-gray-900">{line}</div>
                                );
                              }
                              return (
                                <div key={i} className="whitespace-pre-wrap">{line}</div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-2 pt-2 pb-1 flex gap-1.5 flex-wrap border-t border-gray-100">
                  {[
                    { label: '客戶摘要', prompt: '客戶摘要' },
                    { label: '問候話術', prompt: '問候話術' },
                    { label: '產品推薦', prompt: '產品推薦' },
                  ].map(({ label, prompt }) => (
                    <button
                      key={prompt}
                      onClick={() => sendAssistant(prompt)}
                      className="px-2.5 py-1 text-xs rounded-full bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors whitespace-nowrap"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="p-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendAssistant(assistantInput);
                      }
                    }}
                    placeholder="輸入問題，例如：給我一段行銷話術建議"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-1"
                    onClick={() => {
                      sendAssistant(assistantInput);
                    }}
                  >
                    <Send className="w-4 h-4" />
                    送出
                  </button>
                </div>
              </div>
            )}
          </>
          {/* Relationship Info - Show as additional section */}
          {activeTab === "basic" && (
            <>
              <div className={SUBCARD}>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {currentData.title}
                  </h3>
                  {/* 身份/證件資訊：動態以選取客戶資料為主 */}
                  {selectedCustomer && (
                    <div className={SUBCARD}>
                      <h4 className="font-bold text-md mb-2 text-gray-800">
                        身份 / 證件資訊
                      </h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                          <div className="text-gray-600">個人國籍</div>
                          <div className="font-medium text-right">
                            {selectedCustomer.nationality || "—"}
                          </div>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <div className="text-gray-600">學歷</div>
                          <div className="font-medium text-right">
                            {selectedCustomer.education || "—"}
                          </div>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <div className="text-gray-600">婚姻狀態</div>
                          <div className="font-medium text-right">
                            {selectedCustomer.maritalStatus || "—"}
                          </div>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <div className="text-gray-600">證件類別</div>
                          <div className="font-medium text-right">
                            {selectedCustomer.idType || "—"}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-gray-600">證件號碼</div>
                          <div className="font-medium text-right">
                            {showMaskedData
                              ? maskId(selectedCustomer.idCard)
                              : selectedCustomer.idCard || "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {currentData.sections.map((section, idx) => (
                    <div key={idx} className={SUBCARD}>
                      <h4 className="font-bold text-md mb-2 text-gray-800">
                        {section.name}
                      </h4>
                      {renderSection(section)}
                    </div>
                  ))}
                </div>
              </div>
              {renderRelationships()}
            </>
          )}

          {/* Regular Detail View for other tabs */}
          {activeTab !== "basic" &&
            activeTab !== "financial" &&
            activeTab !== "tags" &&
            activeTab !== "preferences" && (
              <div className={SUBCARD}>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {currentData.title}
                  </h3>
                  {currentData.sections &&
                    currentData.sections.map((section, idx) => (
                      <div key={idx} className={SUBCARD}>
                        <h4 className="font-bold text-md mb-2 text-gray-800">
                          {section.name}
                        </h4>
                        {renderSection(section)}
                      </div>
                    ))}

                  {/* Risk tab additional blocks: credit limits and major/default events */}
                  {activeTab === "risk" && selectedCustomer && (
                    <>
                      <div className={SUBCARD}>
                        <h4 className="font-bold text-md mb-2 text-gray-800">
                          客戶信用限額
                        </h4>
                        {(() => {
                          const f = getCustomerFinance(selectedCustomer);
                          const seed = seedFromId(selectedCustomer);
                          const approval = new Date(
                            2018 + (seed % 5),
                            seed % 12,
                            (seed % 26) + 1
                          );
                          const expiry = new Date(approval);
                          expiry.setFullYear(approval.getFullYear() + 3);
                          const available = Math.max(
                            0,
                            (f.creditLimit || 0) -
                              Math.round((f.cardSpend3M || 0) / 3)
                          );
                          return (
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  信用卡 / 預借額度
                                </div>
                                <div className="font-medium text-right">
                                  {f.creditLimit
                                    ? `NT$ ${f.creditLimit.toLocaleString()}`
                                    : "N/A"}
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  擔保品鑑估值
                                </div>
                                <div className="font-medium text-right">
                                  {f.collateralEstimated
                                    ? `NT$ ${f.collateralEstimated.toLocaleString()}`
                                    : "無"}
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  信用卡目前可用額度
                                </div>
                                <div className="font-medium text-right">
                                  {f.creditLimit
                                    ? `NT$ ${available.toLocaleString()}`
                                    : "N/A"}
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">核准日期</div>
                                <div className="font-medium text-right">
                                  {approval.toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <div className="text-gray-600">有效日期</div>
                                <div className="font-medium text-right">
                                  {expiry.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className={SUBCARD}>
                        <h4 className="font-bold text-md mb-2 text-gray-800">
                          違約 / 重大事件資訊
                        </h4>
                        {(() => {
                          const s = seedFromId(selectedCustomer) + 777;
                          const riskLevel = selectedCustomer.riskLevel || 'low';
                          
                          // Risk flags should align with customer's risk level
                          // low: no flags; medium: 0-1 flags; high: 3+ flags
                          const flags = {
                            blacklist: riskLevel === 'high' && Boolean(s & 1),
                            depositAlert: 
                              riskLevel === 'high' ? Boolean((s >> 1) & 1) : 
                              riskLevel === 'medium' ? Boolean((s >> 6) & 1) : 
                              false,
                            courtSeizure: riskLevel === 'high' && Boolean((s >> 2) & 1),
                            overdueCollection: 
                              riskLevel === 'high' ? Boolean((s >> 3) & 1) : 
                              riskLevel === 'medium' ? Boolean((s >> 7) & 1) : 
                              false,
                            guaranteeAbnormal: riskLevel === 'high' && Boolean((s >> 4) & 1),
                            cardAbnormal: 
                              riskLevel === 'high' ? Boolean((s >> 5) & 1) : 
                              riskLevel === 'medium' ? Boolean((s >> 8) & 1) : 
                              false,
                          };
                          const dateFor = (offset) =>
                            new Date(
                              2019 + ((s + offset) % 6),
                              (s + offset) % 12,
                              ((s + offset) % 26) + 1
                            ).toLocaleDateString();
                          return (
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  拒絕往來 / 黑名單註記
                                </div>
                                <div className="font-medium text-right">
                                  {flags.blacklist ? (
                                    <span className="px-2 py-1 bg-red-600 text-white rounded shadow-md animate-pulse">
                                      是
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">否</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">存款警示</div>
                                <div className="font-medium text-right">
                                  {flags.depositAlert ? (
                                    <span className="px-2 py-1 bg-yellow-500 text-white rounded shadow">
                                      已警示
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">否</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">法院扣押</div>
                                <div className="font-medium text-right">
                                  {flags.courtSeizure ? (
                                    <span className="px-2 py-1 bg-red-600 text-white rounded shadow">
                                      有
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">無</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  逾期 / 催收 / 呆帳註記
                                </div>
                                <div className="font-medium text-right">
                                  {flags.overdueCollection ? (
                                    <span className="px-2 py-1 bg-red-600 text-white rounded shadow">
                                      存在
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">無</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  授信保證異常
                                </div>
                                <div className="font-medium text-right">
                                  {flags.guaranteeAbnormal ? (
                                    <span className="px-2 py-1 bg-red-600 text-white rounded shadow">
                                      異常
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">正常</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <div className="text-gray-600">
                                  信用卡往來異常
                                </div>
                                <div className="font-medium text-right">
                                  {flags.cardAbnormal ? (
                                    <span className="px-2 py-1 bg-red-600 text-white rounded shadow">
                                      異常 ({dateFor(3)})
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">無</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  )}

                  {/* Business tab: show recent transfers and card auths */}
                  {activeTab === "business" && selectedCustomer && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className={SUBCARD}>
                        <div className="font-bold mb-2">近五筆轉帳</div>
                        <div className="space-y-2 text-sm">
                          {generateRecentTransfers(selectedCustomer, 5).map(
                            (t, i) => (
                              <div key={i} className={SUBCARD}>
                                <div className="flex justify-between border-b pb-1">
                                  <div className="font-medium">
                                    {t.merchant}
                                  </div>
                                  <div className="text-right font-medium">
                                    {t.amount}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {t.time}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className={SUBCARD}>
                        <div className="font-bold mb-2">
                          近五筆信用卡授權明細
                        </div>
                        <div className="space-y-2 text-sm">
                          {generateRecentCardAuths(selectedCustomer, 5).map(
                            (t, i) => (
                              <div key={i} className={SUBCARD}>
                                <div className="flex justify-between border-b pb-1">
                                  <div className="font-medium">
                                    {t.merchant}
                                  </div>
                                  <div className="text-right font-medium">
                                    {t.amount}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {t.time}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactions tab: ensure 3-6 interactions and show customer service records */}
                  {activeTab === "interactions" && selectedCustomer && (
                    <div className="mt-4 space-y-3">
                      <div id="interaction-pending" className={SUBCARD}>
                        <div className="font-bold mb-2">通路互動紀錄</div>
                        {(() => {
                          const rawCh = generateCustomerInteractions(selectedCustomer, 5, 7);
                          const parseTS2 = (s) => { const d = new Date(s.replace(/\//g, "-")); return isNaN(d) ? 0 : d.getTime(); };
                          const maxTime = Math.max(...rawCh.map(it => parseTS2(it.time)));
                          const custSeed = seedFromId(selectedCustomer);
                          const showPending = selectedCustomer.id === 'C001' || custSeed % 3 === 0;
                          let pendingAssigned = false;
                          const ch = rawCh.map((it) => {
                            const isNewest = showPending && !pendingAssigned && parseTS2(it.time) === maxTime;
                            if (isNewest) pendingAssigned = true;
                            return { ...it, status: isNewest ? "處理中" : "已發生", customerId: selectedCustomer.id, ...(isNewest && selectedCustomer.id === 'C001' ? { detail: "消費爭議款處理" } : {}) };
                          });
                          return (
                            <InteractionTimeline
                              items={ch}
                              onItemClick={(item) => {
                                setSelectedInteractionItem(item);
                                setShowEventModal(true);
                              }}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Rating tab: contribution and investment-attribute blocks */}
                  {activeTab === "rating" && selectedCustomer && (
                    <div className="mt-4 space-y-4">
                      <div className={SUBCARD}>
                        <h4 className="font-bold text-md mb-2 text-gray-800">
                          客戶貢獻度
                        </h4>
                        {(() => {
                          const f = getCustomerFinance(selectedCustomer);
                          const cardFees = Math.round(
                            ((f.cardSpend3M || 0) / 3) * 0.005
                          ); // approx interchange/fees
                          const depositMargin = Math.round(
                            (f.liquid || 0) * 0.001
                          ); // margin
                          const wealthFees = Math.round(
                            (f.invest || 0) * 0.002
                          );
                          const loanInterest = Math.round((f.loan || 0) * 0.03);
                          const investmentFees = Math.round(
                            (f.invest || 0) * 0.0015
                          );
                          const total = Math.max(
                            1,
                            cardFees +
                              depositMargin +
                              wealthFees +
                              loanInterest +
                              investmentFees
                          );
                          const pct = (v) =>
                            `${Math.round((v / total) * 100)}%`;
                          return (
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  信用卡手續費 / 年費估值
                                </div>
                                <div className="font-medium text-right">
                                  NT$ {cardFees.toLocaleString()}{" "}
                                  <span className="text-xs text-gray-500">
                                    ({pct(cardFees)})
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  存款利差貢獻
                                </div>
                                <div className="font-medium text-right">
                                  NT$ {depositMargin.toLocaleString()}{" "}
                                  <span className="text-xs text-gray-500">
                                    ({pct(depositMargin)})
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  財富管理/顧問費用
                                </div>
                                <div className="font-medium text-right">
                                  NT$ {wealthFees.toLocaleString()}{" "}
                                  <span className="text-xs text-gray-500">
                                    ({pct(wealthFees)})
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  貸款利息貢獻
                                </div>
                                <div className="font-medium text-right">
                                  NT$ {loanInterest.toLocaleString()}{" "}
                                  <span className="text-xs text-gray-500">
                                    ({pct(loanInterest)})
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <div className="text-gray-600">
                                  投資相關手續費
                                </div>
                                <div className="font-medium text-right">
                                  NT$ {investmentFees.toLocaleString()}{" "}
                                  <span className="text-xs text-gray-500">
                                    ({pct(investmentFees)})
                                  </span>
                                </div>
                              </div>
                              <div className="pt-2 text-xs text-gray-500">
                                總估計年度貢獻: NT$ {total.toLocaleString()}
                                （近似值，用於客戶價值排序）
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className={SUBCARD}>
                        <h4 className="font-bold text-md mb-2 text-gray-800">
                          客戶投資屬性資訊
                        </h4>
                        {(() => {
                          const s = seedFromId(selectedCustomer) + 4242;
                          const modes = [
                            "保守型",
                            "穩健型",
                            "積極型",
                            "高度積極",
                          ];
                          const mode = modes[s % modes.length];
                          const updated = new Date(
                            2021 + (s % 4),
                            (s >> 2) % 12,
                            ((s >> 3) % 26) + 1
                          ).toLocaleDateString();
                          const proInvestor = Boolean((s >> 5) & 1);
                          return (
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">投資屬性</div>
                                <div className="font-medium text-right">
                                  {mode}
                                </div>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <div className="text-gray-600">
                                  投資屬性更新日期
                                </div>
                                <div className="font-medium text-right">
                                  {updated}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <div className="text-gray-600">
                                  專業投資人註記
                                </div>
                                <div className="font-medium text-right">
                                  {proInvestor ? (
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                                      是
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">否</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Customer Tags View */}
          {activeTab === "tags" && renderCustomerTags()}

          {/* Customer Preferences View */}
          {activeTab === "preferences" && renderCustomerPreferences(selectedCustomer)}

          {/* Debug: show currentData summary to diagnose missing sections */}
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
            <div className="font-medium mb-1">除錯資訊</div>
            <div>
              activeTab: <strong>{activeTab}</strong>
            </div>
            <div>
              currentData.title:{" "}
              <strong>{currentData && currentData.title}</strong>
            </div>
            <div>
              sections:{" "}
              <strong>
                {currentData && Array.isArray(currentData.sections)
                  ? currentData.sections.map((s) => s.name).join(" | ")
                  : "[]"}
              </strong>
            </div>
            <div className="mt-2">
              selectedCustomer (編號/姓名):{" "}
              <strong>
                {selectedCustomer?.id} / {selectedCustomer?.name}
              </strong>
            </div>
          </div>
        </div>
      );
    } catch (e) {
      console.error("renderDetailView error", e);
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          <div className="font-bold mb-2">錯誤：無法顯示客戶詳細資料</div>
          <div className="text-xs text-gray-700 mb-2">
            請張貼瀏覽器 console 或終端機錯誤訊息以便進一步診斷。
          </div>
          <pre className="text-xs whitespace-pre-wrap bg-white p-2 rounded text-gray-800">
            {JSON.stringify(
              {
                error: (e && e.message) || e,
                selectedCustomer: selectedCustomer,
              },
              null,
              2
            )}
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white p-6 font-sans text-sm text-gray-800">
      <div className="max-w-7xl mx-auto">
        {isLoggedIn && renderTopBar()}

        {/* Login gate */}
        {!isLoggedIn && (
          <div className="flex items-center justify-center mb-6">
            <div className={`${CARD} w-full max-w-md`}>
              <h2 className="text-lg font-semibold mb-2">
                登入客戶 360 戰情室
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700">使用者</label>
                  <input
                    className="mt-1 px-3 py-2 border rounded w-full"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="請輸入使用者代號"
                    onKeyDown={(e) => { if (e.key === "Enter") { if (loginUser === "demo" && loginPass === "demo") { setCurrentRole("manager"); setShowMaskedData(true); setIsLoggedIn(true); setLoginError(""); setActiveModule("search"); } else { setLoginError("登入失敗：請使用 demo / demo。"); } } }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">密碼</label>
                  <input
                    type="password"
                    className="mt-1 px-3 py-2 border rounded w-full"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="請輸入密碼"
                    onKeyDown={(e) => { if (e.key === "Enter") { if (loginUser === "demo" && loginPass === "demo") { setCurrentRole("manager"); setShowMaskedData(true); setIsLoggedIn(true); setLoginError(""); setActiveModule("search"); } else { setLoginError("登入失敗：請使用 demo / demo。"); } } }}
                  />
                </div>
                {loginError && (
                  <div className="text-sm text-red-600">{loginError}</div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
                    onClick={() => {
                      if (loginUser === "demo" && loginPass === "demo") {
                        setCurrentRole("manager");
                        setShowMaskedData(true);
                        setIsLoggedIn(true);
                        setLoginError("");
                        setActiveModule("search");
                      } else {
                        setLoginError("登入失敗：請使用 demo / demo。");
                      }
                    }}
                  >
                    登入
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm text-gray-700"
                      onClick={() => {
                        setCurrentRole("manager");
                        setShowMaskedData(true);
                        setIsLoggedIn(true);
                        setLoginError("");
                        setActiveModule("search");
                      }}
                    >
                      以<span className="font-semibold">主管</span>身分進入
                    </button>
                    <button
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm text-gray-700"
                      onClick={() => {
                        setCurrentRole("specialist");
                        setShowMaskedData(true);
                        setIsLoggedIn(true);
                        setLoginError("");
                        setActiveModule("search");
                      }}
                    >
                      以<span className="font-semibold">專員</span>身分進入
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  提示: demo / demo 可直接登入。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top bar now contains the module buttons and logout; lower duplicate removed */}

        {isLoggedIn ? (
          <div>
            {(() => {
              switch (activeModule) {
                case "search":
                  return renderSearchModule();
                case "filter":
                  return renderFilterModule();
                case "dashboard":
                  return renderDashboardModule();
                case "permission":
                  return renderPermissionModule();
                case "detail":
                  return renderDetailView();
                default:
                  return (
                    <div className="bg-white p-4 rounded-lg shadow text-sm text-gray-600">
                      選取的模組尚未實作或無內容
                    </div>
                  );
              }
            })()}
          </div>
        ) : null}
        {showEventModal && selectedInteractionItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  服務紀錄明細
                </h3>
                <button
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedInteractionItem(null);
                  }}
                >
                  關閉
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">服務時間</span>
                  <span className="font-medium">
                    {selectedInteractionItem.time}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">服務通路</span>
                  <span className="font-medium">
                    {selectedInteractionItem.channel}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">服務項目</span>
                  <span className="font-medium text-right ml-4">
                    {selectedInteractionItem.detail}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">處理狀態</span>
                  <span className="font-medium">
                    {selectedInteractionItem.status || "—"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">服務員編</span>
                  <span className="font-medium">
                    {selectedInteractionItem.agentId || "E00000"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">客戶編號</span>
                  <span className="font-medium">
                    {selectedInteractionItem.customerId || selectedCustomer?.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {showExportModal && renderExportModal()}
        {showLogoutConfirm && renderLogoutConfirm()}
      </div>
    </div>
  );
};

export default CUS360Demo;
