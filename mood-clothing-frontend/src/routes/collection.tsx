import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES, SUBCATEGORIES, type Product, type Category, type SubCategory } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "The Collection — Shop Every Style at Glamora" },
      { name: "description", content: "Browse the full Glamora collection — new arrivals, best sellers, and timeless essentials across Men, Women, and Kids. Jeans, tops, joggers, polos, shirts, and accessories in one place." },
      { property: "og:title", content: "The Collection — Glamora" },
      { property: "og:description", content: "Every Glamora piece in one place — new, best-selling, and classic." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/collection" },
    ],
    links: [{ rel: "canonical", href: "/collection" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "The Glamora Collection",
          description: "Every Glamora piece — new arrivals, best sellers, and classics across Men, Women, and Kids.",
          url: "/collection",
        }),
      },
    ],
  }),
  component: CollectionPage,
});

// Deterministic shuffle so SSR + client match (no hydration mismatch).
function shuffle<T>(arr: T[], seed = 7): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Cat = Category | "all";
type Sub = SubCategory | "all";
type Tag = "all" | "new" | "best" | "recommended";

function CollectionPage() {
  const [cat, setCat] = useState<Cat>("all");
  const [sub, setSub] = useState<Sub>("all");
  const [tag, setTag] = useState<Tag>("all");

  // Grab live database products right from global context along with loader flag
  const { PRODUCTS: liveRegistry, isLoading } = useStore();

  const items = useMemo(() => {
    // COMBINED INVENTORY PIPELINE: Merges backend live products and static fallback entries safely
    const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
    let list = shuffle(allInventory);
    
    // Normalize string comparisons to prevent case mismatches from backend inputs
    if (cat !== "all") {
      list = list.filter((p) => p.category?.toLowerCase() === cat.toLowerCase());
    }
    
    if (sub !== "all") {
      list = list.filter((p) => {
        const productSub = p.sub?.toLowerCase() || "";
        const filterSub = sub.toLowerCase();
        
        // This handles cases where backend strings are singular/plural matches (e.g., "jean" vs "jeans")
        return productSub === filterSub || 
               productSub.startsWith(filterSub) || 
               filterSub.startsWith(productSub);
      });
    }
    
    if (tag === "new") {
      list = list.filter((p) => p.badge?.toLowerCase() === "new");
    } else if (tag === "best") {
      list = list.filter((p) => p.badge?.toLowerCase().includes("best"));
    } else if (tag === "recommended") {
      list = list.filter((p) => p.rating >= 4.7);
    }
    
    return list;
  }, [cat, sub, tag, liveRegistry]);

  // Intercept render cycle to show a spinning ring animation center-screen while fetching live products
  if (isLoading) {
    return (
      <div className="min-h-[70vh] w-full grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-[3px] border-hairline border-t-foreground rounded-full animate-spin" />
          <p className="text-lg uppercase tracking-widest text-muted-foreground font-mono">Loading Collection Drop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Collection" }]} />

      <header className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl md:text-6xl">The Collection</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Every Mood Clothings piece in one place — new arrivals, best sellers, and everyday classics across every category.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{items.length} items</span>
      </header>

      {/* Filters */}
      <div className="mt-8 space-y-3">
        <FilterRow label="Category">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>{c.label}</Chip>
          ))}
        </FilterRow>
        <FilterRow label="Type">
          <Chip active={sub === "all"} onClick={() => setSub("all")}>All</Chip>
          {SUBCATEGORIES.map((s) => (
            <Chip key={s.slug} active={sub === s.slug} onClick={() => setSub(s.slug)}>{s.label}</Chip>
          ))}
        </FilterRow>
        <FilterRow label="Tag">
          <Chip active={tag === "all"} onClick={() => setTag("all")}>All</Chip>
          <Chip active={tag === "new"} onClick={() => setTag("new")}>New Arrivals</Chip>
          <Chip active={tag === "best"} onClick={() => setTag("best")}>Best Sellers</Chip>
          <Chip active={tag === "recommended"} onClick={() => setTag("recommended")}>Recommended</Chip>
        </FilterRow>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
        {items.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No items match those filters yet.</p>
        )}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link to="/new-arrivals" className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">
          View New Arrivals
        </Link>
        <Link to="/shop/$gender" params={{ gender: "women" }} className="border border-hairline px-6 py-3 text-[11px] uppercase tracking-widest hover:border-foreground">
          Shop Women
        </Link>
      </div>

      <RecentlyViewed />
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
        active ? "border-foreground bg-foreground text-background" : "border-hairline hover:border-foreground"
      }`}
    >
      {children}
    </button>
  );
}