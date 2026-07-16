import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Play, ChevronLeft, ChevronRight, Truck, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES, SUBCATEGORIES, type Product } from "@/lib/products";
import { useStore } from "@/lib/store"; 
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Home,
});

// HERO VIDEO PLAYLIST: add, remove, or reorder video URLs here.
// They play in this exact order, then loop back to the first one automatically, forever.
const HERO_VIDEOS: string[] = [

  "https://res.cloudinary.com/gam6ajgd/video/upload/v1783625924/MOOD_ADS_yd3ebt.mp4",
  "https://res.cloudinary.com/gam6ajgd/video/upload/v1783802794/Mood_cap1_mcrasx.mp4",
  "https://res.cloudinary.com/gam6ajgd/video/upload/v1783623029/Change_call_now_to_SHOP_202607091944_dmexui.mp4",
];

// SHOP THE MOOD: curated captions layered over your existing subcategories/products —
// no new data model needed, just a different lens on the same catalog. Edit labels freely.
const MOOD_LABELS = ["Off-Duty Comfort", "Evening Edit", "Street Layers", "Weekend Essentials"];

// Formspree endpoint reused from the contact page, tagged so newsletter sign-ups from this
// inline section are identifiable in your inbox alongside contact messages.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgogvevn";

const FILTERS = ["All", "New Arrival", "Best Seller", "Recommendation"] as const;

