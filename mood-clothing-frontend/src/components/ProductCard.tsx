import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const wished = wishlist.includes(product.id);

  return (
    <div className="group card-lift">
      <div className="relative overflow-hidden bg-secondary">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          aria-label={product.name}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="product-img transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 bg-background/95 px-2 py-1 text-[10px] uppercase tracking-widest">
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition-transform hover:scale-110"
        >
          <Heart className={cn("h-4 w-4", wished && "fill-foreground")} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); addToCart(product.id, product.colors[0]); }}
          aria-label="Add to cart"
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-foreground text-background opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to="/product/$id" params={{ id: product.id }} className="block truncate text-xs uppercase tracking-widest">
            {product.name}
          </Link>
          <div className="mt-2 flex gap-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full border border-hairline" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="shrink-0 text-sm tabular-nums">${product.price}</div>
      </div>
    </div>
  );
}
