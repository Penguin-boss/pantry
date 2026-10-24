export const CATEGORIES = ["dairy","produce","meat","bakery","pantry","beverages","frozen","other"] as const;
export const UNITS = ["pcs","g","kg","ml","L","pack","bunch","loaf","tray"] as const;

export type ItemCategory = typeof CATEGORIES[number];
export type ItemUnit = typeof UNITS[number];

export type Item = {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  price: number | null;
  added_on: string;
  expiry_date: string;
  status: "active" | "used" | "wasted";
  created_at: string;
};

export const CATEGORY_LABEL: Record<string, string> = {
  dairy: "Dairy", produce: "Produce", meat: "Meat & Fish", bakery: "Bakery",
  pantry: "Pantry", beverages: "Beverages", frozen: "Frozen", other: "Other"
};

export const CATEGORY_EMOJI: Record<string, string> = {
  dairy: "🥛", produce: "🥬", meat: "🍗", bakery: "🍞", pantry: "🥫", beverages: "🧃", frozen: "🧊", other: "📦"
};
