import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES, SUBCATEGORIES, type Product, type Category, type SubCategory } from "@/lib/products";
import { useStore } from "@/lib/store";
import { SkeletonProductCard } from "@/components/SkeletonProductCard";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "The Collection — Shop Every Style at Mood Clothings" },
      { name: "description", content: "Browse the full Mood Clothings collection new arrivals, best sellers, and timeless essentials across Men, Women, and Kids. Jeans, tops, joggers, polo, shirts, and accessories in one place." },
      { property: "og:title", content: "The Collection — Mood Clothings" },
      { property: "og:description", content: "Every Mood Clothings piece in one place new, best-selling, and classic." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/collection" },
    ],
    links: [
      { rel: "canonical", href: "/collection" },
      // Same LCP fix as New Arrivals: preload the first hero image directly.
      { rel: "preload", as: "image", href: "https://res.cloudinary.com/gam6ajgd/image/upload/f_auto,q_auto,w_1600/v1783593723/ngxiyhww6xnigtlmbiqb.jpg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "The Mood Clothings Collection",
          description: "Every Mood Clothings piece new arrivals, best sellers, and classics across Men, Women, and Kids.",
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

  // OPTIMIZED CLOUDINARY URLS: same f_auto/q_auto/w_1600 treatment as New Arrivals —
  // smaller, auto-formatted files instead of raw full-resolution uploads.
  const heroImages = [
    "https://res.cloudinary.com/gam6ajgd/image/upload/f_auto,q_auto,w_1600/v1783593723/ngxiyhww6xnigtlmbiqb.jpg",
    "https://res.cloudinary.com/gam6ajgd/image/upload/f_auto,q_auto,w_1600/v1783593510/lyswa7nkacegf649dvfp.jpg"
  ];

  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentImgIdx((prevIdx) => (prevIdx + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [heroImages.length]);

  const { PRODUCTS: liveRegistry, isLoading } = useStore();

  const items = useMemo(() => {
    const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
    let list = shuffle(allInventory);

    if (cat !== "all") {
      list = list.filter((p) => p.category?.toLowerCase() === cat.toLowerCase());
    }

    if (sub !== "all") {
      list = list.filter((p) => {
        const productSub = p.sub?.toLowerCase() || "";
        const filterSub = sub.toLowerCase();
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

  // FIXED: no more full-page spinner blocking the hero + filters behind the product
  // fetch — the page renders immediately, and only the grid shows skeletons while loading.
  return (
    <div className="w-full text-sm md:text-lg">
      {/* FIXED HERO: real <img> tags instead of CSS background-image divs — lets the
          browser discover, prioritize, and preload the first one properly. */}
      <section className="relative w-full h-[50vh] md:h-[75vh] overflow-hidden bg-foreground">
        {heroImages.map((src, idx) => {
          const isVisible = currentImgIdx === idx;
          return (
            <img
              key={src}
              src={src}
              alt="The Mood Clothings collection"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[1.01]"
              }`}
              style={{ willChange: "opacity, transform" }}
              loading={idx === 0 ? "eager" : "lazy"}
              fetchPriority={idx === 0 ? "high" : "auto"}
              decoding="async"
            />
          );
        })}
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h1 className="text-white font-display text-4xl sm:text-7xl lg:text-8xl font-black capitalize tracking-[0.12em] text-center select-none drop-shadow-2xl">
            Collection
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Collection" }]} />

        <header className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold">The Collection</h1>
            <p className="mt-3 max-w-xl text-xs md:text-sm text-muted-foreground">
              Every Mood Clothings piece in one place new arrivals, best sellers, and everyday classics across every category.
            </p>
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium font-mono">{items.length} items</span>
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

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonProductCard key={`skeleton-${i}`} />)
            : items.map((p) => <ProductCard key={p.id} product={p} />)}
          {!isLoading && items.length === 0 && (
            <p className="col-span-full text-xs md:text-sm text-muted-foreground">No items match those filters yet.</p>
          )}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link to="/new-arrivals" className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background font-medium hover:opacity-90 transition-opacity">
            View New Arrivals
          </Link>
          <Link to="/shop/$gender" params={{ gender: "women" }} className="border border-hairline px-6 py-3 text-[11px] uppercase tracking-widest hover:border-foreground transition-colors font-medium">
            Shop Women
          </Link>
          <Link to="/shop/men" className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background font-medium hover:opacity-90 transition-opacity">
            Shop Men
          </Link>

          <Link to="/shop/$gender" params={{ gender: "kids" }} className="border border-hairline px-6 py-3 text-[11px] uppercase tracking-widest hover:border-foreground transition-colors font-medium">
            Shop Kids
          </Link>
        </div>

        <RecentlyViewed />
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors font-medium ${
        active ? "border-foreground bg-foreground text-background" : "border-hairline hover:border-foreground"
      }`}
    >
      {children}
    </button>
  );
}