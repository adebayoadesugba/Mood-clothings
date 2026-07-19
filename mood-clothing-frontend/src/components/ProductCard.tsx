import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const wished = wishlist.includes(product.id);

  // Formats currency parameters cleanly to Naira with thousands grouping commas
  const formatNaira = (amount: number) => {
    return "₦" + Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Second image (if the product has one) swaps in on hover — a common, expected motion
  // cue on fashion sites that gives a quick second look without leaving the grid.
  const hasSecondImage = product.images.length > 1;

  return (
    // Added an ultra-thin border frame, discrete rounded corners, and padding layout values
    <div className="group card-lift border border-hairline/60 rounded-lg p-2 bg-background">
      <div className="relative overflow-hidden bg-secondary rounded-sm">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          aria-label={product.name}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={cn(
              "product-img transition-opacity duration-500",
              hasSecondImage && "group-hover:opacity-0"
            )}
          />
          {hasSecondImage && (
            <img
              src={product.images[1]}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="product-img absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 bg-background/90 px-2 py-1 text-[11px] uppercase tracking-widest text-foreground border border-hairline">
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/95 transition-transform hover:scale-110"
        >
          <Heart className={cn("h-4 w-4", wished && "fill-foreground")} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); addToCart(product.id, product.colors[0]); }}
          aria-label="Add to cart"
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-foreground text-background opacity-100 transition-all duration-300 hover:scale-110 md:opacity-0 md:group-hover:opacity-100"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4  items-start justify-between gap-3 px-1 pb-1">
        <div className="min-w-0">
          {/* Scaled text typography layout from text-xs to text-sm */}
          <Link to="/product/$id" params={{ id: product.id }} className="block truncate text-sm font-normal capitalize -tracking-normal text-foreground/90 lg:text-lg">
            {product.name}
          </Link>
          <div className="mt-2 flex gap-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full border border-hairline" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        {/* Swapped currency token mapping and scaled metrics output layout weight metrics */}
        <div className="shrink-0 text-xs font-semibold tabular-nums text-foreground font-roboto lg:text-lg">
          {formatNaira(product.price)}
        </div>
      </div>
    </div>
  );
}