import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS, CATEGORIES, SUBCATEGORIES } from "@/lib/products";

export const Route = createFileRoute("/")({
  component: Home,
});

const FILTERS = ["All", "New Arrival", "Best Seller", "Recommendation"] as const;

function Home() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const featured = useMemo(() => {
    let list = PRODUCTS;
    if (filter === "New Arrival") list = list.filter((p) => p.badge === "New");
    else if (filter === "Best Seller") list = list.filter((p) => p.badge === "Best Seller");
    else if (filter === "Recommendation") list = list.filter((p) => p.rating >= 4.7);
    return list.slice(0, 6);
  }, [filter]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-lg">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800&h=1000&fit=crop&auto=format&q=80"
          alt="Woman in tailored coat"
          className="h-[68vh] min-h-[420px] w-full object-cover md:h-[75vh]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/50 via-foreground/20 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6 md:items-center md:p-16">
          <div className="max-w-xl text-background">
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] opacity-80">Autumn / Winter Edit</p>
            <h1 className="font-display text-5xl leading-[1.05] md:text-7xl">
              Shaping a new era of style and sophistication
            </h1>
            <p className="mt-4 max-w-md text-sm opacity-90">
              Elevate your wardrobe and embrace your unique elegance with every click.
            </p>
            <Link
              to="/shop/$gender"
              params={{ gender: "women" }}
              className="mt-8 inline-flex items-center gap-2 border border-background/60 bg-background/10 px-6 py-3 text-xs uppercase tracking-widest backdrop-blur transition-transform hover:scale-[1.02]"
            >
              See Collection <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Intro line */}
      <section className="mx-auto max-w-3xl py-16 text-center text-lg leading-relaxed md:text-xl">
        Find the latest styles, classic favorites, and the modern, comfortable fashion.
        Get ready to look and feel amazing in every click with <span className="font-display italic">MOOD CLOTHINGS</span>.
      </section>

      {/* Featured products */}
      <section className="py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl md:text-4xl">Featured Product</h2>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                  filter === f
                    ? "border-foreground bg-foreground text-background"
                    : "border-hairline hover:border-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="mt-10 text-center">
          <Link to="/shop/$gender" params={{ gender: "women" }} className="inline-flex items-center gap-2 border border-hairline px-6 py-3 text-[11px] uppercase tracking-widest hover:border-foreground">
            See More Products <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Editorial banner */}
      <section className="my-16 rounded-lg bg-secondary p-6 md:p-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl">Elevate your style with our new collection</h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Get ready to look amazing with our latest fashion edit. Simple, affordable, and perfect for every occasion.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-md">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop&auto=format&q=75"
              alt="Editorial fashion"
              loading="lazy"
              className="h-72 w-full object-cover md:h-96"
            />
            <button aria-label="Play video" className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground transition-transform hover:scale-110">
              <Play className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/shop/$gender" params={{ gender: "women" }} className="inline-flex items-center gap-2 border border-foreground bg-background px-6 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background">
            See Our New Collection <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <h2 className="mb-8 text-center font-display text-3xl md:text-4xl">Top Fashion Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {SUBCATEGORIES.map((s, i) => (
            <Link
              key={s.slug}
              to="/shop/$gender/$sub"
              params={{ gender: CATEGORIES[i % CATEGORIES.length].slug, sub: s.slug }}
              className="group block overflow-hidden rounded-md bg-secondary"
            >
              <div className="overflow-hidden">
                <img
                  src={PRODUCTS.find((p) => p.sub === s.slug)?.images[0] ?? PRODUCTS[0].images[0]}
                  alt={s.label}
                  loading="lazy"
                  className="product-img transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 text-center text-[11px] uppercase tracking-widest">{s.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop the look */}
      <section className="py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
          <div className="overflow-hidden rounded-md bg-secondary">
            <img
              src="https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=900&h=1200&fit=crop&auto=format&q=75"
              alt="Shop the look"
              loading="lazy"
              className="h-full max-h-[720px] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl">Item in This Look</h2>
            <ul className="mt-6 divide-y divide-[color:var(--hairline)]">
              {PRODUCTS.filter((p) => ["silhouette-puffer", "crystal-midi", "alia-boots"].includes(p.id)).map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-4">
                  <Link to="/product/$id" params={{ id: p.id }}>
                    <img src={p.images[0]} alt={p.name} className="h-20 w-16 object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to="/product/$id" params={{ id: p.id }} className="block truncate text-xs uppercase tracking-widest">
                      {p.name}
                    </Link>
                    <div className="mt-1 text-sm tabular-nums">${p.price}</div>
                  </div>
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="shrink-0 border border-hairline px-4 py-2 text-[10px] uppercase tracking-widest hover:border-foreground"
                  >
                    Add to Cart
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <RecentlyViewed />
    </div>
  );
}
