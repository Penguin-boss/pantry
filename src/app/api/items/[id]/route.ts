import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const existing = db.prepare("SELECT * FROM items WHERE id=? AND user_id=?").get(id, session.userId) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Handle status transitions (used/wasted)
  if (body.status && ["used","wasted","active"].includes(body.status)) {
    db.prepare("UPDATE items SET status=? WHERE id=?").run(body.status, id);
    const item = db.prepare("SELECT * FROM items WHERE id=?").get(id);
    return NextResponse.json({ item });
  }

  const name = body.name !== undefined ? String(body.name).trim() : (existing.name as string);
  const quantity = body.quantity !== undefined ? Number(body.quantity) : (existing.quantity as number);
  const unit = body.unit !== undefined ? String(body.unit).trim() : (existing.unit as string);
  const category = body.category !== undefined ? String(body.category).trim() : (existing.category as string);
  const expiry_date = body.expiry_date !== undefined ? String(body.expiry_date).trim() : (existing.expiry_date as string);
  const price = body.price === "" ? null : body.price !== undefined ? Number(body.price) : (existing.price as number | null);

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Quantity must be > 0." }, { status: 400 });
  if (!unit) return NextResponse.json({ error: "Unit is required." }, { status: 400 });
  if (!category) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry_date)) return NextResponse.json({ error: "Valid expiry date required." }, { status: 400 });
  if (price !== null && (!Number.isFinite(price as number) || (price as number) < 0)) return NextResponse.json({ error: "Price must be >= 0." }, { status: 400 });

  db.prepare("UPDATE items SET name=?, quantity=?, unit=?, category=?, price=?, expiry_date=? WHERE id=?")
    .run(name, quantity, unit, category, price, expiry_date, id);
  const item = db.prepare("SELECT * FROM items WHERE id=?").get(id);
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const existing = db.prepare("SELECT id FROM items WHERE id=? AND user_id=?").get(id, session.userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  db.prepare("DELETE FROM items WHERE id=?").run(id);
  return NextResponse.json({ ok: true });
}
