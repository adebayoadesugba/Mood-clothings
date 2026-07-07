export type Category = "men" | "women" | "kids";
export type SubCategory = "jean" | "t-shirt" | "joggers" | "polo" | "shirt" | "hoodies" | "tracksuit" | "mesh-trucker-hat";

export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "men", label: "Men" },
  { slug: "women", label: "Women" },
  { slug: "kids", label: "Kids" },
];

export const SUBCATEGORIES: { slug: SubCategory; label: string }[] = [
  { slug: "jean", label: "Jean" },
  { slug: "t-shirt", label: "T-Shirt" },
  { slug: "joggers", label: "Joggers" },
  { slug: "polo", label: "Polo" },
  { slug: "shirt", label: "Shirt" },
  { slug: "tracksuit", label: "Track suites" },
  { slug: "hoodies", label: "Hoodies" },
  { slug: "mesh-trucker-hat", label: "Mesh Trucker Hat" },
];

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
  { id: "utility-jacket", name: "Utility Jacket", price: 350, category: "men", sub: "shirt", colors: ["#8b6f47", "#2b2b2b", "#5c4a3a"], images: [img("photo-1591047139829-d91aecb6caea"), img("photo-1516257984-b1b4d707412e")], rating: 4.7, reviewCount: 128, description: "Structured cotton-blend utility jacket with a relaxed drop shoulder and reinforced chest pockets. A refined take on workwear built for daily rotation.", badge: "New" },
  { id: "miracle-shirt", name: "Miracle Air Shirt Jacket", price: 100, category: "men", sub: "shirt", colors: ["#1a1a1a", "#4a5f7a", "#e8ddc0"], images: [img("photo-1602810318383-e386cc2a3ccf"), img("photo-1489987707025-afc232f7ea0f")], rating: 4.5, reviewCount: 96, description: "Featherweight overshirt cut from breathable cotton twill. Wear open over a tee or buttoned up as a lightweight jacket.", badge: "Best Seller" },
  { id: "tailored-rilex", name: "Tailored Rilex Jacket", price: 275, category: "men", sub: "shirt", colors: ["#3a3a3a", "#c7b299", "#5a5a5a", "#1a1a1a"], images: [img("photo-1620799140408-edc6dcb6d633"), img("photo-1552374196-c4e7ffc6e126")], rating: 4.8, reviewCount: 210, description: "Softly tailored blazer in a lightly textured wool blend. Half-lined for movement, with mother-of-pearl buttons." },
  { id: "silhouette-puffer", name: "Silhouette Puffer Jacket", price: 250, category: "women", sub: "hoodies", colors: ["#0a0a0a", "#8b7355"], images: [img("photo-1548126032-079a0fb0099d"), img("photo-1611652022419-a9419f74343d")], rating: 4.9, reviewCount: 341, description: "Signature down puffer with a sculpted shoulder line and matte satin shell. Sub-zero warmth, editorial silhouette.", badge: "Best Seller" },
  { id: "crystal-midi", name: "Crystal Midi Dress", price: 175, category: "women", sub: "shirt", colors: ["#0a0a0a", "#3a3a3a"], images: [img("photo-1595777457583-95e059d581b8"), img("photo-1583496661160-fb5886a13d44")], rating: 4.6, reviewCount: 174, description: "Bias-cut satin midi with a fluid drape and delicate crystal-tipped straps.", badge: "New" },
  { id: "alia-boots", name: "Alia Ankle Boots", price: 1200, category: "women", sub: "mesh-trucker-hat", colors: ["#0a0a0a", "#5a2a1a"], images: [img("photo-1608256246200-53e635b5b65f"), img("photo-1520639888713-7851133b1ed0")], rating: 4.9, reviewCount: 88, description: "Handcrafted Italian leather ankle boots with a stacked block heel and pull-tab detail." },
  { id: "wide-leg-jean", name: "Wide Leg Jean", price: 180, category: "women", sub: "jean", colors: ["#3a4a6a", "#1a1a2a", "#e8e0d0"], images: [img("photo-1541099649105-f69ad21f3246"), img("photo-1584370848010-d7fe6bc767ec")], rating: 4.5, reviewCount: 202, description: "High-rise wide-leg jeans in rigid Japanese denim with a clean hem." },
  { id: "raw-selvedge", name: "Raw Selvedge Jean", price: 220, category: "men", sub: "jean", colors: ["#1e2a44", "#0a0a0a"], images: [img("photo-1542272604-787c3835535d"), img("photo-1475178626620-a4d074967452")], rating: 4.7, reviewCount: 156, description: "14oz raw selvedge denim, straight leg. Built to break in and outlast trends." },
  { id: "kids-classic-tee", name: "Classic Kids Tee", price: 35, category: "kids", sub: "t-shirt", colors: ["#ffffff", "#0a0a0a", "#c44"], images: [img("photo-1503944583220-79d8926ad5e2"), img("photo-1519689680058-324335c77eba")], rating: 4.8, reviewCount: 64, description: "Soft combed cotton tee, cut a little longer for growing kids." },
  { id: "kids-joggers", name: "Everyday Kids Joggers", price: 55, category: "kids", sub: "joggers", colors: ["#3a3a3a", "#8a8a8a", "#1a1a1a"], images: [img("photo-1519238263530-99bdd11df2ea"), img("photo-1519741497674-611481863552")], rating: 4.6, reviewCount: 42, description: "Brushed fleece joggers with a soft elastic waist and roomy pockets." },
  { id: "polo-classic", name: "Classic Piqué Polo", price: 85, category: "men", sub: "polo", colors: ["#ffffff", "#0a0a0a", "#3a4a6a", "#7a8a5a"], images: [img("photo-1586790170083-2f9ceadc732d"), img("photo-1618354691373-d851c5c3a990")], rating: 4.7, reviewCount: 289, description: "The essential piqué polo in pima cotton with a soft, structured collar." },
  { id: "linen-shirt", name: "Linen Camp Shirt", price: 120, category: "men", sub: "shirt", colors: ["#e8ddc0", "#ffffff", "#3a3a3a"], images: [img("photo-1596755094514-f87e34085b2c"), img("photo-1603252109303-2751441dd157")], rating: 4.6, reviewCount: 118, description: "Airy Belgian linen camp shirt with a relaxed cut and open collar." },
  { id: "silk-blouse", name: "Silk Bias Blouse", price: 195, category: "women", sub: "shirt", colors: ["#f5e6d0", "#0a0a0a", "#3a3a3a"], images: [img("photo-1551803091-e20673f15770"), img("photo-1490481651871-ab68de25d43d")], rating: 4.8, reviewCount: 76, description: "Fluid silk blouse cut on the bias for a subtle, sculptural drape." },
  { id: "women-joggers", name: "Cashmere Track Joggers", price: 320, category: "women", sub: "joggers", colors: ["#2a2a2a", "#a89a80", "#0a0a0a"], images: [img("photo-1594633312681-425c7b97ccd1"), img("photo-1483985988355-763728e1935b")], rating: 4.9, reviewCount: 51, description: "Blended cashmere jogger with a knit waistband and tapered leg." },
  { id: "leather-tote", name: "Structured Leather Tote", price: 495, category: "women", sub: "mesh-trucker-hat", colors: ["#1a1a1a", "#8b6f47"], images: [img("photo-1584917865442-de89df76afd3"), img("photo-1509038311940-c8b1cb4bb52d")], rating: 4.8, reviewCount: 133, description: "Full-grain leather tote with hand-burnished edges and suede-lined interior." },
  { id: "wool-scarf", name: "Merino Wool Scarf", price: 95, category: "men", sub: "mesh-trucker-hat", colors: ["#3a3a3a", "#8a8a8a", "#c7b299"], images: [img("photo-1520903920243-00d872a2d1c9"), img("photo-1601924994987-69e26d50dc26")], rating: 4.7, reviewCount: 87, description: "Featherweight Italian merino scarf with a subtle fringe finish." },
  { id: "kids-jean", name: "Everyday Kids Jean", price: 60, category: "kids", sub: "jean", colors: ["#2a3a5a", "#1a1a1a"], images: [img("photo-1622290291468-a28f7a7dc6a8"), img("photo-1519554240892-5b53d5a08a01")], rating: 4.5, reviewCount: 38, description: "Slim, comfortable stretch denim built for real play." },
  { id: "kids-polo", name: "Kids Piqué Polo", price: 45, category: "kids", sub: "polo", colors: ["#ffffff", "#0a0a0a", "#7a8a5a"], images: [img("photo-1519345182560-3f2917c472ef"), img("photo-1596727147705-61a532a659bd")], rating: 4.6, reviewCount: 29, description: "The classic polo, sized for kids in soft pima cotton." },
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