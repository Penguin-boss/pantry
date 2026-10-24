import { getDb } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const e = String(email || "").trim().toLowerCase();
  const p = String(password || "");
  if (!e || !p) return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(e) as { id: string; name: string; email: string; password_hash: string } | undefined;
  if (!user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  const ok = await bcrypt.compare(p, user.password_hash);
  if (!ok) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await setSessionCookie({ userId: user.id, email: user.email, name: user.name });
  return NextResponse.json({ ok: true });
}
