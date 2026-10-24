import Link from "next/link";
import { BOOK, recipesInGroup } from "@/lib/recipe-book";

export default function LandingPage() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-[#FFFBF2]">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-[#FFFBF2]/80 backdrop-blur border-b border-zinc-200">
        <div className="mx-auto max-w-[1160px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1A3C34] flex items-center justify-center text-white font-bold text-sm">◒</div>
            <span className="font-semibold tracking-tight text-[17px]">pantry</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-600">
            <a href="#how" className="hover:text-zinc-900">How it works</a>
            <a href="#book" className="hover:text-zinc-900">Recipe book</a>
            <a href="#features" className="hover:text-zinc-900">Features</a>
            <a href="#faq" className="hover:text-zinc-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-100">Log in</Link>
            <Link href="/signup" className="text-sm font-semibold bg-[#1A3C34] text-white px-5 py-2.5 rounded-full hover:bg-[#234E43] transition">Get started — free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1160px] px-6 pt-12 md:pt-20 pb-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#1A3C34] bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Waste less, cook more
          </p>
          <h1 className="mt-6 text-[44px] md:text-[56px] leading-[0.95] tracking-tight font-[Instrument_Serif] text-zinc-900">
            Know what's in your<br />
            <span className="italic font-normal text-[#1A3C34]">fridge.</span> Use it before<br />
            you lose it.
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-zinc-600 max-w-[46ch]">
            Track every item, see what expires next, and cook from a built-in book of {BOOK.totals.recipes} real recipes covering {BOOK.totals.items} everyday ingredients — then understand exactly how much food and money you saved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-[#1A3C34] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#234E43] transition">Start tracking free <span>→</span></Link>
            <Link href="/login" className="inline-flex items-center gap-2 bg-white border border-zinc-200 font-medium px-7 py-3.5 rounded-full hover:bg-zinc-50 transition">Sign in</Link>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Free forever for personal use · No credit card · {BOOK.totals.recipes} recipes included</p>
        </div>

        {/* Preview card — fridge */}
        <div className="relative">
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100">
              <p className="font-semibold">My Fridge</p>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1">6 items</span>
            </div>
            <div className="p-5 bg-[#FFFBF2] space-y-3">
              {[
                { emoji: "🍓", name: "Strawberries", qty: "250g", tag: "1 day left", cls: "border-orange-200 bg-orange-50 text-orange-700" },
                { emoji: "🥛", name: "Milk", qty: "1 L", tag: "expires today", cls: "border-orange-200 bg-orange-50 text-orange-700" },
                { emoji: "🍞", name: "Sourdough", qty: "1 loaf", tag: "4 days", cls: "border-amber-200 bg-amber-50 text-amber-700" },
                { emoji: "🍗", name: "Chicken thighs", qty: "600g", tag: "8 days", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
              ].map((it) => (
                <div key={it.name} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBF2] border border-zinc-200 flex items-center justify-center text-lg">{it.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.name}</p>
                    <p className="text-xs text-zinc-500">{it.qty}</p>
                  </div>
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${it.cls}`}>{it.tag}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 flex gap-2">
              <span className="flex-1 h-9 rounded-full bg-[#1A3C34] text-white grid place-items-center text-sm font-semibold">+ Add item</span>
              <span className="h-9 rounded-full border border-zinc-200 bg-white px-4 grid place-items-center text-sm">🍳 Recipes</span>
            </div>
          </div>
          {/* floating badges */}
          <div className="hidden md:flex absolute -right-2 -bottom-3 bg-[#1A3C34] text-white rounded-2xl px-5 py-4 shadow-xl items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 grid place-items-center">♻</div>
            <div>
              <p className="text-sm font-semibold">£42.30 saved</p>
              <p className="text-xs text-white/70">this month</p>
            </div>
          </div>
          <div className="hidden md:flex absolute -left-3 top-16 bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-lg items-center gap-3">
            <span className="text-xl">🍫</span>
            <div>
              <p className="text-xs font-semibold">179 recipes</p>
              <p className="text-[11px] text-zinc-500">chocolate → chicken</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1160px] px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: `${BOOK.totals.recipes}`, k: "real recipes built in" },
            { v: `${BOOK.totals.items}`, k: "everyday ingredients covered" },
            { v: `${BOOK.groups.length}`, k: "food groups — meat to chocolate" },
            { v: "£0", k: "cost. free forever" },
          ].map((s) => (
            <div key={s.k}>
              <p className="text-3xl md:text-4xl font-semibold text-[#1A3C34]">{s.v}</p>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-medium">{s.k}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inside the recipe book */}
      <section id="book" className="mx-auto max-w-[1160px] px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">Built-in recipe book</p>
            <h2 className="mt-2 text-3xl md:text-4xl leading-tight">Whatever's in your kitchen, there's a recipe for it</h2>
            <p className="mt-3 text-sm text-zinc-600 max-w-[60ch]">From chicken and salmon to milk, chocolate and oats — browse by group, pick an ingredient, and get one or two proven dishes with full instructions. Your fridge items are ticked off automatically.</p>
          </div>
          <Link href="/signup" className="rounded-full bg-[#1A3C34] text-white font-semibold px-6 py-3 text-sm hover:bg-[#234E43] transition">Open the recipe book →</Link>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOOK.groups.map((g) => (
            <div key={g.id} className="rounded-[24px] bg-white border border-zinc-200 p-6">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#FFFBF2] border border-zinc-200 grid place-items-center text-xl">{g.emoji}</div>
                <span className="text-[11px] font-bold bg-[#1A3C34] text-white rounded-full px-2.5 py-1">{recipesInGroup(g)} recipes</span>
              </div>
              <h3 className="mt-4 font-semibold text-lg">{g.label}</h3>
              <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{g.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {g.items.slice(0, 5).map((i) => (
                  <span key={i.key} className="text-xs bg-[#FFFBF2] border border-zinc-200 rounded-full px-2.5 py-1 text-zinc-600">{i.emoji} {i.name.split(" /")[0]}</span>
                ))}
                {g.items.length > 5 && <span className="text-xs text-zinc-400 px-1 py-1">+{g.items.length - 5} more</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white border-y border-zinc-200">
        <div className="mx-auto max-w-[1160px] px-6 py-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">How it works</p>
          <h2 className="mt-2 text-3xl md:text-4xl leading-tight">From fridge to plate in four steps</h2>
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            {[
              { n: "01", t: "Add items", d: "Log name, quantity, category and expiry date in seconds.", emoji: "🧊" },
              { n: "02", t: "See urgency", d: "Fresh, okay, use soon and expired — colour-coded automatically.", emoji: "⏳" },
              { n: "03", t: "Cook with this", d: "Pick ingredients or browse the book and get real recipes with full instructions.", emoji: "🍳" },
              { n: "04", t: "Track impact", d: "See saved vs wasted and estimated money saved over time.", emoji: "📈" },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-[#FFFBF2] border border-zinc-200 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-light text-zinc-300">{s.n}</p>
                  <span className="text-xl">{s.emoji}</span>
                </div>
                <p className="mt-3 font-semibold">{s.t}</p>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1160px] px-6 py-16">
        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">Features</p>
        <h2 className="mt-2 text-3xl md:text-4xl leading-tight">Everything a food-waste-averse kitchen needs</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { emoji: "▦", t: "Visual fridge shelf", d: "A warm, shelf-inspired layout plus a compact list view — sorted by urgency by default, filterable by category and status." },
            { emoji: "◆", t: "Honest urgency logic", d: "Date-only math, timezone-safe. Today is never shown as expired. Expired, use-soon, okay and fresh states at a glance." },
            { emoji: "📖", t: `${BOOK.totals.recipes}-recipe book`, d: `${BOOK.totals.items} everyday ingredients across ${BOOK.groups.length} groups, each with 1–2 proven dishes, photos, and full step-by-step instructions.` },
            { emoji: "🍳", t: "Cook from your fridge", d: "Search TheMealDB live by your actual ingredients. What you already have is ticked green; what's missing is called out clearly." },
            { emoji: "📈", t: "Waste analytics", d: "Saved vs wasted counts, a monthly trend chart, and your personal save rate — so the habit sticks." },
            { emoji: "💷", t: "Money tracking", d: "Add prices when you log items and Pantry totals what you rescued vs what you lost, in pounds." },
          ].map((f) => (
            <div key={f.t} className="rounded-[24px] bg-white border border-zinc-200 p-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBF2] border border-zinc-200 grid place-items-center text-lg">{f.emoji}</div>
              <h3 className="mt-4 font-semibold text-lg">{f.t}</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white border-y border-zinc-200">
        <div className="mx-auto max-w-[820px] px-6 py-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">FAQ</p>
          <h2 className="mt-2 text-3xl md:text-4xl leading-tight">Questions, answered</h2>
          <div className="mt-8 space-y-3">
            {[
              { q: "Is Pantry really free?", a: "Yes — free forever for personal use. No credit card, no premium tier, no limits on items." },
              { q: "Where do the recipes come from?", a: "The built-in recipe book and the fridge search are powered by TheMealDB, a real, open recipe database. Every recipe has a photo, ingredient list with measurements, and step-by-step instructions — plus a link to the original source." },
              { q: "Do I need an account?", a: "You need a free account so your fridge, history and impact stats stay yours across devices. Signing up takes seconds — just a name, email and password." },
              { q: "How is 'money saved' calculated?", a: "When you mark an item as Used, its price (if you entered one) is added to your savings. Wasted items are counted separately and never counted as saved. Items without a price contribute £0." },
              { q: "Does it work on my phone?", a: "Yes — Pantry is fully responsive with a mobile bottom nav, large touch targets, and a simplified item editor on small screens." },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl bg-[#FFFBF2] border border-zinc-200 px-5 py-4 open:bg-white">
                <summary className="flex items-center justify-between cursor-pointer font-medium text-[15px] list-none">
                  {f.q}
                  <span className="text-zinc-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-[1160px] px-6 py-16">
        <div className="rounded-[28px] bg-[#1A3C34] text-white px-8 py-12 md:px-14 text-center relative overflow-hidden">
          <p className="text-3xl md:text-4xl font-[Instrument_Serif] leading-tight">Your fridge is full of dinner ideas.<br className="hidden md:block" /> Start seeing them.</p>
          <p className="mt-4 text-sm text-white/70 max-w-[52ch] mx-auto">Track what you have, cook {BOOK.totals.recipes}+ real recipes built around it, and watch your waste — and your bill — shrink.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="bg-white text-[#1A3C34] font-semibold px-7 py-3.5 rounded-full hover:bg-emerald-50 transition">Create free account</Link>
            <Link href="/login" className="border border-white/30 text-white font-medium px-7 py-3.5 rounded-full hover:bg-white/10 transition">Log in</Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1160px] px-6 py-10 text-sm text-zinc-500 flex flex-col md:flex-row gap-4 justify-between">
        <p>© {year} Pantry — reduce waste, cook what you have. Recipes via TheMealDB.</p>
        <p className="flex gap-4"><Link href="/login" className="hover:text-zinc-700">Log in</Link><Link href="/signup" className="hover:text-zinc-700">Sign up</Link></p>
      </footer>
    </div>
  );
}
