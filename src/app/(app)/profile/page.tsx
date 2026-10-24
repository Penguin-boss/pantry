"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string; created_at: string } | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (d.user) { setUser(d.user); setName(d.user.name); } });
  }, []);

  async function save() {
    setMsg("");
    const res = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error || "Failed to save."); return; }
    setMsg("Saved.");
    router.refresh();
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!user) return <div className="py-20 text-center text-zinc-500">Loading…</div>;
  return (
    <div className="max-w-[560px]">
      <h1 className="text-[28px]">Profile</h1>
      <div className="mt-6 rounded-[24px] bg-white border border-zinc-200 p-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#1A3C34]" />
        </label>
        <div>
          <p className="text-sm font-medium">Email</p>
          <p className="mt-1 text-sm text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">{user.email}</p>
          <p className="text-xs text-zinc-500 mt-1">Email cannot be changed.</p>
        </div>
        <p className="text-xs text-zinc-500">Member since {new Date(user.created_at).toLocaleDateString()}</p>
        {msg && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
        <div className="flex gap-3">
          <button onClick={save} className="bg-[#1A3C34] text-white font-semibold rounded-full px-6 py-3 hover:bg-[#234E43]">Save changes</button>
          <button onClick={logout} className="rounded-full border border-zinc-200 px-6 py-3 font-medium hover:bg-zinc-50">Log out</button>
        </div>
      </div>
    </div>
  );
}
