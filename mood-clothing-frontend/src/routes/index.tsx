import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES, SUBCATEGORIES, type Product } from "@/lib/products";
import { useStore } from "@/lib/store"; 

export const Route = createFileRoute("/")({
  component: Home,
});

const FILTERS = ["All", "New Arrival", "Best Seller", "Recommendation"] as const;

function Home() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Grab global synchronized tracking arrays and loader flags straight from your store context
  const { cart, recent, PRODUCTS: liveProducts, isLoading } = useStore(); 

  // Combine Mock Items and Database Items dynamically into one uniform array
  const combinedProducts = useMemo(() => {
    return [...(liveProducts || []), ...STATIC_PRODUCTS];
  }, [liveProducts]);

  // Unified Filter logic handles both static and database products seamlessly
  const featured = useMemo(() => {
    let list = combinedProducts;
    
    if (filter === "New Arrival") {
      list = list.filter((p: Product) => p.badge === "New" || p.badge === "New Arrival");
    } else if (filter === "Best Seller") {
      list = list.filter((p: Product) => p.badge === "Best Seller");
    } else if (filter === "Recommendation") {
      list = list.filter((p: Product) => p.rating >= 4.7);
    }
    
    // ENFORCES THE MAXIMUM LIMIT OF 12 ITEMS ONLY
    return list.slice(0, 12);
  }, [filter, combinedProducts]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth / 2;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Generates an automated randomized array selection loop of exactly 8 items on fresh layout shifts
  const randomShowcaseProducts = useMemo(() => {
    if (!combinedProducts || combinedProducts.length === 0) return [];
    const shufflableCopy = [...combinedProducts];
    
    // Perform standard linear collection deck shuffle
    for (let i = shufflableCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shufflableCopy[i];
      shufflableCopy[i] = shufflableCopy[j];
      shufflableCopy[j] = temp;
    }
    
    return shufflableCopy.slice(0, 8);
  }, [combinedProducts]);

  // FIXED GLOBAL INTERCEPTOR SKELETON: Displays a geometric rolling spinner ring while network request handles fetch payloads
  if (isLoading) {
    return (
      <div className="min-h-[85vh] w-full grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-[3px] border-hairline border-t-foreground rounded-full animate-spin" />
          <p className="text-lg uppercase tracking-widest text-muted-foreground font-mono">Welcome To Mood Clothings...</p>
        </div>
      </div>
    );
  }

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
              to="/"
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
        
        {/* Dynamic unified grid layout handles sorting and layouts cleanly */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="mt-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 border border-hairline px-6 py-3 text-[11px] uppercase tracking-widest hover:border-foreground">
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
          <Link to="/" className="inline-flex items-center gap-2 border border-foreground bg-background px-6 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background">
            See Our New Collection <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Categories Carousel (Scaled to precisely match ProductCard ratios) */}
      <section className="py-12 relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl">Top Fashion Category</h2>
          
          <div className="flex gap-2">
            <button 
              onClick={() => scroll("left")}
              className="grid h-10 w-10 place-items-center border border-hairline bg-background text-foreground transition-colors hover:border-foreground active:scale-95"
              aria-label="Previous Category"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="grid h-10 w-10 place-items-center border border-hairline bg-background text-foreground transition-colors hover:border-foreground active:scale-95"
              aria-label="Next Category"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div 
          ref={carouselRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {SUBCATEGORIES.map((s, i) => (
            <Link
              key={s.slug}
              to="/shop/$gender/$sub"
              params={{ gender: CATEGORIES[i % CATEGORIES.length].slug, sub: s.slug }}
              className="group block overflow-hidden rounded-md bg-secondary snap-start flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
            >
              <div className="overflow-hidden aspect-[3/4]">
                <img
                  src={combinedProducts.find((p) => p.sub === s.slug)?.images[0] ?? combinedProducts[0]?.images[0]}
                  alt={s.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
                />
              </div>
              <div className="p-3 text-center text-[11px] uppercase tracking-widest truncate">{s.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* DISCOVER MORE PIECES: Minimalist 8 Random product shuffle loop array showcase grid */}
      <section className="py-16 border-t border-hairline">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl">Discover More Pieces</h2>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Freshly rotated items from the atelier console</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {randomShowcaseProducts.map((p) => (
            <ProductCard key={p.id || p._id} product={p} />
          ))}
        </div>
      </section>

      <RecentlyViewed />
    </div>
  );
}