// Builds src/data/recipe-book.json — a curated recipe book covering ~75 common
// kitchen items with 1-2 real recipes each, fetched live from TheMealDB.
// Usage: node scripts/build-recipe-book.mjs
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.themealdb.com/api/json/v1/1";
const OUT = path.resolve("src/data/recipe-book.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// group -> { label, emoji, blurb, items: [{ key, name, emoji, candidates: [TheMealDB ingredient names to try, in order] }] }
const GROUPS = [
  {
    id: "meat", label: "Meat & Poultry", emoji: "🍗",
    blurb: "Everyday cuts and mince, from quick stir-fries to slow roasts.",
    items: [
      { key: "chicken", name: "Chicken", emoji: "🐔", candidates: ["Chicken"] },
      { key: "chicken-breast", name: "Chicken breast", emoji: "🍗", candidates: ["Chicken Breast", "Chicken breasts", "Chicken"] },
      { key: "beef", name: "Beef", emoji: "🥩", candidates: ["Beef"] },
      { key: "minced-beef", name: "Minced beef", emoji: "🍔", candidates: ["Beef mince", "Minced Beef", "Ground Beef", "Beef"] },
      { key: "pork", name: "Pork", emoji: "🐖", candidates: ["Pork"] },
      { key: "lamb", name: "Lamb", emoji: "🐑", candidates: ["Lamb"] },
      { key: "bacon", name: "Bacon", emoji: "🥓", candidates: ["Bacon", "Streaky Bacon", "Back Bacon"] },
      { key: "sausage", name: "Sausages", emoji: "🌭", candidates: ["Sausages", "Sausage"] },
      { key: "turkey", name: "Turkey", emoji: "🦃", candidates: ["Turkey"] },
      { key: "chorizo", name: "Chorizo", emoji: "🌶️", candidates: ["Chorizo", "Chorizo Sausage"] },
    ],
  },
  {
    id: "seafood", label: "Fish & Seafood", emoji: "🐟",
    blurb: "Weeknight fish suppers and shellfish classics.",
    items: [
      { key: "salmon", name: "Salmon", emoji: "🍣", candidates: ["Salmon"] },
      { key: "cod", name: "Cod", emoji: "🐟", candidates: ["Cod"] },
      { key: "tuna", name: "Tuna", emoji: "🐠", candidates: ["Tuna"] },
      { key: "prawns", name: "Prawns", emoji: "🦐", candidates: ["Prawns", "Prawn", "Shrimp", "Tiger Prawns"] },
      { key: "haddock", name: "Haddock", emoji: "🐡", candidates: ["Haddock"] },
      { key: "sardines", name: "Sardines", emoji: "🐠", candidates: ["Sardines", "Sardine"] },
    ],
  },
  {
    id: "veggies", label: "Vegetables", emoji: "🥦",
    blurb: "The produce drawer, from everyday staples to weekend roasts.",
    items: [
      { key: "tomato", name: "Tomatoes", emoji: "🍅", candidates: ["Tomatoes", "Tomato", "Cherry Tomatoes"] },
      { key: "potato", name: "Potatoes", emoji: "🥔", candidates: ["Potatoes", "Potato", "Sweet Potatoes"] },
      { key: "onion", name: "Onions", emoji: "🧅", candidates: ["Onions", "Onion", "Red Onions"] },
      { key: "garlic", name: "Garlic", emoji: "🧄", candidates: ["Garlic"] },
      { key: "carrot", name: "Carrots", emoji: "🥕", candidates: ["Carrots", "Carrot"] },
      { key: "broccoli", name: "Broccoli", emoji: "🥦", candidates: ["Broccoli"] },
      { key: "spinach", name: "Spinach", emoji: "🥬", candidates: ["Spinach", "Baby Spinach"] },
      { key: "mushroom", name: "Mushrooms", emoji: "🍄", candidates: ["Mushrooms", "Mushroom", "Chestnut Mushroom"] },
      { key: "courgette", name: "Courgette / Zucchini", emoji: "🥒", candidates: ["Courgettes", "Zucchini", "Courgette"] },
      { key: "aubergine", name: "Aubergine / Eggplant", emoji: "🍆", candidates: ["Aubergines", "Eggplant", "Aubergine"] },
      { key: "peppers", name: "Peppers", emoji: "🫑", candidates: ["Red Pepper", "Mixed peppers", "Sweet Red Peppers", "Green Pepper"] },
      { key: "asparagus", name: "Asparagus", emoji: "🌿", candidates: ["Asparagus"] },
      { key: "cabbage", name: "Cabbage", emoji: "🥬", candidates: ["Cabbage", "White Cabbage", "Savoy Cabbage"] },
      { key: "peas", name: "Peas", emoji: "🟢", candidates: ["Peas", "Frozen Peas", "Garden Peas"] },
      { key: "green-beans", name: "Green beans", emoji: "🌿", candidates: ["Green Beans", "French Beans"] },
      { key: "sweetcorn", name: "Sweetcorn", emoji: "🌽", candidates: ["Sweetcorn", "Corn", "Corn Kernels", "Baby Sweetcorn"] },
      { key: "cucumber", name: "Cucumber", emoji: "🥒", candidates: ["Cucumber"] },
      { key: "leek", name: "Leeks", emoji: "🌿", candidates: ["Leeks", "Leek"] },
      { key: "avocado", name: "Avocado", emoji: "🥑", candidates: ["Avocado", "Avocados"] },
      { key: "lettuce", name: "Lettuce", emoji: "🥗", candidates: ["Lettuce", "Cos Lettuce", "Iceberg Lettuce"] },
    ],
  },
  {
    id: "dairy", label: "Dairy & Eggs", emoji: "🥛",
    blurb: "Milk, cheese and everything creamy.",
    items: [
      { key: "milk", name: "Milk", emoji: "🥛", candidates: ["Milk", "Whole Milk", "Full-Fat Milk"] },
      { key: "cheese", name: "Cheese", emoji: "🧀", candidates: ["Cheese", "Cheddar Cheese", "Grated Cheese"] },
      { key: "parmesan", name: "Parmesan", emoji: "🧀", candidates: ["Parmesan", "Parmigiano Reggiano"] },
      { key: "mozzarella", name: "Mozzarella", emoji: "🧀", candidates: ["Mozzarella", "Mozzarella Balls"] },
      { key: "feta", name: "Feta", emoji: "🧀", candidates: ["Feta", "Feta Cheese"] },
      { key: "butter", name: "Butter", emoji: "🧈", candidates: ["Butter", "Unsalted Butter", "Salted Butter"] },
      { key: "yogurt", name: "Yogurt", emoji: "🥣", candidates: ["Yogurt", "Natural Yogurt", "Greek Yogurt", "Yoghurt"] },
      { key: "cream", name: "Cream", emoji: "🍶", candidates: ["Double Cream", "Single Cream", "Cream"] },
      { key: "cream-cheese", name: "Cream cheese", emoji: "🧁", candidates: ["Cream Cheese", "Soft Cheese"] },
      { key: "eggs", name: "Eggs", emoji: "🥚", candidates: ["Eggs", "Egg", "Free-Range Egg, Beaten"] },
    ],
  },
  {
    id: "sweets", label: "Chocolate & Sweet", emoji: "🍫",
    blurb: "Baking-shelf favourites for puddings and treats.",
    items: [
      { key: "chocolate", name: "Chocolate", emoji: "🍫", candidates: ["Chocolate", "Plain Chocolate", "Milk Chocolate"] },
      { key: "dark-chocolate", name: "Dark chocolate", emoji: "🍫", candidates: ["Dark Chocolate", "70% Cocoa Chocolate"] },
      { key: "white-chocolate", name: "White chocolate", emoji: "🍫", candidates: ["White Chocolate"] },
      { key: "cocoa", name: "Cocoa powder", emoji: "🟤", candidates: ["Cocoa", "Cocoa Powder", "Cacao Powder"] },
      { key: "honey", name: "Honey", emoji: "🍯", candidates: ["Honey", "Runny Honey", "Clear Honey"] },
      { key: "sugar", name: "Sugar", emoji: "🍬", candidates: ["Sugar", "Caster Sugar", "Granulated Sugar"] },
      { key: "brown-sugar", name: "Brown sugar", emoji: "🟫", candidates: ["Brown Sugar", "Light Brown Sugar", "Muscovado Sugar"] },
      { key: "jam", name: "Jam", emoji: "🍓", candidates: ["Jam", "Strawberry Jam", "Raspberry Jam"] },
      { key: "golden-syrup", name: "Golden syrup", emoji: "🍯", candidates: ["Golden Syrup", "Corn Syrup", "Maple Syrup"] },
    ],
  },
  {
    id: "grains", label: "Grains, Pasta & Bread", emoji: "🍚",
    blurb: "Carb corner — rice, pasta, oats and the bread bin.",
    items: [
      { key: "rice", name: "Rice", emoji: "🍚", candidates: ["Rice", "Long Grain Rice", "Basmati Rice"] },
      { key: "pasta", name: "Pasta", emoji: "🍝", candidates: ["Linguine Pasta", "Penne Pasta", "Macaroni", "Bowtie Pasta"] },
      { key: "spaghetti", name: "Spaghetti", emoji: "🍝", candidates: ["Spaghetti"] },
      { key: "noodles", name: "Noodles", emoji: "🍜", candidates: ["Noodles", "Egg Noodles", "Rice Noodles"] },
      { key: "bread", name: "Bread", emoji: "🍞", candidates: ["Bread", "White Bread", "Sourdough Bread", "Bread Buns"] },
      { key: "breadcrumbs", name: "Breadcrumbs", emoji: "🍞", candidates: ["Breadcrumbs", "Fresh Breadcrumbs", "Panko Breadcrumbs"] },
      { key: "flour", name: "Flour", emoji: "🌾", candidates: ["Flour", "Plain Flour", "All Purpose Flour", "Self-raising Flour"] },
      { key: "oats", name: "Oats", emoji: "🥣", candidates: ["Oats", "Rolled Oats", "Porridge Oats"] },
      { key: "couscous", name: "Couscous", emoji: "🌾", candidates: ["Couscous", "Giant Couscous"] },
      { key: "quinoa", name: "Quinoa", emoji: "🌱", candidates: ["Quinoa"] },
      { key: "tortillas", name: "Tortillas", emoji: "🌮", candidates: ["Flour Tortilla", "Tortillas", "Corn Tortillas"] },
    ],
  },
  {
    id: "fruit", label: "Fruit", emoji: "🍓",
    blurb: "The fruit bowl — eat fresh, bake riper.",
    items: [
      { key: "banana", name: "Bananas", emoji: "🍌", candidates: ["Bananas", "Banana"] },
      { key: "apple", name: "Apples", emoji: "🍎", candidates: ["Apples", "Apple", "Bramley Apples"] },
      { key: "lemon", name: "Lemons", emoji: "🍋", candidates: ["Lemons", "Lemon", "Lemon Juice"] },
      { key: "orange", name: "Oranges", emoji: "🍊", candidates: ["Oranges", "Orange", "Orange Zest"] },
      { key: "strawberries", name: "Strawberries", emoji: "🍓", candidates: ["Strawberries", "Strawberry"] },
      { key: "mango", name: "Mango", emoji: "🥭", candidates: ["Mango", "Mango Chutney"] },
      { key: "pineapple", name: "Pineapple", emoji: "🍍", candidates: ["Pineapple Chunks", "Fresh Pineapple", "Pineapple Juice"] },
      { key: "blueberries", name: "Blueberries", emoji: "🫐", candidates: ["Blueberries", "Blueberry"] },
      { key: "raspberries", name: "Raspberries", emoji: "🍇", candidates: ["Raspberries", "Raspberry"] },
      { key: "raisins", name: "Raisins & Sultanas", emoji: "🍇", candidates: ["Raisins", "Sultanas"] },
    ],
  },
  {
    id: "plant", label: "Beans, Lentils & Plant-based", emoji: "🌱",
    blurb: "Pulses and plant proteins that stretch any meal.",
    items: [
      { key: "tofu", name: "Tofu", emoji: "⚪", candidates: ["Tofu", "Firm Tofu", "Silken Tofu"] },
      { key: "lentils", name: "Lentils", emoji: "🟤", candidates: ["Lentils", "Red Lentils", "Green Lentils", "Puy Lentils"] },
      { key: "chickpeas", name: "Chickpeas", emoji: "🟡", candidates: ["Chickpeas", "Chick Peas"] },
      { key: "kidney-beans", name: "Kidney beans", emoji: "🔴", candidates: ["Kidney Beans", "Red Kidney Beans"] },
      { key: "black-beans", name: "Black beans", emoji: "⚫", candidates: ["Black Beans", "Fermented Black Beans"] },
      { key: "butter-beans", name: "Butter beans", emoji: "🤍", candidates: ["Butter Beans"] },
      { key: "cannellini-beans", name: "Cannellini beans", emoji: "🤍", candidates: ["Cannellini Beans", "Haricot Beans"] },
      { key: "peanut", name: "Peanuts", emoji: "🥜", candidates: ["Peanuts", "Salted Peanuts", "Unsalted Peanuts"] },
    ],
  },
  {
    id: "pantry", label: "Pantry & Sauces", emoji: "🥫",
    blurb: "Jars, tins and bottles that pull a dish together.",
    items: [
      { key: "olive-oil", name: "Olive oil", emoji: "🫒", candidates: ["Olive Oil", "Extra Virgin Olive Oil"] },
      { key: "soy-sauce", name: "Soy sauce", emoji: "🍶", candidates: ["Soy Sauce", "Dark Soy Sauce", "Light Soy Sauce"] },
      { key: "coconut-milk", name: "Coconut milk", emoji: "🥥", candidates: ["Coconut Milk", "Coconut Cream"] },
      { key: "chopped-tomatoes", name: "Tinned tomatoes", emoji: "🥫", candidates: ["Chopped Tomatoes", "Plum Tomatoes", "Tinned Tomatoes"] },
      { key: "tomato-puree", name: "Tomato puree", emoji: "🥫", candidates: ["Tomato Puree", "Tomato Paste", "Tomato Ketchup"] },
      { key: "basil", name: "Basil", emoji: "🌿", candidates: ["Basil", "Basil Leaves", "Fresh Basil"] },
      { key: "mustard", name: "Mustard", emoji: "💛", candidates: ["Mustard", "Wholegrain Mustard", "Dijon Mustard", "English Mustard"] },
      { key: "mayonnaise", name: "Mayonnaise", emoji: "🥚", candidates: ["Mayonnaise", "Mayo"] },
      { key: "stock", name: "Stock cube", emoji: "🍲", candidates: ["Stock", "Chicken Stock", "Vegetable Stock", "Beef Stock"] },
      { key: "curry-paste", name: "Curry paste", emoji: "🍛", candidates: ["Curry Paste", "Red Curry Paste", "Green Curry Paste", "Massaman Curry Paste"] },
    ],
  },
];

async function fetchJson(url, tries = 3) {
  for (let a = 1; a <= tries; a++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "pantry-recipe-book/1.0" } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.ok ? 200 : res.status}`);
      return await res.json();
    } catch (e) {
      if (a === tries) { console.warn(`  ! ${url} failed: ${e.message}`); return null; }
      await sleep(400 * a);
    }
  }
}

function cleanInstructions(text) {
  if (!text) return "";
  // Normalise newlines, collapse >2 blank lines, trim to ~1400 chars at a word boundary
  let t = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (t.length > 1400) {
    const cut = t.slice(0, 1400);
    t = cut.slice(0, cut.lastIndexOf(" ")) + " …";
  }
  return t;
}

function ingredientsOf(detail) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const ing = detail[`strIngredient${i}`]?.trim();
    const meas = detail[`strMeasure${i}`]?.trim();
    if (ing && ing.toLowerCase() !== "null") out.push(meas ? `${meas} ${ing}`.replace(/\s+/g, " ") : ing);
  }
  return out;
}

const seenRecipeIds = new Set(); // avoid exact dupes across the whole book
let apiCalls = 0;

async function resolveItem(item) {
  let matched = null, meals = null;
  for (const cand of item.candidates) {
    apiCalls++;
    const data = await fetchJson(`${BASE}/filter.php?i=${encodeURIComponent(cand)}`);
    if (data?.meals?.length) { matched = cand; meals = data.meals; break; }
    await sleep(120);
  }
  if (!meals) return { ...item, dbIngredient: null, recipes: [] };

  const picked = [];
  for (const m of meals) {
    if (picked.length >= 2) break;
    if (seenRecipeIds.has(m.idMeal)) continue;
    apiCalls++;
    const detail = await fetchJson(`${BASE}/lookup.php?i=${encodeURIComponent(m.idMeal)}`);
    await sleep(120);
    const d = detail?.meals?.[0];
    if (!d) continue;
    seenRecipeIds.add(m.idMeal);
    picked.push({
      id: d.idMeal,
      name: d.strMeal,
      thumb: d.strMealThumb || "",
      category: d.strCategory || "",
      area: d.strArea || "",
      tags: (d.strTags || "").split(",").map((t) => t.trim()).filter(Boolean),
      youtube: d.strYoutube || "",
      source: `https://www.themealdb.com/meal/${d.idMeal}`,
      ingredients: ingredientsOf(d),
      instructions: cleanInstructions(d.strInstructions),
    });
  }
  return { ...item, dbIngredient: matched, recipes: picked };
}

