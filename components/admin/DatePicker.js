"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Format a Date to a local "YYYY-MM-DD" string (no timezone drift).
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse a "YYYY-MM-DD" string into a local Date (midnight) or null.
function parseISO(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Calendar date picker. Dates before `minDate` are disabled (cannot be clicked)
 * and the field is read-only, so past/current dates can't be typed or selected.
 *
 * @param {string} value      current value as "YYYY-MM-DD"
 * @param {(v:string)=>void} onChange
 * @param {string} [minDate]  earliest selectable date as "YYYY-MM-DD"
 * @param {string} [placeholder]
 * @param {string} [className]
 */
export default function DatePicker({ value, onChange, minDate, placeholder = "Select a date", className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = useMemo(() => parseISO(value), [value]);
  const min = useMemo(() => parseISO(minDate), [minDate]);

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected || min || new Date()));

  // Re-centre the calendar on the selected month each time it opens.
  useEffect(() => {
    if (open) setViewMonth(startOfMonth(selected || min || new Date()));
  }, [open, selected, min]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const isDisabled = (date) => min && date.getTime() < min.getTime();

  // Selectable years: from the earliest allowed year up 50 years (covers long
  // shelf-life stock), always including the currently viewed/selected year.
  const years = useMemo(() => {
    const startYear = min ? min.getFullYear() : new Date().getFullYear();
    const endYear = Math.max(
      startYear + 50,
      viewMonth.getFullYear(),
      selected ? selected.getFullYear() : 0
    );
    const list = [];
    for (let y = startYear; y <= endYear; y++) list.push(y);
    return list;
  }, [min, viewMonth, selected]);

  // A whole month is disabled when its last day is still before the minimum date.
  const isMonthDisabled = (monthIndex) => {
    if (!min) return false;
    const lastDay = new Date(viewMonth.getFullYear(), monthIndex + 1, 0);
    return lastDay.getTime() < min.getTime();
  };

  const setMonth = (monthIndex) => setViewMonth(new Date(viewMonth.getFullYear(), monthIndex, 1));
  const setYear = (year) => setViewMonth(new Date(year, viewMonth.getMonth(), 1));

  const days = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const offset = first.getDay();
    const total = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    return cells;
  }, [viewMonth]);

  // Don't let the admin page back past the minimum-allowed month.
  const canGoPrev = !min || startOfMonth(viewMonth).getTime() > startOfMonth(min).getTime();

  const pick = (date) => {
    if (isDisabled(date)) return;
    onChange(toISO(date));
    setOpen(false);
  };

  const displayLabel = selected
    ? selected.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 bg-brand-cream border border-brand-border rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose"
      >
        <Calendar className="w-4 h-4 text-brand-rose shrink-0" />
        <span className={selected ? "text-brand-espresso" : "text-brand-espresso/40"}>{displayLabel}</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-72 bg-brand-card border border-brand-border rounded-xl shadow-2xl p-3 animate-fade-in">
          <div className="flex items-center gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => canGoPrev && setViewMonth((m) => addMonths(m, -1))}
              disabled={!canGoPrev}
              className="p-1.5 rounded-lg text-brand-espresso/70 hover:bg-brand-espresso/5 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-1.5">
              <select
                value={viewMonth.getMonth()}
                onChange={(e) => setMonth(Number(e.target.value))}
                aria-label="Select month"
                className="flex-1 min-w-0 bg-brand-cream border border-brand-border rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-espresso cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-rose"
              >
                {MONTHS.map((name, i) => (
                  <option key={name} value={i} disabled={isMonthDisabled(i)}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={viewMonth.getFullYear()}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label="Select year"
                className="w-[76px] shrink-0 bg-brand-cream border border-brand-border rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-espresso cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-rose"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-1.5 rounded-lg text-brand-espresso/70 hover:bg-brand-espresso/5 shrink-0"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[10px] font-bold uppercase text-brand-espresso/40 py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) return <div key={`e-${i}`} />;
              const disabled = isDisabled(date);
              const isSelected = sameDay(date, selected);
              return (
                <button
                  key={toISO(date)}
                  type="button"
                  onClick={() => pick(date)}
                  disabled={disabled}
                  className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-brand-rose text-brand-cream font-bold"
                      : disabled
                      ? "text-brand-espresso/25 cursor-not-allowed line-through"
                      : "text-brand-espresso hover:bg-brand-rose/10"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
