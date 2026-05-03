"use client";

interface DateNavProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  todayStr: string;
}

function offsetDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export default function DateNav({ date, onChange, todayStr }: DateNavProps) {
  const isToday = date === todayStr;
  const canGoForward = date < todayStr;

  const label = isToday ? "Today" : (() => {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  })();

  return (
    <div className="flex items-center justify-between py-2 px-2">
      <button
        onClick={() => onChange(offsetDate(date, -1))}
        className="w-9 h-9 flex items-center justify-center rounded-full text-ink-soft hover:bg-card touch-manipulation"
        aria-label="Previous day"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="text-center">
        <div className="font-serif font-semibold text-2xl text-ink leading-none">
          {label}
        </div>
        <div className="text-xs text-ink-mute mt-1 tracking-wide">{date}</div>
      </div>

      <button
        onClick={() => canGoForward && onChange(offsetDate(date, 1))}
        disabled={!canGoForward}
        className={`w-9 h-9 flex items-center justify-center rounded-full touch-manipulation ${
          canGoForward
            ? "text-ink-soft hover:bg-card"
            : "text-ink-mute/40 cursor-default"
        }`}
        aria-label="Next day"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
