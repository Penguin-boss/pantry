"use client";
import { useEffect, useState } from "react";

export default function StatsPage() {
  const [data, setData] = useState<{ counts: { active: number; used: number; wasted: number; total: number }; money: { saved: number; wasted: number }; monthly: Array<{ month: string; used: number; wasted: number }> } | null>(null);
  useEffect(() => { fetch("/api/stats").then((r) => r.json()).then(setData); }, []);
  if (!data) return <div className="py-20 text-center text-zinc-500">Loading stats…</div>;
  const { counts, money, monthly } = data;
  const totalDone = counts.used + counts.wasted;
  const savedPct = totalDone ? Math.round((counts.used / totalDone) * 100) : 0;
  const max = Math.max(1, ...monthly.map((m) => Math.max(m.used, m.wasted)));

  return (
    <div>
      <h1 className="text-[28px]">Impact</h1>
      <p className="text-sm text-zinc-600">Based on items you marked Used vs Wasted. Money saved sums the price of used items (missing prices count as £0).</p>

      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-zinc-200 p-6">
          <p className="text-xs tracking-widest uppercase text-zinc-500">Items saved</p>
          <p className="text-3xl font-semibold mt-1 text-emerald-700">{counts.used}</p>
          <p className="text-xs text-zinc-500 mt-1">marked Used</p>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-200 p-6">
          <p className="text-xs tracking-widest uppercase text-zinc-500">Items wasted</p>
          <p className="text-3xl font-semibold mt-1 text-red-600">{counts.wasted}</p>
          <p className="text-xs text-zinc-500 mt-1">marked Wasted</p>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-200 p-6">
          <p className="text-xs tracking-widest uppercase text-zinc-500">Money saved</p>
          <p className="text-3xl font-semibold mt-1">£{money.saved.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-[#1A3C34] text-white p-6">
          <p className="text-xs tracking-widest uppercase text-white/70">Save rate</p>
          <p className="text-3xl font-semibold mt-1">{savedPct}%</p>
          <p className="text-xs text-white/70 mt-1">{counts.used} of {totalDone} completed</p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] bg-white border border-zinc-200 p-6">
        <h2 className="font-semibold">Saved vs wasted over time</h2>
        {monthly.length === 0 ? (
          <p className="text-sm text-zinc-500 mt-2">No completed items yet. Mark items as Used or Wasted to see trends.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {monthly.slice(-8).map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-20 text-xs text-zinc-500">{m.month}</span>
                <div className="flex-1 flex gap-1 h-6">
                  <div className="bg-emerald-500 rounded-full" style={{ width: `${(m.used / max) * 100}%`, minWidth: m.used ? 12 : 0 }} title={`Used: ${m.used}`} />
                  <div className="bg-red-400 rounded-full" style={{ width: `${(m.wasted / max) * 100}%`, minWidth: m.wasted ? 12 : 0 }} title={`Wasted: ${m.wasted}`} />
                </div>
                <span className="text-xs text-zinc-600 w-28 text-right">{m.used} saved · {m.wasted} wasted</span>
              </div>
            ))}
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Saved</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /> Wasted</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-zinc-200 p-6">
          <p className="font-semibold">Money</p>
          <p className="text-sm text-zinc-600 mt-1">Saved £{money.saved.toFixed(2)} · Wasted £{money.wasted.toFixed(2)}</p>
          <div className="mt-4 h-3 rounded-full bg-zinc-100 overflow-hidden flex">
            {money.saved + money.wasted > 0 && (
              <>
                <div className="bg-emerald-500" style={{ width: `${(money.saved / (money.saved + money.wasted)) * 100}%` }} />
                <div className="bg-red-400 flex-1" />
              </>
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
          <p className="font-semibold text-amber-900">How this is calculated</p>
          <p className="text-sm text-amber-800/80 mt-2 leading-relaxed">Money saved = sum of <code className="bg-white px-1 py-0.5 rounded">price</code> for items marked Used. Wasted money is shown separately and never counted as saved. Items without a price contribute £0. Counts update immediately and persist after reload.</p>
        </div>
      </div>
    </div>
  );
}