const book = { builtAt: new Date().toISOString(), source: "TheMealDB (themealdb.com)", groups: [] };
let totalRecipes = 0, emptyItems = [];

// --only=key1,key2 : re-fetch just these items and merge into the existing JSON
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const onlyKeys = onlyArg ? onlyArg.slice(7).split(",").map((s) => s.trim()) : null;
if (onlyKeys && fs.existsSync(OUT)) {
  const prev = JSON.parse(fs.readFileSync(OUT, "utf8"));
  for (const g of prev.groups) for (const it of g.items) for (const r of it.recipes) seenRecipeIds.add(r.id);
  book.groups = prev.groups;
}

for (const g of GROUPS) {
  process.stdout.write(`\n== ${g.label} (${g.items.length} items)\n`);
  let outGroup = book.groups.find((x) => x.id === g.id);
  if (!outGroup) {
    outGroup = { id: g.id, label: g.label, emoji: g.emoji, blurb: g.blurb, items: [] };
    book.groups.push(outGroup);
  }
  for (const item of g.items) {
    if (onlyKeys && !onlyKeys.includes(item.key)) continue;
    const existing = outGroup.items.find((i) => i.key === item.key);
    const resolved = await resolveItem(item);
    if (existing) {
      Object.assign(existing, resolved);
    } else {
      outGroup.items.push(resolved);
    }
    totalRecipes += resolved.recipes.length;
    if (resolved.recipes.length === 0) emptyItems.push(`${g.id}/${item.key} (tried: ${item.candidates.join(", ")})`);
    process.stdout.write(`  ${resolved.recipes.length > 0 ? "✓" : "✗"} ${item.name} -> ${resolved.dbIngredient ?? "no match"} (${resolved.recipes.length} recipes)\n`);
  }
  outGroup.items.sort((a, b) => a.name.localeCompare(b.name));
}
// Re-count totals from the merged tree so merges never drift
for (const g of book.groups) totalRecipes += 0; // (counted above for fetched; recount below)
book.totals = {
  items: book.groups.reduce((n, g) => n + g.items.length, 0),
  recipes: book.groups.reduce((n, g) => n + g.items.reduce((m, i) => m + i.recipes.length, 0), 0),
};
totalRecipes = book.totals.recipes;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(book, null, 1));
console.log(`\nDone: ${book.totals.items} items, ${totalRecipes} recipes, ${apiCalls} API calls`);
if (emptyItems.length) console.log(`Items with no recipes (${emptyItems.length}):\n  - ` + emptyItems.join("\n  - "));
