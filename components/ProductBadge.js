"use client";

import React from "react";
import { getBadgeStyle } from "@/lib/badges";

export default function ProductBadge({ text, color, className = "" }) {
  if (!text) return null;

  const style = getBadgeStyle(text, color);

  return (
    <span
      className={`text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm ${className}`}
      style={style}
    >
      {text}
    </span>
  );
}
