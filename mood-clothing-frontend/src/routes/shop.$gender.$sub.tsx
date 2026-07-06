import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES, SUBCATEGORIES, type Category, type SubCategory } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useMemo } from "react";

export const Route = createFileRoute("/shop/$gender/$sub")({
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.gender)} — ${cap(params.sub)} — Mood Clothings` },
      { name: "description", content: `${cap(params.gender)} ${params.sub} at Mood Clothings.` },
    ],
  }),
  loader: ({ params }) => {
    if (!CATEGORIES.some((c) => c.slug === params.gender)) throw notFound();
    if (!SUBCATEGORIES.some((s) => s.slug === params.sub)) throw notFound();
    return {};
  },
  component: ShopSub,
});

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function ShopSub() {
  const { gender, sub } = Route.useParams();
  
  // Grab live database products right from global context
  const { PRODUCTS: liveRegistry } = useStore();

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
      {/* Head section titles are now gracefully kept in the layout shell */}
      <div className="mt-6 flex items-end justify-between">
        <h1 className="font-display text-4xl md:text-5xl">{cap(gender)} · {cap(sub)}</h1>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{products.length} items</span>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
        {products.length === 0 && <p className="col-span-full text-sm text-muted-foreground">Nothing here yet — check back soon.</p>}
      </div>
    </>
  );
}