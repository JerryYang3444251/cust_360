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
      <div className="space-y-4">
        {/* 報表區間選單 */}
        <div className="flex items-end gap-3">
          <div className="text-sm font-bold text-gray-700">報表區間</div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="px-2 py-1 border rounded"
            />
            <span className="text-gray-600">至</span>
            <input
              type="month"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="px-2 py-1 border rounded"
            />
          </div>
          <div className="text-xs text-gray-500">所有圖表依月份區間更新</div>
        </div>
        <div className="grid grid-cols-6 gap-4">
          <div
            className={
              CARD +
              " col-span-2 border border-teal-100 hover:shadow-lg transition-shadow"
            }
          >
            <div className="space-y-2">
              <div className="text-sm font-bold text-gray-700 tracking-wide">
                總客戶數
              </div>
              <div className={`${KPI_NUM} text-teal-600`}>
                {scaled.total.toLocaleString()}
              </div>
              {/* 移除以樣本比例推估銀行規模 */}
              <div className="mt-3 text-sm font-bold text-gray-700">
                活躍客戶 (最近 3 個月有交易)
              </div>
              <div className={`${KPI_NUM} text-teal-600`}>
                {scaled.active.toLocaleString()}
              </div>
            </div>
          </div>
          <div
            className={
              CARD +
              " col-span-2 border border-teal-100 hover:shadow-lg transition-shadow"
            }
          >
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              收益與 KPI
            </div>
            <div className="mt-3 space-y-2">
              <div className="text-xs font-bold text-gray-600">
                收益趨勢 (月)
              </div>
              <div className="mt-1">
                <MonthlyBarHover
                  values={revSeries}
                  color="#0d9488"
                  height={64}
                  labels={monthLabels}
                />
              </div>
              {/* 移除 季均收益 (估) */}
            </div>
          </div>
          <div
            className={
              CARD +
              " col-span-2 border border-teal-100 hover:shadow-lg transition-shadow"
            }
          >
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              產品收益佔比
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-shrink-0">
                <DonutInteractive
                  data={Object.entries(productShare).map(([label, value]) => ({
                    label,
                    value,
                  }))}
                  colors={["#0d9488", "#06b6d4", "#34d399", "#7dd3fc"]}
                  size={96}
                />
              </div>
              <div className="flex-1 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(productShare).map(([k, v], idx) => (
                    <div key={k} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: [
                            "#0d9488",
                            "#06b6d4",
                            "#34d399",
                            "#7dd3fc",
                          ][idx % 4],
                        }}
                      ></span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-600">
                          {k}
                        </div>
                        <div className={`${KPI_NUM} text-teal-600`}>{v}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          <div
            className={
              CARD +
              " col-span-3 border border-teal-100 hover:shadow-lg transition-shadow"
            }
          >
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              授信與風險重點
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs font-bold text-gray-600">DPD30</div>
                <div className={`${KPI_NUM} text-teal-600`}>
                  {credit.dpd30}%
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-600">不良率</div>
                <div className={`${KPI_NUM} text-teal-600`}>
                  {credit.nplRate}%
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-600">
                  平均使用率
                </div>
                <div className={`${KPI_NUM} text-teal-600`}>
                  {credit.avgUtil}%
                </div>
              </div>
            </div>
          </div>
          <div
            className={
              CARD +
              " col-span-3 border border-teal-100 hover:shadow-lg transition-shadow"
            }
          >
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              授信活動趨勢 (月)
            </div>
            <div className="mt-2 -mx-1">
              <MonthlyBarHover
                values={Array.from({ length: monthCount }, (_, i) =>
                  Math.round(
                    1000 + 200 * Math.sin((i / 12) * 2 * Math.PI) + i * 10
                  )
                )}
                color="#0f766e"
                height={64}
                labels={monthLabels}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            className={
              CARD + " border border-teal-100 hover:shadow-lg transition-shadow"
            }
          >
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              客戶等級分布
            </div>
            <div className="mt-3">
              {/* compute counts and render pie */}
              {(() => {
                // Updated tiers: 一般、VIP、VVIP、VVVIP (Chinese labels match keys)
                const tiers = ["normal", "VIP", "VVIP", "VVVIP"];
                const labels = {
                  normal: "一般",
                  VIP: "VIP",
                  VVIP: "VVIP",
                  VVVIP: "VVVIP",
                };
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
                  <div className="flex items-center gap-4">
                    <DonutInteractive
                      data={segs.map((s) => ({ label: s.label, value: s.pct }))}
                      colors={colors}
                      size={96}
                    />
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {segs.map((s, i) => (
                        <div key={s.key} className="flex items-start gap-2">
                          <span
                            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: colors[i % colors.length] }}
                          ></span>
                          <div>
                            <div className="text-xs font-bold text-gray-600 leading-tight">
                              {s.label}
                            </div>
                            <div className={`${KPI_NUM} text-teal-600 leading-none mt-0.5`}>
                              {s.pct}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div
            className={
              CARD + " border border-teal-100 hover:shadow-lg transition-shadow"
            }
          >
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              近 3 個月互動趨勢
            </div>
            <div className="mt-2">
              <MonthlyBarHover
                values={Array.from(
                  { length: 3 },
                  (_, i) =>
                    (getCustomerFinance(mockCustomers[i % mockCustomers.length])
                      .monthlyIncome || 0) +
                    i * 500
                )}
                color="#0ea5a3"
                height={64}
                labels={["1月", "2月", "3月"]}
              />
            </div>
          </div>
          <div
            className={
              CARD + " border border-teal-100 hover:shadow-lg transition-shadow"
            }
          >
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              重點指標快覽
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-gray-600">本月新戶</div>
                <div className={`${KPI_NUM} text-teal-600`}>
                  {Math.round(BASE_TOTAL * 0.002).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">本月貸款申請</div>
                <div className={`${KPI_NUM} text-teal-600`}>
                  {Math.round(BASE_TOTAL * 0.004).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">月均刷卡額</div>
                <div className={`${KPI_NUM} text-teal-600`}>
                  NT${" "}
                  {Math.round(
                    revSeries.reduce((a, b) => a + b, 0) /
                      Math.max(1, revSeries.length) /
                      1000
                  ).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">預估流失率</div>
                <div className={`${KPI_NUM} text-teal-600`}>
                  {Math.round(
                    ((mockCustomers.length * 0.02) / totalSample) * 100
                  )}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // deterministic mock customers (small, used to derive proportions)
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
      tags: ["投資理財", "狀態調整-有效戶"],
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
      tags: ["高風險客戶", "失效戶"],
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
      tags: ["數位通路使用者", "狀態調整-有效戶"],
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
      tags: ["家庭導向", "狀態調整-有效戶"],
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
      tags: ["房貸需求", "穩定收入", "線上試算偏好", "房貸意圖"],
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
      riskScore: "B",
      riskLevel: "medium",
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
        { name: "客戶等級資訊", data: [{ label: "VIP等級", value: "VIP" }] },
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
          name: "消費類別偏好",
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
    const q = normalize(qRaw);
    if (!qRaw) {
      setSearchPerformed(true);
      setSearchResults([]);
      setSelectedCustomer(null);
      return;
    }

    // Exact match against the selected identifier field only (no fuzzy fallback)
    const fieldMap = {
      idCard: "idCard",
      creditCard: "creditCard",
      accountNumber: "accountNumber",
    };
    const field = fieldMap[searchType] || "idCard";
    const found = mockCustomers.filter((c) => normalize(c[field]) === q);

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
            <div className="max-w-xl mx-auto">
              <input
                className="w-full rounded-full px-4 py-2 bg-white bg-opacity-20 placeholder-white/80 border border-white/10"
                placeholder="快速搜尋: 身分證/卡號/帳號..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-white/90">林經理 (008)</div>
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
        has = (customer.tags || []).some(n => n === cond.tag);
      } else {
        has = (customer.structuredTags || []).some(t => (!cond.category || t.category === cond.category) && t.name === cond.tag);
      }
      const val = cond.op === 'NOT' ? !has : has;
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
    return Boolean(overall);
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
  const [searchType, setSearchType] = useState("idCard");
  const [searchResults, setSearchResults] = useState([]);
  const [showMaskedData, setShowMaskedData] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
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

  // Generate a concise assistant reply using available customer signals
  const generateAssistantReply = (prompt, customer) => {
    if (!customer) return "目前未選擇客戶。請先在左側選擇或搜尋客戶。";
    const topChannel = getTopPreferenceForCustomer("通路偏好", "score", customer);
    const topProduct = getTopPreferenceForCustomer("產品偏好", "score", customer);
    const topConsumption = getTopPreferenceForCustomer("消費類別偏好", "score", customer);
    const intent = getTopIntentTag && getTopIntentTag();
    const f = getCustomerFinance(customer);
    const vip = customer.vipLevel || "normal";
    const risk = customer.riskLevel || "medium";
    const nat = customer.nationality || "";
    const personType = nat === "中華民國" ? "本國人" : (nat ? "外國人" : "");
    const chText = topChannel ? channelLabel(topChannel.channel || topChannel.name) : "慣用通路";
    // Derive a single, consistent primary product for the whole recommendation
    let prodText = topProduct ? (topProduct.product || topProduct.name) : "核心產品";
    const intentName = intent ? intent.name : "";
    const normalizeProd = (s) => (s || "").toLowerCase();
    const isTravelIntent = /旅遊|出國/.test(intentName || "");
    const prefersCard = normalizeProd(prodText).includes("card") || /信用卡|卡|card/.test(prodText);
    // If travel intent and not already card-focused, steer to信用卡一體化方案
    if (isTravelIntent && !prefersCard) prodText = "信用卡旅遊權益方案";
    // If deposits/wealth intent conflicts with loans, keep deposits/wealth consistent for low risk
    const isWealthLike = /投資|基金|wealth|理財/.test(prodText);
    if (risk === 'low' && /貸款|loan/.test(prodText)) prodText = isWealthLike ? prodText : "穩健理財/定存加值";
    const consText = topConsumption ? (topConsumption.category || topConsumption.name) : "主要消費類別";
    const intentText = intent ? intent.name : "近期需求";

    const lower = (prompt || "").toLowerCase();
    const wantScript = /話術|script|怎麼說|推銷|推薦/.test(prompt || "");
    const wantRisk = /風險|risk/.test(lower);
    const wantSummary = /摘要|summary|概況|overview/.test(lower);

    // Determine product type for coherent messaging
    const prodLower = (prodText || '').toLowerCase();
    const isCreditCard = /信用卡|card/.test(prodText) || prodLower.includes('card');
    const isLoan = /貸款|loan/.test(prodText);
    const isWealth = /理財|投資|基金|wealth/.test(prodText);
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
    out.push('🧩 客戶摘要');
    out.push(
      [
        `年齡/族群：${customer.age||'—'}／${seg}／${vip}`,
        `收入&產業：${incomeBand}；產業：${customer.industry||'—'}`,
        `偏好通路：${chText}`,
        `過去使用產品：${pastPref||'—'}`,
        `行為洞察：${behav||'—'}`,
      ].join('\n')
    );

    out.push('🎯 溝通目標');
    const objective = primaryType === 'card' ? '推薦旅遊信用卡' : primaryType === 'loan' ? '推薦信貸降息方案' : primaryType === 'wealth' ? '旅遊/保險方案交叉銷售' : '邀請申請額度調整';
    out.push(objective);

    out.push('👋 客製化開場白（主開場/簡版）');
    out.push(`主開場：${vipOpen.replace(/^開場：/, '')}`);
    out.push(`簡版開場：您好，我們有一個與您近期需求相符的「${prodText}」方案，可於${chText}快速完成，方便嗎？`);

    out.push('✅ 為何推薦（與客戶資料連結）');
    const reasons = [
      `您近期「${behav||intentText}」的傾向明顯，「${prodText}」可直接滿足此需求。`,
      primaryType==='card' ? `您的「${consText}」消費較多，該卡在該情境享有加碼回饋。` : `您的月收約 NT$${(f.monthlyIncome||0).toLocaleString()}，採用本方案後可更貼近您的現金流安排。`,
      primaryType!=='card' ? `風險等級為${risk}，我們將依適合度評估分段配置。` : `此方案重點在權益與回饋，不涉及投資風險配置。`,
    ];
    out.push(reasons.filter(Boolean).join('\n'));

    out.push('🗣️ 主推話術（可直接口說）');
    const nameForCall = customer.name ? `，${customer.name}` : '';
    let spoken = '';
    if (primaryType === 'card') {
      spoken = `您好${nameForCall}，看您的「${consText}」消費與${intentText || '近期需求'}，我幫您配一張「${prodText}」。這張卡在${consText}與海外都有加碼回饋，權益集中、使用簡單。等一下我可以在${chText}幫您一次設定，流程不用幾分鐘，之後有通知提醒，回饋不會漏。`;
    } else if (primaryType === 'loan') {
      spoken = `您好${nameForCall}，留意到您最近的資金安排需求，這個「${prodText}」可以把月付壓得更穩，費用與期數我會先說清楚，並依適合度幫您試算。現在我可在${chText}替您送出預審，幾分鐘就好，您覺得如何？`;
    } else if (primaryType === 'wealth') {
      spoken = `您好${nameForCall}，基於您的風險等級${risk}與${intentText || '理財'}規劃，我們先用「${prodText}」做穩健配置，重點是透明、可調整；有變動我會即時通知。待會我在${chText}帶您完成設定，過程很簡單。`;
    } else {
      spoken = `您好${nameForCall}，根據您的使用習慣，我建議「${prodText}」作為主要方案，搭配您常用的${chText}完成設定，之後依您的「${consText}」情境提供加碼提醒。現在幫您處理，方便嗎？`;
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
    // Mask applies when toggle is ON or the field explicitly requests masking
    if (!showMaskedData && !force) return value;
    if (!value) return value;
    const l = label || "";
    if (force) {
      // best-effort based on label types
      if (/郵件|email/i.test(l)) return maskEmail(value);
      if (/手機|電話/.test(l)) return maskPhone(value);
      if (/地址/.test(l)) return maskAddress(value);
      if (/證件號|身分證|ID|idCard/i.test(l)) return maskId(value);
      return value;
    }
    if (/郵件|email/i.test(l)) return maskEmail(value);
    if (/手機|電話/.test(l)) return maskPhone(value);
    if (/地址/.test(l)) return maskAddress(value);
    if (/證件號|身分證|ID|idCard/i.test(l)) return maskId(value);
    return value;
  };

  // get highest-confidence intent tag from detailedCustomerData
  const getTopIntentTag = () => {
    try {
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

    // VIP-tier based wealth brackets
    const vipLevel = (customer && customer.vipLevel) || "normal";
    let baseRange, base;
    
    if (vipLevel === "VVVIP") {
      // VVVIP: 5M - 15M
      baseRange = 10000000;
      base = 5000000;
    } else if (vipLevel === "VVIP") {
      // VVIP: 2M - 8M
      baseRange = 6000000;
      base = 2000000;
    } else if (vipLevel === "VIP") {
      // VIP: 800K - 3M
      baseRange = 2200000;
      base = 800000;
    } else {
      // normal: 200K - 1M
      baseRange = 800000;
      base = 200000;
    }
    
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

    const monthlyIncome = Math.round(netWorth / 60 + ((hash >> 3) % 50000));
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

  // Enrichment: derive dynamic riskLevel, accountStatus, preferences and tag scores for realism
  const deriveRiskLevel = (f) => {
    const loanRatio = f.loan / Math.max(1, f.netWorth);
    const utilRatio = f.creditUtilPct / 100; // 0-1
    const spendRatio = f.cardSpend3M / Math.max(1, f.avgMonthlySpend * 3);
    const composite = loanRatio * 0.5 + utilRatio * 0.3 + spendRatio * 0.2;
    if (composite < 0.33) return "low";
    if (composite < 0.66) return "medium";
    return "high";
  };
  mockCustomers.forEach((c) => {
    const f = getCustomerFinance(c);
    c.riskLevel = deriveRiskLevel(f);
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
    if (personaIds.has(c.id)) c.riskLevel = "low";
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
    const seed = seedFromId(customer) + 1357;
    const events = [];
    const now = new Date();
    // Deposit maturity (upcoming reminder)
    const d1 = new Date(
      now.getFullYear(),
      now.getMonth() + ((seed % 3) + 1),
      (seed % 28) + 1
    );
    events.push({
      channel: "定存到期",
      time: d1.toLocaleString(),
      detail: "您的定存即將到期，建議評估續存/轉存與利率方案。",
      status: "提醒",
    });
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
    const [hover, setHover] = React.useState(null); // index
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
    const bars = values.map((v, i) => {
      const h = (v / Math.max(1, max)) * (innerH - 4);
      const x = PAD_X + i * segW + (segW - barW) / 2;
      const y = height - PAD_Y - h;
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
          {bars.map((b) => (
            <rect
              key={b.i}
              x={b.x}
              y={b.y}
              width={barW}
              height={b.h}
              rx={2}
              fill={color}
              fillOpacity={hover === b.i ? 0.85 : 0.65}
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
            className="absolute z-10 px-2 py-1 bg-white border rounded shadow text-xs"
            style={{
              left: Math.min(
                Math.max(bars[hover].x + barW / 2 - 40, 4),
                w - 84
              ),
              top: 4,
            }}
          >
            <div className="font-medium text-teal-700">
              {values[hover].toLocaleString()}
            </div>
            <div className="text-gray-500">
              {labels[hover] || `${hover + 1}月`}
            </div>
          </div>
        )}
        <div className="flex justify-between items-start text-xs mt-1 text-gray-600">
          {(labels.length ? labels : values.map((_, i) => `${i + 1}月`)).map(
            (m, i) => (
              <div
                key={i}
                className="text-center"
                style={{ width: `${100 / values.length}%` }}
              >
                <div className="text-gray-500">{m}</div>
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
    if (!data.length)
      return <div className="text-xs text-gray-500">無資料</div>;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const cx = 21;
    const cy = 21;
    const outerR = 15.9155;
    const innerR = outerR * innerRatio;
    let acc = 0;
    const segments = data.map((d, i) => {
      const pct = d.value / total;
      const start = acc;
      const end = acc + pct;
      acc = end;
      return { ...d, pctFrac: pct, startFrac: start, endFrac: end, i };
    });
    const describeSeg = (startFrac, endFrac) => {
      const startAngle = startFrac * Math.PI * 2 - Math.PI / 2;
      const endAngle = endFrac * Math.PI * 2 - Math.PI / 2;
      const x0 = cx + outerR * Math.cos(startAngle);
      const y0 = cy + outerR * Math.sin(startAngle);
      const x1 = cx + outerR * Math.cos(endAngle);
      const y1 = cy + outerR * Math.sin(endAngle);
      const x2 = cx + innerR * Math.cos(endAngle);
      const y2 = cy + innerR * Math.sin(endAngle);
      const x3 = cx + innerR * Math.cos(startAngle);
      const y3 = cy + innerR * Math.sin(startAngle);
      const largeArcOuter = endAngle - startAngle > Math.PI ? 1 : 0;
      const largeArcInner = largeArcOuter; // same span
      return `M ${x0} ${y0} A ${outerR} ${outerR} 0 ${largeArcOuter} 1 ${x1} ${y1} L ${x2} ${y2} A ${innerR} ${innerR} 0 ${largeArcInner} 0 ${x3} ${y3} Z`;
    };
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 42 42">
          {segments.map((s, i) => {
            const d = describeSeg(s.startFrac, s.endFrac);
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
          <div className="absolute left-1 top-1 px-2 py-1 bg-white border rounded shadow text-xs">
            <div className="font-medium text-teal-700">
              {segments[hoverIdx].label}
            </div>
            <div className="text-gray-500">
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
                <option value="idCard">證件號碼</option>
                <option value="creditCard">信用卡號</option>
                <option value="accountNumber">存款帳號</option>
              </select>

              <input
                type="text"
                placeholder="輸入選擇的識別號 (精準比對，不支援模糊)"
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
              請選擇一種識別號並輸入完整號碼以查得客戶。
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

          {/* 提示：若尚未查詢，顯示建議客戶樣本供點選 */}
          {!searchPerformed && (
            <div className="p-2 text-sm text-gray-600">
              建議客戶 (點選以查看明細)
            </div>
          )}

          {uniqueById(
            searchResults ||
              (!searchPerformed && mockCustomers.slice(0, 5)) ||
              []
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
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  {(() => {
                    const ch = getTopPreference(
                      "通路偏好",
                      "usage",
                      customer
                    );
                    const pd = getTopPreference(
                      "產品偏好",
                      "score",
                      customer
                    );
                    const intent = getTopIntentTag();
                    return (
                      <>
                        {ch && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                            通路: {channelLabel(ch.name || ch.channel)}
                          </span>
                        )}
                        {pd && (
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-full">
                            產品: {pd.name}
                          </span>
                        )}
                        {intent && (
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-full">
                            意圖: {intent.name}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    customer.vipLevel === "VVIP"
                      ? "bg-purple-100 text-purple-800"
                      : customer.vipLevel === "VIP"
                      ? "bg-blue-100 text-blue-800"
                      : customer.vipLevel === "VVVIP"
                      ? "bg-fuchsia-100 text-fuchsia-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {customer.vipLevel === "normal" ? "一般" : customer.vipLevel}
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
                <option value="vvip">VVIP</option>
                <option value="vip">VIP</option>
                <option value="normal">一般客戶</option>
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
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>2024/11/27 14:30:25</span>
              <span className="text-gray-600">查詢客戶 C001</span>
              <span className="ml-auto text-blue-600">使用者: E12345</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>2024/11/27 14:25:10</span>
              <span className="text-gray-600">匯出客戶名單</span>
              <span className="ml-auto text-blue-600">使用者: E12345</span>
            </div>
          </div>
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

  const renderRelationships = () => (
    <div className={SUBCARD}>
      <h4 className="text-lg font-semibold text-gray-800 mb-3">
        客戶關係人資訊
      </h4>
      <div className="space-y-3">
        <div className={SUBCARD}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-md">李美珍</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-sm">
                  配偶
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm ml-8">
                <div>
                  <span className="text-gray-600">關係人客戶編號: </span>
                  <span className="font-medium">C005</span>
                </div>
                <div>
                  <span className="text-gray-600">關係起日: </span>
                  <span className="font-medium">2015/06/20</span>
                </div>
                <div>
                  <span className="text-gray-600">聯絡電話: </span>
                  <span className="font-medium">0923-456-789</span>
                </div>
                <div>
                  <span className="text-gray-600">關係狀態: </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    有效
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={SUBCARD}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-md">王志明</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  子女
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm ml-8">
                <div>
                  <span className="text-gray-600">年齡: </span>
                  <span className="font-medium">8歲</span>
                </div>
                <div>
                  <span className="text-gray-600">關係起日: </span>
                  <span className="font-medium">2017/03/15</span>
                </div>
                <div>
                  <span className="text-gray-600">受益人註記: </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    是
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">關係狀態: </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    有效
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={SUBCARD}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-md">王小華</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  子女
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm ml-8">
                <div>
                  <span className="text-gray-600">年齡: </span>
                  <span className="font-medium">5歲</span>
                </div>
                <div>
                  <span className="text-gray-600">關係起日: </span>
                  <span className="font-medium">2020/08/22</span>
                </div>
                <div>
                  <span className="text-gray-600">受益人註記: </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    是
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">關係狀態: </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    有效
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={SUBCARD}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-md">張專員 (E12345)</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                  經管人員
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm ml-8">
                <div>
                  <span className="text-gray-600">經管分行: </span>
                  <span className="font-medium">信義分行</span>
                </div>
                <div>
                  <span className="text-gray-600">關係起日: </span>
                  <span className="font-medium">2023/01/10</span>
                </div>
                <div>
                  <span className="text-gray-600">在職狀況: </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    在職
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">理專註記: </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    是
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

  const renderCustomerTags = () => {
    const tagsData = detailedCustomerData.tags;
    const categories = Object.keys(TAG_CATEGORIES);
    return (
      <div className={CARD}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {tagsData.title}
        </h3>
        <div className="space-y-6">
          {tagsData.sections.map((section, idx) => (
            <div key={idx} className={SUBCARD}>
              <h4 className="font-bold text-lg mb-4 text-gray-800">
                {section.name}
              </h4>

              {section.tags && (
                <div className="space-y-4">
                  {section.name && section.name.includes("意圖標籤") ? (
                    <div className="space-y-3">
                      {section.tags.map((tag, tagIdx) => {
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
                        return (
                          <div
                            key={tagIdx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${badgeCls}`}
                              >
                                {tag.name}
                              </span>
                              <span className="text-sm text-gray-600">
                                信心度:{" "}
                                {tag.confidence ||
                                  Math.round((tag.score || 0) * 100) + "%"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-teal-200 to-teal-600"
                                  style={{
                                    width: `${Math.max(
                                      6,
                                      Math.round((tag.score || 0) * 100)
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {Math.max(
                                  6,
                                  Math.round((tag.score || 0) * 100)
                                )}
                                %
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

  const renderCustomerPreferences = () => {
    const prefsData = detailedCustomerData.preferences || {
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
              // skip consuming section here; we'll render it immediately after the marketing consent section
              if (section.name && section.name.includes("消費")) return null;

              // When we hit the marketing consent section, render it and then render the consumption SUBCARD below it
              if (section.name && section.name.includes("行銷")) {
                const consumption = (prefsData.sections || []).find(
                  (s) => s.name && s.name.includes("消費")
                );
                return (
                  <React.Fragment key={sIdx}>
                    <div className={SUBCARD}>
                      <h4 className="font-bold text-lg mb-4 text-gray-800">
                        {section.name}
                      </h4>
                      {section.preferences &&
                        section.preferences.length > 0 && (
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

                    {/* consumption SUBCARD placed immediately after marketing consent */}
                    {consumption &&
                      Array.isArray(consumption.preferences) &&
                      consumption.preferences.length > 0 && (
                        <div className={SUBCARD}>
                          <h4 className="font-bold text-lg mb-4 text-gray-800">
                            {consumption.name || "消費類別偏好"}
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {consumption.preferences.map((item, i) => (
                              <div
                                key={i}
                                className="p-2 bg-gray-50 rounded-md text-xs"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium truncate">
                                    {item.category || item.name}
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {item.score || item.percentage || ""}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-teal-200 to-teal-600"
                                    style={{
                                      width:
                                        item.score || item.percentage || "0%",
                                    }}
                                  ></div>
                                </div>
                                {item.amount && (
                                  <div className="mt-1 text-[11px] text-gray-600">
                                    {item.amount}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </React.Fragment>
                );
              }

              // default rendering for other sections
              return (
                <div key={sIdx} className={SUBCARD}>
                  <h4 className="font-bold text-lg mb-4 text-gray-800">
                    {section.name}
                  </h4>

                  {/* Product preferences */}
                  {section.preferences &&
                    section.preferences.length > 0 &&
                    section.name.includes("產品") && (
                      <div className="grid grid-cols-3 gap-2">
                        {section.preferences.map((item, i) => (
                          <div
                            key={i}
                            className="p-2 bg-gray-50 rounded-md text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">
                                {item.product || item.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  parsePercent(item.score) >= 80
                                    ? "bg-teal-100 text-teal-800"
                                    : parsePercent(item.score) >= 60
                                    ? "bg-teal-50 text-teal-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {getPreferenceLabel(item.score)}
                              </span>
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
                              <div className="text-xs text-gray-500 mt-1">
                                {item.note}
                              </div>
                            )}
                          </div>
                        ))}
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
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  parsePercent(item.score) >= 80
                                    ? "bg-teal-100 text-teal-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {getPreferenceLabel(item.score || item.usage)}
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
                </div>
              );
            })}

            {/* consumption is rendered immediately after the marketing consent section to avoid duplication */}

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

  const renderDetailView = () => {
    if (!selectedCustomer)
      return (
        <div className="p-2 text-sm text-gray-500">
          請從左側或搜尋結果選擇客戶以檢視詳細資料。
        </div>
      );

    // Dynamically generate customer-specific basic info instead of using hardcoded detailedCustomerData
    const generateCustomerBasicInfo = (customer) => {
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
        contact: detailedCustomerData.contact,
        risk: detailedCustomerData.risk,
        financial: detailedCustomerData.financial,
      };
    };

    const currentData = (generateCustomerBasicInfo(selectedCustomer)[activeTab] || detailedCustomerData[activeTab]) || {
      title: "",
      sections: [],
    };

    // compute top preferences for this selected customer (fallbacks to demo-level)
    const topChannel = getTopPreference(
      "通路偏好",
      "score",
      selectedCustomer
    );
    const topProduct = getTopPreference(
      "產品偏好",
      "score",
      selectedCustomer
    );
    const topConsumption = getTopPreference(
      "消費類別偏好",
      "score",
      selectedCustomer
    );
    const topIntent = getTopIntentTag();
    // simulated finance and marketing signals
    const f = getCustomerFinance(selectedCustomer);

    try {
      return (
        <div className="space-y-2">
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
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        selectedCustomer?.vipLevel === "VVIP"
                          ? "bg-teal-700 text-white"
                          : selectedCustomer?.vipLevel === "VIP"
                          ? "bg-teal-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {selectedCustomer?.vipLevel}
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
                    {topChannel && (
                      <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium self-end">
                        通路偏好:{" "}
                        {channelLabel(topChannel.channel || topChannel.name)} (
                        {topChannel.score || topChannel.usage || ""})
                      </span>
                    )}
                    {topProduct && (
                      <span className="px-2 py-1 bg-teal-50 text-teal-800 rounded-full text-sm font-medium self-end">
                        產品偏好: {topProduct.product || topProduct.name} (
                        {topProduct.score || ""})
                      </span>
                    )}
                    {topConsumption && (
                      <span className="px-2 py-1 bg-teal-50 text-teal-800 rounded-full text-sm font-medium self-end">
                        消費類別偏好: {topConsumption.category || topConsumption.name} (
                        {topConsumption.score || ""})
                      </span>
                    )}
                    {topIntent && (
                      <span className="px-2 py-1 bg-teal-200 text-teal-900 rounded-full text-sm font-medium self-end">
                        意圖: {topIntent.name} (
                        {Math.round((topIntent.score || 0) * 100)}%)
                      </span>
                    )}
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
                <div className="p-2 border-t flex items-center gap-2">
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
                          const flags = {
                            blacklist: Boolean(s & 1),
                            depositAlert: Boolean((s >> 1) & 1),
                            courtSeizure: Boolean((s >> 2) & 1),
                            overdueCollection: Boolean((s >> 3) & 1),
                            guaranteeAbnormal: Boolean((s >> 4) & 1),
                            cardAbnormal: Boolean((s >> 5) & 1),
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
                      <div className={SUBCARD}>
                        <div className="font-bold mb-2">通路互動紀錄</div>
                        {(() => {
                          const ch = generateCustomerInteractions(
                            selectedCustomer,
                            5,
                            7
                          ).map((it, i) => ({
                            ...it,
                            status: "已發生",
                            customerId: selectedCustomer.id,
                          }));
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
          {activeTab === "preferences" && renderCustomerPreferences()}

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
                  />
                </div>
                {loginError && (
                  <div className="text-sm text-red-600">{loginError}</div>
                )}
                <div className="flex gap-2 justify-end">
                  {/* removed demo-fill button per request */}
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    onClick={() => {
                      if (loginUser === "demo" && loginPass === "demo") {
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
                  <button
                    className="px-3 py-1 rounded border"
                    onClick={() => {
                      setIsLoggedIn(true);
                      setLoginError("");
                      setActiveModule("search");
                    }}
                  >
                    以訪客身分進入
                  </button>
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
