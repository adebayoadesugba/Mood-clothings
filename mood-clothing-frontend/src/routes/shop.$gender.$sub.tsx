import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { bySub, CATEGORIES, SUBCATEGORIES, type Category, type SubCategory } from "@/lib/products";

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
  const products = bySub(gender as Category, sub as SubCategory);
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: cap(gender), to: "/shop/$gender", params: { gender } },
          { label: cap(sub) },
        ]}
      />
      <div className="mt-6 flex items-end justify-between">
        <h1 className="font-display text-4xl md:text-5xl">{cap(gender)} · {cap(sub)}</h1>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{products.length} items</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/shop/$gender"
          params={{ gender }}
          className="border border-hairline px-4 py-2 text-[11px] uppercase tracking-widest hover:border-foreground"
        >
          All
        </Link>
        {SUBCATEGORIES.map((s) => {
          const active = s.slug === sub;
          return (
            <Link
              key={s.slug}
              to="/shop/$gender/$sub"
              params={{ gender, sub: s.slug }}
              aria-current={active ? "page" : undefined}
              className={`border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${active ? "border-foreground bg-foreground text-background" : "border-hairline hover:border-foreground"}`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
        {products.length === 0 && <p className="col-span-full text-sm text-muted-foreground">Nothing here yet — check back soon.</p>}
      </div>
      <RecentlyViewed />
    </div>
  );
}