import raw from "@/data/recipe-book.json";

export type BookRecipe = {
  id: string;
  name: string;
  thumb: string;
  category: string;
  area: string;
  tags: string[];
  youtube: string;
  source: string;
  ingredients: string[];
  instructions: string;
};

export type BookItem = {
  key: string;
  name: string;
  emoji: string;
  dbIngredient: string | null;
  recipes: BookRecipe[];
};

export type BookGroup = {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  items: BookItem[];
};

export type RecipeBook = {
  builtAt: string;
  source: string;
  groups: BookGroup[];
  totals: { items: number; recipes: number };
};

export const BOOK = raw as unknown as RecipeBook;

export const ALL_BOOK_ITEMS: BookItem[] = BOOK.groups.flatMap((g) => g.items);

export const BOOK_ITEM_BY_KEY: Map<string, BookItem> = new Map(
  ALL_BOOK_ITEMS.map((i) => [i.key, i])
);

export function recipesInGroup(group: BookGroup): number {
  return group.items.reduce((n, i) => n + i.recipes.length, 0);
}

/** Best-effort match of a fridge item name (e.g. "Whole Milk") to book items. */
export function findBookItemsForName(name: string): BookItem[] {
  const n = name.toLowerCase().trim();
  if (!n) return [];
  const words = n.split(/\s+/);
  const scored = ALL_BOOK_ITEMS.map((item) => {
    const key = item.key.toLowerCase();
    const itemName = item.name.toLowerCase();
    let score = 0;
    if (key === n || itemName === n) score = 100;
    else if (itemName.includes(n) || n.includes(itemName)) score = 80;
    else if (key.includes(n) || n.includes(key)) score = 70;
    else {
      for (const w of words) {
        if (w.length >= 4 && (itemName.includes(w) || key.startsWith(w))) score = Math.max(score, 50);
      }
    }
    return { item, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.item);
}
