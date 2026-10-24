"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { daysRemaining, getUrgency, urgencyMeta, urgencySort } from "@/lib/urgency";
import type { Item } from "@/lib/types";
import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABEL, UNITS } from "@/lib/types";
import ItemModal from "@/components/ItemModal";

function Badge({ urgency }: { urgency: ReturnType<typeof getUrgency> }) {
  const m = urgencyMeta[urgency];
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 border ${m.bg} ${m.color}`}>{m.label}</span>;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const STAT_CARDS: Array<{ urg: "expired" | "use_soon" | "okay" | "fresh"; label: string; emoji: string }> = [
  { urg: "expired", label: "Expired", emoji: "🚫" },
  { urg: "use_soon", label: "Use soon", emoji: "⏳" },
  { urg: "okay", label: "Okay", emoji: "🌤️" },
  { urg: "fresh", label: "Fresh", emoji: "✨" },
];

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState<"all" | "fresh" | "okay" | "use_soon" | "expired">("all");
  const [view, setView] = useState<"shelf" | "list">("shelf");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems((data.items ?? []) as Item[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const active = useMemo(() => items.filter((i) => i.status === "active"), [items]);
  const counts = useMemo(() => {
    let fresh = 0, okay = 0, use_soon = 0, expired = 0;
    for (const it of active) {
      const u = getUrgency(it.expiry_date);
      if (u === "fresh") fresh++; else if (u === "okay") okay++; else if (u === "use_soon") use_soon++; else expired++;
    }
    return { fresh, okay, use_soon, expired, total: active.length };
  }, [active]);

  const health = counts.total ? Math.round(((counts.fresh + counts.okay) / counts.total) * 100) : 100;
  const atRisk = counts.expired + counts.use_soon;
  const expiring = useMemo(() => active
    .filter((it) => ["expired", "use_soon"].includes(getUrgency(it.expiry_date)))
    .sort(urgencySort)
    .slice(0, 3), [active]);

  const filtered = useMemo(() => {
    let list = [...active].sort(urgencySort);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(needle));
    }
    if (cat !== "all") list = list.filter((i) => i.category === cat);
    if (status !== "all") list = list.filter((i) => getUrgency(i.expiry_date) === status);
    return list;
  }, [active, q, cat, status]);

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of active) m[it.category] = (m[it.category] ?? 0) + 1;
    return m;
  }, [active]);

  async function mark(id: string, st: "used" | "wasted") {
    await fetch(`/api/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: st }) });
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="py-20 text-center text-zinc-500">Loading your fridge…</div>;

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400">{today}</p>
          <h1 className="text-[28px] leading-tight mt-1">{greeting()} — here's your fridge</h1>
          <p className="text-sm text-zinc-600 mt-1">
            {counts.total} item{counts.total === 1 ? "" : "s"} · sorted by what expires first
            {atRisk > 0 && <> · <span className="text-orange-700 font-medium">{atRisk} need{atRisk === 1 ? "s" : ""} attention</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/recipes?tab=book" className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium hover:bg-zinc-50">📖 Recipe Book</Link>
          <button onClick={() => setShowAdd(true)} className="bg-[#1A3C34] text-white font-semibold rounded-full px-6 py-3 hover:bg-[#234E43] transition">+ Add item</button>
        </div>
      </div>

      {/* Health + use-it-or-lose-it */}
      {counts.total > 0 && (
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1 rounded-[24px] bg-[#1A3C34] text-white p-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/60">Fridge health</p>
            <p className="text-4xl font-semibold mt-2">{health}<span className="text-xl text-white/60">%</span></p>
            <div className="mt-3 h-2.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-400" style={{ width: `${health}%` }} />
            </div>
            <p className="text-xs text-white/60 mt-3">{counts.fresh + counts.okay} of {counts.total} items are in good shape. {counts.expired > 0 ? `${counts.expired} expired.` : counts.use_soon > 0 ? `${counts.use_soon} expiring soon.` : "Nothing urgent."}</p>
            <Link href="/stats" className="inline-block mt-4 text-xs font-semibold text-white/80 hover:text-white underline underline-offset-2">See your impact →</Link>
          </div>
          <div className="md:col-span-2 rounded-[24px] bg-white border border-zinc-200 p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">⚡ Use it or lose it</p>
              <Link href="/recipes?tab=fridge" className="text-xs font-semibold text-[#1A3C34] hover:underline">Find more recipes →</Link>
            </div>
            {expiring.length === 0 ? (
              <p className="text-sm text-zinc-500 mt-3">Nothing expiring soon — you're on top of it. 🎉</p>
            ) : (
              <div className="mt-3 space-y-2">
                {expiring.map((it) => {
                  const urg = getUrgency(it.expiry_date);
                  const days = daysRemaining(it.expiry_date);
                  const label = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "expires today" : days === 1 ? "1 day left" : `${days} days left`;
                  return (
                    <div key={it.id} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${urgencyMeta[urg].bg}`}>
                      <span className="text-lg">{CATEGORY_EMOJI[it.category] ?? "📦"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{it.name} <span className="text-zinc-500 font-normal">· {it.quantity} {it.unit}</span></p>
                        <p className={`text-xs font-medium ${urgencyMeta[urg].color}`}>{label}</p>
                      </div>
                      <Link href={`/recipes?tab=fridge&ingredient=${encodeURIComponent(it.name)}`} className="shrink-0 text-xs font-semibold bg-[#1A3C34] text-white rounded-full px-3.5 py-2 hover:bg-[#234E43] transition">Cook it →</Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Urgency summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map((c) => {
          const m = urgencyMeta[c.urg];
          const v = counts[c.urg];
          const pct = counts.total ? Math.round((v / counts.total) * 100) : 0;
          return (
            <button key={c.urg} onClick={() => setStatus(status === c.urg ? "all" : c.urg)} className={`text-left rounded-2xl border bg-white p-4 hover:shadow-sm transition ${status === c.urg ? "ring-2 ring-[#1A3C34]" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${m.dot}`} />
                <span className="text-xs font-semibold tracking-widest uppercase text-zinc-500">{c.label}</span>
                <span className="ml-auto text-sm">{c.emoji}</span>
              </div>
              <p className="text-2xl font-semibold mt-2">{v}</p>
              <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className={`h-full rounded-full ${m.dot}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5">{pct}% of fridge</p>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items…" className="flex-1 max-w-[360px] rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1A3C34]" />
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-full border border-zinc-200 bg-white px-3 py-2.5 text-sm">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {CATEGORY_LABEL[c]}{catCounts[c] ? ` (${catCounts[c]})` : ""}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-full border border-zinc-200 bg-white px-3 py-2.5 text-sm">
            <option value="all">All status</option>
            <option value="expired">Expired</option>
            <option value="use_soon">Use soon</option>
            <option value="okay">Okay</option>
            <option value="fresh">Fresh</option>
          </select>
        </div>
        <div className="flex rounded-full border border-zinc-200 bg-white p-1 self-start">
          <button onClick={() => setView("shelf")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${view === "shelf" ? "bg-[#1A3C34] text-white" : "text-zinc-600"}`}>Shelf</button>
          <button onClick={() => setView("list")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${view === "list" ? "bg-[#1A3C34] text-white" : "text-zinc-600"}`}>List</button>
        </div>
      </div>

      {/* Empty state */}
      {active.length === 0 && (
        <div className="mt-8 rounded-[24px] border border-dashed border-zinc-300 bg-white p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFFBF2] border border-zinc-200 grid place-items-center mx-auto text-2xl">🧊</div>
          <h3 className="mt-4 text-xl">Your fridge is empty</h3>
          <p className="mt-2 text-sm text-zinc-600 max-w-[42ch] mx-auto">Add your first item — it takes under 10 seconds. We'll colour-code it by expiry so you always know what to use next.</p>
          <button onClick={() => setShowAdd(true)} className="mt-6 bg-[#1A3C34] text-white font-semibold rounded-full px-6 py-3 hover:bg-[#234E43]">Add your first item</button>
        </div>
      )}

      {filtered.length === 0 && active.length > 0 && (
        <p className="mt-8 text-center text-sm text-zinc-500">No items match your filters.</p>
      )}

      {/* Shelf view */}
      {view === "shelf" && filtered.length > 0 && (
        <div className="mt-6 rounded-[24px] bg-white border border-zinc-200 p-4 md:p-6">
          <div className="grid gap-3 md:gap-4">
            {filtered.map((it) => {
              const urg = getUrgency(it.expiry_date);
              const m = urgencyMeta[urg];
              const days = daysRemaining(it.expiry_date);
              const label = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "expires today" : days === 1 ? "1 day left" : `${days} days left`;
              return (
                <div key={it.id} className={`relative flex gap-4 rounded-2xl border bg-[#FFFBF2] px-4 py-4 items-center ${m.bg}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${m.dot}`} />
                  <div className="ml-2 w-12 h-12 rounded-xl bg-white border border-zinc-200 grid place-items-center text-xl shrink-0">{CATEGORY_EMOJI[it.category] ?? "📦"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="font-medium">{it.name}</p>
                      <Badge urgency={urg} />
                      <span className="text-xs text-zinc-500">{CATEGORY_LABEL[it.category] ?? it.category} · {it.quantity} {it.unit}</span>
                    </div>
                    <p className={`text-xs mt-1 font-medium ${m.color}`}>{label} · exp {it.expiry_date}{it.price != null ? ` · £${Number(it.price).toFixed(2)}` : ""}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 shrink-0">
                    <Link href={`/recipes?tab=fridge&ingredient=${encodeURIComponent(it.name)}`} className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-2 hover:bg-zinc-50">🍳 Cook</Link>
                    <button onClick={() => setEditing(it)} className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-2 hover:bg-zinc-50">Edit</button>
                    <button onClick={() => mark(it.id, "used")} className="text-xs bg-[#1A3C34] text-white rounded-full px-3 py-2 hover:bg-[#234E43]">Used</button>
                    <button onClick={() => mark(it.id, "wasted")} className="text-xs bg-white border border-orange-200 text-orange-700 rounded-full px-3 py-2 hover:bg-orange-50">Wasted</button>
                    <button onClick={() => remove(it.id)} className="text-xs text-zinc-500 hover:text-red-600 px-2">✕</button>
                  </div>
                  <div className="md:hidden flex gap-1">
                    <button onClick={() => setEditing(it)} className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-2">Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 h-2 rounded-full bg-zinc-100 border border-zinc-200" />
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div className="mt-6 rounded-2xl bg-white border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-widest">
                <tr><th className="text-left px-4 py-3 font-semibold">Item</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Qty</th><th className="text-left px-4 py-3">Expiry</th><th className="text-left px-4 py-3">Days</th><th className="text-left px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const urg = getUrgency(it.expiry_date);
                  const days = daysRemaining(it.expiry_date);
                  return (
                    <tr key={it.id} className="border-t border-zinc-100 hover:bg-[#FFFBF2]/50">
                      <td className="px-4 py-3 font-medium"><span className="mr-2">{CATEGORY_EMOJI[it.category] ?? "📦"}</span>{it.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{CATEGORY_LABEL[it.category] ?? it.category}</td>
                      <td className="px-4 py-3">{it.quantity} {it.unit}</td>
                      <td className="px-4 py-3">{it.expiry_date}</td>
                      <td className={`px-4 py-3 font-medium ${urgencyMeta[urg].color}`}>{days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "today" : `${days}d`}</td>
                      <td className="px-4 py-3"><Badge urgency={urg} /></td>
                      <td className="px-4 py-3 text-right flex gap-1 justify-end">
                        <button onClick={() => setEditing(it)} className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50">Edit</button>
                        <button onClick={() => mark(it.id, "used")} className="rounded-full bg-[#1A3C34] text-white px-3 py-1.5 text-xs hover:bg-[#234E43]">Used</button>
                        <button onClick={() => mark(it.id, "wasted")} className="rounded-full border border-orange-200 text-orange-700 px-3 py-1.5 text-xs hover:bg-orange-50">Wasted</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showAdd || editing) && (
        <ItemModal
          item={editing ?? undefined}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSaved={() => { setShowAdd(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
