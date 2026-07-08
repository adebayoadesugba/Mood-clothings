import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — The Latest 40 Drops at Glamora" },
      { name: "description", content: "The 40 newest pieces at Glamora, refreshed as new drops arrive. Shop just-landed jeans, tops, joggers, polos, shirts, and accessories before they're gone." },
      { property: "og:title", content: "New Arrivals — Glamora" },
      { property: "og:description", content: "The 40 newest Glamora drops — updated the moment new pieces land." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/new-arrivals" },
    ],
    links: [{ rel: "canonical", href: "/new-arrivals" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "New Arrivals — Glamora",
          description: "The 40 newest Glamora drops.",
          url: "/new-arrivals",
        }),
      },
    ],
  }),
  component: NewArrivalsPage,
});

const MAX = 40;

function NewArrivalsPage() {
  // Grab live database products right from global context along with loader flag
  const { PRODUCTS: liveRegistry, isLoading } = useStore();

  // Rank: pieces flagged "New" first, then everything else in catalog order.
  // Cap at 40 so older items are pushed out as new ones are added.
  const items = useMemo(() => {
    const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
    
    const withRank = allInventory.map((p, i) => ({
      p,
      rank: (p.badge === "New" ? 0 : 1) * 1000 + i,
    }));
    
    withRank.sort((a, b) => a.rank - b.rank);
    return withRank.slice(0, MAX).map((x) => x.p);
  }, [liveRegistry]);

  // Intercept view layer to display the spinning ring animation matching requested loader copy text
  if (isLoading) {
    return (
      <div className="min-h-[70vh] w-full grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-[3px] border-hairline border-t-foreground rounded-full animate-spin" />
          <p className="text-lg uppercase tracking-widest text-muted-foreground font-mono">new arrival loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "New Arrivals" }]} />

      <header className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Just Landed</p>
          <h1 className="mt-2 font-display text-4xl md:text-6xl">New Arrivals</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            The latest {MAX} pieces to hit the studio floor. This edit refreshes automatically — as new drops arrive, older ones make room.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Showing {items.length} of {MAX}
        </span>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
        {items.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">New pieces will appear here soon.</p>
        )}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link to="/collection" className="inline-flex items-center gap-2 border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">
          See the Full Collection <ArrowUpRight className="h-3 w-3" />
        </Link>
        <Link to="/custom-design" className="inline-flex items-center gap-2 border border-hairline px-6 py-3 text-[11px] uppercase tracking-widest hover:border-foreground">
          Design Something Custom
        </Link>
      </div>

      <RecentlyViewed />
    </div>
  );
}