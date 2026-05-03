"use client";

import { useState } from "react";
import BrandHeader from "@/components/BrandHeader";

type AdviceState = "idle" | "loading" | "done" | "error";

function renderAdvice(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h3 key={i} className="font-serif font-bold text-ink text-lg mt-5 mb-1.5">
          {line.replace("## ", "")}
        </h3>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li key={i} className="text-ink-soft text-sm ml-5 mb-1.5 list-disc leading-relaxed">
          {line.replace(/^[-*] /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-ink-soft text-sm leading-relaxed mb-1.5">
        {line.replace(/\*\*(.*?)\*\*/g, "$1")}
      </p>
    );
  });
}

export default function CoachPage() {
  const [state, setState] = useState<AdviceState>("idle");
  const [advice, setAdvice] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const getAdvice = async () => {
    setState("loading");
    setAdvice(null);
    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (!res.ok) throw new Error("Failed to fetch advice");
      const data = await res.json();
      setAdvice(data.advice);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="px-4 pt-2">
      <BrandHeader />

      <div className="text-center pt-3 pb-5">
        <h1 className="font-serif text-3xl font-bold text-ink">Coach</h1>
        <p className="text-sm text-ink-soft mt-1">Personalized advice from Claude</p>
      </div>

      <div className="bg-card rounded-3xl shadow-sm border border-[color:var(--border)] p-5 mb-4">
        <p className="text-sm text-ink-soft mb-4">
          Analyze your recent meals and get tailored nutrition guidance.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-ink-mute uppercase tracking-wider">Window</span>
          {[3, 7, 14].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors touch-manipulation ${
                days === d
                  ? "bg-terracotta text-white"
                  : "bg-bg text-ink-soft hover:bg-[color:var(--border)]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>

        <button
          onClick={getAdvice}
          disabled={state === "loading"}
          className={`w-full py-3.5 rounded-2xl font-semibold text-white transition-opacity touch-manipulation ${
            state === "loading" ? "bg-terracotta opacity-70 cursor-not-allowed" : "bg-terracotta hover:opacity-90"
          }`}
        >
          {state === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Reading your logs…
            </span>
          ) : (
            "Get my report"
          )}
        </button>
      </div>

      {state === "error" && (
        <div className="bg-terracotta-soft/30 border border-[color:var(--terracotta)]/30 text-[color:var(--terracotta)] text-sm rounded-2xl px-4 py-3">
          Couldn't generate advice. Please try again.
        </div>
      )}

      {state === "done" && advice && (
        <div className="bg-card rounded-3xl shadow-sm border border-[color:var(--border)] p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-terracotta" />
            <span className="text-xs uppercase tracking-wider text-ink-soft font-semibold">
              Your nutrition report
            </span>
          </div>
          <div>{renderAdvice(advice)}</div>

          <button
            onClick={getAdvice}
            className="mt-5 w-full py-2.5 rounded-2xl border border-[color:var(--border-strong)] text-ink-soft text-sm font-semibold touch-manipulation"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
