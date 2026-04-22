"use client";

import { useMemo, useState } from "react";

type BlockedRange = { start: string; end: string };

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function fromISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function DateRangePicker({
  blocked,
  value,
  onChange,
}: {
  blocked: BlockedRange[];
  value: { start: string | null; end: string | null };
  onChange: (v: { start: string | null; end: string | null }) => void;
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const blockedSet = useMemo(() => {
    const set = new Set<string>();
    for (const r of blocked) {
      let d = fromISO(r.start);
      const end = fromISO(r.end);
      while (d <= end) {
        set.add(toISO(d));
        d = addDays(d, 1);
      }
    }
    return set;
  }, [blocked]);

  const today = toISO(new Date());
  const start = value.start;
  const end = value.end;

  function handleClick(iso: string) {
    if (blockedSet.has(iso) || iso < today) return;
    if (!start || (start && end)) {
      onChange({ start: iso, end: null });
      return;
    }
    // start set, end not set
    if (iso < start) {
      onChange({ start: iso, end: null });
      return;
    }
    // Check no blocked day in the range
    let d = fromISO(start);
    const target = fromISO(iso);
    while (d <= target) {
      if (blockedSet.has(toISO(d))) {
        onChange({ start: iso, end: null });
        return;
      }
      d = addDays(d, 1);
    }
    onChange({ start, end: iso });
  }

  function renderMonth(base: Date) {
    const first = startOfMonth(base);
    const firstDay = (first.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(
      base.getFullYear(),
      base.getMonth() + 1,
      0,
    ).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++)
      cells.push(new Date(base.getFullYear(), base.getMonth(), i));

    return (
      <div className="flex-1">
        <div className="text-center font-display text-lg mb-3">
          {MONTHS[base.getMonth()]} {base.getFullYear()}
        </div>
        <div className="calendar-grid text-black/60 text-xs mb-1">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center py-1">{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const iso = toISO(d);
            const isPast = iso < today;
            const isBlocked = blockedSet.has(iso);
            const isStart = start === iso;
            const isEnd = end === iso;
            const inRange =
              start && end && iso > start && iso < end ? true : false;

            const classes = ["calendar-day"];
            if (isPast) classes.push("disabled");
            if (isBlocked) classes.push("blocked");
            if (isStart || isEnd) classes.push("range-edge");
            else if (inRange) classes.push("in-range");

            return (
              <div
                key={i}
                className={classes.join(" ")}
                onClick={() => handleClick(iso)}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="p-2 hover:bg-black/5 rounded"
          aria-label="Mois précédent"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="p-2 hover:bg-black/5 rounded"
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {renderMonth(cursor)}
        <div className="hidden md:block">{renderMonth(addMonths(cursor, 1))}</div>
      </div>
      <div className="mt-4 text-xs text-black/50 flex gap-4 flex-wrap">
        <span><span className="inline-block w-3 h-3 bg-[var(--color-primary)] rounded-sm mr-1 align-middle" /> sélection</span>
        <span><span className="inline-block w-3 h-3 bg-black/10 rounded-sm mr-1 align-middle" /> inclus</span>
        <span><span className="line-through text-black/30">12</span> jour réservé</span>
      </div>
    </div>
  );
}
