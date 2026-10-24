import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const items = db.prepare("SELECT * FROM items WHERE user_id=?").all(s.userId) as Array<Record<string, unknown>>;
  const active = items.filter((i) => i.status === "active");
  const used = items.filter((i) => i.status === "used");
  const wasted = items.filter((i) => i.status === "wasted");

  const usedMoney = used.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
  const wastedMoney = wasted.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  // Monthly buckets for chart (from created_at / added_on)
  const months: Record<string, { used: number; wasted: number }> = {};
  for (const it of items) {
    const d = new Date((it.created_at as string) || (it.added_on as string));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!months[key]) months[key] = { used: 0, wasted: 0 };
    if (it.status === "used") months[key].used += 1;
    if (it.status === "wasted") months[key].wasted += 1;
  }

  return NextResponse.json({
    counts: { active: active.length, used: used.length, wasted: wasted.length, total: items.length },
    money: { saved: Number(usedMoney.toFixed(2)), wasted: Number(wastedMoney.toFixed(2)) },
    monthly: Object.entries(months).sort(([a],[b])=>a.localeCompare(b)).map(([month, v]) => ({ month, ...v })),
  });
}
