import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES, getSubcategoriesFor, type Category, type SubCategory } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useMemo } from "react";
import { SkeletonProductCard } from "@/components/SkeletonProductCard";

export const Route = createFileRoute("/shop/$gender/$sub")({
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.gender)} — ${cap(params.sub)} — Mood Clothings` },
      { name: "description", content: `${cap(params.gender)} ${params.sub} at Mood Clothings.` },
    ],
  }),
  loader: ({ params }) => {
    if (!CATEGORIES.some((c) => c.slug === params.gender)) throw notFound();
    // Checks the actual gender+subcategory PAIRING, not just that each exists independently.
    const validSubs = getSubcategoriesFor(params.gender as Category);
    if (!validSubs.some((s) => s.slug === params.sub)) throw notFound();
    return {};
  },
  component: ShopSub,
});

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function ShopSub() {
  const { gender, sub } = Route.useParams();
  
  // Grab live database products right from global context, plus loading state
  const { PRODUCTS: liveRegistry, isLoading } = useStore();

  // Combine and filter dynamically by both gender category and item subcategory
  const products = useMemo(() => {
    const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
    return allInventory.filter((p) => {
      const productCat = p.category?.toLowerCase() || "";
      const filterCat = gender?.toLowerCase() || "";
      const productSub = p.sub?.toLowerCase() || "";
      const filterSub = sub?.toLowerCase() || "";

      return productCat === filterCat && (
        productSub === filterSub || 
        productSub.startsWith(filterSub) || 
        filterSub.startsWith(productSub)
      );
    });
  }, [gender, sub, liveRegistry]);

  return (
    <>
      {/* Header renders immediately regardless of product-fetch state — no reason to
          block the title/breadcrumb area behind a network round-trip. */}
      <div className="mt-6 flex items-end justify-between">
        <h1 className="font-display text-4xl md:text-5xl">{cap(gender)} · {cap(sub)}</h1>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {isLoading ? "…" : `${products.length} items`}
        </span>
      </div>

      {/* FIXED: skeleton shimmer cards while loading instead of nothing/blank —
          swaps to real ProductCards the moment data arrives. */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={`skeleton-${i}`} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
        {!isLoading && products.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Nothing here yet — check back soon.</p>
        )}
      </div>
    </>
  );
}