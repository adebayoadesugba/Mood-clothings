import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { byCategory, CATEGORIES, SUBCATEGORIES, type Category } from "@/lib/products";

export const Route = createFileRoute("/shop/$gender")({
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.gender)} — Glamora` },
      { name: "description", content: `Shop the latest ${params.gender} collection from Glamora — jeans, tops, joggers, polos, shirts, and accessories.` },
      { property: "og:title", content: `${cap(params.gender)} — Glamora` },
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
  const products = byCategory(cat);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: cap(gender) }]} />
      <div className="mt-6 flex items-end justify-between">
        <h1 className="font-display text-4xl md:text-5xl">{cap(gender)}</h1>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{products.length} items</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {SUBCATEGORIES.map((s) => (
          <Link
            key={s.slug}
            to="/shop/$gender/$sub"
            params={{ gender, sub: s.slug }}
            className="border border-hairline px-4 py-2 text-[11px] uppercase tracking-widest hover:border-foreground"
          >
            {s.label}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
        {products.length === 0 && <p className="col-span-full text-sm text-muted-foreground">No products in this collection yet.</p>}
      </div>
      <RecentlyViewed />
    </div>
  );
}
