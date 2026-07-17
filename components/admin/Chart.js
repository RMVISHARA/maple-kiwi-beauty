"use client";

import React from "react";

/**
 * Lightweight, dependency-free SVG area/line chart.
 * @param {{data: {label:string, value:number}[], height?:number, formatValue?:(n:number)=>string, color?:string}} props
 */
export function AreaChart({ data, height = 200, formatValue = (n) => n, color = "#B95C65" }) {
  const width = 720;
  const padX = 8;
  const padY = 16;

  if (!data || data.length === 0) {
    return <div className="text-sm text-brand-espresso/50 py-10 text-center">No data yet.</div>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = (width - padX * 2) / Math.max(data.length - 1, 1);
  const scaleY = (v) => height - padY - (v / max) * (height - padY * 2);

  const points = data.map((d, i) => ({
    x: padX + i * stepX,
    y: scaleY(d.value),
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padY} L ${points[0].x.toFixed(1)} ${height - padY} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => height - padY - f * (height - padY * 2));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((y, i) => (
        <line key={i} x1={padX} y1={y} x2={width - padX} y2={y} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" className="text-brand-espresso" />
      ))}

      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={color} className="opacity-0 hover:opacity-100 transition-opacity" />
          <rect x={p.x - stepX / 2} y={0} width={stepX} height={height} fill="transparent">
            <title>{`${p.label}: ${formatValue(p.value)}`}</title>
          </rect>
        </g>
      ))}
    </svg>
  );
}

/**
 * Horizontal "bar list" used for category/top breakdowns (Shopify style).
 * @param {{items:{label:string, value:number, sub?:string}[], formatValue?:(n:number)=>string, color?:string}} props
 */
export function BarList({ items, formatValue = (n) => n, color = "#B95C65" }) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-brand-espresso/50 py-6 text-center">No data yet.</div>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-brand-espresso/80 truncate pr-2">{it.label}</span>
            <span className="font-semibold text-brand-espresso shrink-0">{formatValue(it.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-brand-espresso/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(it.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Simple donut chart for status breakdowns.
 * @param {{segments:{label:string, value:number, color:string}[], size?:number}} props
 */
export function Donut({ segments, size = 140 }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return <div className="text-sm text-brand-espresso/50 py-6 text-center">No data yet.</div>;
  }

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s, i) => {
            const fraction = s.value / total;
            const dash = fraction * circumference;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              >
                <title>{`${s.label}: ${s.value}`}</title>
              </circle>
            );
            offset += dash;
            return seg;
          })}
        </g>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-brand-espresso font-bold" fontSize="22">
          {total}
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-brand-espresso/70">{s.label}</span>
            <span className="font-semibold text-brand-espresso ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
