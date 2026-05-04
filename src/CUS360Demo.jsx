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

// ── CustomerProductTree ────────────────────────────────────────────────────
// Hierarchical product tree: L1 → L2 → L4-group (grouped by type, detail panel inside).
// Same-type products are grouped under one row; expanding shows all instances stacked.
// Defined outside CUS360Demo so the component reference is stable and
// React does NOT unmount/remount it on every parent re-render.
const CustomerProductTree = ({ products = [], layout = "vertical" }) => {
  const [expanded, setExpanded] = React.useState({});
  const toggle = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // Build L1 → L2 → L4label → [products]  (group same-type together)
  const tree = {};
  products.forEach((p) => {
    if (!tree[p.l1]) tree[p.l1] = {};
    if (!tree[p.l1][p.l2]) tree[p.l1][p.l2] = {};
    if (!tree[p.l1][p.l2][p.l4]) tree[p.l1][p.l2][p.l4] = [];
    tree[p.l1][p.l2][p.l4].push(p);
  });

  const L1_STYLE = {
    存款:  { badge: "bg-teal-100 text-teal-800" },
    信用卡: { badge: "bg-blue-100 text-blue-800" },
    貸款:  { badge: "bg-amber-100 text-amber-800" },
    財管:  { badge: "bg-purple-100 text-purple-800" },
  };

  const Arrow = ({ open }) => (
    <span
      className="text-gray-400 font-bold transition-transform duration-200"
      style={{ display: "inline-block", transform: open ? "rotate(90deg)" : "none" }}
    >
      ›
    </span>
  );

  if (!products.length)
    return <div className="text-sm text-gray-400 py-2">尚無產品資料</div>;

  return (
    <div className={layout === "horizontal" ? "grid grid-cols-4 gap-2" : "space-y-2"}>
      {Object.entries(tree).map(([l1, l2Map]) => {
        const isL1Open = !!expanded[l1];
        // total = number of unique L4 groups (not raw product count)
        const totalGroups = Object.values(l2Map).reduce(
          (s, l4Map) => s + Object.keys(l4Map).length, 0
        );
        const style = L1_STYLE[l1] || { badge: "bg-gray-100 text-gray-700" };
        return (
          <div key={l1} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* L1 row */}
            <button
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                isL1Open ? "bg-teal-50 border-b border-teal-200" : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => toggle(l1)}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style.badge}`}>{l1}</span>
                <span className="text-xs text-gray-500 bg-white border rounded-full px-2 py-0.5">
                  {totalGroups} 項產品
                </span>
              </div>
              <Arrow open={isL1Open} />
            </button>

            {isL1Open && (
              <div className="divide-y divide-gray-100">
                {Object.entries(l2Map).map(([l2, l4Map]) => {
                  const l2key = `${l1}/${l2}`;
                  const isL2Open = !!expanded[l2key];
                  return (
                    <div key={l2}>
                      {/* L2 row */}
                      <button
                        className={`w-full flex items-center justify-between px-5 py-2.5 transition-colors ${
                          isL2Open ? "bg-teal-50/50" : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => toggle(l2key)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                          <span className="font-medium text-gray-700 text-sm">{l2}</span>
                          <span className="text-xs text-gray-400">({Object.keys(l4Map).length})</span>
                        </div>
                        <Arrow open={isL2Open} />
                      </button>

                      {isL2Open && (
                        <div className="ml-4 border-l-2 border-teal-100 pb-2 space-y-1.5 pt-1">
                          {Object.entries(l4Map).map(([l4label, groupItems]) => {
                            const groupKey = `${l1}/${l2}/${l4label}`;
                            const isGroupOpen = !!expanded[groupKey];
                            const hasMultiple = groupItems.length > 1;
                            return (
                              <div
                                key={l4label}
                                className="ml-2 border border-teal-100 rounded-lg overflow-hidden"
                              >
                                {/* L4 group row */}
                                <button
                                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                                    isGroupOpen
                                      ? "bg-teal-600 text-white"
                                      : "bg-teal-50 hover:bg-teal-100 text-gray-700"
                                  }`}
                                  onClick={() => toggle(groupKey)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        isGroupOpen ? "bg-white" : "bg-teal-500"
                                      }`}
                                    />
                                    <span className="font-medium">{l4label}</span>
                                    {hasMultiple && (
                                      <span
                                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                                          isGroupOpen
                                            ? "bg-white/25 text-white"
                                            : "bg-teal-500 text-white"
                                        }`}
                                      >
                                        {groupItems.length}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs px-1.5 py-0.5 rounded ${
                                        isGroupOpen
                                          ? "bg-white/20 text-white"
                                          : "bg-teal-200 text-teal-700"
                                      }`}
                                    >
                                      查看細節資訊
                                    </span>
                                    <span
                                      className="text-sm font-bold transition-transform duration-200"
                                      style={{
                                        display: "inline-block",
                                        transform: isGroupOpen ? "rotate(90deg)" : "none",
                                        color: isGroupOpen ? "white" : "#9ca3af",
                                      }}
                                    >
                                      ›
                                    </span>
                                  </div>
                                </button>

                                {/* Detail panel — stacked if multiple */}
                                {isGroupOpen && (
                                  <div className="bg-white border-t border-teal-100 divide-y divide-gray-100">
                                    {groupItems.map((product, idx) => (
                                      <div key={idx} className="px-3 py-2">
                                        {hasMultiple && (
                                          <div className="text-xs font-semibold text-teal-600 mb-1.5">
                                            第 {idx + 1} 筆
                                          </div>
                                        )}
                                        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                                          {product.details.map((d, di) => (
                                            <div key={di} className="flex flex-col">
                                              <span className="text-gray-400">{d.label}</span>
                                              <span className="font-medium text-gray-800">{d.value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
// ── end CustomerProductTree ────────────────────────────────────────────────

// Hoisted to module scope — same reason as MonthlyBarHover: stable function reference
// prevents React from unmounting/remounting on every parent state change (e.g. tab switch).
// Animation fires when aumSeries data changes (new customer), not on tab switch.
const AUMChart = ({
  aumUnitLabel, aumSeries,
  monthLabels, fmtAUM,
  compact,
}) => {
  const containerRef = React.useRef(null);
  const [dims, setDims] = React.useState({ w: 560, h: 140 });
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const [animPct, setAnimPct] = React.useState(0);
  const animRef = React.useRef(null);
  const aumKey = aumSeries.map(d => `${d.liq},${d.inv}`).join("|");

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setDims({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    setAnimPct(0);
    const start = performance.now();
    const dur = 700;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      setAnimPct(1 - Math.pow(1 - t, 3));
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [aumKey]);

  const { w: W, h: H } = dims;
  const PAD_LEFT = 46, PAD_RIGHT = 8, PAD_TOP = 10, PAD_BOTTOM = 42;
  const PAD_X = PAD_LEFT;
  const innerW = W - PAD_LEFT - PAD_RIGHT, innerH = H - PAD_TOP - PAD_BOTTOM;
  const CHART_BOTTOM = PAD_TOP + innerH;
  const slotW = innerW / 12;
  const barW = slotW * 0.75;
  const barX = i => PAD_X + i * slotW + (slotW - barW) / 2;
  const maxAUM = Math.max(...aumSeries.map(d => d.total), 1);
  const aumUnit = maxAUM > 1e8 ? 1e8 : maxAUM > 1e4 ? 1e4 : 1;
  const aumUnitLabelCalc = maxAUM > 1e8 ? '億' : '萬';
  const fmtAUMCalc = v => Math.round(v / aumUnit);
  const aumToH = v => innerH * v / maxAUM;
  const aumRawStep = maxAUM / aumUnit / 4;
  const aumMag = Math.pow(10, Math.floor(Math.log10(Math.max(aumRawStep, 0.1))));
  const aumNorm = aumRawStep / aumMag;
  const aumNiceStep = aumNorm <= 1 ? aumMag : aumNorm <= 2 ? 2 * aumMag : aumNorm <= 5 ? 5 * aumMag : 10 * aumMag;
  const aumYTicks = Array.from({ length: 5 }, (_, i) => ({
    v: i * aumNiceStep,
    y: PAD_TOP + innerH * (1 - (i * aumNiceStep * aumUnit) / maxAUM),
  })).filter(t => t.v * aumUnit <= maxAUM * 1.05);

  return (
    <div className={compact ? "bg-gray-50 p-2 rounded-md flex-1 min-w-0 flex flex-col" : "bg-white p-4 rounded-lg shadow flex-1 min-w-0 flex flex-col"}>
      <div className={compact ? "flex items-center justify-between mb-1 flex-shrink-0" : "flex items-center justify-between mb-3 flex-shrink-0"}>
        <h4 className={compact ? "font-semibold text-xs text-gray-800" : "text-lg font-semibold text-gray-800"}>過去 12 個月末 AUM</h4>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#14b8a6' }}></span>存款
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#0891b2' }}></span>財管
          </div>
        </div>
      </div>
      <div ref={containerRef} className="relative flex-1 min-h-0">
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="block overflow-visible">
          <defs>
            <linearGradient id="aumGradLiq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="aumGradInv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {aumYTicks.map(t => (
            <g key={t.v}>
              <line x1={PAD_X} x2={W - PAD_RIGHT} y1={t.y} y2={t.y} stroke="#f0fdfa" strokeWidth="1" />
              <text x={PAD_X - 4} y={t.y + 4} fontSize="12" fill="#9ca3af" textAnchor="end">{t.v}{aumUnitLabelCalc}</text>
            </g>
          ))}
          {aumSeries.map((d, i) => {
            const hLiq = aumToH(d.liq) * animPct;
            const hInv = aumToH(d.inv) * animPct;
            const yLiq = CHART_BOTTOM - hLiq;
            const yInv = yLiq - hInv;
            const isHov = hoverIdx === i;
            return (
              <g key={i}>
                <rect x={barX(i)} y={yInv} width={barW} height={Math.max(0, hInv)} rx={2}
                  fill={isHov ? '#0891b2' : 'url(#aumGradInv)'} fillOpacity={isHov ? 1 : 0.85} />
                <rect x={barX(i)} y={yLiq} width={barW} height={Math.max(0, hLiq)} rx={2}
                  fill={isHov ? '#14b8a6' : 'url(#aumGradLiq)'} fillOpacity={isHov ? 1 : 0.85} />
                <rect x={barX(i) - 2} y={PAD_TOP} width={barW + 4} height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)} />
              </g>
            );
          })}
          {monthLabels.map((lbl, i) => {
            const cx = PAD_X + i * slotW + slotW / 2;
            return (
              <text key={i} x={cx} y={CHART_BOTTOM + 26}
                fontSize="12" fill={hoverIdx === i ? '#0f766e' : '#9ca3af'}
                textAnchor="end" fontWeight={hoverIdx === i ? 'bold' : 'normal'}
                transform={`rotate(-45, ${cx}, ${CHART_BOTTOM + 4})`}>{lbl}</text>
            );
          })}
        </svg>
        {hoverIdx !== null && (() => {
          const d = aumSeries[hoverIdx];
          const xPct = (PAD_X + hoverIdx * slotW + slotW / 2) / W * 100;
          const clamp = Math.min(Math.max(xPct, 5), 68);
          return (
            <div className="absolute top-0 pointer-events-none z-10" style={{ left: `${clamp}%` }}>
              <div className="bg-white border border-teal-100 rounded-lg shadow-md px-2 py-1.5 text-xs whitespace-nowrap">
                <div className="font-semibold text-gray-700 mb-1">{monthLabels[hoverIdx]}</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#14b8a6' }}></span>
                  <span className="text-gray-600">存款</span>
                  <span className="font-medium ml-auto pl-3 text-teal-700">{fmtAUMCalc(d.liq)}{aumUnitLabelCalc}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#0891b2' }}></span>
                  <span className="text-gray-600">財管</span>
                  <span className="font-medium ml-auto pl-3 text-teal-700">{fmtAUMCalc(d.inv)}{aumUnitLabelCalc}</span>
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1 flex justify-between gap-3">
                  <span className="text-gray-500">合計</span>
                  <span className="font-semibold text-gray-700">{fmtAUMCalc(d.total)}{aumUnitLabelCalc}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// Hoisted to module scope so its function reference is stable across parent re-renders.
// If defined inside CUS360Demo, every state change (e.g. assetAllocTab) creates a new
// function type, causing React to unmount+remount the component and re-trigger animation.
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

// Shared loading spinner — SVG + label, container provided by caller
const SpinnerBlock = ({ text = "載入中…" }) => (
  <>
    <svg className="animate-spin" width="48" height="48" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" stroke="#99f6e4" strokeWidth="4" />
      <path d="M36 20a16 16 0 0 0-16-16" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" />
    </svg>
    <div className="mt-4 text-base font-semibold text-teal-700">{text}</div>
    <div className="mt-1 text-xs text-gray-400">請稍候</div>
  </>
);

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

  // 依台灣護照羅馬拼音（Wade-Giles）從中文姓名生成英文戶名
  const generateNameEn = (chineseName) => {
    if (!chineseName) return '';
    const MAP = {
      // 常見姓氏
      '王':'WANG','李':'LI','陳':'CHEN','張':'CHANG','劉':'LIU','林':'LIN','吳':'WU',
      '蔡':'TSAI','何':'HO','周':'CHOU','許':'HSU','曾':'TSENG','郭':'KUO','黃':'HUANG',
      '葉':'YEH','鄭':'CHENG','謝':'HSIEH','洪':'HUNG','邱':'CHIU','楊':'YANG','余':'YU',
      '朱':'CHU','胡':'HU','江':'CHIANG','高':'KAO','韓':'HAN','宋':'SUNG','廖':'LIAO',
      '賴':'LAI','潘':'PAN','方':'FANG','石':'SHIH','徐':'HSU','蕭':'HSIAO',
      // 常見名字字
      '小':'HSIAO','明':'MING','美':'MEI','華':'HUA','大':'TA','偉':'WEI','麗':'LI',
      '娟':'CHUAN','志':'CHIH','芳':'FANG','杰':'CHIEH','仁':'JEN','雅':'YA','婷':'TING',
      '宗':'TSUNG','憲':'HSIEN','文':'WEN','冠':'KUAN','哲':'CHE','逸':'YI','軒':'HSUAN',
      '佳':'CHIA','穎':'YING','育':'YU','庭':'TING','豪':'HAO','霖':'LIN','建':'CHIEN',
      '弘':'HUNG','宇':'YU','昕':'HSIN','恩':'EN','柏':'PO','翰':'HAN','郁':'YU',
      '安':'AN','怡':'YI','珊':'SHAN','欣':'HSIN','俊':'CHUN','凱':'KAI','嘉':'CHIA',
      '彥':'YEN','君':'CHUN','涵':'HAN','澤':'TSE','瑋':'WEI','銘':'MING','靖':'CHING',
      '慧':'HUI','玲':'LING','萍':'PING','秀':'HSIU','珍':'CHEN','淑':'SHU','素':'SU',
      '英':'YING','瑜':'YU','如':'JU','倩':'CHIEN','燕':'YEN','靜':'CHING','莉':'LI',
      '依':'YI','思':'SSU','雯':'WEN','心':'HSIN','儀':'YI','筠':'YUN','菁':'CHING',
      '昱':'YU','勝':'SHENG','健':'CHIEN','翔':'HSIANG','廷':'TING','聰':'TSUNG',
      '威':'WEI','國':'KUO','家':'CHIA','峰':'FENG','源':'YUAN','龍':'LUNG','強':'CHIANG',
      '春':'CHUN','玉':'YU','婉':'WAN','卓':'CHO','博':'PO','喬':'CHIAO','坤':'KUN',
      '天':'TIEN','子':'TZU','孟':'MENG','尚':'SHANG','堅':'CHIEN','達':'TA','德':'TE',
      '敬':'CHING','武':'WU','民':'MIN','世':'SHIH','仲':'CHUNG','宏':'HUNG','宜':'YI',
      '容':'JUNG','富':'FU','幸':'HSING','彤':'TUNG','彬':'PIN','惠':'HUI','晉':'CHIN',
      '朗':'LANG','柔':'JOU','樂':'LE','淳':'CHUN','添':'TIEN','清':'CHING','漢':'HAN',
      '煜':'YU','熙':'HSI','璟':'CHING','璇':'HSUAN','琪':'CHI','琬':'WAN','琳':'LIN',
      '琴':'CHIN','真':'CHEN','祥':'HSIANG','竣':'CHUN','綺':'CHI','若':'JO','莊':'CHUANG',
      '蕙':'HUI','融':'JUNG','誼':'YI','謙':'CHIEN','賢':'HSIEN','軍':'CHUN','辰':'CHEN',
      '鋒':'FENG','鑫':'HSIN','馨':'HSIN','黎':'LI','品':'PIN','元':'YUAN','平':'PING',
      '展':'CHAN','道':'TAO','生':'SHENG','寬':'KUAN','律':'LU','晟':'CHENG','暉':'HUI',
      '格':'KO','樺':'HUA','歆':'HSIN','澄':'CHENG','炯':'CHIUNG','璘':'LIN','盈':'YING',
      '祐':'YU','筑':'CHU','緣':'YUAN','耘':'YUN','致':'CHIH','荃':'CHUAN','菀':'WAN',
      '蕾':'LEI','藍':'LAN','語':'YU','豫':'YU','錦':'CHIN','頡':'CHIEH',
      '馥':'FU','麒':'CHI','宸':'CHEN','彭':'PENG','朋':'PENG',
      '杏':'HSING','珈':'CHIA','琇':'HSIU','珠':'CHU','寶':'PAO','旭':'HSU',
      '成':'CHENG','義':'YI','信':'HSIN','善':'SHAN','良':'LIANG','松':'SUNG','梅':'MEI',
      '蘭':'LAN','蓮':'LIEN','桂':'KUEI','岳':'YUEH','毅':'YI','傑':'CHIEH','凡':'FAN',
      '力':'LI','函':'HAN','棟':'TUNG','豐':'FENG','耀':'YAO','飛':'FEI',
    };
    const surname = chineseName[0];
    const given = chineseName.slice(1);
    const surnameEn = MAP[surname] || '';
    const givenParts = given.split('').map(c => MAP[c]).filter(Boolean);
    if (!surnameEn && !givenParts.length) return '';
    return [surnameEn, givenParts.join('-')].filter(Boolean).join(' ');
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
            <SpinnerBlock text="資料更新中…" />
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
      nameEn: "WANG HSIAO-MING",
      age: 35,
      industry: "K 金融及保險業",
      occupation: "財富管理顧問",
      employer: "台灣金融控股股份有限公司",
      jobTitle: "資深財富管理顧問",
      seniority: 12,
      employmentType: "正職",
      vipLevel: "VVVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-345-678",
      idCard: "A123456789",
      creditCard: "4559-****-****-1001",
      accountNumber: "004-1234567-1",
      tags: ["財富管理需求", "高頻交易客戶", "投資理財意圖", "出國旅遊意圖"],
      email: "wangxm@example.com",
      address: "台北市信義區忠孝東路五段",
      city: "台北市",
      preferredContact: "email",
      marketingOptIn: true,
      preferredChannels: ["wealth_portal", "email", "phone"],
      marketingChannels: {
        email: true,
        appPush: true,
        linePush: false,
        sms: true,
      },
      productPreferences: {
        creditCard: 0.92,
        loans: 0.08,
        deposits: 0.55,
        investment: 0.93,
      },
      spendingCategories: {
        dining: 0.85,
        travel: 0.88,
        groceries: 0.35,
        entertainment: 0.65,
        luxury: 0.78,
        overseas: 0.82,
      },
      lifecycleStage: "established_professional",
      lifetimeValueTier: "diamond",
    },
    {
      id: "C002",
      name: "李美華",
      nameEn: "LI MEI-HUA",
      age: 42,
      industry: "M 專業、科學及技術服務業",
      occupation: "企業主管",
      employer: "卓越管理顧問股份有限公司",
      jobTitle: "執行長",
      seniority: 17,
      employmentType: "正職",
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0923-456-789",
      idCard: "B287654321",
      creditCard: "4559-****-****-1002",
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
      nameEn: "CHEN DA-WEI",
      age: 28,
      industry: "J 資訊及通訊傳播業",
      occupation: "軟體工程師",
      employer: "星辰科技股份有限公司",
      jobTitle: "軟體工程師",
      seniority: 4,
      employmentType: "正職",
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0934-567-890",
      idCard: "C111223334",
      creditCard: "4559-****-****-1003",
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
      nameEn: "CHANG LI-CHUAN",
      age: 51,
      industry: "P 教育業",
      occupation: "中等教育教師",
      employer: "台北市立中正高中",
      jobTitle: "資深教師",
      seniority: 26,
      employmentType: "正職",
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0911-222-333",
      idCard: "D222334445",
      creditCard: "4559-****-****-1004",
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
      nameEn: "LIU CHIH-MING",
      age: 46,
      industry: "G 批發及零售業",
      occupation: "業務人員",
      employer: "明豐貿易有限公司",
      jobTitle: "業務員",
      seniority: 8,
      employmentType: "約聘",
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "失效戶",
      phone: "0933-444-555",
      idCard: "E133445556",
      creditCard: "4559-****-****-1005",
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
      nameEn: "LIN HSIAO-FANG",
      age: 33,
      industry: "K 金融及保險業",
      occupation: "銀行理財專員",
      employer: "國泰世華商業銀行",
      jobTitle: "理財專員",
      seniority: 9,
      employmentType: "正職",
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0922-111-222",
      idCard: "F244556667",
      creditCard: "4559-****-****-1006",
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
      nameEn: "CHANG CHIEH-JEN",
      age: 41,
      industry: "J 資訊及通訊傳播業",
      occupation: "資訊主管",
      employer: "沛思數位科技股份有限公司",
      jobTitle: "技術長",
      seniority: 15,
      employmentType: "正職",
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0966-123-456",
      idCard: "G155667778",
      creditCard: "4559-****-****-1007",
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
      nameEn: "HO YA-TING",
      age: 29,
      industry: "Q 醫療保健及社會工作服務業",
      occupation: "護理人員",
      employer: "台北榮民總醫院",
      jobTitle: "護理師",
      seniority: 5,
      employmentType: "正職",
      vipLevel: "normal",
      riskScore: "B",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0977-234-567",
      idCard: "H266778889",
      creditCard: "4559-****-****-1008",
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
      nameEn: "WU TSUNG-HSIEN",
      age: 58,
      industry: "C 製造業",
      occupation: "工廠管理人員",
      employer: "台達電子工業股份有限公司",
      jobTitle: "廠務部協理",
      seniority: 32,
      employmentType: "正職",
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0988-345-678",
      idCard: "I177889990",
      creditCard: "4559-****-****-1009",
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
      nameEn: "TSAI YA-WEN",
      age: 64,
      industry: "K 金融及保險業",
      occupation: "金融機構主管",
      employer: "台新金融控股股份有限公司",
      jobTitle: "董事",
      seniority: 38,
      employmentType: "正職",
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0900-456-789",
      idCard: "J288990001",
      creditCard: "4559-****-****-1010",
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
      nameEn: "LIN KUAN-CHE",
      age: 39,
      industry: "J 資訊及通訊傳播業",
      occupation: "資訊主管",
      employer: "博遠科技股份有限公司",
      jobTitle: "產品長",
      seniority: 14,
      employmentType: "正職",
      vipLevel: "VVVIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0918-222-111",
      idCard: "K199112223",
      creditCard: "4559-****-****-1011",
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
      nameEn: "CHOU YI-HSUAN",
      age: 45,
      industry: "M 專業、科學及技術服務業",
      occupation: "管理顧問",
      employer: "宏達國際顧問集團",
      jobTitle: "總監",
      seniority: 20,
      employmentType: "正職",
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-888-012",
      idCard: "L123456780",
      creditCard: "4559-****-****-1012",
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
      nameEn: "LIN CHIA-YING",
      age: 29,
      industry: "I 住宿及餐飲業",
      occupation: "餐飲服務人員",
      employer: "漢皇國際餐飲集團",
      jobTitle: "外場主任",
      seniority: 3,
      employmentType: "兼職",
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0920-123-013",
      idCard: "M234567891",
      creditCard: "4559-****-****-1013",
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
      nameEn: "CHEN YU-TING",
      age: 40,
      industry: "C 製造業",
      occupation: "製程工程師",
      employer: "聯華電子股份有限公司",
      jobTitle: "資深製程工程師",
      seniority: 14,
      employmentType: "正職",
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0935-456-014",
      idCard: "N245678902",
      creditCard: "4559-****-****-1014",
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
      nameEn: "KUO JEN-HAO",
      age: 38,
      industry: "F 營造業",
      occupation: "土木工程師",
      employer: "中華工程股份有限公司",
      jobTitle: "專案工程師",
      seniority: 13,
      employmentType: "正職",
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "medium",
      accountStatus: "active",
      phone: "0976-222-015",
      idCard: "O156789013",
      creditCard: "4559-****-****-1015",
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
      nameEn: "TSENG YA-LIN",
      age: 27,
      industry: "G 批發及零售業",
      occupation: "門市服務人員",
      employer: "統一超商股份有限公司",
      jobTitle: "門市人員",
      seniority: 2,
      employmentType: "兼職",
      vipLevel: "normal",
      riskScore: "C",
      riskLevel: "high",
      accountStatus: "active",
      phone: "0958-333-016",
      idCard: "P267890124",
      creditCard: "4559-****-****-1016",
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
      nameEn: "HSU CHIEN-HUNG",
      age: 50,
      industry: "G 批發及零售業",
      occupation: "企業負責人",
      employer: "弘泰國際股份有限公司",
      jobTitle: "董事長",
      seniority: 22,
      employmentType: "正職",
      vipLevel: "VVIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0931-444-017",
      idCard: "Q178901235",
      creditCard: "4559-****-****-1017",
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
      creditCard: "4559-****-****-1181",
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
      creditCard: "4559-****-****-1182",
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
      idCard: "R133333333",
      creditCard: "4559-****-****-1183",
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
      idCard: "R244444444",
      creditCard: "4559-****-****-1184",
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
      idCard: "R155555555",
      creditCard: "4559-****-****-1185",
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
      idCard: "R266666666",
      creditCard: "4559-****-****-1186",
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
      idCard: "R177777777",
      creditCard: "4559-****-****-1187",
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
      idCard: "R288888888",
      creditCard: "4559-****-****-1188",
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
      idCard: "R199999999",
      creditCard: "4559-****-****-1189",
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
      idCard: "S200000000",
      creditCard: "4559-****-****-1190",
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
      idCard: "S211111111",
      creditCard: "4559-****-****-1191",
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
      creditCard: "4559-****-****-1192",
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
      idCard: "T233333333",
      creditCard: "4559-****-****-1193",
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
      idCard: "T144444444",
      creditCard: "4559-****-****-1194",
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
      idCard: "T255555555",
      creditCard: "4559-****-****-1195",
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
      industry: "M 專業、科學及技術服務業",
      occupation: "行銷專員",
      employer: "歐珀行銷顧問股份有限公司",
      jobTitle: "行銷專員",
      seniority: 7,
      employmentType: "正職",
      nationality: "中華民國",
      maritalStatus: "已婚",
      vipLevel: "VIP",
      riskScore: "A",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0912-196-000",
      idCard: "U266666666",
      creditCard: "4559-****-****-1196",
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
        "數位通路使用者",
        "有效戶",
        "子女教育基金規劃意圖",
        "信用卡申辦意圖",
        "投資意圖",
        "信貸意圖",
      ],
    },
    {
      id: "C197",
      name: "曾建文",
      nameEn: "",
      age: 52,
      industry: "K 金融及保險業",
      occupation: "投資公司主管",
      employer: "鼎盛投資股份有限公司",
      jobTitle: "執行董事",
      seniority: 25,
      employmentType: "正職",
      vipLevel: "VVIP",
      riskScore: "A+",
      riskLevel: "low",
      accountStatus: "active",
      phone: "0956-789-012",
      idCard: "J197197197",
      creditCard: "4559-****-****-0183",
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
      idCard: "K299001112",
      creditCard: "4559-****-****-0184",
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
      creditCard: "4559-****-****-0185",
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
      creditCard: "4559-****-****-0186",
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
      idCard: "N233334445",
      creditCard: "4559-****-****-0187",
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
      idCard: "O144445556",
      creditCard: "4559-****-****-0188",
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
      idCard: "P255556667",
      creditCard: "4559-****-****-0189",
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
      idCard: "Q166667778",
      creditCard: "4559-****-****-0190",
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
      idCard: "R277778889",
      creditCard: "4559-****-****-0191",
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
      idCard: "S188889990",
      creditCard: "4559-****-****-0192",
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
      idCard: "T101639233",
      creditCard: "4559-****-****-0300",
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
      idCard: "U101647152",
      creditCard: "4559-****-****-0301",
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
      idCard: "V101655071",
      creditCard: "4559-****-****-0302",
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
      idCard: "W101662990",
      creditCard: "4559-****-****-0303",
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
      idCard: "X101670909",
      creditCard: "4559-****-****-0304",
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
      idCard: "Y101678828",
      creditCard: "4559-****-****-0305",
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
      idCard: "Z101686747",
      creditCard: "4559-****-****-0306",
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
      idCard: "A101694666",
      creditCard: "4559-****-****-0307",
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
      idCard: "B101702585",
      creditCard: "4559-****-****-0308",
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
      idCard: "C101710504",
      creditCard: "4559-****-****-0309",
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
      idCard: "D101718423",
      creditCard: "4559-****-****-0310",
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
      idCard: "E101726342",
      creditCard: "4559-****-****-0311",
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
      idCard: "F101734261",
      creditCard: "4559-****-****-0312",
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
      idCard: "G101742180",
      creditCard: "4559-****-****-0313",
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
      idCard: "H101750099",
      creditCard: "4559-****-****-0314",
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
      idCard: "I101758018",
      creditCard: "4559-****-****-0315",
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
      idCard: "J101765937",
      creditCard: "4559-****-****-0316",
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
      idCard: "K101773856",
      creditCard: "4559-****-****-0317",
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
      idCard: "L101781775",
      creditCard: "4559-****-****-0318",
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
      idCard: "M101789694",
      creditCard: "4559-****-****-0319",
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
      idCard: "N101797613",
      creditCard: "4559-****-****-0320",
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
      idCard: "O101805532",
      creditCard: "4559-****-****-0321",
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
      idCard: "P101813451",
      creditCard: "4559-****-****-0322",
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
      idCard: "Q101821370",
      creditCard: "4559-****-****-0323",
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
      idCard: "R101829289",
      creditCard: "4559-****-****-0324",
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
      idCard: "S101837208",
      creditCard: "4559-****-****-0325",
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
      idCard: "T101845127",
      creditCard: "4559-****-****-0326",
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
      idCard: "U101853046",
      creditCard: "4559-****-****-0327",
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
      idCard: "V101860965",
      creditCard: "4559-****-****-0328",
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
      idCard: "W101868884",
      creditCard: "4559-****-****-0329",
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
      idCard: "X101876803",
      creditCard: "4559-****-****-0330",
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
      idCard: "Y101884722",
      creditCard: "4559-****-****-0331",
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
      idCard: "Z101892641",
      creditCard: "4559-****-****-0332",
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
      idCard: "A101900560",
      creditCard: "4559-****-****-0333",
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
      idCard: "B101908479",
      creditCard: "4559-****-****-0334",
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
      idCard: "C101916398",
      creditCard: "4559-****-****-0335",
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
      idCard: "D101924317",
      creditCard: "4559-****-****-0336",
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
      idCard: "E101932236",
      creditCard: "4559-****-****-0337",
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
      idCard: "F101940155",
      creditCard: "4559-****-****-0338",
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
      idCard: "G101948074",
      creditCard: "4559-****-****-0339",
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
      idCard: "H101955993",
      creditCard: "4559-****-****-0340",
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
      idCard: "I101963912",
      creditCard: "4559-****-****-0341",
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
      idCard: "J101971831",
      creditCard: "4559-****-****-0342",
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
      idCard: "K101979750",
      creditCard: "4559-****-****-0343",
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
      idCard: "L101987669",
      creditCard: "4559-****-****-0344",
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
      idCard: "M101995588",
      creditCard: "4559-****-****-0345",
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
      idCard: "N102003507",
      creditCard: "4559-****-****-0346",
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
      idCard: "O102011426",
      creditCard: "4559-****-****-0347",
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
      idCard: "P102019345",
      creditCard: "4559-****-****-0348",
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
      idCard: "Q102027264",
      creditCard: "4559-****-****-0349",
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
      idCard: "R102035183",
      creditCard: "4559-****-****-0350",
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
      idCard: "S102043102",
      creditCard: "4559-****-****-0351",
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
      idCard: "T102051021",
      creditCard: "4559-****-****-0352",
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
      idCard: "U102058940",
      creditCard: "4559-****-****-0353",
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
      idCard: "V102066859",
      creditCard: "4559-****-****-0354",
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
      idCard: "W102074778",
      creditCard: "4559-****-****-0355",
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
      idCard: "X102082697",
      creditCard: "4559-****-****-0356",
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
      idCard: "Y102090616",
      creditCard: "4559-****-****-0357",
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
      idCard: "Z102098535",
      creditCard: "4559-****-****-0358",
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
      idCard: "A102106454",
      creditCard: "4559-****-****-0359",
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
      idCard: "B102114373",
      creditCard: "4559-****-****-0360",
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
      idCard: "C102122292",
      creditCard: "4559-****-****-0361",
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
      idCard: "D102130211",
      creditCard: "4559-****-****-0362",
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
      idCard: "E102138130",
      creditCard: "4559-****-****-0363",
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
      idCard: "F102146049",
      creditCard: "4559-****-****-0364",
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
      idCard: "G102153968",
      creditCard: "4559-****-****-0365",
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
      idCard: "H102161887",
      creditCard: "4559-****-****-0366",
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
      idCard: "I102169806",
      creditCard: "4559-****-****-0367",
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
      idCard: "J102177725",
      creditCard: "4559-****-****-0368",
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
      idCard: "K102185644",
      creditCard: "4559-****-****-0369",
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
      idCard: "L102193563",
      creditCard: "4559-****-****-0370",
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
      idCard: "M102201482",
      creditCard: "4559-****-****-0371",
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
      idCard: "N102209401",
      creditCard: "4559-****-****-0372",
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
      idCard: "O102217320",
      creditCard: "4559-****-****-0373",
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
      idCard: "P102225239",
      creditCard: "4559-****-****-0374",
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
      idCard: "Q102233158",
      creditCard: "4559-****-****-0375",
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
      idCard: "R102241077",
      creditCard: "4559-****-****-0376",
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
      idCard: "S102248996",
      creditCard: "4559-****-****-0377",
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
      idCard: "T102256915",
      creditCard: "4559-****-****-0378",
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
      idCard: "U102264834",
      creditCard: "4559-****-****-0379",
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
      idCard: "V102272753",
      creditCard: "4559-****-****-0380",
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
      idCard: "W102280672",
      creditCard: "4559-****-****-0381",
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
      idCard: "X102288591",
      creditCard: "4559-****-****-0382",
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
      idCard: "Y102296510",
      creditCard: "4559-****-****-0383",
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
      idCard: "Z102304429",
      creditCard: "4559-****-****-0384",
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
      idCard: "A102312348",
      creditCard: "4559-****-****-0385",
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
      idCard: "B102320267",
      creditCard: "4559-****-****-0386",
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
      idCard: "C102328186",
      creditCard: "4559-****-****-0387",
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
      idCard: "D102336105",
      creditCard: "4559-****-****-0388",
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
      idCard: "E102344024",
      creditCard: "4559-****-****-0389",
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
      idCard: "F102351943",
      creditCard: "4559-****-****-0390",
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
      idCard: "G102359862",
      creditCard: "4559-****-****-0391",
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
      idCard: "H102367781",
      creditCard: "4559-****-****-0392",
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
      idCard: "I102375700",
      creditCard: "4559-****-****-0393",
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
      idCard: "J102383619",
      creditCard: "4559-****-****-0394",
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
      idCard: "K102391538",
      creditCard: "4559-****-****-0395",
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
      idCard: "L102399457",
      creditCard: "4559-****-****-0396",
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
      idCard: "M102407376",
      creditCard: "4559-****-****-0397",
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
      idCard: "N102415295",
      creditCard: "4559-****-****-0398",
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
      idCard: "O102423214",
      creditCard: "4559-****-****-0399",
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
      idCard: "P102431133",
      creditCard: "4559-****-****-0400",
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
      idCard: "Q102439052",
      creditCard: "4559-****-****-0401",
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
      idCard: "R102446971",
      creditCard: "4559-****-****-0402",
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
      idCard: "S102454890",
      creditCard: "4559-****-****-0403",
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
      idCard: "T102462809",
      creditCard: "4559-****-****-0404",
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
      idCard: "U102470728",
      creditCard: "4559-****-****-0405",
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
      idCard: "V102478647",
      creditCard: "4559-****-****-0406",
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
      idCard: "W102486566",
      creditCard: "4559-****-****-0407",
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
      idCard: "X102494485",
      creditCard: "4559-****-****-0408",
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
      idCard: "Y102502404",
      creditCard: "4559-****-****-0409",
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
      idCard: "Z102510323",
      creditCard: "4559-****-****-0410",
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
      idCard: "A102518242",
      creditCard: "4559-****-****-0411",
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
      idCard: "B102526161",
      creditCard: "4559-****-****-0412",
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
      idCard: "C102534080",
      creditCard: "4559-****-****-0413",
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
      idCard: "D102541999",
      creditCard: "4559-****-****-0414",
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
      idCard: "E102549918",
      creditCard: "4559-****-****-0415",
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
      idCard: "F102557837",
      creditCard: "4559-****-****-0416",
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
      idCard: "G102565756",
      creditCard: "4559-****-****-0417",
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
      idCard: "H102573675",
      creditCard: "4559-****-****-0418",
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
      idCard: "I102581594",
      creditCard: "4559-****-****-0419",
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
      idCard: "J102589513",
      creditCard: "4559-****-****-0420",
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
      idCard: "K102597432",
      creditCard: "4559-****-****-0421",
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
      idCard: "L102605351",
      creditCard: "4559-****-****-0422",
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
      idCard: "M102613270",
      creditCard: "4559-****-****-0423",
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
      idCard: "N102621189",
      creditCard: "4559-****-****-0424",
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
      idCard: "O102629108",
      creditCard: "4559-****-****-0425",
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
      idCard: "P102637027",
      creditCard: "4559-****-****-0426",
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
      idCard: "Q102644946",
      creditCard: "4559-****-****-0427",
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
      idCard: "R102652865",
      creditCard: "4559-****-****-0428",
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
      idCard: "S102660784",
      creditCard: "4559-****-****-0429",
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
      idCard: "T102668703",
      creditCard: "4559-****-****-0430",
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
      idCard: "U102676622",
      creditCard: "4559-****-****-0431",
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
      idCard: "V102684541",
      creditCard: "4559-****-****-0432",
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
            { label: "行業別", value: "K 金融及保險業" },
            { label: "職業別", value: "資深財富管理顧問" },
            { label: "任職單位", value: "台灣金融控股股份有限公司" },
            { label: "職稱", value: "資深財富管理顧問" },
            { label: "年資", value: "12 年" },
            { label: "聘僱類型", value: "正職" },
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
            { label: "市內電話", value: "(02) 2758-3390", masked: true },
            { label: "電子郵件", value: "wangxm@example.com", masked: false },
            {
              label: "居住地址",
              value: "中華民國（台灣）台北市信義區忠孝東路五段100號8樓",
              masked: true,
            },
            {
              label: "通訊地址",
              value: "中華民國（台灣）台北市信義區忠孝東路五段100號8樓",
              masked: true,
            },
            {
              label: "戶籍地址",
              value: "中華民國（台灣）台南市中西區中正路52號",
              masked: true,
            },
            { label: "聯絡偏好", value: "行動 App / Email", masked: false },
            { label: "行銷同意", value: "允許", masked: false },
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
          data: [{ label: "個人資產", value: "NT$ 49,043,662" }],
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

  // VIP-tag incompatibility rules: tags that must NOT appear for certain VIP levels
  const VIP_TAG_BLACKLIST = {
    // VVVIP & VVIP: 高端客戶不應有負向財務標籤
    VVVIP: [
      "低收益客戶",
      "頻繁預借現金",
      "近期首次產生循環利息",
      "長期信卡循環利息",
      "刷卡經常額度不足",
      "經常在信卡額度上限邊緣",
      "信卡臨時額度上調",
      "頻繁聯絡客服",
    ],
    VVIP: [
      "低收益客戶",
      "頻繁預借現金",
      "近期首次產生循環利息",
      "長期信卡循環利息",
      "刷卡經常額度不足",
      "信卡臨時額度上調",
    ],
    // VIP: 不應有明顯負向信用標籤
    VIP: [
      "低收益客戶",
      "長期信卡循環利息",
    ],
  };

  // VIP-tag allowlist: tags that should be preferred for high VIP levels
  const VIP_TAG_PREFERRED = {
    VVVIP: ["有投資經驗用戶", "有近期投資行銷回應紀錄", "定期投資金額增加", "定期投資頻率增加", "高累計現金與點數回饋", "頻繁調整定期投資設定"],
    VVIP:  ["有投資經驗用戶", "有近期投資行銷回應紀錄", "定期投資金額增加", "高累計現金與點數回饋"],
  };

  // Helper: assign sample tags by category to each customer
  const attachStructuredTags = (customer) => {
    const seed = seedFromId(customer) + 777;
    const vipBlacklist = VIP_TAG_BLACKLIST[customer.vipLevel] || [];
    const filterByVip = (arr) => arr.filter((t) => !vipBlacklist.includes(t));
    const pick = (arr, n = 2) => {
      const filtered = filterByVip(arr);
      const pool = filtered.length > 0 ? filtered : arr;
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push(pool[(seed + i * 3) % pool.length]);
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
    // For high-VIP customers, inject preferred tags if none are already present
    const preferred = VIP_TAG_PREFERRED[customer.vipLevel] || [];
    if (preferred.length > 0) {
      const hasPref = structured.some((t) => preferred.includes(t.name));
      if (!hasPref) {
        const prefTag = preferred[seed % preferred.length];
        // Find its category
        const prefCat = Object.entries(TAG_CATEGORIES).find(([, tags]) => tags.includes(prefTag));
        if (prefCat && !structured.some((t) => t.name === prefTag)) {
          structured.push({ category: prefCat[0], name: prefTag });
        }
      }
    }
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
    // Format validation based on selected searchType
    const qRaw = (searchQuery || "").toString().trim();
    if (!qRaw) {
      setSearchValidationError("");
      setSearchPerformed(true);
      setSearchResults([]);
      setSelectedCustomer(null);
      return;
    }

    // Validate format based on the user-selected search type
    if (searchType === "idCard") {
      if (!/^[A-Za-z][12][0-9]{8}$/.test(qRaw)) {
        setSearchValidationError("客戶編號格式錯誤：應為 1 個英文字母 + 數字 1 或 2 + 8 位數字（例如 A123456789）");
        return;
      }
    } else if (searchType === "creditCard") {
      const ccNorm = qRaw.replace(/[-\s*X]/g, "");
      if (!/^\d{16}$/.test(ccNorm)) {
        setSearchValidationError("信用卡號格式錯誤：應為 16 位數字，可含連字號（例如 4559-****-****-1234）");
        return;
      }
    } else if (searchType === "accountNumber") {
      if (!/^\d{3}-\d{7}-\d$/.test(qRaw) && !/^\d{11,12}$/.test(qRaw.replace(/-/g, ""))) {
        setSearchValidationError("存款帳號格式錯誤：應為 XXX-XXXXXXX-X 格式（例如 004-1234567-8）");
        return;
      }
    }

    setSearchValidationError("");
    setSearchLoading(true);

    const normalize = (s) =>
      (s || "")
        .toString()
        .replace(/[^0-9A-Za-z]/g, "")
        .toLowerCase();

    // 嚴格使用使用者所選的查詢欄位，不做自動偵測
    const fieldMap = {
      idCard: "idCard",
      creditCard: "creditCard",
      accountNumber: "accountNumber",
      name: "name",
    };
    const field = fieldMap[searchType] || "name";

    setTimeout(() => {
      // 姓名欄位使用模糊比對；其他欄位一律精準比對
      const found = mockCustomers.filter((c) => {
        if (field === "name") {
          const nameValue = (c[field] || "").toString();
          return nameValue.toLowerCase().includes(qRaw.toLowerCase());
        } else {
          return normalize(c[field]) === normalize(qRaw);
        }
      });

      setSearchLoading(false);
      setSearchPerformed(true);
      setSearchResults(found);

      if (found && found.length === 1) {
        setSelectedCustomer(found[0]);
        setActiveModule("detail");
      } else {
        setSelectedCustomer(null);
        setActiveModule("search");
      }
    }, 800);
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
                className="mt-2 px-3 py-2 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
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

  // centralized login behavior with loading animation
  const doLogin = (role) => {
    setLoginLoading(true);
    setTimeout(() => {
      setCurrentRole(role);
      setShowMaskedData(true);
      setIsLoggedIn(true);
      setLoginError("");
      setLoginLoading(false);
      setActiveModule("search");
    }, 800);
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
              {modules.filter((m) => !(m.id === "dashboard" && currentRole === "specialist")).map((module) => {
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

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="text-sm text-white/90">
              {currentRole === "specialist" ? "楊專員（理財專員）" : "林經理 (008)"}
            </div>
            <div className="text-sm bg-white bg-opacity-10 px-3 py-1 rounded-full">
              即時
            </div>
            {activeModule === "detail" && selectedCustomer && (
              <div className="flex items-center bg-white/15 rounded-lg p-0.5 gap-0.5">
                {[{ value: "tabs", label: "頁籤" }, { value: "onepage", label: "一頁" }].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setViewMode(value)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${viewMode === value ? "bg-white text-teal-700 shadow-sm" : "text-white/80 hover:text-white"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
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
  const [loginLoading, setLoginLoading] = React.useState(false);
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
  const [assetAllocTab, setAssetAllocTab] = useState("l1");
  const [viewMode, setViewMode] = useState("tabs"); // "tabs" | "onepage"

  // Reset asset alloc tab to 概覽 whenever a new customer is selected
  useEffect(() => { if (selectedCustomer) setAssetAllocTab("l1"); }, [selectedCustomer]);

  const [pendingAnchor, setPendingAnchor] = useState(null); // { anchorId } — scroll after tab render
  const [insightModal, setInsightModal] = useState(null); // { type, data } — insight popup
  const [filters, setFilters] = useState({
    vipLevel: "",
    riskLevel: "",
    accountStatus: "",
    idType: "",
  });
  // Grouped tag filters: array of groups; each group has join ('AND'|'OR') across groups and conditions with op ('AND'|'OR'|'NOT')
  const [tagGroups, setTagGroups] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filterResults, setFilterResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchValidationError, setSearchValidationError] = useState("");
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
      else if (/教育基金|子女教育|育兒/.test(_forcedIntentName)) prodText = '子女教育基金規劃方案';
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
      const isEducationFundIntent = /教育基金|子女教育|育兒/.test(intentName || "");
      const prefersCard = normalizeProd(prodText).includes("card") || /信用卡|卡|card/.test(prodText);
      if (isEducationFundIntent) prodText = "子女教育基金規劃方案";
      else if (isTravelIntent && !prefersCard) prodText = "信用卡旅遊權益方案";
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
    // 低度遮罩（個資法）: 保留前 1 碼 + 後 4 碼，中間以 * 取代 → A*****6789
    if (s.length <= 5) return s.slice(0, 1) + "*".repeat(Math.max(0, s.length - 1));
    return s.slice(0, 1) + "*".repeat(s.length - 5) + s.slice(-4);
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
  const maskAccount = makeMaskFunction((s) => {
    // 低度遮罩: 保留前 5 碼數字 + 後 4 碼數字，中間以 * 取代，保留分隔符位置
    // 例: 0000123456789012 → 00001*******9012
    const chars = String(s).split("");
    const digitIndices = chars.reduce((acc, ch, i) => { if (/\d/.test(ch)) acc.push(i); return acc; }, []);
    const n = digitIndices.length;
    if (n <= 9) return maskDigitsKeepLast(s, 4);
    const keepSet = new Set([...digitIndices.slice(0, 5), ...digitIndices.slice(-4)]);
    digitIndices.forEach((idx) => { if (!keepSet.has(idx)) chars[idx] = "*"; });
    return chars.join("");
  });
  const maskCard = makeMaskFunction((s) => {
    // PCI DSS 一般顯示用: 僅顯示後 4 碼，格式 ****-****-****-XXXX
    const digits = s.replace(/[\s\-*X]/g, "");
    const last4 = digits.slice(-4);
    return `****-****-****-${last4}`;
  });
  const maskValue = (label, value, force = false) => {
    // When masking is disabled, always return raw value regardless of force flag
    if (!showMaskedData) return value;
    if (!value) return value;
    const l = label || "";
    if (/郵件|email/i.test(l)) return maskEmail(value);
    if (/手機|電話/.test(l)) return maskPhone(value);
    if (/地址/.test(l)) return maskAddress(value);
    if (/證件號|身分證|ID|idCard/i.test(l)) return maskId(value);
    if (/帳號/.test(l)) return maskAccount(value);
    if (/信用卡/.test(l)) return maskCard(value);
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
          if (/子女教育基金|教育基金規劃/.test(name)) return (sp.education || 0) * 0.6 + (sp.childcare || 0) * 0.4;
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

  // ── 客戶工作資訊輔助函式 ─────────────────────────────────────────────────
  // 台灣主計總處行業標準分類大類（DGBAS）+ 勞動部職業別組合庫
  const WORK_POOL = [
    // A 農業
    { industry: "A 農業", occupation: "農業技術人員", employers: ["行政院農業部農業試驗所", "台灣農業研究院"], titles: { VVVIP: "研究員", VVIP: "副研究員", VIP: "助理研究員", normal: "農業技術員" }, empType: "正職" },
    // C 製造業
    { industry: "C 製造業", occupation: "電子工程師", employers: ["台積電股份有限公司", "聯發科技股份有限公司", "鴻海精密工業股份有限公司"], titles: { VVVIP: "製造副總", VVIP: "技術協理", VIP: "資深電子工程師", normal: "電子工程師" }, empType: "正職" },
    { industry: "C 製造業", occupation: "製程工程師", employers: ["聯華電子股份有限公司", "台積電股份有限公司", "日月光半導體製造股份有限公司"], titles: { VVVIP: "廠務處長", VVIP: "部門主管", VIP: "資深製程工程師", normal: "製程工程師" }, empType: "正職" },
    { industry: "C 製造業", occupation: "生產管理人員", employers: ["台達電子工業股份有限公司", "正新橡膠工業股份有限公司"], titles: { VVVIP: "製造副總", VVIP: "廠長", VIP: "課長", normal: "生產管理員" }, empType: "正職" },
    // D 電力及燃氣供應業
    { industry: "D 電力及燃氣供應業", occupation: "電力工程師", employers: ["台灣電力股份有限公司", "中油股份有限公司"], titles: { VVVIP: "工程處長", VVIP: "主任工程師", VIP: "資深工程師", normal: "電力工程師" }, empType: "正職" },
    // F 營造業
    { industry: "F 營造業", occupation: "土木工程師", employers: ["中華工程股份有限公司", "榮工工程股份有限公司", "達欣工程股份有限公司"], titles: { VVVIP: "工程副總", VVIP: "專案協理", VIP: "資深工程師", normal: "土木工程師" }, empType: "正職" },
    // G 批發及零售業
    { industry: "G 批發及零售業", occupation: "業務人員", employers: ["統一超商股份有限公司", "全家便利商店股份有限公司", "遠東百貨股份有限公司"], titles: { VVVIP: "業務副總", VVIP: "區域業務主管", VIP: "資深業務專員", normal: "業務員" }, empType: "正職" },
    { industry: "G 批發及零售業", occupation: "採購人員", employers: ["家樂福股份有限公司", "大潤發流通事業股份有限公司"], titles: { VVVIP: "採購長", VVIP: "採購協理", VIP: "資深採購專員", normal: "採購員" }, empType: "正職" },
    // H 運輸及倉儲業
    { industry: "H 運輸及倉儲業", occupation: "物流管理人員", employers: ["台灣宅配通股份有限公司", "統一速達股份有限公司"], titles: { VVVIP: "物流長", VVIP: "區域主管", VIP: "站長", normal: "物流人員" }, empType: "正職" },
    // I 住宿及餐飲業
    { industry: "I 住宿及餐飲業", occupation: "餐飲服務人員", employers: ["王品集團", "六福旅遊集團", "晶華國際酒店股份有限公司"], titles: { VVVIP: "品牌總監", VVIP: "店長", VIP: "副店長", normal: "外場服務員" }, empType: "兼職" },
    // J 資訊及通訊傳播業
    { industry: "J 資訊及通訊傳播業", occupation: "軟體工程師", employers: ["緯穎科技服務股份有限公司", "趨勢科技股份有限公司", "研華股份有限公司"], titles: { VVVIP: "技術長", VVIP: "架構師", VIP: "資深工程師", normal: "軟體工程師" }, empType: "正職" },
    { industry: "J 資訊及通訊傳播業", occupation: "數位行銷人員", employers: ["Line Taiwan Limited", "Google Taiwan LLC", "Yahoo奇摩股份有限公司"], titles: { VVVIP: "行銷長", VVIP: "行銷協理", VIP: "資深行銷專員", normal: "行銷專員" }, empType: "正職" },
    { industry: "J 資訊及通訊傳播業", occupation: "資料分析師", employers: ["91APP股份有限公司", "富邦媒體科技股份有限公司", "KKBOX Technologies"], titles: { VVVIP: "首席數據官", VVIP: "數據協理", VIP: "資深資料分析師", normal: "資料分析師" }, empType: "正職" },
    // K 金融及保險業
    { industry: "K 金融及保險業", occupation: "理財顧問", employers: ["富邦金融控股股份有限公司", "國泰金融控股股份有限公司", "中國信託金融控股股份有限公司"], titles: { VVVIP: "財務長", VVIP: "部門主管", VIP: "資深理財顧問", normal: "理財顧問" }, empType: "正職" },
    { industry: "K 金融及保險業", occupation: "保險業務人員", employers: ["國泰人壽保險股份有限公司", "南山人壽保險股份有限公司", "富邦人壽保險股份有限公司"], titles: { VVVIP: "業務處長", VVIP: "資深業務主任", VIP: "業務主任", normal: "保險業務員" }, empType: "正職" },
    // L 不動產業
    { industry: "L 不動產業", occupation: "不動產經紀人", employers: ["信義房屋仲介股份有限公司", "永慶房屋仲介股份有限公司"], titles: { VVVIP: "業務副總", VVIP: "分店長", VIP: "資深業務", normal: "房產仲介" }, empType: "正職" },
    // M 專業、科學及技術服務業
    { industry: "M 專業、科學及技術服務業", occupation: "會計師", employers: ["勤業眾信聯合會計師事務所", "資誠聯合會計師事務所", "安侯建業聯合會計師事務所"], titles: { VVVIP: "合夥人", VVIP: "協理", VIP: "資深會計師", normal: "會計師" }, empType: "正職" },
    { industry: "M 專業、科學及技術服務業", occupation: "管理顧問", employers: ["麥肯錫顧問公司台灣分公司", "波士頓顧問集團台灣辦公室", "奧緯顧問有限公司台灣分公司"], titles: { VVVIP: "資深合夥人", VVIP: "合夥人", VIP: "資深顧問", normal: "顧問" }, empType: "正職" },
    { industry: "M 專業、科學及技術服務業", occupation: "行銷專員", employers: ["歐珀行銷顧問股份有限公司", "奧美廣告股份有限公司", "電通安吉斯集團"], titles: { VVVIP: "行銷長", VVIP: "行銷協理", VIP: "資深行銷專員", normal: "行銷專員" }, empType: "正職" },
    // N 支援服務業
    { industry: "N 支援服務業", occupation: "人力資源專員", employers: ["104人力銀行股份有限公司", "1111人力銀行股份有限公司"], titles: { VVVIP: "人資長", VVIP: "人資協理", VIP: "資深人資專員", normal: "人資專員" }, empType: "正職" },
    // O 公共行政及國防；強制性社會安全
    { industry: "O 公共行政及國防；強制性社會安全", occupation: "公務人員", employers: ["台北市政府", "行政院", "台灣省政府"], titles: { VVVIP: "局長", VVIP: "科長", VIP: "主任", normal: "公務員" }, empType: "正職" },
    // P 教育業
    { industry: "P 教育業", occupation: "教師", employers: ["國立台灣大學", "國立成功大學", "台北市立高中"], titles: { VVVIP: "教授", VVIP: "副教授", VIP: "講師", normal: "教師" }, empType: "正職" },
    // Q 醫療保健及社會工作服務業
    { industry: "Q 醫療保健及社會工作服務業", occupation: "護理人員", employers: ["台大醫院", "台北榮民總醫院", "長庚醫療財團法人"], titles: { VVVIP: "護理長", VVIP: "資深護理師", VIP: "護理師", normal: "護士" }, empType: "正職" },
    { industry: "Q 醫療保健及社會工作服務業", occupation: "醫師", employers: ["台大醫院", "台北榮民總醫院", "馬偕紀念醫院"], titles: { VVVIP: "主任醫師", VVIP: "主治醫師", VIP: "主治醫師", normal: "住院醫師" }, empType: "正職" },
    // R 藝術、娛樂及休閒服務業
    { industry: "R 藝術、娛樂及休閒服務業", occupation: "創意設計師", employers: ["琉璃工房", "霹靂國際多媒體股份有限公司"], titles: { VVVIP: "創意總監", VVIP: "設計協理", VIP: "資深設計師", normal: "設計師" }, empType: "正職" },
    // S 其他服務業
    { industry: "S 其他服務業", occupation: "美容美髮師", employers: ["超越美容美髮有限公司", "髮型概念沙龍"], titles: { VVVIP: "總監造型師", VVIP: "資深造型師", VIP: "造型師", normal: "美容師" }, empType: "約聘" },
  ];

  // 依客戶資料確定性生成工作資訊（含行業別、職業別、任職單位、職稱、年資、聘僱類型）
  const getCustomerWork = (customer) => {
    if (!customer) return { industry: "—", occupation: "—", employer: "—", jobTitle: "—", seniority: 1, employmentType: "正職" };

    // 若已有完整明確欄位，直接回傳
    if (customer.industry && customer.occupation && customer.jobTitle) {
      const maxSen = Math.min(Math.max(1, (customer.age || 25) - 22), 45);
      return {
        industry: customer.industry,
        occupation: customer.occupation,
        employer: customer.employer || "—",
        jobTitle: customer.jobTitle,
        seniority: Math.min(customer.seniority || 1, maxSen),
        employmentType: customer.employmentType || "正職",
      };
    }

    // 確定性雜湊
    const key = (customer && customer.id) || "demo";
    let hash = 0;
    for (let i = 0; i < key.length; i++)
      hash = (hash * 31 + key.charCodeAt(i)) % 1000000;

    const entry = WORK_POOL[hash % WORK_POOL.length];
    const vip = customer.vipLevel || "normal";
    const jobTitle = entry.titles[vip] || entry.titles.normal;
    const employers = entry.employers;
    const employer = employers[(hash + 13) % employers.length];

    // 年資：依年齡合理推算（最小 1 年，最大 min(age-22, 45)）
    const maxSeniority = Math.min(Math.max(1, (customer.age || 25) - 22), 45);
    const seniorityBase = Math.max(1, Math.round(maxSeniority * 0.5));
    const seniorityRange = Math.max(1, maxSeniority - seniorityBase);
    const seniority = seniorityBase + ((hash + 37) % (seniorityRange + 1));

    return {
      industry: entry.industry,
      occupation: entry.occupation,
      employer,
      jobTitle,
      seniority,
      employmentType: entry.empType,
    };
  };

  // 客戶行業映射 - 依據客戶 ID 進行確定性分配（向後相容）
  const getCustomerIndustry = (customer) => {
    const w = getCustomerWork(customer);
    return w.industry || "—";
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
      "中鼎商業銀行",
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
      "順豐便利商店",
      "晨星咖啡",
      "城央購物廣場",
      "裕豐量販",
      "速達外送",
      "文薈書店",
      "捷運儲值",
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

  // ── generateCustomerProducts ───────────────────────────────────────────────
  // Returns a flat array of held products { l1, l2, l3, l4, details[] }
  // deterministically from the customer's financial data + seed.
  const generateCustomerProducts = (customer) => {
    const f = getCustomerFinance(customer);
    const s = seedFromId(customer);
    const vip = (customer && customer.vipLevel) || "normal";

    // Deterministic pseudo-random integer in [0, mod)
    const rnd = (salt, mod) => Math.abs((s + salt * 1337) % mod);

    // Account / contract number helpers
    const acctNum = (prefix, salt) =>
      `${prefix}${String(1000000 + rnd(salt, 9000000)).slice(0, 7)}`;

    // Date string helper: baseYear + small variance
    const dateStr = (baseYear, salt) => {
      const v = rnd(salt, 10000000);
      const yr = baseYear + (v % 4);
      const mo = String((v % 12) + 1).padStart(2, "0");
      const dy = String(((v >> 3) % 28) + 1).padStart(2, "0");
      return `${yr}/${mo}/${dy}`;
    };

    const products = [];

    // ── 存款 ─────────────────────────────────────────────────────────────────
    // Pre-compute which TWD deposit products are held so fractions sum to 1.0
    const hasTWDSavings = f.liquid > 50000 && rnd(2, 3) === 0;
    const hasTWDTime    = f.liquid > 100000 && rnd(3, 2) === 0;
    // Canonical fractions: 定期 0.30, 活儲 0.30, 活期 = remainder
    const twdTimeFrac    = hasTWDTime    ? 0.30 : 0;
    const twdSavingsFrac = hasTWDSavings ? 0.30 : 0;
    const twdDemandFrac  = Math.max(0, 1.0 - twdTimeFrac - twdSavingsFrac);

    // 台幣活期存款 (always when liquid > 0)
    if (f.liquid > 0) {
      products.push({
        l1: "存款", l2: "台幣存款", l3: "台幣活期存款", l4: "台幣活期存款",
        details: [
          { label: "帳號",     value: acctNum("001", 1) },
          { label: "開戶日期", value: dateStr(2015, 101) },
          { label: "現存餘額", value: `NT$ ${Math.round(f.liquid * twdDemandFrac).toLocaleString()}` },
          { label: "帳戶狀態", value: "正常" },
        ],
      });
    }
    // 台幣活期儲蓄存款
    if (hasTWDSavings) {
      products.push({
        l1: "存款", l2: "台幣存款", l3: "台幣活期存款", l4: "台幣活期儲蓄存款",
        details: [
          { label: "帳號",     value: acctNum("002", 2) },
          { label: "開戶日期", value: dateStr(2018, 102) },
          { label: "現存餘額", value: `NT$ ${Math.round(f.liquid * twdSavingsFrac).toLocaleString()}` },
          { label: "帳戶狀態", value: "正常" },
        ],
      });
    }
    // 台幣定期存款
    if (hasTWDTime) {
      products.push({
        l1: "存款", l2: "台幣存款", l3: "台幣定期存款", l4: "台幣定期存款",
        details: [
          { label: "帳號",     value: acctNum("003", 3) },
          { label: "開戶日期", value: dateStr(2020, 103) },
          { label: "存款金額", value: `NT$ ${Math.round(f.liquid * twdTimeFrac).toLocaleString()}` },
          { label: "到期日",   value: dateStr(2025, 203) },
          { label: "利率",     value: `${(1.5 + rnd(5, 20) / 10).toFixed(2)}%` },
          { label: "帳戶狀態", value: "定存中" },
        ],
      });
    }
    // 外幣活期存款 (VIP+ or one-third of normal customers)
    if (vip !== "normal" || rnd(6, 3) === 1) {
      const fxCcys = ["USD", "EUR", "JPY", "AUD", "CNY"];
      const ccy = fxCcys[rnd(7, fxCcys.length)];
      const fxRates = { USD: 32, EUR: 35, JPY: 0.22, AUD: 21, CNY: 4.5 };
      const fxBal = Math.max(100, Math.round(f.invest * 0.03 / fxRates[ccy]));
      products.push({
        l1: "存款", l2: "外幣存款", l3: "外幣活期存款", l4: "外幣活期存款",
        details: [
          { label: "帳號",     value: acctNum("FX1", 10) },
          { label: "幣別",     value: ccy },
          { label: "開戶日期", value: dateStr(2019, 110) },
          { label: "現存餘額", value: `${ccy} ${fxBal.toLocaleString()}` },
          { label: "帳戶狀態", value: "正常" },
        ],
      });
    }
    // 外幣定期存款 (VVIP+)
    if ((vip === "VVIP" || vip === "VVVIP") && f.invest > 500000) {
      const fxCcys2 = ["USD", "EUR", "GBP"];
      const ccy2 = fxCcys2[rnd(11, 3)];
      const fxRates2 = { USD: 32, EUR: 35, GBP: 40 };
      const fxDepForeign = Math.max(1000, Math.round(f.invest * 0.06 / fxRates2[ccy2]));
      products.push({
        l1: "存款", l2: "外幣存款", l3: "外幣定期存款", l4: "外幣定期存款",
        details: [
          { label: "帳號",     value: acctNum("FX2", 11) },
          { label: "幣別",     value: ccy2 },
          { label: "存款金額", value: `${ccy2} ${fxDepForeign.toLocaleString()}` },
          { label: "開戶日期", value: dateStr(2022, 111) },
          { label: "到期日",   value: dateStr(2025, 211) },
          { label: "利率",     value: `${(2.0 + rnd(12, 15) / 10).toFixed(2)}%` },
          { label: "帳戶狀態", value: "定存中" },
        ],
      });
    }

    // ── 信用卡 ────────────────────────────────────────────────────────────────
    // 本行信用卡 (always)
    {
      const last4 = String(1000 + rnd(20, 9000));
      const cardTypes = ["白金卡", "鈦金卡", "御璽卡", "無限卡"];
      const cardType = cardTypes[rnd(21, cardTypes.length)];
      products.push({
        l1: "信用卡", l2: "信用卡", l3: "信用卡發卡", l4: "本行信用卡",
        details: [
          { label: "卡號",     value: `**** **** **** ${last4}` },
          { label: "卡片類型", value: cardType },
          { label: "信用額度", value: `NT$ ${f.creditLimit.toLocaleString()}` },
          { label: "本期消費", value: `NT$ ${Math.round(f.cardSpend3M / 3).toLocaleString()}` },
          { label: "開卡日期", value: dateStr(2016, 120) },
          { label: "有效期限", value: `${2025 + rnd(22, 4)}/12` },
        ],
      });
    }
    // 聯名卡
    if (rnd(23, 3) === 0) {
      const partners = ["翔泰航空", "文薈書店", "好家量販", "優購電商"];
      const partner = partners[rnd(24, partners.length)];
      const last4b = String(1000 + rnd(25, 9000));
      products.push({
        l1: "信用卡", l2: "信用卡", l3: "信用卡發卡", l4: "聯名卡",
        details: [
          { label: "卡號",     value: `**** **** **** ${last4b}` },
          { label: "聯名廠商", value: partner },
          { label: "信用額度", value: `NT$ ${Math.round(f.creditLimit * 0.6).toLocaleString()}` },
          { label: "開卡日期", value: dateStr(2020, 123) },
          { label: "有效期限", value: `${2025 + rnd(26, 3)}/06` },
        ],
      });
    }
    // 簽帳卡
    if (rnd(27, 4) === 0) {
      const last4c = String(1000 + rnd(28, 9000));
      products.push({
        l1: "信用卡", l2: "簽帳卡", l3: "簽帳卡", l4: "簽帳卡",
        details: [
          { label: "卡號",     value: `**** **** **** ${last4c}` },
          { label: "開卡日期", value: dateStr(2021, 127) },
          { label: "帳戶狀態", value: "正常" },
        ],
      });
    }

    // ── 貸款 ──────────────────────────────────────────────────────────────────
    // 房屋貸款
    if (f.loan > 500000 && rnd(30, 3) !== 0) {
      const loanAmt = Math.round(f.loan * 0.75);
      const loanRate = (1.5 + rnd(31, 20) / 10).toFixed(2);
      const loanL4 = rnd(32, 7) === 0 ? "政策房貸" : "一般房貸";
      products.push({
        l1: "貸款", l2: "個人貸款", l3: "房屋貸款", l4: loanL4,
        details: [
          { label: "貸款帳號", value: acctNum("HL", 30) },
          { label: "貸款金額", value: `NT$ ${loanAmt.toLocaleString()}` },
          { label: "起貸日期", value: dateStr(2018, 130) },
          { label: "到期日",   value: dateStr(2038, 230) },
          { label: "利率",     value: `${loanRate}%` },
          { label: "月繳金額", value: `NT$ ${Math.round(loanAmt * parseFloat(loanRate) / 100 / 12 * 1.3).toLocaleString()}` },
          { label: "帳戶狀態", value: "正常繳款" },
        ],
      });
    }
    // 信用貸款
    if (f.loan > 100000 && rnd(33, 4) === 1) {
      const plAmt = Math.round(f.loan * 0.25);
      const plRate = (3.5 + rnd(34, 30) / 10).toFixed(2);
      const plL4 = rnd(35, 3) === 0 ? "公教信貸" : "一般房貸";
      products.push({
        l1: "貸款", l2: "個人貸款", l3: "信用貸款", l4: plL4,
        details: [
          { label: "貸款帳號", value: acctNum("PL", 33) },
          { label: "貸款金額", value: `NT$ ${plAmt.toLocaleString()}` },
          { label: "起貸日期", value: dateStr(2022, 133) },
          { label: "到期日",   value: dateStr(2027, 233) },
          { label: "利率",     value: `${plRate}%` },
          { label: "帳戶狀態", value: "正常繳款" },
        ],
      });
    }
    // 汽車貸款
    if (rnd(36, 5) === 0 && f.loan > 200000) {
      const carAmt = Math.round(300000 + rnd(37, 700000));
      products.push({
        l1: "貸款", l2: "個人貸款", l3: "其他貸款", l4: "汽車貸款",
        details: [
          { label: "貸款帳號", value: acctNum("AL", 36) },
          { label: "貸款金額", value: `NT$ ${carAmt.toLocaleString()}` },
          { label: "起貸日期", value: dateStr(2023, 136) },
          { label: "到期日",   value: dateStr(2028, 236) },
          { label: "利率",     value: `${(2.0 + rnd(38, 15) / 10).toFixed(2)}%` },
          { label: "帳戶狀態", value: "正常繳款" },
        ],
      });
    }

    // ── 財管 ──────────────────────────────────────────────────────────────────
    // 國內基金
    if (f.invest > 100000) {
      const fundCats = ["股票型", "固定收益型", "平衡型", "貨幣市場型"];
      const fCat = fundCats[rnd(40, fundCats.length)];
      const fundNameMap = {
        股票型:    "台灣高股息連結基金",
        固定收益型: "投資等級債券基金",
        平衡型:    "大中華平衡基金",
        貨幣市場型: "台幣貨幣市場基金",
      };
      products.push({
        l1: "財管", l2: "基金", l3: "國內基金", l4: fCat,
        details: [
          { label: "契約號",   value: `F${String(100000 + rnd(41, 900000))}` },
          { label: "基金名稱", value: fundNameMap[fCat] },
          { label: "持有金額", value: `NT$ ${Math.round(f.invest * 0.2).toLocaleString()}` },
          { label: "申購日期", value: dateStr(2021, 140) },
          { label: "帳戶狀態", value: "持有中" },
        ],
      });
      // 第二支國內基金 (部分客戶)
      if (rnd(70, 3) === 0) {
        const fCat2 = fundCats[(rnd(40, fundCats.length) + 1) % fundCats.length];
        const fundNameMap2 = {
          股票型:    "亞太資訊股票基金",
          固定收益型: "亞洲高收益債基金",
          平衡型:    "全球平衡配置基金",
          貨幣市場型: "美元貨幣市場基金",
        };
        products.push({
          l1: "財管", l2: "基金", l3: "國內基金", l4: fCat2,
          details: [
            { label: "契約號",   value: `F${String(100000 + rnd(71, 900000))}` },
            { label: "基金名稱", value: fundNameMap2[fCat2] },
            { label: "持有金額", value: `NT$ ${Math.round(f.invest * 0.1).toLocaleString()}` },
            { label: "申購日期", value: dateStr(2023, 172) },
            { label: "帳戶狀態", value: "持有中" },
          ],
        });
      }
    }
    // 境外基金 (VIP+)
    if (f.invest > 500000 && vip !== "normal") {
      const ofCats = ["股票型", "固定收益型", "平衡型"];
      const ofCat = ofCats[rnd(42, 3)];
      const ofNameMap = {
        股票型:    "全球科技股票基金",
        固定收益型: "新興市場債券基金",
        平衡型:    "全球資產配置基金",
      };
      products.push({
        l1: "財管", l2: "基金", l3: "境外基金", l4: ofCat,
        details: [
          { label: "契約號",          value: `OF${String(100000 + rnd(43, 900000))}` },
          { label: "基金名稱",        value: ofNameMap[ofCat] },
          { label: "持有金額(台幣換算)", value: `NT$ ${Math.round(f.invest * 0.12).toLocaleString()}` },
          { label: "申購日期",        value: dateStr(2022, 142) },
          { label: "帳戶狀態",        value: "持有中" },
        ],
      });
      // 第二支境外基金 (VVIP+)
      if (vip === "VVVIP" || (vip === "VVIP" && rnd(72, 2) === 0)) {
        const ofCat2 = ofCats[(rnd(42, 3) + 2) % 3];
        const ofNameMap2 = {
          股票型:    "歐洲遊奕股票基金",
          固定收益型: "全球投資級公司債基金",
          平衡型:    "多元資產收益基金",
        };
        products.push({
          l1: "財管", l2: "基金", l3: "境外基金", l4: ofCat2,
          details: [
            { label: "契約號",          value: `OF${String(100000 + rnd(73, 900000))}` },
            { label: "基金名稱",        value: ofNameMap2[ofCat2] },
            { label: "持有金額(台幣換算)", value: `NT$ ${Math.round(f.invest * 0.08).toLocaleString()}` },
            { label: "申購日期",        value: dateStr(2024, 174) },
            { label: "帳戶狀態",        value: "持有中" },
          ],
        });
      }
    }
    // 國內ETF
    if (rnd(44, 3) === 0 && f.invest > 200000) {
      const etfNames = ["TA50 華信台灣50", "TA56 華信高股息", "TA88 永信永續高股息"];
      const etfName = etfNames[rnd(45, 3)];
      const shares = (rnd(46, 50) + 1) * 1000;
      products.push({
        l1: "財管", l2: "ETF", l3: "國內ETF", l4: "國內ETF",
        details: [
          { label: "帳號",     value: acctNum("ETF", 44) },
          { label: "ETF名稱",  value: etfName },
          { label: "持有股數", value: `${shares.toLocaleString()} 股` },
          { label: "概估市值", value: `NT$ ${Math.round(f.invest * 0.08).toLocaleString()}` },
          { label: "購入日期", value: dateStr(2020, 144) },
          { label: "帳戶狀態", value: "持有中" },
        ],
      });
    }
    // 壽險 (most customers)
    if (rnd(50, 5) !== 0) {
      const insCoList = ["大成人壽", "豐裕人壽", "南峰人壽", "中正人壽"];
      const insCo = insCoList[rnd(51, 4)];
      const annualPremium = Math.round(20000 + rnd(52, 80000));
      products.push({
        l1: "財管", l2: "保險", l3: "人身保險", l4: "壽險",
        details: [
          { label: "契約號",   value: `L${String(1000000 + rnd(53, 9000000))}` },
          { label: "保險公司", value: insCo },
          { label: "年繳保費", value: `NT$ ${annualPremium.toLocaleString()}` },
          { label: "保額",     value: `NT$ ${Math.round(annualPremium * 20).toLocaleString()}` },
          { label: "生效日期", value: dateStr(2019, 150) },
          { label: "帳戶狀態", value: "有效" },
        ],
      });
    }
    // 醫療險
    if (rnd(54, 2) === 0) {
      products.push({
        l1: "財管", l2: "保險", l3: "人身保險", l4: "醫療險",
        details: [
          { label: "契約號",   value: `M${String(1000000 + rnd(55, 9000000))}` },
          { label: "日額保障", value: `NT$ ${(1000 + rnd(56, 5) * 500).toLocaleString()}` },
          { label: "年繳保費", value: `NT$ ${Math.round(8000 + rnd(57, 30000)).toLocaleString()}` },
          { label: "生效日期", value: dateStr(2020, 154) },
          { label: "帳戶狀態", value: "有效" },
        ],
      });
    }
    // 投資型保險 (VIP+ with high invest)
    if (f.invest > 1000000 && vip !== "normal") {
      const invInsAmt = Math.round(f.invest * 0.04);
      products.push({
        l1: "財管", l2: "保險", l3: "人身保險", l4: "投資型保險",
        details: [
          { label: "契約號",       value: `IV${String(100000 + rnd(58, 900000))}` },
          { label: "年繳保費",     value: `NT$ ${invInsAmt.toLocaleString()}` },
          { label: "累積投資金額", value: `NT$ ${Math.round(invInsAmt * 2.5).toLocaleString()}` },
          { label: "生效日期",     value: dateStr(2021, 158) },
          { label: "帳戶狀態",     value: "有效" },
        ],
      });
    }
    // 旅遊不便險
    if (rnd(59, 4) === 0) {
      products.push({
        l1: "財管", l2: "保險", l3: "產物保險", l4: "旅遊不便險",
        details: [
          { label: "契約號",   value: `TR${String(100000 + rnd(60, 900000))}` },
          { label: "保障天數", value: `${7 + rnd(61, 14)} 天` },
          { label: "生效日期", value: dateStr(2024, 159) },
          { label: "到期日",   value: dateStr(2025, 259) },
          { label: "帳戶狀態", value: "有效" },
        ],
      });
    }
    // 海外債 (VVIP+)
    if (f.invest > 2000000 && (vip === "VVIP" || vip === "VVVIP")) {
      const bondNames = ["美國政府公債", "投資等級企業債", "新興市場主權債"];
      const bond = bondNames[rnd(62, 3)];
      products.push({
        l1: "財管", l2: "海外債", l3: "海外債", l4: "海外債",
        details: [
          { label: "契約號",          value: `B${String(100000 + rnd(63, 900000))}` },
          { label: "債券名稱",        value: bond },
          { label: "面額(台幣換算)",  value: `NT$ ${Math.round(f.invest * 0.1).toLocaleString()}` },
          { label: "購入日期",        value: dateStr(2023, 162) },
          { label: "到期日",          value: dateStr(2033, 262) },
          { label: "帳戶狀態",        value: "持有中" },
        ],
      });
    }
    // 安養信託 (VVVIP or very high invest)
    if (vip === "VVVIP" || (f.invest > 3000000 && rnd(64, 3) === 0)) {
      products.push({
        l1: "財管", l2: "信託", l3: "非金錢信託", l4: "安養信託",
        details: [
          { label: "契約號",   value: `T${String(100000 + rnd(65, 900000))}` },
          { label: "信託金額", value: `NT$ ${Math.round(f.netWorth * 0.08).toLocaleString()}` },
          { label: "委託日期", value: dateStr(2022, 164) },
          { label: "信託目的", value: "退休養老規劃" },
          { label: "帳戶狀態", value: "有效" },
        ],
      });
    }

    return products;
  };
  // ── end generateCustomerProducts ──────────────────────────────────────────

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
        { channel: "臨櫃", time: fourDaysAgo.toLocaleString(), detail: "子女教育金規劃諮詢申請送出" },
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
          status: "提醒", summary: "定存即將到期", _type: "event",
        },
        {
          channel: "人生大事",
          time: past1.toLocaleDateString("zh-TW") + " 10:00",
          detail: "結婚：婚姻狀態更新，提供家庭保險與房貸試算。",
          status: "已發生", summary: "結婚", _type: "event",
        },
        {
          channel: "人生大事",
          time: past2.toLocaleDateString("zh-TW") + " 09:30",
          detail: "購屋：購屋完成，提供房貸與保費整合建議。",
          status: "已發生", summary: "購屋", _type: "event",
        },
      ];
    }
    // C196 林怡君 — 生子事件（6 個月前）+ 教育金規劃申請處理中
    // 定存已於 6 週前完成續存（見通路互動紀錄），故不再顯示定存到期提醒
    if (customer && customer.id === "C196") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      return [
        {
          channel: "保單續繳",
          time: oneMonthLater.toLocaleDateString("zh-TW") + " 09:00",
          detail: "新生兒醫療險首次年繳即將到期，建議確認保障內容並視需要調整。",
          status: "提醒", summary: "保費即將到期", _type: "event",
        },
        {
          channel: "人生大事",
          time: sixMonthsAgo.toLocaleString(),
          detail: "生子：新生兒相關教育基金與保險建議。",
          status: "已發生", summary: "生子", _type: "event",
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
      events.push({ channel: "定存到期", time: d1.toLocaleString(), detail: "您的定存即將到期，建議評估續存/轉存與利率方案。", status: "提醒", summary: "定存即將到期", _type: "event" });
    } else if (reminderType === 2) {
      const d2 = new Date(now.getFullYear(), now.getMonth() + ((seed % 2) + 1), (seed % 20) + 1);
      events.push({ channel: "保單續繳", time: d2.toLocaleString(), detail: "壽險/醫療險保費即將到期，請確認繳費方式與保障內容是否需調整。", status: "提醒", summary: "保費即將到期", _type: "event" });
    } else if (reminderType === 3) {
      const d3 = new Date(now.getFullYear(), now.getMonth() + 1, (seed % 25) + 1);
      events.push({ channel: "信用卡年費", time: d3.toLocaleString(), detail: "信用卡年費即將扣款，建議評估是否刷卡達標免年費或升級方案。", status: "提醒", summary: "年費即將到期", _type: "event" });
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
        summary: c.label,
        _type: "event",
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
              className="absolute z-10 px-2 py-1 bg-white border border-teal-100 rounded-lg shadow-md text-xs"
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
  // Interactive donut component (hover tooltip) used for product share & tier distribution
  const DonutInteractive = ({
    data = [],
    colors = [],
    size = 96,
    innerRatio = 0.55,
    centerText = null,
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
    // Special case: single segment = full circle (arc path degenerates to nothing)
    if (data.length === 1) {
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox="0 0 42 42">
            <circle cx={cx} cy={cy} r={outerR} fill={colors[0] || '#14b8a6'} />
            <circle cx={cx} cy={cy} r={innerR} fill="white" />
            {centerText && (
              <text x="21" y="18.5" textAnchor="middle" dominantBaseline="middle" fontSize="4.2" fontWeight="bold" fill="#0f766e">{centerText.line1}</text>
            )}
            {centerText && (
              <text x="21" y="24" textAnchor="middle" dominantBaseline="middle" fontSize="3" fill="#6b7280">{centerText.line2}</text>
            )}
          </svg>
        </div>
      );
    }
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
          {centerText && (
            <text
              x="21"
              y="18.5"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="4.2"
              fontWeight="bold"
              fill="#0f766e"
            >
              {centerText.line1}
            </text>
          )}
          {centerText && (
            <text
              x="21"
              y="24"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="3"
              fill="#6b7280"
            >
              {centerText.line2}
            </text>
          )}
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

  const renderSearchModule = () => {
    if (searchLoading) return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <SpinnerBlock text="查詢中…" />
      </div>
    );
    return (
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
                onChange={(e) => { setSearchType(e.target.value); setSearchValidationError(""); }}
                className="px-3 py-2 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
              >
                <option value="name">客戶姓名</option>
                <option value="idCard">客戶編號</option>
                <option value="creditCard">信用卡號</option>
                <option value="accountNumber">存款帳號</option>
              </select>

              <input
                type="text"
                placeholder={searchType === 'name' ? '輸入姓名 (支援模糊搜尋)' : '輸入選擇的識別號 (精準比對)'}
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 ${searchValidationError ? "border-red-400 bg-red-50" : "border-teal-100"}`}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchValidationError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                搜尋
              </button>
            </div>
            {searchValidationError && (
              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                {searchValidationError}
              </div>
            )}
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
                setSearchLoading(true);
                setTimeout(() => {
                  setSearchLoading(false);
                  setSelectedCustomer(customer);
                  setActiveModule("detail");
                  setActiveTab("basic");
                }, 800);
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
  };

  const renderFilterModule = () => {
    const displayedList =
      filterResults === null ? mockCustomers : filterResults;
    const noResults =
      Array.isArray(filterResults) && filterResults.length === 0;
    if (filterLoading) return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <SpinnerBlock text="篩選中…" />
      </div>
    );
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
                className="w-full px-3 py-2 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
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
                className="w-full px-3 py-2 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
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
                className="w-full px-3 py-2 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
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
                className="w-full px-3 py-2 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
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
                    }} className="px-2 py-1 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300">
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
                      <select value={cond.op} onChange={(e)=> updateTagCondition(gIdx, cIdx, { op: e.target.value })} className="px-2 py-1 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300">
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                        <option value="NOT">NOT</option>
                      </select>
                      <select value={cond.category || ''} onChange={(e)=> updateTagCondition(gIdx, cIdx, { category: e.target.value, tag: '' })} className="px-2 py-1 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300">
                        <option value="">(選擇類別)</option>
                        {[...Object.keys(TAG_CATEGORIES), '意圖標籤'].map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                      <select value={cond.tag || ''} onChange={(e)=> updateTagCondition(gIdx, cIdx, { tag: e.target.value })} className="flex-1 px-3 py-1 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" disabled={!cond.category}>
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
                setFilterLoading(true);
                setTimeout(() => {
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
                setFilterLoading(false);
                }, 800);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={filterLoading}
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
          <h3 className="font-bold text-md mb-3 text-gray-800">查詢歷程稽核</h3>
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

  const renderFinancialCharts = (compact = false) => {
    // Reorganized: separate NetWorth/Liabilities, Income Sources+3mo trend, and Asset Allocation
    return (
      <>
      {selectedCustomer ? (() => {
        const f = getCustomerFinance(selectedCustomer);
        // ── Income data ───────────────────────────────────────────────
        const series = generateMonthlySeries(selectedCustomer, 6);
        const lastMonthAvg = series.length ? series[series.length - 1] : 0;
        const incomeSources = generateIncomeSources(selectedCustomer);
        // ── Asset allocation data ─────────────────────────────────────
        const allProdsFA = generateCustomerProducts(selectedCustomer);
        const ASSET_L1 = new Set(['存款', '財管']);
        const EXCLUDE_L2 = new Set(['保險']);
        const assetProds = allProdsFA.filter(p => ASSET_L1.has(p.l1) && !EXCLUDE_L2.has(p.l2));
        const depositProds = assetProds.filter(p => p.l1 === '存款');
        const investProds  = assetProds.filter(p => p.l1 === '財管');
        const DEP_W = { '台幣活期存款': 40, '台幣活期儲蓄存款': 30, '台幣定期存款': 30, '外幣活期存款': 12, '外幣定期存款': 18 };
        const INV_W = { '股票型': 25, '固定收益型': 20, '平衡型': 20, '組合型': 15, '貨幣市場型': 15, '期貨信託型': 10, '國內ETF': 18, '境外ETF': 18, '海外債': 22, '結構型': 10, '安養信託': 18, '保險金信託': 12, '不動產信託': 18, '價金信託': 12, '其他信託': 8 };
        const L4_PALETTE = { '存款': ['#14b8a6', '#0d9488', '#5eead4', '#99f6e4'], '財管': ['#06b6d4', '#0891b2', '#22d3ee', '#67e8f9', '#a5f3fc', '#0e7490'] };
        const allocatePool = (prods, poolAmt, weightMap, palette) => {
          if (!prods.length || poolAmt <= 0) return [];
          const totalW = prods.reduce((acc, p) => acc + (weightMap[p.l4] || 15), 0) || 1;
          const items = prods.map((p, idx) => ({ label: p.l4, l1: p.l1, value: Math.round(poolAmt * (weightMap[p.l4] || 15) / totalW), color: palette[idx % palette.length] }));
          let diff = poolAmt - items.reduce((acc, x) => acc + x.value, 0);
          if (diff !== 0) items[0].value += diff;
          return items.filter(x => x.value > 0);
        };
        const itemsAll = assetAllocTab === 'l1'
          ? [depositProds.length > 0 && { label: '存款', value: f.liquid, color: '#14b8a6' }, investProds.length > 0 && { label: '財管', value: f.invest, color: '#06b6d4' }].filter(Boolean)
          : [...allocatePool(depositProds, f.liquid, DEP_W, L4_PALETTE['存款']), ...allocatePool(investProds, f.invest, INV_W, L4_PALETTE['財管'])];
        const colors = itemsAll.map(x => x.color);
        const assetTotal = itemsAll.reduce((acc, x) => acc + x.value, 0) || 1;
        const data = (() => {
          const d = itemsAll.map(it => ({ label: it.label, value: Math.max(1, Math.round((it.value / assetTotal) * 100)) }));
          let sum = d.reduce((acc, x) => acc + x.value, 0);
          for (let i = 0; sum > 100 && i < d.length; i++) { if (d[i].value > 1) { d[i].value--; sum--; i = -1; } }
          for (let i = 0; sum < 100 && i < d.length; i++) { d[i].value++; sum++; }
          return d;
        })();

        if (compact) return (
          <div className="space-y-2">
            {/* Row 1: 總資產/總負債 — full width */}
            <div className="bg-gray-50 p-2 rounded-md">
              <h4 className="font-semibold text-xs text-gray-800 mb-1">總資產 / 總負債</h4>
              <div className="flex gap-4">
                <div className="flex justify-between items-center text-xs flex-1 border-r border-gray-200 pr-4">
                  <span className="text-gray-500">總資產</span>
                  <span className="font-semibold text-teal-600 tabular-nums">NT$ {f.netWorth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs flex-1">
                  <span className="text-gray-500">總負債</span>
                  <span className="font-semibold text-teal-500 tabular-nums">NT$ {f.loan.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* Row 2: 收入趨勢 + 資產配置 — 2 col */}
            <div className="grid grid-cols-2 gap-2">
              {/* Income */}
              <div className="bg-gray-50 p-2 rounded-md">
                <h4 className="font-semibold text-xs text-gray-800 mb-1">收入來源 & 近期收入趨勢</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">近 3 月平均收入</span>
                    <span className="font-semibold text-teal-600 tabular-nums">NT$ {lastMonthAvg.toLocaleString()}</span>
                  </div>
                  <MonthlyBarHover values={series} labels={series.map((_, i) => `${i + 1}月`)} height={40} color="#0ea5a4" />
                  <div className="space-y-0.5">
                    {incomeSources.map((src, i) => (
                      <div key={i} className="flex justify-between items-center text-xs border-b border-gray-100 pb-0.5 last:border-0">
                        <span className="text-gray-500">{src.name}</span>
                        <span className="font-medium tabular-nums text-gray-800">NT$ {src.amount.toLocaleString()} <span className="text-gray-400">({src.pct}%)</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Asset Allocation */}
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-xs text-gray-800">資產配置</h4>
                  <div className="flex gap-0.5 text-xs bg-gray-200 rounded-lg p-0.5">
                    <button className={`px-1.5 py-0.5 rounded-md transition-colors ${assetAllocTab === 'l1' ? 'bg-white shadow text-teal-700 font-semibold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setAssetAllocTab('l1')}>概覽</button>
                    <button className={`px-1.5 py-0.5 rounded-md transition-colors ${assetAllocTab === 'l3' ? 'bg-white shadow text-teal-700 font-semibold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setAssetAllocTab('l3')}>細項</button>
                  </div>
                </div>
                {itemsAll.length === 0 ? <div className="text-xs text-gray-400">暫無資產資料</div> : (
                  <div className="space-y-0.5">
                    {itemsAll.map((it, i) => (
                      <div key={`${it.label}-${i}`} className="flex items-center text-xs border-b border-gray-100 pb-0.5 last:border-0">
                        <span className="flex items-center gap-1 text-gray-600 min-w-0 flex-1">
                          <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: colors[i] }}></span>
                          <span className="truncate">{it.label}</span>
                        </span>
                        <span className="font-medium text-gray-800 tabular-nums flex-shrink-0 ml-1 text-right">NT$ {it.value.toLocaleString()}</span>
                        <span className="text-gray-400 tabular-nums flex-shrink-0 ml-2 text-right w-7">{data[i]?.value ?? 0}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

        // ── Non-compact: original 3-col grid ─────────────────────────
        return (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">總資產 / 總負債</h4>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">總資產</div>
                <div className="text-2xl font-bold text-teal-600">NT$ {f.netWorth.toLocaleString()}</div>
                <div className="text-sm text-gray-600">總負債</div>
                <div className="text-2xl font-bold text-teal-500">NT$ {f.loan.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow col-span-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">收入來源 &amp; 近期收入趨勢</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">最近 3 個月平均收入</div>
                    <div className="text-2xl font-bold text-teal-600">NT$ {lastMonthAvg.toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-gray-500">最近走勢 (月)</div>
                </div>
                <div>
                  <MonthlyBarHover values={series} labels={series.map((_, i) => `${i + 1}月`)} height={64} color="#0ea5a4" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {incomeSources.map((src, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded border text-sm">
                      <div className="text-xs text-gray-600">{src.name}</div>
                      <div className="font-medium">NT$ {src.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{src.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">資產配置</h4>
                <div className="flex gap-0.5 text-xs bg-gray-100 rounded-lg p-0.5">
                  <button className={`px-2.5 py-1 rounded-md transition-colors ${assetAllocTab === 'l1' ? 'bg-white shadow text-teal-700 font-semibold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setAssetAllocTab('l1')}>概覽</button>
                  <button className={`px-2.5 py-1 rounded-md transition-colors ${assetAllocTab === 'l3' ? 'bg-white shadow text-teal-700 font-semibold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setAssetAllocTab('l3')}>細項</button>
                </div>
              </div>
              <div className="rounded-lg p-3 bg-gray-50 flex items-center gap-4">
                {itemsAll.length === 0 ? <div className="text-sm text-gray-400">暫無資產資料</div> : (
                  <div className="flex items-center gap-4 w-full">
                    <DonutInteractive data={data} colors={colors} size={96} />
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        {itemsAll.map((it, i) => (
                          <div key={`${it.label}-${i}`} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: colors[i] }}></span>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{it.label}</div>
                              <div className="text-gray-500">NT$ {it.value.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })() : (
        <div className="text-sm text-gray-500 p-2">請選取客戶以顯示財務資訊。</div>
      )}

            {/* 12-month AUM stacked bar & ROI trend — side-by-side */}
      {selectedCustomer && (() => {
        const s = seedFromId(selectedCustomer);
        const f = getCustomerFinance(selectedCustomer);
        const allProds = generateCustomerProducts(selectedCustomer);
        const EXCLUDE_L2 = new Set(['保險']);
        const investProds = allProds.filter(p => p.l1 === '財管' && !EXCLUDE_L2.has(p.l2));

        const now = new Date();
        const monthLabels = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          return `${d.getMonth() + 1}月`;
        });

        const rndSalt = (salt, range) => (Math.abs((s + salt * 1337 + salt) % range) - range / 2);

        // ── AUM data: all 12 months within ±30% of current AUM; most recent ≤30% off ──
        // Forward random walk: start from a point near current, drift month-to-month,
        // every month clamped within ±30% of the current anchor (f.liquid / f.invest).
        const MAX_DRIFT = 0.30;
        const buildWalk = (current, saltBase) => {
          const lo = Math.round(current * (1 - MAX_DRIFT));
          const hi = Math.round(current * (1 + MAX_DRIFT));
          const clamp = v => Math.min(hi, Math.max(lo, v));
          // Start at a random point within ±20% of current
          const initOffset = rndSalt(saltBase + 999, 1000) / 1000 * 0.20;
          const vals = new Array(12);
          vals[0] = clamp(Math.round(current * (1 + initOffset)));
          for (let i = 1; i < 12; i++) {
            const step = rndSalt(saltBase + i * 13, 1000) / 1000 * 0.08; // ±8% per month
            vals[i] = clamp(Math.round(vals[i - 1] * (1 + step)));
          }
          return vals;
        };
        // Scale liquid/invest proportionally so their sum equals netWorth
        const aumBase = f.liquid + f.invest || 1;
        const liqRatio = f.liquid / aumBase;
        const invRatio = f.invest / aumBase;
        const scaledLiq = Math.round(f.netWorth * liqRatio);
        const scaledInv = Math.round(f.netWorth * invRatio);
        const liqWalk = buildWalk(scaledLiq, 500);
        const invWalk = buildWalk(scaledInv, 600);
        const aumSeries = Array.from({ length: 12 }, (_, i) => ({
          liq: liqWalk[i], inv: invWalk[i], total: liqWalk[i] + invWalk[i],
        }));
        const maxAUM = Math.max(...aumSeries.map(d => d.total), 1);
        const aumUnit = maxAUM >= 100000000 ? 100000000 : 10000;
        const aumUnitLabel = aumUnit === 100000000 ? '億' : '萬';
        const fmtAUM = v => (v / aumUnit).toFixed(aumUnit === 100000000 ? 1 : 0);

        // ── ROI data ─────────────────────────────────────────────────────────────────
        const heldProducts = [];
        const seenProdKeys = new Set();
        investProds.forEach(p => {
          const key = `${p.l3}/${p.l4 || p.l3}`;
          if (!seenProdKeys.has(key)) { seenProdKeys.add(key); heldProducts.push(p); }
        });

        const prodLabel = (p) => {
          if (p.l2 === '基金' && p.l3.includes('境外')) return '境外' + p.l4;
          if (p.l2 === '基金' && p.l3.includes('國內')) return '國內' + p.l4;
          return p.l4 || p.l3;
        };

        const BASE_PROFILES = {
          '國內股票型':    { annualBase: 14.0, vol: 2.5 },
          '國內固定收益型': { annualBase:  5.5, vol: 1.0 },
          '國內平衡型':    { annualBase:  9.0, vol: 1.8 },
          '國內貨幣市場型': { annualBase:  2.5, vol: 0.3 },
          '國內組合型':    { annualBase:  8.0, vol: 1.6 },
          '國內期貨信託型': { annualBase: 16.0, vol: 4.0 },
          '境外股票型':    { annualBase: 16.0, vol: 3.0 },
          '境外固定收益型': { annualBase:  5.0, vol: 1.0 },
          '境外平衡型':    { annualBase: 10.0, vol: 2.0 },
          '境外組合型':    { annualBase:  9.0, vol: 1.8 },
          '境外貨幣市場型': { annualBase:  3.0, vol: 0.4 },
          '國內ETF':      { annualBase: 12.0, vol: 3.5 },
          '境外ETF':      { annualBase: 13.0, vol: 4.0 },
          '海外債':        { annualBase:  4.5, vol: 1.2 },
          '結構型':        { annualBase:  5.5, vol: 1.8 },
          '安養信託':      { annualBase:  3.5, vol: 0.8 },
          '保險金信託':    { annualBase:  3.0, vol: 0.7 },
          '不動產信託':    { annualBase:  5.0, vol: 1.5 },
          '價金信託':      { annualBase:  2.5, vol: 0.6 },
          '其他信託':      { annualBase:  3.0, vol: 0.9 },
        };
        const COLOR_PALETTE = [
          '#14b8a6', '#0891b2', '#06b6d4', '#0d9488', '#0e7490',
          '#5eead4', '#22d3ee', '#0f766e', '#67e8f9', '#99f6e4',
        ];

        const roiSeries = heldProducts.map((p, idx) => {
          const label = prodLabel(p);
          const prof = BASE_PROFILES[label] || { annualBase: 7.0, vol: 2.0 };
          const saltBase = (p.l3.charCodeAt(0) + (p.l4 || '').charCodeAt(0)) * 17 + idx * 31;
          let prevReturn = prof.annualBase / 12;
          const monthlyReturns = Array.from({ length: 23 }, (_, i) => {
            const shock  = rndSalt(saltBase + i * 3, 2000) / 2000 * prof.vol;
            const regime = rndSalt(saltBase + i * 7 + 999, 1000) / 1000 * (prof.vol * 0.4);
            const ret    = prof.annualBase / 12 * 0.7 + prevReturn * 0.3 + shock + regime;
            prevReturn = ret;
            return ret;
          });
          const values = Array.from({ length: 12 }, (_, i) => {
            const sum = monthlyReturns.slice(i, i + 12).reduce((a, b) => a + b, 0);
            return Math.round(sum * 100) / 100;
          });
          return { label, values, color: COLOR_PALETTE[idx % COLOR_PALETTE.length] };
        });

        // ── Shared SVG dimensions ──────────────────────────────────────────────────
        const W = 560, H = 140, PAD_X = 44, PAD_TOP = 12, PAD_BOTTOM = 22;
        const innerW = W - PAD_X * 2, innerH = H - PAD_TOP - PAD_BOTTOM;
        const CHART_BOTTOM = PAD_TOP + innerH;

        // ── AUM SVG helpers ────────────────────────────────────────────────────────
        const slotW = innerW / 12;
        const barW = slotW * 0.62;
        const barX = i => PAD_X + i * slotW + (slotW - barW) / 2;
        const aumToY = v => PAD_TOP + innerH * (1 - v / maxAUM);
        const aumToH = v => innerH * v / maxAUM;

        const aumRawStep = maxAUM / aumUnit / 4;
        const aumMag = Math.pow(10, Math.floor(Math.log10(Math.max(aumRawStep, 0.1))));
        const aumNorm = aumRawStep / aumMag;
        const aumNiceStep = aumNorm <= 1 ? aumMag : aumNorm <= 2 ? 2 * aumMag : aumNorm <= 5 ? 5 * aumMag : 10 * aumMag;
        const aumYTicks = Array.from({ length: 5 }, (_, i) => ({
          v: i * aumNiceStep,
          y: aumToY(i * aumNiceStep * aumUnit),
        })).filter(t => t.v * aumUnit <= maxAUM * 1.05);

        // ── ROI SVG helpers: 0% at centre, equal-distance ticks ──────────────────
        const allROIVals = roiSeries.length > 0 ? roiSeries.flatMap(sr => sr.values) : [0];
        const dataAbsMax = Math.max(...allROIVals.map(v => Math.abs(v)), 1);
        // Pick step so axis snugly covers data with minimum 2 ticks per side
        const NICE_STEPS = [1, 2, 5, 10, 15, 20, 25, 30];
        const roiStep = NICE_STEPS.find(s => s * 2 >= dataAbsMax) || 30;
        const roiTickCount = Math.max(2, Math.ceil(dataAbsMax / roiStep));
        const axisMax = roiStep * roiTickCount;          // symmetric axis: [-axisMax, +axisMax]
        const roiToX = i => PAD_X + (i / 11) * innerW;
        const roiToY = v => PAD_TOP + innerH * (1 - (v + axisMax) / (2 * axisMax)); // 0 → mid
        const roiYTicks = Array.from({ length: roiTickCount * 2 + 1 }, (_, i) => ({
          v: (i - roiTickCount) * roiStep,
          y: roiToY((i - roiTickCount) * roiStep),
        }));

        const toBezier = (pts) => {
          if (!pts.length) return '';
          let d = `M ${pts[0].x} ${pts[0].y}`;
          for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)];
            const p1 = pts[i], p2 = pts[i + 1];
            const p3 = pts[Math.min(pts.length - 1, i + 2)];
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
          }
          return d;
        };

        // ── ROI Chart component ────────────────────────────────────────────────────
        const ROIChart = () => {
          const containerRef = React.useRef(null);
          const [dims, setDims] = React.useState({ w: 560, h: 140 });
          const [hoverMonth, setHoverMonth] = React.useState(null);
          React.useEffect(() => {
            const el = containerRef.current;
            if (!el) return;
            const ro = new ResizeObserver(() => {
              const { width, height } = el.getBoundingClientRect();
              if (width > 0 && height > 0) setDims({ w: Math.round(width), h: Math.round(height) });
            });
            ro.observe(el);
            return () => ro.disconnect();
          }, []);
          const { w: W2, h: H2 } = dims;
          const PAD_LEFT2 = 46, PAD_RIGHT2 = 8, PAD_TOP2 = 10, PAD_BOTTOM2 = 42;
          const PAD_X2 = PAD_LEFT2;
          const innerW2 = W2 - PAD_LEFT2 - PAD_RIGHT2, innerH2 = H2 - PAD_TOP2 - PAD_BOTTOM2;
          const CHART_BOTTOM2 = PAD_TOP2 + innerH2;
          const roiToX2 = i => PAD_X2 + (i / 11) * innerW2;
          const roiToY2 = v => PAD_TOP2 + innerH2 * (1 - (v + axisMax) / (2 * axisMax));
          const handleMouseMove = (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const xRaw = (e.clientX - rect.left) / rect.width * W2;
            setHoverMonth(Math.min(11, Math.max(0, Math.round((xRaw - PAD_X2) / innerW2 * 11))));
          };
          return (
            <div className={compact ? "bg-gray-50 p-2 rounded-md flex-1 min-w-0 flex flex-col" : "bg-white p-4 rounded-lg shadow flex-1 min-w-0 flex flex-col"}>
              <div className={compact ? "mb-1 flex-shrink-0" : "mb-3 flex-shrink-0"}>
                <h4 className={compact ? "font-semibold text-xs text-gray-800 whitespace-nowrap" : "text-lg font-semibold text-gray-800 whitespace-nowrap"}>12 個月滾動投資報酬率</h4>
                <div className="flex gap-x-3 gap-y-1 flex-wrap mt-1.5">
                  {roiSeries.map(sr => (
                    <div key={sr.label} className="flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
                      <span className="inline-block rounded flex-shrink-0" style={{ width: 18, height: 2, background: sr.color }}></span>
                      {sr.label}
                    </div>
                  ))}
                </div>
              </div>
              <div ref={containerRef} className="relative flex-1 min-h-0" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverMonth(null)}>
                <svg width="100%" height="100%" viewBox={`0 0 ${W2} ${H2}`} className="block overflow-visible">
                  {roiYTicks.map(t => {
                    const ty = roiToY2(t.v);
                    return (
                    <g key={t.v}>
                      <line x1={PAD_X2} x2={W2 - PAD_RIGHT2} y1={ty} y2={ty}
                        stroke={t.v === 0 ? '#6b7280' : '#f0fdfa'}
                        strokeWidth={1}
                        strokeDasharray={t.v === 0 ? '4 3' : undefined} />
                      <text x={PAD_X2 - 4} y={ty + 4} fontSize="12" textAnchor="end"
                        fill={t.v === 0 ? '#6b7280' : '#9ca3af'}
                        fontWeight={t.v === 0 ? 'bold' : 'normal'}>
                        {t.v === 0 ? '0%' : `${t.v > 0 ? '+' : ''}${t.v}%`}
                      </text>
                    </g>
                    );
                  })}
                  {hoverMonth !== null && (
                    <line x1={roiToX2(hoverMonth)} x2={roiToX2(hoverMonth)} y1={PAD_TOP2} y2={CHART_BOTTOM2}
                      stroke="#d1fae5" strokeWidth="1" strokeDasharray="3 2" />
                  )}
                  {roiSeries.map(sr => {
                    const pts = sr.values.map((v, i) => ({ x: roiToX2(i), y: roiToY2(v) }));
                    return (
                      <g key={sr.label}>
                        <path d={toBezier(pts)} fill="none" stroke={sr.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        {hoverMonth !== null && (
                          <circle cx={roiToX2(hoverMonth)} cy={roiToY2(sr.values[hoverMonth])} r="3.5" fill={sr.color} stroke="white" strokeWidth="1.5" />
                        )}
                      </g>
                    );
                  })}
                  {monthLabels.map((lbl, i) => {
                    const cx2 = roiToX2(i);
                    return (
                      <text key={i} x={cx2} y={CHART_BOTTOM2 + 26}
                        fontSize="12"
                        fill={hoverMonth === i ? '#0f766e' : '#9ca3af'}
                        textAnchor="end" fontWeight={hoverMonth === i ? 'bold' : 'normal'}
                        transform={`rotate(-45, ${cx2}, ${CHART_BOTTOM2 + 4})`}>{lbl}</text>
                    );
                  })}
                </svg>
                {hoverMonth !== null && (() => {
                  const pct = roiToX2(hoverMonth) / W2 * 100;
                  const clampLeft = Math.min(Math.max(pct, 5), 68);
                  return (
                    <div className="absolute top-0 pointer-events-none z-10" style={{ left: `${clampLeft}%` }}>
                      <div className="bg-white border border-teal-100 rounded-lg shadow-md px-2 py-1.5 text-xs whitespace-nowrap">
                        <div className="font-semibold text-gray-700 mb-1">{monthLabels[hoverMonth]}</div>
                        {roiSeries.map(sr => (
                          <div key={sr.label} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: sr.color }}></span>
                            <span className="text-gray-600">{sr.label}</span>
                            <span className="font-medium ml-auto pl-3" style={{ color: sr.values[hoverMonth] >= 0 ? '#0d9488' : '#ef4444' }}>
                              {sr.values[hoverMonth] >= 0 ? '+' : ''}{sr.values[hoverMonth].toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        };

        return (
          <div className={compact ? "flex gap-2 mt-2" : "flex gap-4 mt-4"} style={{ minHeight: 160 }}>
            <AUMChart
              aumUnitLabel={aumUnitLabel} aumSeries={aumSeries}
              monthLabels={monthLabels} fmtAUM={fmtAUM}
              compact={compact}
            />
            {heldProducts.length > 0 ? <ROIChart /> : (
              <div className={compact ? "bg-gray-50 p-2 rounded-md flex-1 min-w-0 flex items-center justify-center" : "bg-white p-4 rounded-lg shadow flex-1 min-w-0 flex items-center justify-center"}>
                <span className="text-sm text-gray-400">未持有投資商品</span>
              </div>
            )}
          </div>
        );
      })()}
      </>
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
            setSearchLoading(true);
            setTimeout(() => {
              setSearchLoading(false);
              setSelectedCustomer(spouseCustomer);
              setActiveTab("basic");
              window.scrollTo({ top: 0, behavior: "instant" });
            }, 800);
          } : undefined}
          title={isBankCustomer ? `點擊查看 ${spouseName} 的客戶資料` : undefined}
        >
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
            <span className="font-medium text-xs">{spouseName}</span>
            <span className="px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded text-[10px] font-medium">配偶</span>
            {isBankCustomer && <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-[10px] font-bold border border-teal-300">本行</span>}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-[11px] mt-1 ml-5">
            {isBankCustomer && spouseCid && <div><span className="text-gray-400">編號 </span><span className="font-medium text-teal-700">{spouseCid}</span></div>}
            <div><span className="text-gray-400">起日 </span><span className="font-medium">{marriageDate}</span></div>
            <div><span className="text-gray-400">狀態 </span><span className="px-1.5 py-0 bg-green-100 text-green-700 rounded">有效</span></div>
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
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="font-medium text-xs">{child.name}</span>
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">子女</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-[11px] mt-1 ml-5">
                <div><span className="text-gray-400">年齡 </span><span className="font-medium">{ageDisplay}</span></div>
                <div><span className="text-gray-400">出生 </span><span className="font-medium">{childBirthYear}年</span></div>
                <div><span className="text-gray-400">受益人 </span><span className="px-1.5 py-0 bg-purple-100 text-purple-700 rounded">是</span></div>
                <div><span className="text-gray-400">狀態 </span><span className="px-1.5 py-0 bg-green-100 text-green-700 rounded">有效</span></div>
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
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="font-medium text-xs">{childName}</span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">子女</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-[11px] mt-1 ml-5">
              <div><span className="text-gray-400">年齡 </span><span className="font-medium">{ageDisplay}</span></div>
              <div><span className="text-gray-400">出生 </span><span className="font-medium">{childBirthYear}年</span></div>
              <div><span className="text-gray-400">受益人 </span><span className="px-1.5 py-0 bg-purple-100 text-purple-700 rounded">是</span></div>
              <div><span className="text-gray-400">狀態 </span><span className="px-1.5 py-0 bg-green-100 text-green-700 rounded">有效</span></div>
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
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
          <span className="font-medium text-xs">{managerName}（E{String(10000 + (seed % 89999)).slice(0,5)}）</span>
          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">經管人員</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-[11px] mt-1 ml-5">
          <div><span className="text-gray-400">分行 </span><span className="font-medium">{managerBranch}</span></div>
          <div><span className="text-gray-400">起日 </span><span className="font-medium">{2018 + (seed % 6)}/0{(seed % 9) + 1}/01</span></div>
          <div><span className="text-gray-400">狀態 </span><span className="px-1.5 py-0 bg-green-100 text-green-700 rounded">在職</span></div>
          <div><span className="text-gray-400">理專 </span><span className="px-1.5 py-0 bg-blue-100 text-blue-700 rounded">是</span></div>
        </div>
      </div>
    );

    const allCards = [spouseCard, ...childCards, managerCard].filter(Boolean);
    if (!allCards.length) return null;
    return (
      <div className={`${SUBCARD} h-full`}>
        <h4 className="font-semibold text-sm text-gray-800 mb-1.5">客戶關係人資訊</h4>
        <div className="space-y-1.5">{allCards}</div>
      </div>
    );
  };

  // Generic section renderer used in detail pages
  const renderSection = (section, compact = false) => {
    if (!section) return <div className="flex items-center justify-center py-6"><span className="text-sm text-gray-400">無資料</span></div>;
    // simple key/value list
    if (Array.isArray(section.data) && section.data.length > 0) {
      return (
        <div className={compact ? "space-y-1" : "grid gap-2 text-sm"}>
          {section.data.map((d, i) => {
            const val = maskValue(d.label, d.value, Boolean(d.masked));
            return (
              <div key={i} className={compact ? "flex justify-between border-b border-gray-50 pb-0.5 last:border-0 text-xs" : "flex justify-between border-b pb-1"}>
                <div className={compact ? "text-gray-500" : "text-gray-600"}>{d.label}</div>
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
          <InteractionTimeline
            items={section.interactions}
            onItemClick={(item) => {
              setSelectedInteractionItem(item);
              setShowEventModal(true);
            }}
          />
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

    return <div className="flex items-center justify-center py-6"><span className="text-sm text-gray-400">無資料</span></div>;
  };

  // Horizontal timeline for interactions
  const InteractionTimeline = ({ items = [], onItemClick = null }) => {
    if (!items.length)
      return <div className="text-xs text-gray-500">無互動紀錄</div>;
    // Sort descending by time (newest first → leftmost)
    // Handles Chinese locale strings like "2026/4/2 上午12:00:00" and "2025/12/15 09:00"
    const parseTS = (s) => {
      // Extract YYYY/M/D or YYYY-M-D from any locale string
      const m = String(s).match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
      const d = new Date(s);
      return isNaN(d) ? new Date(0) : d;
    };
    const data = [...items].sort((a, b) => parseTS(b.time) - parseTS(a.time));
    const getColors = (it, idx) => {
      const status = it.status || (idx % 2 === 0 ? "處理中" : "已解決");
      const isWarn = status === "處理中" || status === "提醒";
      const isSuccess = status === "已解決" || status === "已發生";
      return {
        status,
        statusColor: isWarn ? "bg-yellow-400" : isSuccess ? "bg-green-500" : "bg-teal-500",
        badgeCls: isWarn ? "bg-yellow-100 text-yellow-800" : isSuccess ? "bg-green-100 text-green-800" : "bg-teal-100 text-teal-800",
      };
    };
    return (
      <div className="overflow-x-auto pb-2">
        <div className="min-w-max px-2">
          {/* Row 1: date labels */}
          <div className="flex gap-6 mb-1">
            {data.map((it, idx) => (
              <div key={idx} className="w-44 text-center text-[11px] text-gray-500 font-medium">{it.time}</div>
            ))}
          </div>
          {/* Row 2: axis line + dots — line centers perfectly via top-1/2 */}
          <div className="relative flex gap-6">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200" />
            {data.map((it, idx) => {
              const { statusColor } = getColors(it, idx);
              return (
                <div key={idx} className="w-44 flex justify-center relative z-10">
                  <div className={`w-4 h-4 rounded-full shadow ${statusColor}`} />
                </div>
              );
            })}
          </div>
          {/* Row 3: cards */}
          <div className="flex gap-6 mt-2">
            {data.map((it, idx) => {
              const { status, badgeCls } = getColors(it, idx);
              return (
                <div key={idx} className="w-44">
                  <div
                    className="p-2 rounded-lg bg-white shadow border border-teal-100 hover:shadow-md transition cursor-pointer text-xs"
                    onClick={() => { if (onItemClick) onItemClick(it); }}
                  >
                    <div className="font-medium text-gray-800 truncate mb-1 flex items-center gap-1">
                      <span>{it.channel}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeCls}`}>{status}</span>
                    </div>
                    <div className="text-gray-600 leading-snug line-clamp-2">{it.summary || it.detail}</div>
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
      if (/子女教育基金|教育基金規劃/.test(name)) return (sp.education || 0) * 0.6 + (sp.childcare || 0) * 0.4;
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
    // 使用動態產生的 preferences 而非硬編碼資料
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

  // 消費類別中英文對照表
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

  // 取得消費類別中文標籤
  const getSpendingCategoryLabel = (category) => {
    return SPENDING_CATEGORY_MAP[category] || category;
  };

  // 為每位客戶動態產生基本資訊 - 定義於 renderDetailView 外部，供 renderCustomerPreferences 存取
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
              { label: "客戶英文戶名", value: customer.nameEn || generateNameEn(customer.name) || "—" },
            ],
          },
          {
            name: "客戶工作資訊",
            data: (() => {
              const w = getCustomerWork(customer);
              return [
                { label: "行業別", value: w.industry || "—" },
                { label: "職業別", value: w.occupation || "—" },
                { label: "任職單位", value: w.employer || "—" },
                { label: "職稱", value: w.jobTitle || "—" },
                { label: "年資", value: w.seniority ? `${w.seniority} 年` : "—" },
                { label: "聘僱類型", value: w.employmentType || "—" },
              ];
            })(),
          },
        ],
      },
      contact: {
        title: "客戶聯絡資訊",
        sections: [
          {
            name: "聯絡方式與地址",
            data: (() => {
              const s = seedFromId(customer);
              const ADDR_POOL = [
                { city: "台北市信義區", streets: ["忠孝東路五段", "松高路", "基隆路一段", "松仁路"], areaCode: "02" },
                { city: "台北市大安區", streets: ["仁愛路四段", "復興南路一段", "和平東路一段", "敦化南路一段"], areaCode: "02" },
                { city: "台北市中山區", streets: ["中山北路二段", "民生東路三段", "長安東路二段", "建國北路一段"], areaCode: "02" },
                { city: "台北市松山區", streets: ["南京東路四段", "民生東路五段", "八德路三段", "敦化北路"], areaCode: "02" },
                { city: "台北市大同區", streets: ["重慶北路二段", "民生西路", "太原路", "南京西路"], areaCode: "02" },
                { city: "新北市板橋區", streets: ["文化路一段", "縣民大道", "府中路", "新府路"], areaCode: "02" },
                { city: "新北市三重區", streets: ["重新路三段", "中興北街", "龍門路", "集美街"], areaCode: "02" },
                { city: "新北市中和區", streets: ["中和路", "景平路", "連城路", "員山路"], areaCode: "02" },
                { city: "台中市西屯區", streets: ["台灣大道三段", "文心路一段", "黎明路二段", "永和路"], areaCode: "04" },
                { city: "台中市南屯區", streets: ["公益路", "惠中路一段", "大墩路", "精武路"], areaCode: "04" },
                { city: "台中市北區", streets: ["進化北路", "崇德路一段", "三民路三段", "學士路"], areaCode: "04" },
                { city: "高雄市鼓山區", streets: ["中華一路", "龍德路", "美術館路", "鼓山一路"], areaCode: "07" },
                { city: "高雄市左營區", streets: ["自由路", "博愛三路", "翠華路", "崇德路"], areaCode: "07" },
                { city: "台南市中西區", streets: ["中正路", "民生路一段", "忠義路二段", "西門路一段"], areaCode: "06" },
                { city: "桃園市中壢區", streets: ["中山東路二段", "延平路", "中正路", "新生路"], areaCode: "03" },
                { city: "桃園市桃園區", streets: ["中平路", "三民路", "春日路", "民生路"], areaCode: "03" },
                { city: "新竹市東區", streets: ["光復路一段", "中正路", "東大路一段", "金山十五街"], areaCode: "03" },
              ];
              const addr = customer.address || '';
              const matchEntry = ADDR_POOL.find(e => addr.includes(e.city) || (addr.length >= 3 && e.city.includes(addr.slice(0, 3))));
              const residEntry = matchEntry || ADDR_POOL[s % ADDR_POOL.length];
              const residStreet = residEntry.streets[(s + 7) % residEntry.streets.length];
              const residNum = ((s % 200) + 1);
              const residFloor = ((s >> 3) % 12) + 1;
              const residAddr = `中華民國（台灣）${residEntry.city}${residStreet}${residNum}號${residFloor}樓`;
              // Mailing: 1/3 chance different from residential
              const diffMailing = (s >> 5) % 3 === 0;
              let mailAddr;
              if (diffMailing) {
                const mEntry = ADDR_POOL[(s + 3) % ADDR_POOL.length];
                const mStreet = mEntry.streets[(s + 11) % mEntry.streets.length];
                const mNum = ((s + 13) % 200) + 1;
                mailAddr = `中華民國（台灣）${mEntry.city}${mStreet}${mNum}號`;
              } else {
                mailAddr = residAddr;
              }
              // Domicile: 50% chance different (hometown)
              const diffDomicile = (s >> 8) % 2 === 0;
              let domAddr;
              if (diffDomicile) {
                const dEntry = ADDR_POOL[(s + 5) % ADDR_POOL.length];
                const dStreet = dEntry.streets[(s + 17) % dEntry.streets.length];
                const dNum = ((s + 7) % 200) + 1;
                domAddr = `中華民國（台灣）${dEntry.city}${dStreet}${dNum}號`;
              } else {
                domAddr = residAddr;
              }
              // Landline: ~60% of customers
              const hasLandline = (s % 5) >= 2;
              const areaCode = residEntry.areaCode;
              const ld1 = String(2000 + (s % 7999)).slice(0, 4);
              const ld2 = String(1000 + ((s >> 4) % 8999)).slice(0, 4);
              const landline = hasLandline ? `(${areaCode}) ${ld1}-${ld2}` : null;
              const contactFields = [
                { label: "手機號碼", value: customer.phone || "—", masked: true },
                ...(landline ? [{ label: "市內電話", value: landline, masked: true }] : []),
                { label: "電子郵件", value: customer.email || "—", masked: false },
                { label: "居住地址", value: residAddr, masked: true },
                { label: "通訊地址", value: mailAddr, masked: true },
                { label: "戶籍地址", value: domAddr, masked: true },
                {
                  label: "聯絡偏好",
                  value: customer.preferredContact === "mobile" ? "行動 App"
                    : customer.preferredContact === "email" ? "Email"
                    : customer.preferredContact === "phone" ? "電話"
                    : customer.preferredContact || "—",
                },
                { label: "行銷同意", value: customer.marketingOptIn ? "允許" : "拒絕" },
              ];
              return contactFields;
            })(),
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
              return scoreB - scoreA; // 由高至低排序
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
                    entertainment: "娛樂", fashion: "時尚", sports: "運動", beauty: "美妝",
                    automotive: "汽車", home: "居家", petcare: "寵物", childcare: "育兒",
                    utilities: "水電瓦斯", overseas: "海外消費", insurance: "保险",
                  };
                  const prodMap = { creditCard: "高回饋卡", investment: "投資理財", loans: "貸款", deposits: "存款", insurance: "保險", wealth: "財富管理" };
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

  // ─── One-Page Mode (銀行櫃員速覽) ────────────────────────────────────────
  const renderOnePageView = () => {
    if (!selectedCustomer) return null;
    const c = selectedCustomer;
    const f = getCustomerFinance(c);
    const seed = seedFromId(c);
    const allInfo = generateCustomerBasicInfo(c);
    const riskLevel = c.riskLevel || 'low';
    const sf = seed + 777;
    const rflags = {
      blacklist:         riskLevel === 'high' && Boolean(sf & 1),
      depositAlert:      riskLevel === 'high' ? Boolean((sf >> 1) & 1) : riskLevel === 'medium' ? Boolean((sf >> 6) & 1) : false,
      courtSeizure:      riskLevel === 'high' && Boolean((sf >> 2) & 1),
      overdueCollection: riskLevel === 'high' ? Boolean((sf >> 3) & 1) : riskLevel === 'medium' ? Boolean((sf >> 7) & 1) : false,
      guaranteeAbnormal: riskLevel === 'high' && Boolean((sf >> 4) & 1),
      cardAbnormal:      riskLevel === 'high' ? Boolean((sf >> 5) & 1) : riskLevel === 'medium' ? Boolean((sf >> 8) & 1) : false,
    };
    const hasAnyFlag = Object.values(rflags).some(Boolean);
    const investSeed = seed + 4242;
    const investModes = ["保守型", "穩健型", "積極型", "高度積極"];
    const investMode  = investModes[investSeed % investModes.length];
    const parseTS2 = (sv) => { const m = String(sv).match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/); if (m) return new Date(+m[1], +m[2]-1, +m[3]).getTime(); const d = new Date(sv); return isNaN(d) ? 0 : d.getTime(); };

    // Section divider header
    const SecHeader = ({ Icon, title }) => (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border-l-4 border-teal-500 rounded-r-md">
        <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <span className="text-sm font-bold text-teal-700">{title}</span>
      </div>
    );
    const NoData = ({ label = '無資料' }) => (
      <div className="flex items-center justify-center py-6">
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    );

    // Pre-compute data needed for multiple sections
    const allProds = generateCustomerProducts(c);
    const transfers5 = generateRecentTransfers(c, 5);
    const cards5 = generateRecentCardAuths(c, 5);
    const transferTotal = transfers5.reduce((sum, t) => { const n = parseInt(t.amount.replace(/[^0-9-]/g, ''), 10); return sum + (isNaN(n) ? 0 : Math.abs(n)); }, 0);
    const fR = getCustomerFinance(c);
    const rSeed = seedFromId(c);
    const approval = new Date(2018 + (rSeed % 5), rSeed % 12, (rSeed % 26) + 1);
    const expiry = new Date(approval); expiry.setFullYear(approval.getFullYear() + 3);
    const available = Math.max(0, (fR.creditLimit || 0) - Math.round((fR.cardSpend3M || 0) / 3));
    const s = rSeed + 777;
    const dateFor = (offset) => new Date(2019 + ((s + offset) % 6), (s + offset) % 12, ((s + offset) % 26) + 1).toLocaleDateString();
    const dRisk = allInfo.risk || { title: '', sections: [] };
    const rawCh = generateCustomerInteractions(c, 5, 7);
    const maxTime = Math.max(...rawCh.map(it => parseTS2(it.time)));
    const custSeed = seedFromId(c);
    const showPending = c.id === 'C001' || custSeed % 3 === 0;
    let pendingAssigned = false;
    const ch = rawCh.map((it) => {
      const isNewest = showPending && !pendingAssigned && parseTS2(it.time) === maxTime;
      if (isNewest) pendingAssigned = true;
      return { ...it, status: isNewest ? '處理中' : '已發生', customerId: c.id, ...(isNewest && c.id === 'C001' ? { detail: '消費爭議款處理' } : {}) };
    });
    const fRating = getCustomerFinance(c);
    const cardFees      = Math.round(((fRating.cardSpend3M || 0) / 3) * 0.005);
    const depositMargin = Math.round((fRating.liquid || 0) * 0.001);
    const wealthFees    = Math.round((fRating.invest || 0) * 0.002);
    const loanInterest  = Math.round((fRating.loan || 0) * 0.03);
    const investFees    = Math.round((fRating.invest || 0) * 0.0015);
    const total = Math.max(1, cardFees + depositMargin + wealthFees + loanInterest + investFees);
    const contribColors = ["#14b8a6", "#06b6d4", "#34d399", "#0ea5a4", "#7dd3fc"];
    const contribItems = [
      { label: '信用卡手續費 / 年費估值', value: cardFees },
      { label: '存款利差貢獻',            value: depositMargin },
      { label: '財富管理/顧問費用',        value: wealthFees },
      { label: '貸款利息貢獻',            value: loanInterest },
      { label: '投資相關手續費',           value: investFees },
    ].filter(it => it.value > 0);
    const donutData = contribItems.map(it => ({ label: it.label, value: Math.max(1, Math.round((it.value / total) * 100)) }));
    const iSeed = seed + 4242;
    const iMode = investModes[iSeed % investModes.length];
    const iUpdated = new Date(2021 + (iSeed % 4), (iSeed >> 2) % 12, ((iSeed >> 3) % 26) + 1).toLocaleDateString();
    const proInvestor = Boolean((iSeed >> 5) & 1);

    return (
      <div className="space-y-2">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-700 text-lg font-bold flex-shrink-0">
              {c.name?.charAt(0) || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold">{c.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTierBgClass(c.vipLevel)}`}>{getTierDisplayLabel(c.vipLevel)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${riskLevel === 'high' ? 'bg-red-600 text-white' : riskLevel === 'medium' ? 'bg-yellow-500 text-white' : 'bg-teal-500 text-white'}`}>風險評級: {c.riskScore}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{investMode}</span>
              </div>
              <div className="text-teal-100 text-xs mt-0.5">
                {c.id} ・ {c.age}歲 ・ {c.gender === 'male' ? '男' : '女'} ・ {c.maritalStatus} ・ {c.occupation || '—'} ・ {c.nationality}
              </div>
            </div>
          </div>
          <button onClick={() => setActiveModule("search")} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-xs flex-shrink-0">返回搜尋</button>
        </div>

        {/* ── Alert Banner ────────────────────────────────────────────── */}
        <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 flex-wrap ${hasAnyFlag ? 'bg-red-50 border border-red-300' : 'bg-green-50 border border-green-200'}`}>
          <span className={`text-xs font-bold ${hasAnyFlag ? 'text-red-700' : 'text-green-700'}`}>{hasAnyFlag ? '客戶警示' : '無異常警示'}</span>
          {rflags.blacklist         && <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-semibold animate-pulse">黑名單</span>}
          {rflags.depositAlert      && <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-semibold">存款警示</span>}
          {rflags.courtSeizure      && <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-semibold">法院扣押</span>}
          {rflags.overdueCollection && <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-semibold">逾期/催收</span>}
          {rflags.guaranteeAbnormal && <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-semibold">授信保證異常</span>}
          {rflags.cardAbnormal      && <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-semibold">信用卡異常</span>}
          {!hasAnyFlag && <span className="text-xs text-green-600">所有往來狀態正常，可正常服務</span>}
        </div>

        {/* ── Quick Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '總資產',   value: `NT$ ${f.netWorth.toLocaleString()}`,      hi: true },
            { label: '總負債',   value: `NT$ ${f.loan.toLocaleString()}` },
            { label: '月收入',   value: `NT$ ${f.monthlyIncome.toLocaleString()}` },
            { label: '行銷分數', value: String(f.marketingScore) },
          ].map(({ label, value, hi }) => (
            <div key={label} className={SUBCARD}>
              <div className="text-xs text-gray-500 mb-0.5">{label}</div>
              <div className={`text-base font-bold tabular-nums ${hi ? 'text-teal-600' : 'text-gray-800'}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── 優先行動建議 ─────────────────────────────────────────────── */}
        {(() => {
          const sp = c.spendingCategories || {};
          const pp = c.productPreferences || {};
          const intentScorer = (name) => {
            if (/子女教育基金|教育基金規劃/.test(name)) return (sp.education || 0) * 0.6 + (sp.childcare || 0) * 0.4;
            if (/旅遊|出國/.test(name)) return Math.max(sp.travel || 0, sp.overseas || 0) * 0.9 + (pp.creditCard || 0) * 0.1;
            if (/信用卡/.test(name)) return pp.creditCard || 0;
            if (/投資|理財/.test(name)) return pp.investment || 0;
            if (/房貸/.test(name)) return (pp.loans || 0) * 0.8 + (sp.groceries || 0) * 0.2;
            if (/信貸/.test(name)) return (pp.loans || 0) * 0.7;
            if (/留學/.test(name)) return sp.education || 0;
            return 0.5;
          };
          // 建立完整意圖標籤清單
          const explicitIntents = (c.tags || [])
            .filter(t => typeof t === 'string' && t.includes('意圖'))
            .map(name => ({ name, score: intentScorer(name) }));
          const allCandidates = explicitIntents.length > 0
            ? [...explicitIntents].sort((a, b) => b.score - a.score)
            : [
                { name: '出國旅遊意圖', score: Math.max(sp.travel || 0, sp.overseas || 0) },
                { name: '投資理財意圖', score: pp.investment || 0 },
                { name: '信用卡申辦意圖', score: pp.creditCard || 0 },
                { name: '房貸需求', score: pp.loans || 0 },
                { name: '個人信貸意圖', score: (pp.loans || 0) * 0.7 },
              ].filter(t => t.score > 0).sort((a, b) => b.score - a.score);

          // 優先（score ≥ 0.8）先取，不足再以其他補足，共 6 個
          const priority = allCandidates.filter(t => t.score >= 0.8);
          const others   = allCandidates.filter(t => t.score < 0.8);
          const display  = [...priority, ...others].slice(0, 3);
          if (!display.length) return null;

          return (
            <div className={SUBCARD}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-sm font-bold text-gray-800">⚡ 行動建議方案</span>
                <span className="text-[11px] text-gray-400">依客戶意圖排序・點擊卡片查看完整話術與推薦產品</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {display.map((tag, idx) => {
                  const score = typeof tag.score === 'number' ? tag.score : parseFloat(tag.score || '0');
                  const isPriority = score >= 0.8;
                  const insight = buildIntentInsight(tag, c);
                  const topProduct = insight.recs?.[0]?.name || '—';
                  const productReason = insight.recs?.[0]?.reason || '';
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border cursor-pointer hover:shadow-md transition-all group flex flex-col ${
                        isPriority
                          ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
                          : 'bg-white border-gray-200 hover:border-teal-300'
                      }`}
                      onClick={() => setInsightModal({ type: 'intent', data: insight, customer: c })}
                    >
                      {/* 卡片頂部：意圖名稱 + 優先標章 */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg ${isPriority ? 'bg-amber-100' : 'bg-gray-50'}`}>
                        {isPriority && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-gray-800 truncate flex-1">{tag.name}</span>
                        {isPriority && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold flex-shrink-0">優先</span>
                        )}
                      </div>
                      {/* 卡片主體：推薦產品 */}
                      <div className="px-2.5 py-1.5 flex-1">
                        <div className="text-[10px] text-gray-400 mb-0.5">建議推薦產品</div>
                        <div className="text-xs font-semibold text-teal-700 leading-snug">{topProduct}</div>
                      </div>
                      {/* 卡片底部：點擊提示 */}
                      <div className={`px-2.5 py-1 rounded-b-lg text-[10px] font-medium flex items-center justify-between border-t ${
                        isPriority ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-gray-100 text-teal-600 bg-gray-50'
                      }`}>
                        <span>查看話術與完整方案</span>
                        <span className="opacity-60 group-hover:opacity-100 transition-opacity">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── 基本資訊 + 聯絡資訊（服務基本所需，置頂一列）────────────── */}
        {(() => {
          const dBasic = allInfo.basic || { title: '', sections: [] };
          const dContact = allInfo.contact || { title: '', sections: [] };
          return (
            <div className="flex gap-2 items-stretch">
              {/* 基本資訊 ── flex-[3] ≈ 75% 寬 */}
              <div className="flex-[3] min-w-0 flex flex-col gap-2">
                <SecHeader Icon={FileText} title="基本資訊" />
                <div className="grid grid-cols-3 gap-2 flex-1 items-stretch">
                  {/* 欄 1: 身份 / 證件資訊 */}
                  <div className={SUBCARD}>
                    <h4 className="font-semibold text-sm mb-1.5 text-gray-800">身份 / 證件資訊</h4>
                    <div className="space-y-1 text-xs">
                      {[
                        { label: '個人國籍', value: c.nationality },
                        { label: '學歷',     value: c.education },
                        { label: '婚姻狀態', value: c.maritalStatus },
                        { label: '證件類別', value: c.idType },
                        { label: '證件號碼', value: showMaskedData ? maskId(c.idCard) : c.idCard },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between border-b border-gray-50 pb-0.5 last:border-0">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-800">{value || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 欄 2: 客戶名稱 + 工作資訊（堆疊） */}
                  <div className="flex flex-col gap-2">
                    {dBasic.sections.map((section, idx) => (
                      <div key={idx} className={`${SUBCARD} flex-1`}>
                        <h4 className="font-semibold text-sm mb-1.5 text-gray-800">{section.name}</h4>
                        {renderSection(section, true)}
                      </div>
                    ))}
                  </div>
                  {/* 欄 3: 客戶關係人資訊 */}
                  <div className="flex flex-col">{renderRelationships()}</div>
                </div>
              </div>
              {/* 聯絡資訊 ── flex-[1] ≈ 25% 寬 */}
              <div className="flex-[1] min-w-0 flex flex-col gap-2">
                <SecHeader Icon={Users} title="聯絡資訊" />
                <div className="flex flex-col gap-2 flex-1">
                  {dContact.sections.map((section, idx) => (
                    <div key={idx} className={`${SUBCARD} flex-1`}>
                      <h4 className="font-semibold text-sm mb-1.5 text-gray-800">{section.name}</h4>
                      {renderSection(section, true)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 業務往來（全寬）══════════════════════════════════════════ */}
        <div className="space-y-2">
          <SecHeader Icon={Star} title="業務往來" />
          <div className="space-y-2">
            {/* Row 1: 累計統計 | 近五筆轉帳 | 近五筆信用卡授權明細 */}
            <div className="grid grid-cols-3 gap-3 items-start">
              <div className={SUBCARD}>
                <h4 className="font-semibold text-sm mb-1.5 text-gray-800">客戶業務往來累計</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '持有產品總數',       value: `${allProds.length} 項` },
                    { label: '近三個月信用卡消費',  value: `NT$ ${f.cardSpend3M.toLocaleString()}` },
                    { label: '近五筆轉帳合計',      value: `NT$ ${transferTotal.toLocaleString()}` },
                    { label: '信用卡額度動用率',        value: `${f.creditUtilPct}%` },
                  ].map(st => (
                    <div key={st.label} className="bg-gray-50 rounded-lg p-2.5">
                      <div className="text-xs text-gray-500 mb-0.5">{st.label}</div>
                      <div className="font-semibold text-gray-800 text-sm tabular-nums">{st.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={SUBCARD}>
                <h4 className="font-semibold text-sm mb-1.5 text-gray-800">近五筆轉帳</h4>
                <div className="space-y-1 text-xs">
                  {transfers5.map((t, i) => (
                    <div key={i} className="grid border-b border-gray-50 py-0.5 last:border-0" style={{gridTemplateColumns:'5rem 1fr auto',gap:'0.5rem'}}>
                      <span className="text-gray-700 truncate">{t.merchant}</span>
                      <span className="text-gray-400 truncate">{t.time}</span>
                      <span className="font-medium tabular-nums text-right">{t.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={SUBCARD}>
                <h4 className="font-semibold text-sm mb-1.5 text-gray-800">近五筆信用卡授權明細</h4>
                <div className="space-y-1 text-xs">
                  {cards5.map((t, i) => (
                    <div key={i} className="grid border-b border-gray-50 py-0.5 last:border-0" style={{gridTemplateColumns:'5rem 1fr auto',gap:'0.5rem'}}>
                      <span className="text-gray-700 truncate">{t.merchant}</span>
                      <span className="text-gray-400 truncate">{t.time}</span>
                      <span className="font-medium tabular-nums text-right">{t.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Row 2: 客戶開辦業務 — 四種產品橫排一列 */}
            <div className={SUBCARD}>
              <h4 className="font-semibold text-sm mb-1.5 text-gray-800">客戶開辦業務</h4>
              <CustomerProductTree key={c.id} products={allProds} layout="horizontal" />
            </div>
          </div>
        </div>

        {/* ── 其餘 8 個模組：兩欄獨立堆疊 ─────────────────────────────────── */}
        <div className="grid gap-3" style={{gridTemplateColumns: '1fr 3fr'}}>

          {/* 左欄：風險資訊 — 1/4 寬，absolute 填滿行高 */}
          <div className="relative">
            <div className="absolute inset-0 flex flex-col gap-2 overflow-hidden">
              <div className="flex-shrink-0"><SecHeader Icon={Shield} title="風險資訊" /></div>
              {/* single white card fills remaining height; inner content scrolls */}
              <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm overflow-y-auto p-3 flex flex-col gap-3">
                {dRisk.sections.length > 0 && dRisk.sections.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-sm mb-1.5 text-gray-800">{section.name}</h4>
                    {renderSection(section, true)}
                  </div>
                ))}
                <div>
                  <h4 className="font-semibold text-sm mb-1.5 text-gray-800">客戶信用限額</h4>
                  <div className="space-y-1 text-xs">
                    {[
                      { label: '信用卡 / 預借額度',  value: fR.creditLimit ? `NT$ ${fR.creditLimit.toLocaleString()}` : 'N/A' },
                      { label: '擔保品鑑估值',       value: fR.collateralEstimated ? `NT$ ${fR.collateralEstimated.toLocaleString()}` : '無' },
                      { label: '信用卡目前可用額度', value: fR.creditLimit ? `NT$ ${available.toLocaleString()}` : 'N/A' },
                      { label: '核准日期',           value: approval.toLocaleDateString() },
                      { label: '有效日期',           value: expiry.toLocaleDateString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between border-b border-gray-50 pb-0.5 last:border-0">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1.5 text-gray-800">違約 / 重大事件資訊</h4>
                  <div className="space-y-1 text-xs">
                    {[
                      { label: '拒絕往來 / 黑名單', flag: rflags.blacklist,         yes: '是',                   no: '否',   yc: 'bg-red-600 text-white animate-pulse' },
                      { label: '存款警示',          flag: rflags.depositAlert,      yes: '已警示',               no: '否',   yc: 'bg-yellow-500 text-white' },
                      { label: '法院扣押',          flag: rflags.courtSeizure,      yes: '有',                   no: '無',   yc: 'bg-red-600 text-white' },
                      { label: '逾期/催收/呆帳',    flag: rflags.overdueCollection, yes: '存在',                 no: '無',   yc: 'bg-red-600 text-white' },
                      { label: '授信保證異常',      flag: rflags.guaranteeAbnormal, yes: '異常',                 no: '正常', yc: 'bg-red-600 text-white' },
                      { label: '信用卡往來異常',    flag: rflags.cardAbnormal,      yes: `異常 (${dateFor(3)})`, no: '無',   yc: 'bg-red-600 text-white' },
                    ].map(({ label, flag, yes, no, yc }) => (
                      <div key={label} className="flex justify-between border-b border-gray-50 pb-0.5 last:border-0">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium">
                          {flag ? <span className={`px-1.5 py-0.5 rounded text-xs ${yc}`}>{yes}</span> : <span className="text-gray-600">{no}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>{/* end absolute */}
          </div>{/* end 風險資訊 relative */}

          {/* 財務狀況 — 3/4 寬，決定行高 */}
          <div className="min-w-0 flex flex-col gap-2">
            <div className="space-y-2">
              <SecHeader Icon={TrendingUp} title="財務狀況" />
              <div className={SUBCARD}>
                <h4 className="font-semibold text-sm mb-1.5 text-gray-800">財務狀況視覺化分析</h4>
                {renderFinancialCharts(true)}
              </div>
            </div>
          </div>
        </div>{/* end Row A */}

        {/* ── Row B: 互動紀錄 + 評價資訊 ── */}
        {/* grid layout: right col sets row height; left col uses absolute inset-0 to fill without contributing to height */}
        <div className="grid gap-3" style={{gridTemplateColumns: '1fr 1fr'}}>
          {/* 左側: 互動紀錄 — relative wrapper, content absolutely fills grid cell */}
          <div className="relative">
            {/* absolute inset-0: height = grid row height (set by right col); flex-col enables height chain */}
            <div className="absolute inset-0 flex flex-col gap-2 overflow-hidden">
              <div className="flex-shrink-0"><SecHeader Icon={Clock} title="互動紀錄" /></div>
              {(() => {
                const events = generateCustomerEvents(c);
                const parseTS3 = (sv) => { const m = String(sv).match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/); if (m) return new Date(+m[1], +m[2]-1, +m[3]).getTime(); const d = new Date(sv); return isNaN(d) ? 0 : d.getTime(); };
                const getStatusCls = (status) => {
                  if (status === '提醒' || status === '處理中') return 'bg-yellow-100 text-yellow-800';
                  if (status === '已發生' || status === '已解決') return 'bg-green-100 text-green-800';
                  return 'bg-teal-100 text-teal-800';
                };
                const getDotCls = (status) => {
                  if (status === '提醒' || status === '處理中') return 'bg-yellow-400';
                  if (status === '已發生' || status === '已解決') return 'bg-green-500';
                  return 'bg-teal-500';
                };
                const CompactList = ({ items, emptyText }) => {
                  if (!items || !items.length) return <div className="flex items-center justify-center py-4"><span className="text-sm text-gray-400">{emptyText || '無紀錄'}</span></div>;
                  const sorted = [...items].sort((a, b) => parseTS3(b.time) - parseTS3(a.time));
                  return (
                    <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 space-y-1">
                      {sorted.map((it, idx) => {
                        const status = it.status || '已發生';
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-teal-50 cursor-pointer transition-colors group"
                            onClick={() => { setSelectedInteractionItem(it); setShowEventModal(true); }}
                          >
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${getDotCls(status)}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-medium text-gray-800 truncate">{it.channel}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${getStatusCls(status)}`}>{status}</span>
                              </div>
                              <div className="text-[11px] text-gray-500 truncate">{it.summary || it.detail}</div>
                            </div>
                            <div className="text-[10px] text-gray-400 flex-shrink-0 pt-0.5 whitespace-nowrap">{String(it.time).replace(/\s*上午.*|下午.*|\s*\d{1,2}:\d{2}(:\d{2})?$/, '')}</div>
                            <span className="text-[10px] text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">›</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                };
                // grid is direct flex-1 child of absolute div → definite height → SUBCARD stretches → CompactList scrolls
                return (
                  <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
                    <div className={`${SUBCARD} flex flex-col overflow-hidden`}>
                      <h4 className="font-semibold text-xs mb-1.5 text-gray-700 flex-shrink-0">客戶事件紀錄</h4>
                      <CompactList items={events} emptyText="無事件紀錄" />
                    </div>
                    <div className={`${SUBCARD} flex flex-col overflow-hidden`}>
                      <h4 className="font-semibold text-xs mb-1.5 text-gray-700 flex-shrink-0">通路互動紀錄</h4>
                      <CompactList items={ch} emptyText="無互動紀錄" />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          {/* 評價資訊 — 決定行高 */}
          <div className="flex flex-col gap-2">
            <div className="space-y-2">
              <SecHeader Icon={Star} title="評價資訊" />
              <div className="space-y-2">
                <div className={SUBCARD}>
                  <h4 className="font-semibold text-sm mb-1.5 text-gray-800">客戶貢獻度</h4>
                  <div className="rounded-lg p-2 bg-gray-50 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <DonutInteractive data={donutData} colors={contribColors.slice(0, contribItems.length)} size={120} centerText={{ line1: `${(total / 1000).toFixed(1)}K`, line2: '年貢獻' }} />
                    </div>
                    <div className="flex-1 space-y-1">
                      {contribItems.map((it, i) => (
                        <div key={it.label} className="flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: contribColors[i] }} />
                          <span className="text-gray-700 flex-1 truncate">{it.label}</span>
                          <span className="font-semibold text-gray-800 tabular-nums">NT$ {it.value.toLocaleString()}</span>
                          <span className="text-gray-400 w-8 text-right tabular-nums">{Math.round((it.value / total) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={SUBCARD}>
                  <h4 className="font-semibold text-sm mb-1.5 text-gray-800">客戶投資屬性資訊</h4>
                  <div className="space-y-1 text-xs">
                    {[
                      { label: '投資屬性',         value: iMode },
                      { label: '投資屬性更新日期', value: iUpdated },
                      { label: '專業投資人',       value: proInvestor ? '是' : '否' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between border-b border-gray-50 pb-0.5 last:border-0">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>{/* end Row B */}

        {/* ── Row C: 標籤資訊 + 偏好資訊 ── */}
        <div className="flex gap-3 items-stretch">
          <div className="flex-1 min-w-0 flex flex-col gap-2">

            {/* TAB 8: 標籤資訊（緊湊 inline） */}
            <div className="space-y-2 flex-1">
              <SecHeader Icon={Filter} title="標籤資訊" />
              {(() => {
                const sp2 = c.spendingCategories || {};
                const pp2 = c.productPreferences || {};
                const iScorer = (name) => {
                  if (/子女教育基金|教育基金規劃/.test(name)) return (sp2.education || 0) * 0.6 + (sp2.childcare || 0) * 0.4;
                  if (/旅遊|出國/.test(name)) return Math.max(sp2.travel || 0, sp2.overseas || 0) * 0.9 + (pp2.creditCard || 0) * 0.1;
                  if (/信用卡/.test(name)) return pp2.creditCard || 0;
                  if (/投資|理財/.test(name)) return pp2.investment || 0;
                  if (/房貸/.test(name)) return (pp2.loans || 0) * 0.8 + (sp2.groceries || 0) * 0.2;
                  if (/信貸/.test(name)) return (pp2.loans || 0) * 0.7;
                  if (/留學/.test(name)) return sp2.education || 0;
                  return 0.5;
                };
                const intentTagObjs = (c.tags || [])
                  .filter(t => typeof t === 'string' && t.includes('意圖'))
                  .map(name => ({ name, score: iScorer(name) }))
                  .sort((a, b) => b.score - a.score);
                const otherTags  = (c.tags || []).filter(t => typeof t === 'string' && !t.includes('意圖'));
                const structuredByCat = {};
                (c.structuredTags || []).forEach(t => {
                  if (!structuredByCat[t.category]) structuredByCat[t.category] = [];
                  structuredByCat[t.category].push(t.name);
                });
                const hasAnyTag = intentTagObjs.length > 0 || otherTags.length > 0 || Object.values(structuredByCat).some(ns => ns.length > 0);
                if (!hasAnyTag) return <NoData />;
                return (
                  <div className="grid grid-cols-2 gap-2 items-stretch">
                    {intentTagObjs.length > 0 && (
                      <div className={`${SUBCARD} h-full`}>
                        <h4 className="font-semibold text-sm mb-1.5 text-gray-800">意圖標籤</h4>
                        <div className="space-y-1">
                          {intentTagObjs.map((tag, i) => {
                            const isPriority = tag.score >= 0.8;
                            const pct = Math.max(4, Math.round(tag.score * 100));
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-0 text-xs px-2 py-1 rounded-lg cursor-pointer hover:shadow-md transition-all group border ${isPriority ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-gray-50 border-gray-100 hover:border-teal-200'}`}
                                onClick={() => setInsightModal({ type: 'intent', data: buildIntentInsight(tag, c), customer: c })}
                              >
                                <span className="text-gray-700 min-w-0 truncate font-medium">{tag.name}</span>
                                <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-2">
                                  {isPriority && <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">優先</span>}
                                  <div className="w-10 bg-gray-200 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-gray-700 font-medium w-7 text-right tabular-nums">{pct}%</span>
                                </div>
                                <span className="w-2 text-center text-[11px] text-teal-500 flex-shrink-0 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-out">→</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {otherTags.length > 0 && (
                      <div className={`${SUBCARD} h-full`}>
                        <h4 className="font-semibold text-sm mb-1.5 text-gray-800">行為標籤</h4>
                        <div className="flex flex-wrap gap-1">
                          {otherTags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs">{t}</span>)}
                        </div>
                      </div>
                    )}
                    {Object.entries(structuredByCat).filter(([, ns]) => ns.length > 0).map(([cat, ns]) => (
                      <div key={cat} className={`${SUBCARD} h-full`}>
                        <h4 className="font-semibold text-sm mb-1.5 text-gray-800">{cat}</h4>
                        <div className="flex flex-wrap gap-1">
                          {ns.map((n, i) => <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{n}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

          </div>
          {/* 偏好資訊 — Row C right */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">

            {/* TAB 9: 偏好資訊（緊湊 inline） */}
            <div className="space-y-2 flex-1">
              <SecHeader Icon={Users} title="偏好資訊" />
              {(() => {
                const prefsData = generateCustomerBasicInfo(c).preferences;
                if (!prefsData) return <NoData />;
                return (
                  <div className="grid grid-cols-2 gap-2 items-stretch">
                    {prefsData.sections.map((section, sIdx) => {
                      const isProd  = section.name.includes('產品');
                      const isSpend = section.name.includes('消費');
                      const isChan  = section.name.includes('通路');
                      return (
                        <div key={sIdx} className={`${SUBCARD} h-full`}>
                          <h4 className="font-semibold text-sm mb-1.5 text-gray-800">{section.name}</h4>

                          {/* 產品偏好：優先 badge + 點擊開啟產品方案 */}
                          {isProd && section.preferences && section.preferences.length > 0 && (
                            <div className="space-y-1">
                              {section.preferences.map((p, i) => {
                                const pct = parsePercent(p.score || p.percentage || p.usage);
                                const insight = buildProductInsight(p, c);
                                const isPriority = insight.gap >= 0 && pct >= 70;
                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-0 text-xs px-2 py-1 rounded-lg cursor-pointer hover:shadow-md transition-all group border ${isPriority ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-gray-50 border-gray-100 hover:border-teal-200'}`}
                                    onClick={() => setInsightModal({ type: 'product', data: insight, customer: c })}
                                  >
                                    <span className="text-gray-700 min-w-0 truncate font-medium">{p.product || p.label || p.name}</span>
                                    <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-2">
                                      {isPriority && <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">優先</span>}
                                      <div className="w-10 bg-gray-200 rounded-full h-1.5">
                                        <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${Math.max(4, pct)}%` }} />
                                      </div>
                                      <span className="text-gray-700 font-medium w-7 text-right tabular-nums">{Math.round(pct)}%</span>
                                    </div>
                                    <span className="w-2 text-center text-[11px] text-teal-500 flex-shrink-0 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-out">→</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 消費偏好：優先 badge + 點擊開啟消費洞察 */}
                          {isSpend && section.preferences && section.preferences.length > 0 && (
                            <div className="space-y-1">
                              {section.preferences.map((p, i) => {
                                const pct = parsePercent(p.score || p.percentage || p.usage);
                                const spInsight = buildSpendingInsight(p, c);
                                const isPriority = (spInsight.crossRef || spInsight.seasonal) && i < 3;
                                const label = p.label || p.name || p.category || p.product || '';
                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-0 text-xs px-2 py-1 rounded-lg cursor-pointer hover:shadow-md transition-all group border ${isPriority ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-gray-50 border-gray-100 hover:border-teal-200'}`}
                                    onClick={() => setInsightModal({ type: 'spending', data: spInsight, customer: c })}
                                  >
                                    <span className="text-gray-700 min-w-0 truncate">{label}</span>
                                    <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-2">
                                      {isPriority && <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">優先</span>}
                                      <div className="w-10 bg-gray-200 rounded-full h-1.5">
                                        <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${Math.max(4, pct)}%` }} />
                                      </div>
                                      <span className="text-gray-700 font-medium w-7 text-right tabular-nums">{Math.round(pct)}%</span>
                                    </div>
                                    <span className="w-2 text-center text-[11px] text-teal-500 flex-shrink-0 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-out">→</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 通路偏好：僅顯示進度條，不可點擊 */}
                          {isChan && section.preferences && section.preferences.length > 0 && (
                            <div className="space-y-1">
                              {section.preferences.map((p, i) => {
                                const pct = parsePercent(p.score || p.percentage || p.usage);
                                const label = p.channel ? channelLabel(p.channel) : (p.label || p.name || '');
                                return (
                                  <div key={i} className="flex items-center gap-2 text-xs border-b border-gray-50 pb-0.5 last:border-0">
                                    <span className="text-gray-600 flex-1 truncate">{label}</span>
                                    <div className="w-16 bg-gray-200 rounded-full h-1.5 flex-shrink-0">
                                      <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${Math.max(4, pct)}%` }} />
                                    </div>
                                    <span className="text-gray-700 font-medium w-7 text-right flex-shrink-0 tabular-nums">{Math.round(pct)}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 行銷同意 & 其他：純文字顯示 */}
                          {!isProd && !isSpend && !isChan && section.preferences && section.preferences.length > 0 && (
                            <div className="space-y-1 text-xs">
                              {section.preferences.map((p, i) => {
                                const label = p.label || p.name || p.category || '';
                                const val = p.value || p.status || '';
                                return (
                                  <div key={i} className="flex justify-between border-b border-gray-50 pb-0.5 last:border-0">
                                    <span className="text-gray-500">{label}</span>
                                    <span className="font-medium text-gray-800">{val}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* items fallback */}
                          {section.items && (
                            <div className="space-y-1 text-xs">
                              {section.items.map((it, i) => (
                                <div key={i} className="flex justify-between border-b border-gray-50 pb-0.5 last:border-0">
                                  <span className="text-gray-500">{it.label || it.name}</span>
                                  <span className="font-medium text-gray-800">{it.value || it.status || '—'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>{/* end Row C */}

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
                            const isColonTitle = parts.length > 1 && parts[0].length <= 20 && /^(【.*】|開場|洞察|利益|產品串接|疑慮處理|行動|概況|摘要|風險提示)$/.test(parts[0].trim());
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
                  className="flex-1 px-3 py-2 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
                <button
                  className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-1"
                  onClick={() => { sendAssistant(assistantInput); }}
                >
                  <Send className="w-4 h-4" />
                  送出
                </button>
              </div>
            </div>
          )}
        </>
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

    // Delegate to one-page mode when toggled
    if (viewMode === "onepage") return renderOnePageView();

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
          {/* Customer Header Card */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-teal-600 text-2xl font-bold">
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
                      // Count all intent tags with score >= 0.8
                      const allIntentTags = (selectedCustomer?.tags || []).filter(t => typeof t === 'string' && t.includes('意圖'));
                      const sp2 = selectedCustomer?.spendingCategories || {};
                      const pp2 = selectedCustomer?.productPreferences || {};
                      const headerIntentScorer = (name) => {
                        if (/子女教育基金|教育基金規劃/.test(name)) return (sp2.education || 0) * 0.6 + (sp2.childcare || 0) * 0.4;
                        if (/旅遊|出國/.test(name)) return Math.max(sp2.travel || 0, sp2.overseas || 0) * 0.9 + (pp2.creditCard || 0) * 0.1;
                        if (/信用卡/.test(name)) return pp2.creditCard || 0;
                        if (/投資|理財/.test(name)) return pp2.investment || 0;
                        if (/房貸/.test(name)) return (pp2.loans || 0) * 0.8 + (sp2.groceries || 0) * 0.2;
                        if (/信貸/.test(name)) return (pp2.loans || 0) * 0.7;
                        if (/留學/.test(name)) return sp2.education || 0;
                        return 0.5;
                      };
                      const intentPriorityCount = allIntentTags.filter(name => headerIntentScorer(name) >= 0.8).length;
                      const hasIntentPriority = intentPriorityCount > 0;
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
                              <CountBadge n={intentPriorityCount} />
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

          {/* Business tab: product tree + recent transactions */}
          {activeTab === "business" && selectedCustomer && (
            <div className="space-y-4">
              {/* 客戶業務往來累計 */}
              {(() => {
                const f = getCustomerFinance(selectedCustomer);
                const allProds = generateCustomerProducts(selectedCustomer);
                const transfers = generateRecentTransfers(selectedCustomer, 5);
                const transferTotal = transfers.reduce((sum, t) => {
                  const num = parseInt(t.amount.replace(/[^0-9-]/g, ""), 10);
                  return sum + (isNaN(num) ? 0 : Math.abs(num));
                }, 0);
                const stats = [
                  { label: "持有產品總數",       value: `${allProds.length} 項` },
                  { label: "近三個月信用卡消費",  value: `NT$ ${f.cardSpend3M.toLocaleString()}` },
                  { label: "近五筆轉帳合計",      value: `NT$ ${transferTotal.toLocaleString()}` },
                  { label: "信用卡額度動用率",        value: `${f.creditUtilPct}%` },
                ];
                return (
                  <div className={SUBCARD}>
                    <h4 className="font-bold text-md mb-3 text-gray-800">客戶業務往來累計</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {stats.map((st) => (
                        <div key={st.label} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">{st.label}</div>
                          <div className="font-semibold text-gray-800 text-sm">{st.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className={SUBCARD}>
                <h4 className="font-bold text-md mb-3 text-gray-800">客戶開辦業務</h4>
                <CustomerProductTree
                  key={selectedCustomer.id}
                  products={generateCustomerProducts(selectedCustomer)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={SUBCARD}>
                  <div className="font-bold text-md mb-2 text-gray-800">近五筆轉帳</div>
                  <div className="space-y-2 text-sm">
                    {generateRecentTransfers(selectedCustomer, 5).map((t, i) => (
                      <div key={i} className={SUBCARD}>
                        <div className="flex justify-between border-b pb-1">
                          <div className="font-medium">{t.merchant}</div>
                          <div className="text-right font-medium">{t.amount}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{t.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={SUBCARD}>
                  <div className="font-bold text-md mb-2 text-gray-800">近五筆信用卡授權明細</div>
                  <div className="space-y-2 text-sm">
                    {generateRecentCardAuths(selectedCustomer, 5).map((t, i) => (
                      <div key={i} className={SUBCARD}>
                        <div className="flex justify-between border-b pb-1">
                          <div className="font-medium">{t.merchant}</div>
                          <div className="text-right font-medium">{t.amount}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{t.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
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
                    className="flex-1 px-3 py-2 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
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
                          <div className="text-gray-600">客戶編號</div>
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
            activeTab !== "preferences" &&
            activeTab !== "business" && (
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

                  {/* Interactions tab: ensure 3-6 interactions and show customer service records */}
                  {activeTab === "interactions" && selectedCustomer && (
                    <div className="mt-4 space-y-3">
                      <div id="interaction-pending" className={SUBCARD}>
                        <div className="font-bold text-md mb-2 text-gray-800">通路互動紀錄</div>
                        {(() => {
                          const rawCh = generateCustomerInteractions(selectedCustomer, 5, 7);
                          const parseTS2 = (s) => { const m = String(s).match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/); if (m) return new Date(+m[1], +m[2]-1, +m[3]).getTime(); const d = new Date(s); return isNaN(d) ? 0 : d.getTime(); };
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
                    <div className="mt-4 grid grid-cols-2 gap-4 items-start">
                      <div className={SUBCARD}>
                        <h4 className="font-bold text-md mb-2 text-gray-800">
                          客戶貢獻度
                        </h4>
                        {(() => {
                          const f = getCustomerFinance(selectedCustomer);
                          const cardFees = Math.round(
                            ((f.cardSpend3M || 0) / 3) * 0.005
                          );
                          const depositMargin = Math.round(
                            (f.liquid || 0) * 0.001
                          );
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
                          const contribColors = [
                            "#14b8a6",
                            "#06b6d4",
                            "#34d399",
                            "#0ea5a4",
                            "#7dd3fc",
                          ];
                          const contribItems = [
                            { label: "信用卡手續費 / 年費估值", value: cardFees },
                            { label: "存款利差貢獻", value: depositMargin },
                            { label: "財富管理/顧問費用", value: wealthFees },
                            { label: "貸款利息貢獻", value: loanInterest },
                            { label: "投資相關手續費", value: investmentFees },
                          ].filter((it) => it.value > 0);
                          const donutData = contribItems.map((it) => ({
                            label: it.label,
                            value: Math.max(1, Math.round((it.value / total) * 100)),
                          }));
                          return (
                            <div className="rounded-lg p-3 bg-gray-50 flex items-center gap-5">
                              <div className="flex-shrink-0">
                                <DonutInteractive
                                  data={donutData}
                                  colors={contribColors.slice(0, contribItems.length)}
                                  size={140}
                                  centerText={{
                                    line1: `${(total / 1000).toFixed(1)}K`,
                                    line2: "年貢獻",
                                  }}
                                />
                              </div>
                              <div className="flex-1 space-y-1.5">
                                {contribItems.map((it, i) => (
                                  <div key={it.label} className="flex items-center gap-2 text-xs">
                                    <span
                                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                      style={{ background: contribColors[i] }}
                                    />
                                    <span className="text-gray-700 flex-1">{it.label}</span>
                                    <span className="font-semibold text-gray-800 tabular-nums">
                                      NT$ {it.value.toLocaleString()}
                                    </span>
                                    <span className="text-gray-400 w-9 text-right tabular-nums">
                                      {Math.round((it.value / total) * 100)}%
                                    </span>
                                  </div>
                                ))}
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
          <div className="fixed inset-0 z-50 overflow-y-auto"
            style={{ background: "linear-gradient(135deg, #0f4c5c 0%, #0d7377 40%, #14a085 100%)" }}>
            {/* Decorative blobs */}
            <div className="fixed top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, #5eead4, transparent)" }} />
            <div className="fixed bottom-[-60px] right-[-60px] w-96 h-96 rounded-full opacity-15 pointer-events-none"
              style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }} />
            <div className="fixed top-1/3 right-1/4 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, #a7f3d0, transparent)" }} />

            <div className="min-h-full flex items-center justify-center py-8 px-4">
              <div className="relative w-full max-w-sm">
                {/* Card */}
                <div className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)" }}>

                  {/* Header band */}
                  <div className="px-8 pt-5 pb-4 text-center"
                    style={{ background: "linear-gradient(135deg, #0d7377 0%, #14a085 100%)" }}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2 shadow-lg"
                      style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white text-lg font-bold tracking-wide">客戶 360 戰情室</div>
                    <div className="text-teal-100 text-xs mt-0.5 opacity-80">Customer Intelligence Platform</div>
                  </div>

                  {/* Form area */}
                  {loginLoading ? (
                    <div className="px-8 py-12 flex flex-col items-center justify-center">
                      <SpinnerBlock text="登入中…" />
                    </div>
                  ) : (
                  <div className="px-8 py-4 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">使用者帳號</label>
                      <input
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        placeholder="請輸入使用者代號"
                        onKeyDown={(e) => { if (e.key === "Enter") { if (loginUser === "demo" && loginPass === "demo") { doLogin("manager"); } else { setLoginError("登入失敗：請使用 demo / demo。"); } } }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">密碼</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="請輸入密碼"
                        onKeyDown={(e) => { if (e.key === "Enter") { if (loginUser === "demo" && loginPass === "demo") { doLogin("manager"); } else { setLoginError("登入失敗：請使用 demo / demo。"); } } }}
                      />
                    </div>

                    {loginError && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                        <span className="text-red-400">⚠</span> {loginError}
                      </div>
                    )}

                    <button
                      className="w-full py-2 rounded-xl text-white text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #0d7377, #14a085)" }}
                      onClick={() => {
                        if (loginUser === "demo" && loginPass === "demo") {
                          doLogin("manager");
                        } else {
                          setLoginError("登入失敗：請使用 demo / demo。");
                        }
                      }}
                    >
                      登入系統
                    </button>

                    {/* DEMO quick-login section */}
                    <div className="pt-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-300 uppercase tracking-widest font-medium">Demo 快速體驗</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-dashed border-teal-200 bg-teal-50/60 hover:bg-teal-100/80 transition-all text-teal-700"
                          onClick={() => { doLogin("manager"); }}
                        >
                          <Shield className="w-3 h-3 opacity-70" />
                          <span className="text-[11px] font-medium">主管（林經理）</span>
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-dashed border-cyan-200 bg-cyan-50/60 hover:bg-cyan-100/80 transition-all text-cyan-700"
                          onClick={() => { doLogin("specialist"); }}
                        >
                          <Users className="w-3 h-3 opacity-70" />
                          <span className="text-[11px] font-medium">專員（楊專員）</span>
                        </button>
                      </div>
                      <div className="text-center text-[10px] text-gray-300 mt-1">
                        demo / demo
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Footer text */}
                <div className="mt-4 text-center text-[11px] text-teal-200 opacity-70">
                  © 2026 Customer 360 Intelligence · IBM Demo
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top bar now contains the module buttons and logout; lower duplicate removed */}

        {isLoggedIn ? (
          <div className="relative">
            {searchLoading && (
              <div className="absolute inset-0 z-40 min-h-[50vh] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                <SpinnerBlock text="載入中…" />
              </div>
            )}
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
        {renderInsightModal()}
        {showEventModal && selectedInteractionItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedInteractionItem._type === 'event' ? '事件紀錄明細' : '服務紀錄明細'}
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
                {selectedInteractionItem._type === 'event' ? (
                  <>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-600">事件時間</span><span className="font-medium">{selectedInteractionItem.time}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-600">事件類型</span><span className="font-medium">{selectedInteractionItem.channel}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-600">事件說明</span><span className="font-medium text-right ml-4">{selectedInteractionItem.detail}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">狀態</span><span className="font-medium">{selectedInteractionItem.status || '—'}</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-600">服務時間</span><span className="font-medium">{selectedInteractionItem.time}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-600">服務通路</span><span className="font-medium">{selectedInteractionItem.channel}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-600">服務項目</span><span className="font-medium text-right ml-4">{selectedInteractionItem.detail}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-600">處理狀態</span><span className="font-medium">{selectedInteractionItem.status || '—'}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-600">服務員編</span><span className="font-medium">{selectedInteractionItem.agentId || 'E00000'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">客戶編號</span><span className="font-medium">{selectedInteractionItem.customerId || selectedCustomer?.id}</span></div>
                  </>
                )}
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
