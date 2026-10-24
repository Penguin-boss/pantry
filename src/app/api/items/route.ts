import { getDb, generateId } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const items = db.prepare("SELECT * FROM items WHERE user_id=? ORDER BY expiry_date ASC, created_at DESC").all(session.userId) as unknown[];
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = String(body.name || "").trim();
  const quantity = Number(body.quantity);
  const unit = String(body.unit || "").trim();
  const category = String(body.category || "").trim();
  const expiry_date = String(body.expiry_date || "").trim();
  const price = body.price === "" || body.price == null ? null : Number(body.price);
  const added_on = body.added_on ? String(body.added_on) : new Date().toISOString().slice(0, 10);

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Quantity must be > 0." }, { status: 400 });
  if (!unit) return NextResponse.json({ error: "Unit is required." }, { status: 400 });
  if (!category) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry_date)) return NextResponse.json({ error: "Valid expiry date required (YYYY-MM-DD)." }, { status: 400 });
  if (price !== null && (!Number.isFinite(price) || price < 0)) return NextResponse.json({ error: "Price must be >= 0." }, { status: 400 });

  const id = generateId();
  const db = getDb();
  db.prepare("INSERT INTO items (id,user_id,name,quantity,unit,category,price,added_on,expiry_date,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))")
    .run(id, session.userId, name, quantity, unit, category, price, added_on, expiry_date, "active");
  const item = db.prepare("SELECT * FROM items WHERE id=?").get(id);
  return NextResponse.json({ item }, { status: 201 });
}
