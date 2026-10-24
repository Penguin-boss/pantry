import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache (per server instance)
const cache = new Map<string, { at: number; data: unknown }>();
const TTL = 10 * 60 * 1000; // 10 min

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("ingredients")?.trim();
  const text = req.nextUrl.searchParams.get("q")?.trim();
  const id = req.nextUrl.searchParams.get("id")?.trim();

  // Detail lookup by id
  if (id) {
    const cacheKey = `meal:${id}`;
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < TTL) return NextResponse.json(hit.data);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`, { next: { revalidate: 600 } });
      if (!res.ok) return NextResponse.json({ error: "Recipe service unavailable." }, { status: 502 });
      const data = await res.json();
      const payload = { meals: data.meals };
      cache.set(cacheKey, { at: Date.now(), data: payload });
      return NextResponse.json(payload);
    } catch {
      return NextResponse.json({ error: "Failed to fetch recipe." }, { status: 502 });
    }
  }

  // Free-text search (meal names)
  if (text) {
    const cacheKey = `search:${text.toLowerCase()}`;
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < TTL) return NextResponse.json(hit.data);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(text)}`, { next: { revalidate: 600 } });
      if (!res.ok) return NextResponse.json({ error: "Recipe service unavailable.", meals: [] }, { status: 502 });
      const data = await res.json();
      const payload = { meals: data.meals ?? [], query: text };
      cache.set(cacheKey, { at: Date.now(), data: payload });
      return NextResponse.json(payload);
    } catch {
      return NextResponse.json({ error: "Failed to fetch recipes.", meals: [] }, { status: 502 });
    }
  }

  if (!q) return NextResponse.json({ error: "ingredients query required" }, { status: 400 });

  // TheMealDB filters by a single ingredient; try each selected ingredient in
  // order until one returns results, so any pick works even with multiple chosen.
  const list = q.split(",").map((s) => s.trim()).filter(Boolean);
  let matched: string | null = null;
  let meals: unknown[] | null = null;

  for (const ing of list) {
    const cacheKey = `filter:${ing.toLowerCase()}`;
    const hit = cache.get(cacheKey);
    let payload: { meals: unknown[] | null } | null = hit && Date.now() - hit.at < TTL ? (hit.data as { meals: unknown[] | null }) : null;
    if (!payload) {
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`, { next: { revalidate: 600 } });
        if (!res.ok) continue;
        const data = await res.json();
        payload = { meals: data.meals ?? null };
        cache.set(cacheKey, { at: Date.now(), data: payload });
      } catch {
        continue;
      }
    }
    if (payload.meals && payload.meals.length > 0) {
      matched = ing;
      meals = payload.meals;
      break;
    }
  }

  if (!matched) {
    return NextResponse.json({ meals: [], query: list[0] ?? q, error: `No recipes found for “${list[0] ?? q}”.` });
  }
  return NextResponse.json({ meals, query: matched });
}
