import { getDb, generateId } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  const n = String(name || "").trim();
  const e = String(email || "").trim().toLowerCase();
  const p = String(password || "");
  if (!n) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!e.includes("@")) return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  if (p.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

  const db = getDb();
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(e);
  if (exists) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

  const id = generateId();
  const hash = await bcrypt.hash(p, 10);
  db.prepare("INSERT INTO users (id,name,email,password_hash,created_at) VALUES (?,?,?,?,datetime('now'))").run(id, n, e, hash);
  await setSessionCookie({ userId: id, email: e, name: n });
  return NextResponse.json({ ok: true, user: { id, name: n, email: e } });
}
