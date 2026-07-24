export type Category = "men" | "women" | "kids";
export type SubCategory = "jean" | "t-shirt" | "joggers" | "polo" | "shirt" | "hoodies" | "tracksuit" | "mesh-trucker-hat" | "polo-gown" | "shorts";

export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "men", label: "Men" },
  { slug: "women", label: "Women" },
  { slug: "kids", label: "Kids" },
];

// FIXED: each subcategory now declares which genders it's actually valid under, via
// `categories`. This is what lets "Polo Gown" show up only where it makes sense
// (e.g. Women + Kids) instead of automatically appearing under every single gender.
// To restrict or expand any subcategory later, just edit its `categories` array —
// nothing else needs to change.
export const SUBCATEGORIES: { slug: SubCategory; label: string; categories: Category[] }[] = [
  { slug: "jean", label: "Jean", categories: ["men", "women", "kids"] },
  { slug: "t-shirt", label: "T-Shirt", categories: ["men", "women", "kids"] },
  { slug: "joggers", label: "Joggers", categories: ["men", "women", "kids"] },
  { slug: "polo", label: "Polo", categories: ["men", "kids", "women"] },
  { slug: "polo-gown", label: "Polo Gown", categories: ["women", "kids"] },
  { slug: "tracksuit", label: "Track suites", categories: ["men", "women", "kids"] },
  { slug: "hoodies", label: "Hoodies", categories: ["men", "women", "kids"] },
  { slug: "mesh-trucker-hat", label: "Mesh Trucker Hat", categories: ["men", "women", "kids"] },
 // { slug: "shirt", label: "Shirt", categories: ["men", "women", "kids"] },
  { slug: "shorts", label: "Shorts", categories: ["men", "women", "kids"] },
];

// Returns only the subcategories valid for a given gender/category — this is the
// function Header.tsx, the admin product form, and the shop route all use now,
// instead of looping over the full SUBCATEGORIES list unconditionally.
export function getSubcategoriesFor(category: Category) {
  return SUBCATEGORIES.filter((s) => s.categories.includes(category));
}

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  sub: SubCategory;
  colors: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  badge?: "New" | "New Arrival" | "Best Seller" | "Out of Stock"; // FIXED: Expanded typing matrix boundaries cleanly
};

// Clean inline utility to handle fallback string normalization for name lookups
const convertToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/[\s_-]+/g, '-') 
    .replace(/^-+|-+$/g, '');
};

// Unsplash fashion photos, resized. Stable IDs.
const img = (id: string) => `https://images.unsplash.com/${id}?w=900&h=1125&fit=crop&auto=format&q=75`;

export const PRODUCTS: Product[] = [
  { id: "wide-leg-jean", name: "Wide Leg Jean", price: 180, category: "women", sub: "jean", colors: ["#3a4a6a", "#1a1a2a", "#e8e0d0"], images: [img("photo-1541099649105-f69ad21f3246"), img("photo-1584370848010-d7fe6bc767ec")], rating: 4.5, reviewCount: 202, description: "High-rise wide-leg jeans in rigid Japanese denim with a clean hem." },
];

export function findProduct(id: string): Product | undefined { 
  if (!id) return undefined;
  const cleanId = id.toString();
  
  // Try structural text matching rules first
  const match = PRODUCTS.find((p) => p.id === cleanId);
  if (match) return match;
  
  // Fall back to check text slug mutations
  return PRODUCTS.find((p) => convertToSlug(p.name) === cleanId.toLowerCase());
}

export function byCategory(cat: Category): Product[] {
  return PRODUCTS.filter((p) => p.category === cat);
}

export function bySub(cat: Category, sub: SubCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === cat && p.sub === sub);
}

export function related(p: Product, n = 4): Product[] {
  if (!p) return [];
  return PRODUCTS.filter((x) => x.id !== p.id && (x.sub === p.sub || x.category === p.category)).slice(0, n);
}