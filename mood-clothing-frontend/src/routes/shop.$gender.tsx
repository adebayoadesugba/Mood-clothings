import { createFileRoute, Link, notFound, Outlet, useLocation } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES, getSubcategoriesFor, type Category } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useMemo } from "react";
import { SkeletonProductCard } from "@/components/SkeletonProductCard";

export const Route = createFileRoute("/shop/$gender")({
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.gender)} — Mood Clothings` },
      { name: "description", content: `Shop the latest ${params.gender} collection from Mood Clothings — jeans, polo tops, joggers, polo gowns, shirts, and accessories.` },
      { property: "og:title", content: `${cap(params.gender)} — Mood Clothings` },
    ],
  }),
  loader: ({ params }) => {
    if (!CATEGORIES.some((c) => c.slug === params.gender)) throw notFound();
    return {};
  },
  component: ShopGender,
});

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function ShopGender() {
  const { gender } = Route.useParams();
  const cat = gender as Category;
  const location = useLocation();
  
  // Grab live database products right from global context, plus loading state
  const { PRODUCTS: liveRegistry, isLoading } = useStore();

  // Combine and filter dynamically by gender category case-insensitively
  const products = useMemo(() => {
    const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
    return allInventory.filter((p) => p.category?.toLowerCase() === cat?.toLowerCase());
  }, [cat, liveRegistry]);

  // FIXED: Check if the user is looking at a child subcategory view (like /shop/men/jeans)
  const isSubcategoryRoute = location.pathname.split("/").length > 3;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: cap(gender) }]} />
      
      {/* FIXED: Only display parent header details if we are sitting directly on the parent "All" view */}
      {!isSubcategoryRoute ? (
        <div className="mt-6 flex items-end justify-between">
          <h1 className="font-display text-4xl md:text-5xl">{cap(gender)}</h1>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {isLoading ? "…" : `${products.length} items`}
          </span>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/shop/$gender"
          params={{ gender }}
          activeOptions={{ exact: true }}
          activeProps={{ className: "border-foreground bg-foreground text-background" }}
          inactiveProps={{ className: "border-hairline hover:border-foreground text-foreground bg-transparent" }}
          className="border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors"
        >
          All
        </Link>
        {/* FIXED: only shows subcategories actually valid for this gender, matching the
            same validation the shop.$gender.$sub route now enforces — previously this
            listed every subcategory regardless of gender, which could link to combos
            that would 404 (e.g. "Polo Gown" under Men). */}
        {getSubcategoriesFor(cat).map((s) => (
          <Link
            key={s.slug}
            to="/shop/$gender/$sub"
            from="/shop/$gender"
            params={{ sub: s.slug }}
            activeProps={{ className: "border-foreground bg-foreground text-background font-medium" }}
            inactiveProps={{ className: "border-hairline hover:border-foreground text-foreground bg-transparent" }}
            className="border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors"
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* FIXED: If a subcategory pill is active, render the Outlet shell to execute your subcategory filter page. */}
      {isSubcategoryRoute ? (
        <Outlet />
      ) : (
        /* Render the default parent catalog grid view only when sitting exactly on the "All" path.
           FIXED: skeleton shimmer cards while loading instead of nothing. */
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonProductCard key={`skeleton-${i}`} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
          {!isLoading && products.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No products in this collection yet.</p>
          )}
        </div>
      )}

      <RecentlyViewed />
    </div>
  );
}