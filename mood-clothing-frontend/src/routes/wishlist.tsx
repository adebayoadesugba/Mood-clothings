import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { findProduct } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Glamora" }, { name: "description", content: "Your saved Glamora pieces." }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const items = wishlist.map(findProduct).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Wishlist" }]} />
      <h1 className="mt-6 font-display text-4xl md:text-5xl">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
          <Link to="/" className="mt-6 inline-block border border-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
