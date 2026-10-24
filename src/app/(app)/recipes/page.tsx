"use client";
import { useEffect, useMemo, useState } from "react";
import type { Item } from "@/lib/types";
import { getUrgency, urgencySort } from "@/lib/urgency";
import { BOOK, recipesInGroup, type BookItem, type BookRecipe } from "@/lib/recipe-book";

type Meal = { idMeal: string; strMeal: string; strMealThumb: string };
type Detail = { idMeal: string; strMeal: string; strMealThumb: string; strInstructions: string; strCategory: string; strArea: string; [k: string]: string };

type DetailView =
  | { kind: "book"; recipe: BookRecipe; item: BookItem }
  | { kind: "fridge"; detail: Detail };

function ingredientsFrom(detail: Detail): string[] {
  const out: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = detail[`strIngredient${i}`]?.trim();
    const meas = detail[`strMeasure${i}`]?.trim();
    if (ing) out.push(meas ? `${meas} ${ing}` : ing);
  }
  return out;
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold tracking-wide uppercase bg-[#FFFBF2] border border-zinc-200 rounded-full px-2.5 py-1 text-zinc-600">{children}</span>;
}

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}

export default function RecipesPage() {
  const [tab, setTab] = useState<"book" | "fridge">("book");

  // Fridge items (shared: chips in fridge tab + "have it" ticks in book detail)
  const [items, setItems] = useState<Item[]>([]);

  // Fridge flow
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Book flow
  const [group, setGroup] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Shared detail
  const [detail, setDetail] = useState<DetailView | null>(null);

  const activeSorted = useMemo(() => [...items].sort(urgencySort), [items]);
  const fridgeNames = useMemo(() => activeSorted.map((i) => i.name.toLowerCase()), [activeSorted]);

  function isHave(line: string): boolean {
    const l = line.toLowerCase();
    return fridgeNames.some((n) => n.length >= 3 && l.includes(n));
  }

  useEffect(() => {
    fetch("/api/items").then((r) => r.json()).then((d) => setItems((d.items ?? []).filter((i: Item) => i.status === "active")));
    // Deep link support: /recipes?tab=fridge&ingredient=chicken
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab");
    const ing = p.get("ingredient");
    if (t === "fridge" || t === "book") setTab(t as "fridge" | "book");
    if (ing) setSelected(new Set([ing]));
  }, []);

  async function search(ings?: string[]) {
    const list = ings ?? Array.from(selected);
    if (list.length === 0) { setErr("Pick at least one ingredient."); return; }
    setErr(""); setLoading(true); setMeals([]); setDetail(null);
    try {
      const q = list.join(",");
      const res = await fetch(`/api/recipes/search?ingredients=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Recipe search failed."); return; }
      setMeals(data.meals ?? []);
      if (!data.meals || data.meals.length === 0) setErr(`No recipes found for “${data.query ?? list[0]}”. Try another ingredient — or browse the Recipe Book tab.`);
    } catch {
      setErr("Network error. Try again.");
    } finally { setLoading(false); }
  }

  async function openMeal(id: string) {
    setDetail(null);
    const res = await fetch(`/api/recipes/search?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (data.meals?.[0]) setDetail({ kind: "fridge", detail: data.meals[0] });
  }

  async function cookAndMarkUsed(d: Detail) {
    const detailIngs = ingredientsFrom(d).map((s) => s.toLowerCase());
    const toMark = activeSorted.filter((it) => detailIngs.some((ing) => ing.includes(it.name.toLowerCase()) || it.name.toLowerCase().includes(ing.split(" ").pop() || "")));
    if (toMark.length === 0) { alert("No matching fridge items to mark as used."); return; }
    if (!confirm(`Mark ${toMark.map((i) => i.name).join(", ")} as used?`)) return;
    for (const it of toMark) {
      await fetch(`/api/items/${it.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "used" }) });
    }
    alert(`Marked ${toMark.length} item(s) as used.`);
    setDetail(null);
    const r = await fetch("/api/items"); const dd = await r.json();
    setItems((dd.items ?? []).filter((i: Item) => i.status === "active"));
  }

  // ---------- Book tab data ----------
  const filteredItems = useMemo(() => {
    let list = BOOK.groups.flatMap((g) => (group === "all" || g.id === group ? g.items : []));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((i) => i.name.toLowerCase().includes(q) || i.key.includes(q));
    return list;
  }, [group, query]);

  const openItem = openKey ? BOOK.groups.flatMap((g) => g.items).find((i) => i.key === openKey) ?? null : null;

  function toggle(name: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name); else n.add(name);
      return n;
    });
  }

  // ================= DETAIL VIEW (shared) =================
  if (detail) {
    if (detail.kind === "fridge") {
      const d = detail.detail;
      const ings = ingredientsFrom(d);
      return (
        <div>
          <button onClick={() => setDetail(null)} className="text-sm font-medium text-[#1A3C34] hover:underline">← Back to results</button>
          <div className="mt-4 rounded-[24px] bg-white border border-zinc-200 overflow-hidden shadow-sm">
            <div className="relative">
              <Img src={d.strMealThumb} alt={d.strMeal} className="w-full h-[280px] object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-6 pt-16 pb-5">
                <p className="text-[11px] tracking-widest uppercase text-white/80 font-semibold">{d.strCategory} · {d.strArea}</p>
                <h1 className="text-3xl text-white leading-tight">{d.strMeal}</h1>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h3 className="font-semibold text-lg">Ingredients <span className="text-sm font-normal text-zinc-500">· {ings.length}</span></h3>
              <ul className="mt-3 grid md:grid-cols-2 gap-1.5">
                {ings.map((ing, i) => {
                  const have = isHave(ing);
                  return <li key={i} className={`text-sm rounded-full border px-3.5 py-1.5 ${have ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-zinc-50 border-zinc-200 text-zinc-600"}`}>{have ? "✓ " : ""}{ing}</li>;
                })}
              </ul>
              <p className="text-xs text-zinc-500 mt-2.5">✓ Green = in your fridge right now · Grey = missing</p>
              <h3 className="mt-8 font-semibold text-lg">Instructions</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">{d.strInstructions || "No instructions available."}</p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                <button onClick={() => cookAndMarkUsed(d)} className="bg-[#1A3C34] text-white font-semibold rounded-full px-6 py-3 hover:bg-[#234E43] transition">Cook it — mark fridge items as used</button>
                {d.strSource && <a href={d.strSource} target="_blank" rel="noreferrer" className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-medium hover:bg-zinc-50">Original source ↗</a>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Book recipe detail
    const r = detail.recipe;
    return (
      <div>
        <button onClick={() => setDetail(null)} className="text-sm font-medium text-[#1A3C34] hover:underline">← Back to {detail.item.name}</button>
        <div className="mt-4 rounded-[24px] bg-white border border-zinc-200 overflow-hidden shadow-sm">
          <div className="relative">
            <Img src={r.thumb} alt={r.name} className="w-full h-[280px] object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-6 pt-16 pb-5">
              <p className="text-[11px] tracking-widest uppercase text-white/80 font-semibold">{r.category} · {r.area} · via TheMealDB</p>
              <h1 className="text-3xl text-white leading-tight">{r.name}</h1>
            </div>
          </div>
          <div className="p-6 md:p-8">
            {r.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map((t) => <MetaChip key={t}>{t}</MetaChip>)}
              </div>
            )}
            <h3 className="mt-6 font-semibold text-lg">Ingredients <span className="text-sm font-normal text-zinc-500">· {r.ingredients.length}</span></h3>
            <ul className="mt-3 grid md:grid-cols-2 gap-1.5">
              {r.ingredients.map((ing, i) => {
                const have = isHave(ing);
                return <li key={i} className={`text-sm rounded-full border px-3.5 py-1.5 ${have ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-zinc-50 border-zinc-200 text-zinc-600"}`}>{have ? "✓ " : ""}{ing}</li>;
              })}
            </ul>
            <p className="text-xs text-zinc-500 mt-2.5">✓ Green = in your fridge right now · Grey = add it to your shopping list</p>
            <h3 className="mt-8 font-semibold text-lg">Instructions</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">{r.instructions || "No instructions available."}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {r.youtube && <a href={r.youtube} target="_blank" rel="noreferrer" className="bg-[#1A3C34] text-white font-semibold rounded-full px-6 py-3 hover:bg-[#234E43] transition">▶ Watch video</a>}
              <a href={r.source} target="_blank" rel="noreferrer" className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-medium hover:bg-zinc-50">View on TheMealDB ↗</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= BOOK TAB =================
  if (tab === "book") {
    return (
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] leading-none">Recipe Book</h1>
            <p className="text-sm text-zinc-600 mt-1.5">{BOOK.totals.recipes} real recipes across {BOOK.totals.items} everyday ingredients — meat, veg, dairy, chocolate and more. Tick marks show what's already in your fridge.</p>
          </div>
          <button onClick={() => setTab("fridge")} className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-50">🍳 Cook from my fridge instead</button>
        </div>

        {/* Category chips */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button onClick={() => { setGroup("all"); setOpenKey(null); }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${group === "all" ? "bg-[#1A3C34] text-white border-[#1A3C34]" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}>
            ✳️ All groups
          </button>
          {BOOK.groups.map((g) => (
            <button key={g.id} onClick={() => { setGroup(g.id); setOpenKey(null); }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${group === g.id ? "bg-[#1A3C34] text-white border-[#1A3C34]" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}>
              {g.emoji} {g.label} <span className={group === g.id ? "text-white/60" : "text-zinc-400"}>{recipesInGroup(g)}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${BOOK.totals.items} ingredients — try “chicken”, “chocolate”, “milk”…`}
            className="w-full max-w-[520px] rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm outline-none focus:border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/10"
          />
        </div>

        {fridgeNames.length === 0 && (
          <p className="mt-3 text-xs text-zinc-500">💡 Tip: add items to <a href="/dashboard" className="font-medium text-[#1A3C34] underline">My Fridge</a> and recipe ingredients you already have turn green.</p>
        )}

        {/* Open item: show its recipes */}
        {openItem ? (
          <div className="mt-6">
            <button onClick={() => setOpenKey(null)} className="text-sm font-medium text-[#1A3C34] hover:underline">← All ingredients</button>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBF2] border border-zinc-200 grid place-items-center text-2xl">{openItem.emoji}</div>
              <div>
                <h2 className="text-xl leading-tight">{openItem.name}</h2>
                <p className="text-xs text-zinc-500">{openItem.recipes.length} recipe{openItem.recipes.length === 1 ? "" : "s"} · TheMealDB ingredient: {openItem.dbIngredient}</p>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              {openItem.recipes.map((r) => (
                <button key={r.id} onClick={() => setDetail({ kind: "book", recipe: r, item: openItem })} className="text-left rounded-2xl bg-white border border-zinc-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition">
                  <Img src={r.thumb} alt={r.name} className="w-full h-44 object-cover" />
                  <div className="p-4">
                    <p className="font-semibold leading-snug">{r.name}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <MetaChip>{r.category}</MetaChip>
                      <MetaChip>{r.area}</MetaChip>
                      {r.tags.slice(0, 2).map((t) => <MetaChip key={t}>{t}</MetaChip>)}
                    </div>
                    <p className="mt-3 text-xs font-medium text-[#1A3C34]">{r.ingredients.length} ingredients · Open recipe →</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Ingredient grid */
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((it) => (
              <button key={it.key} onClick={() => setOpenKey(it.key)} disabled={it.recipes.length === 0} className={`text-left rounded-2xl border p-4 transition ${it.recipes.length === 0 ? "opacity-40 cursor-not-allowed bg-zinc-50 border-zinc-200" : "bg-white border-zinc-200 hover:shadow-md hover:-translate-y-0.5 hover:border-[#1A3C34]/30"}`}>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#FFFBF2] border border-zinc-200 grid place-items-center text-xl">{it.emoji}</div>
                  {it.recipes.length > 0 && <span className="text-[11px] font-bold bg-[#1A3C34] text-white rounded-full px-2 py-0.5">{it.recipes.length}</span>}
                </div>
                <p className="mt-2.5 font-medium text-sm leading-tight">{it.name}</p>
                <div className="mt-2 flex -space-x-2">
                  {it.recipes.slice(0, 2).map((r) => (
                    <Img key={r.id} src={r.thumb} alt={r.name} className="w-9 h-9 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <p className="col-span-full text-sm text-zinc-500 py-10 text-center">No ingredients match “{query}”. Try another word.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ================= FRIDGE TAB =================
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-none">Cook with this</h1>
          <p className="text-sm text-zinc-600 mt-1.5">Pick ingredients from your fridge — soonest expiring first — and we'll find real recipes you can make right now.</p>
        </div>
        <button onClick={() => setTab("book")} className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-50">📖 Browse the Recipe Book</button>
      </div>

      {activeSorted.length === 0 ? (
        <div className="mt-6 rounded-[24px] bg-white border border-zinc-200 p-10 text-center">
          <div className="text-3xl">🍳</div>
          <h3 className="mt-3 text-xl">Your fridge is empty</h3>
          <p className="mt-2 text-sm text-zinc-600 max-w-[46ch] mx-auto">Add items first and we'll match recipes to what you already have — or browse the built-in Recipe Book.</p>
          <div className="mt-5 flex justify-center gap-2.5">
            <a href="/dashboard" className="bg-[#1A3C34] text-white font-semibold rounded-full px-6 py-3 text-sm hover:bg-[#234E43]">Add items first</a>
            <button onClick={() => setTab("book")} className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium hover:bg-zinc-50">Browse Recipe Book</button>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] bg-white border border-zinc-200 p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">Your ingredients (soonest expiring first)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeSorted.map((it) => {
              const on = selected.has(it.name);
              const urg = getUrgency(it.expiry_date);
              return (
                <button key={it.id} onClick={() => toggle(it.name)} className={`text-sm rounded-full border px-4 py-2 font-medium transition ${on ? "bg-[#1A3C34] text-white border-[#1A3C34]" : urg === "use_soon" || urg === "expired" ? "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}>
                  {it.name} {on ? "✓" : ""}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => search()} disabled={loading} className="bg-[#1A3C34] text-white font-semibold rounded-full px-6 py-3 disabled:opacity-50 hover:bg-[#234E43]">{loading ? "Searching…" : "Find recipes"}</button>
            {selected.size > 0 && <button onClick={() => setSelected(new Set())} className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-medium hover:bg-zinc-50">Clear</button>}
          </div>
          {err && <p className={`mt-3 text-sm rounded-xl px-3 py-2 border ${meals.length === 0 ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-700"}`}>{err}</p>}
        </div>
      )}

      {meals.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold">Results — {meals.length} recipe{meals.length === 1 ? "" : "s"}</h2>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {meals.map((m) => (
              <button key={m.idMeal} onClick={() => openMeal(m.idMeal)} className="text-left rounded-2xl bg-white border border-zinc-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition">
                <Img src={m.strMealThumb} alt={m.strMeal} className="w-full h-44 object-cover" />
                <div className="p-4">
                  <p className="font-medium leading-tight">{m.strMeal}</p>
                  <p className="text-xs text-zinc-500 mt-1">View recipe →</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
