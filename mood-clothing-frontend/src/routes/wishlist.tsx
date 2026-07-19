import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { useStore } from "@/lib/store";
import { SkeletonProductCard } from "@/components/SkeletonProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Mood Clothings" }, { name: "description", content: "Your saved Mood Clothings pieces." }] }),
  component: WishlistPage,
});

function WishlistPage() {
  // Grab your live global PRODUCTS database items context directly alongside your actions and isLoading status
  const { wishlist, user, openLogin, PRODUCTS: liveRegistry, isLoading } = useStore();

  // Sort from latest added to oldest added, map, and filter out duplicates
  const items = [...wishlist]
    .reverse()
    .map((id) => {
      const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
      return allInventory.find(
        (p) => p.id === id || p._id === id || p.databaseId === id
      );
    })
    .filter((p): p is NonNullable<typeof p> => !!p)
    .filter((product, index, self) => 
      index === self.findIndex((p) => p.id === product.id)
    );

  // FIXED: header/breadcrumbs now render immediately regardless of loading state.
  // Only the body (guest prompt vs. empty state vs. wishlist grid) waits on isLoading —
  // which is still necessary here specifically, since we genuinely don't know yet
  // whether to show "please sign in" or a real wishlist until session restoration
  // (part of isLoading) finishes. Showing skeleton cards during that wait feels far
  // less jarring than a full-page spinner, and is consistent with the rest of the site.
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Wishlist" }]} />
      <h1 className="mt-6 font-display text-4xl md:text-5xl">My Wishlist</h1>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonProductCard key={`skeleton-${i}`} />)}
        </div>
      ) : !user ? (
        /* Guest Authentication Screen */
        <div className="mt-16 text-center max-w-sm mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please log in or create an account to view and save your personal items to your wishlist.
          </p>
          <button
            onClick={openLogin}
            className="mt-6 inline-block w-full bg-foreground text-background py-3 text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]"
          >
            Sign In / Register
          </button>
        </div>
      ) : items.length === 0 ? (
        /* Authenticated but Empty State */
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
          <Link to="/" className="mt-6 inline-block border border-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background">
            Explore the collection
          </Link>
        </div>
      ) : (
        /* Authenticated Wishlist Grid View */
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
          {items.map((p, idx) => <ProductCard key={`${p.id}-${idx}`} product={p} />)}
        </div>
      )}
    </div>
  );
}