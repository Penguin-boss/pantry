import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const user = db.prepare("SELECT id,name,email,created_at FROM users WHERE id=?").get(s.userId);
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  const n = String(name || "").trim();
  if (!n) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const db = getDb();
  db.prepare("UPDATE users SET name=? WHERE id=?").run(n, s.userId);
  // refresh cookie name
  const { setSessionCookie } = await import("@/lib/auth");
  await setSessionCookie({ userId: s.userId, email: s.email, name: n });
  return NextResponse.json({ ok: true });
}
