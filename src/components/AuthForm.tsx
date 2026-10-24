"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email.includes("@")) { setErr("Enter a valid email address."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (mode === "signup" && !name.trim()) { setErr("Name is required."); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Something went wrong."); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {mode === "signup" && (
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/10" autoComplete="name" />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/10" autoComplete="email" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/10" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
      </label>
      {err && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
      <button disabled={busy} className="w-full bg-[#1A3C34] text-white font-semibold rounded-full py-3.5 hover:bg-[#234E43] disabled:opacity-50 transition">
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
