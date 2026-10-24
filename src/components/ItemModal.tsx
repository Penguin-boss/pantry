"use client";
import { useState } from "react";
import { CATEGORIES, UNITS, CATEGORY_LABEL } from "@/lib/types";
import type { Item } from "@/lib/types";

export default function ItemModal({ item, onClose, onSaved }: { item?: Item; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const [name, setName] = useState(item?.name ?? "");
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [unit, setUnit] = useState(item?.unit ?? "pcs");
  const [category, setCategory] = useState(item?.category ?? "produce");
  const [expiry, setExpiry] = useState(item?.expiry_date ?? new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10));
  const [price, setPrice] = useState(item?.price != null ? String(item.price) : "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!name.trim()) { setErr("Name is required."); return; }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) { setErr("Quantity must be greater than 0."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)) { setErr("Enter a valid expiry date."); return; }
    const pr = price === "" ? null : Number(price);
    if (pr !== null && (!Number.isFinite(pr) || pr < 0)) { setErr("Price must be >= 0."); return; }
    setBusy(true);
    try {
      const body = { name: name.trim(), quantity: qty, unit, category, expiry_date: expiry, price: pr };
      const res = await fetch(isEdit ? `/api/items/${item!.id}` : "/api/items", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Failed to save."); return; }
      onSaved();
    } catch {
      setErr("Network error. Try again.");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center">
      <button onClick={onClose} className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" aria-label="Close" />
      <div className="relative w-full max-w-[560px] bg-white rounded-t-[24px] md:rounded-[24px] shadow-xl max-h-[92vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg">{isEdit ? "Edit item" : "Add item"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-zinc-200 grid place-items-center hover:bg-zinc-50">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Item name</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Milk, strawberries, chicken…" className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/10" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Quantity</span>
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" step="any" min="0" className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#1A3C34]" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Unit</span>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm bg-white">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm bg-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Expiry date</span>
              <input value={expiry} onChange={(e) => setExpiry(e.target.value)} type="date" className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Price (optional)</span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-zinc-500">£</span>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" min="0" placeholder="2.50" className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#1A3C34]" />
            </div>
            <span className="text-xs text-zinc-500">Used to calculate money saved. Leave blank if unknown.</span>
          </label>
          {err && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-zinc-200 py-3 font-medium hover:bg-zinc-50">Cancel</button>
            <button disabled={busy} className="flex-1 rounded-full bg-[#1A3C34] text-white font-semibold py-3 hover:bg-[#234E43] disabled:opacity-50">{busy ? "Saving…" : isEdit ? "Save changes" : "Add to fridge"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