function Home() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const carouselRef = useRef<HTMLDivElement>(null);

  // HERO VIDEO PLAYLIST STATE: tracks which video is currently playing, advances on end, loops forever
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  const handleHeroVideoEnded = () => {
    setHeroVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
  };

  // Ensures the new video source actually starts playing every time the index changes
  useEffect(() => {
    const videoEl = heroVideoRef.current;
    if (videoEl) {
      videoEl.load();
      videoEl.play().catch(() => {
        // Autoplay can be blocked by the browser in rare cases; fails silently and safely
      });
    }
  }, [heroVideoIndex]);
  
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
    
    // ENFORCES THE MAXIMUM LIMIT OF 18 ITEMS ONLY
    return list.slice(0, 18);
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

  // Generates an automated randomized array selection loop of exactly 12 items on fresh layout shifts
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
    
    return shufflableCopy.slice(0, 12); // Return exactly 12 random products for the showcase grid
  }, [combinedProducts]);

  // Inline newsletter section state (separate from the timed popup — this one is always
  // visible near the bottom of the page for anyone who dismissed the popup or scrolled past it)
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSending, setNewsletterSending] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterSending(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim(), form_type: "newsletter-signup-inline" }),
      });
      if (!res.ok) throw new Error("Failed to subscribe. Please try again.");
      toast.success("You're subscribed! Welcome to the list.");
      setNewsletterEmail("");
    } catch (err: any) {
      toast.error(err.message || "Unable to subscribe right now.");
    } finally {
      setNewsletterSending(false);
    }
  };

  // FIXED GLOBAL INTERCEPTOR SKELETON: Displays a geometric rolling spinner ring while network request handles fetch payloads
  if (isLoading) {
    return (
      <div className="min-h-[85vh] w-full grid place-items-center bg-background lg:min-h-[85vh] ">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-[3px] border-hairline border-t-foreground rounded-full animate-spin" />
          <p className="text-sm uppercase tracking-widest text-muted-foreground font-mono lg:text-lg">Welcome To Mood Clothings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-0 md:px-0">
      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-lg">
        {/* HERO VIDEO PLAYLIST: autoplays muted + inline (required for mobile autoplay), plays each
            video in HERO_VIDEOS in order, then advances to the next on end via onEnded, looping forever. */}
        <video
          ref={heroVideoRef}
          key={HERO_VIDEOS[heroVideoIndex]}
          className="h-[68vh] min-h-[420px] w-full object-cover md:h-[75vh]"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleHeroVideoEnded}
          aria-label="Mood Clothings promotional video"
        >
          <source src={HERO_VIDEOS[heroVideoIndex]} type="video/mp4" />
        </video>

        {/* DARK OVERLAY — tweak opacity/color here.
            Currently a flat dark tint over the whole hero. Adjust "bg-foreground/60" (e.g. /40, /70)
            to make it lighter or darker, or swap for a gradient like the old
            "bg-gradient-to-r from-foreground/50 via-foreground/20 to-transparent" if preferred. */}
        <div className="absolute inset-0 bg-foreground/10" />

        {/* CTA — centered at the bottom of the hero on all screen sizes, no text/heading above it */}
        <div className="px-2 absolute inset-x-0 bottom-6 flex justify-center px-4 md:bottom-10">
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 border border-background/60 bg-background/10 px-6 py-3 text-xs uppercase tracking-widest text-background backdrop-blur transition-transform hover:scale-[1.02]"
          >
            See Collection <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Intro line */}
      <section className="mx-auto max-w-3xl py-16 text-center text-lg leading-relaxed md:text-xl px-8">
        Find premium styles, Quality urban classic, luxury and comfortable fashion apparels.Get ready to look and feel amazing in every click with <span className="font-display italic">MOOD CLOTHINGS</span>.
      </section>

      {/* Featured products */}
      <section className="py-8">
        <div className="px-2 mb-6 flex flex-wrap items-end justify-between gap-4 md:px-8">
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
        <div className="px-2 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 md:px-8 lg:grid-cols-6">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="mt-10 text-center">
          <Link to="/new-arrivals" className="inline-flex items-center gap-2 border border-hairline px-6 py-3 text-[11px] uppercase tracking-widest hover:border-foreground">
            See More Products <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* BRAND STATEMENT — no products, just identity. This is the page's quiet, confident
          "thesis" moment: large editorial type, generous space, nothing competing for attention. */}
      <section className="px-4 py-20 text-center md:px-8 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">The Mood Clothings Ethos</p>
        <p className="mx-auto mt-6 max-w-3xl font-display text-3xl italic leading-snug md:text-5xl">
          Everyday dressing deserves the same intention as your best occasion wear
          considered fabric, honest fit, and pieces built to be worn, not just owned.
        </p>
      </section>

      {/* Editorial banner */}
      <section className="px-2 my-16 rounded-lg bg-secondary p-6 md:p-12 md:px-8">
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
          <Link to="/collection" className="inline-flex items-center gap-2 border border-foreground bg-background px-6 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background">
            See Our New Collection <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* SHOP THE MOOD — curated feeling-based tiles layered over your existing catalog data.
          Reuses the same lookup pattern as the category carousel below; no new product logic. */}
      <section className="px-2 py-12 md:px-8">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl">Shop The Mood</h2>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Curated by feeling, not just category</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {SUBCATEGORIES.slice(0, 4).map((s, i) => (
            <Link
              key={s.slug}
              to="/shop/$gender/$sub"
              params={{ gender: CATEGORIES[i % CATEGORIES.length].slug, sub: s.slug }}
              className="group relative block overflow-hidden rounded-md bg-secondary aspect-[3/4]"
            >
              <img
                src={combinedProducts.find((p) => p.sub === s.slug)?.images[0] ?? combinedProducts[0]?.images[0]}
                alt={MOOD_LABELS[i] ?? s.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-background">
                <p className="font-display text-lg italic md:text-xl">{MOOD_LABELS[i] ?? s.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories Carousel (Scaled to precisely match ProductCard ratios) */}
      <section className="px-2 py-12 relative md:px-8">
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
              className="group block overflow-hidden rounded-md bg-secondary snap-start flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(20%-18px)]"
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

      {/* TRUST BAR — quiet reassurance, static content, no data dependency */}
      <section className="border-y border-hairline px-2 py-10 md:px-8">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          <div className="flex flex-col items-center gap-2">
            <Truck className="h-5 w-5 text-foreground" />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Fast Delivery</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-foreground" />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">7-day easy returns</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-foreground" />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Secure checkout</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="h-5 w-5 text-foreground" />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">New arrivals weekly</p>
          </div>
        </div>
      </section>

      {/* DISCOVER MORE PIECES: Minimalist 8 Random product shuffle loop array showcase grid */}
      <section className="px-2 py-16 border-t border-hairline md:px-8">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl">Discover More Pieces</h2>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Freshly rotated items from the atelier console</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
          {randomShowcaseProducts.map((p) => (
            <ProductCard key={p.id || p._id} product={p} />
          ))}
        </div>
      </section>

      {/* SECOND EDITORIAL MOMENT — mirrored layout (image left, text right) for visual rhythm,
          different image and destination from the first editorial banner above */}
      <section className="px-2 my-16 rounded-lg bg-secondary p-6 md:p-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="relative order-2 overflow-hidden rounded-md md:order-1">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop&auto=format&q=75"
              alt="Custom tailoring detail"
              loading="lazy"
              className="h-72 w-full object-cover md:h-96"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-display text-3xl md:text-5xl">Design something entirely your own</h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              From fabric to fit, our custom design service brings your vision to life
              tailored to you, made to last.
            </p>
            <Link
              to="/custom-design"
              className="mt-6 inline-flex items-center gap-2 border border-foreground bg-background px-6 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background"
            >
              Start Your Design <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* INLINE NEWSLETTER — always-available signup for anyone who scrolled past or dismissed
          the timed popup. Full-width dark band gives the page a strong closing note. */}
      <section className="mx-2 mb-16 rounded-lg bg-foreground px-6 py-14 text-center text-background md:mx-8 md:px-12">
        <p className="text-[11px] uppercase tracking-[0.25em] opacity-70">Stay In The Loop</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">Join the Mood Clothings list</h2>
        <p className="mx-auto mt-3 max-w-md text-sm opacity-80">
          New arrivals, early access, and offers — straight to your inbox.
        </p>
        <form onSubmit={handleNewsletterSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            required
            type="email"
            placeholder="Email address"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            className="w-full border border-background/30 bg-transparent px-4 py-3 text-sm text-background placeholder:text-background/60 outline-none focus:border-background"
          />
          <button
            type="submit"
            disabled={newsletterSending}
            className="shrink-0 bg-background px-6 py-3 text-xs uppercase tracking-widest text-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {newsletterSending ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </section>

      <RecentlyViewed />
    </div>
  );
}