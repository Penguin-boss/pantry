"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "My Fridge", icon: "▦" },
  { href: "/recipes", label: "Recipes", icon: "◎" },
  { href: "/stats", label: "Stats", icon: "◈" },
  { href: "/profile", label: "Profile", icon: "◐" },
];

export default function AppShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="min-h-screen bg-[#FFFBF2]">
      <header className="sticky top-0 z-20 bg-[#FFFBF2]/80 backdrop-blur border-b border-zinc-200">
        <div className="mx-auto max-w-[1160px] px-4 md:px-6 h-[60px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1A3C34] text-white grid place-items-center font-bold text-sm">◒</div>
              <span className="font-semibold">pantry</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className={`px-3 py-2 rounded-full text-sm font-medium ${pathname === n.href || pathname.startsWith(n.href + "/") ? "bg-[#1A3C34] text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}>
                  <span className="mr-1.5">{n.icon}</span>{n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
            <button onClick={logout} disabled={busy} className="text-sm border border-zinc-200 bg-white rounded-full px-4 py-2 hover:bg-zinc-50 disabled:opacity-50">Log out</button>
          </div>
        </div>
        <nav className="md:hidden border-t border-zinc-200 flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`flex-1 text-center py-3 text-sm font-medium border-b-2 ${pathname === n.href ? "border-[#1A3C34] text-[#1A3C34]" : "border-transparent text-zinc-500"}`}>{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1160px] px-4 md:px-6 py-6 md:py-8">{children}</main>
    </div>
  );
}
