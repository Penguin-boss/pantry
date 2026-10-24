export type Urgency = "expired" | "use_soon" | "okay" | "fresh";

export function daysRemaining(expiryDate: string): number {
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d = new Date(expiryDate + "T00:00:00");
  const expiryMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((expiryMidnight.getTime() - todayMidnight.getTime()) / 86400000);
}

export function getUrgency(expiryDate: string): Urgency {
  const days = daysRemaining(expiryDate);
  if (days < 0) return "expired";
  if (days <= 2) return "use_soon";
  if (days <= 5) return "okay";
  return "fresh";
}

export const urgencyMeta: Record<Urgency, { label: string; color: string; bg: string; dot: string; icon: string }> = {
  expired:   { label: "Expired",   color: "text-red-700",   bg: "bg-red-50 border-red-200",   dot: "bg-red-500",   icon: "●" },
  use_soon:  { label: "Use soon",  color: "text-orange-700",bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500", icon: "◐" },
  okay:      { label: "Okay",      color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-400", icon: "○" },
  fresh:     { label: "Fresh",     color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", icon: "◎" },
};

export function urgencySort(a: { expiry_date: string }, b: { expiry_date: string }) {
  const da = daysRemaining(a.expiry_date);
  const db = daysRemaining(b.expiry_date);
  return da - db;
}
