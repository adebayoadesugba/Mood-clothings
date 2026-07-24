import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  // Destructure your synchronized PRODUCTS (the live backend items) right out of useStore
  const { cartOpen, closeCart, cart, cartTotal, setQty, removeFromCart, PRODUCTS: liveRegistry } = useStore();

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  // Clean formatting conversion mapping for local currency standards
  const formatNaira = (amount: number) => {
    return "₦" + Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const displayCart = cart || [];

// Items whose product no longer exists in the catalog (deleted/renamed in admin)
const staleCartItems = displayCart.filter((item) => {
  const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
  return !allInventory.some(
    (product) => product.id === item.id || product._id === item.id || product.databaseId === item.id
  );
});

  return (
    <div className={cn("fixed inset-0 z-50", cartOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!cartOpen}>
      <div
        onClick={closeCart}
        className={cn("absolute inset-0 bg-foreground/40 transition-opacity duration-300", cartOpen ? "opacity-100" : "opacity-0")}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background transition-transform duration-300",
          cartOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center justify-between p-5 hairline-b">
          <h3 className="text-sm uppercase tracking-widest">My Cart ({displayCart.length})</h3>
          {staleCartItems.length > 0 && (
  <div className="mx-5 mt-3 flex items-center justify-between gap-3 border border-hairline bg-secondary/50 p-3 text-xs text-muted-foreground">
    <span>{staleCartItems.length} item(s) in your cart are no longer available.</span>
    <button
      type="button"
      onClick={() => staleCartItems.forEach((item) => removeFromCart(item.id))}
      className="shrink-0 underline underline-offset-2 hover:text-foreground"
    >
      Remove
    </button>
  </div>
)}
          <button onClick={closeCart} aria-label="Close cart"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {displayCart.length === 0 ? (
            <div className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
              Your cart is empty.
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--hairline)]">
              {/* REVERSED ARRAY PIPELINE: Orders selections cleanly from newest to oldest added */}
              {[...displayCart].reverse().map((item, idx) => {
                // UNIFIED LOOKUP ENGINE: Checks both backend registry items and your static mock data
                const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
                const p = allInventory.find(
                  (product) => product.id === item.id || product._id === item.id || product.databaseId === item.id
                );
                
                // If it still can't find it anywhere, skip rendering to prevent crashing
                if (!p) return null;
                
                return (
                  <li key={`${item.id}-${item.color ?? ""}-${(item as any).size ?? ""}-${idx}`} className="flex gap-4 p-5">
                    <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518'} alt={p.name} className="h-24 w-20 object-cover bg-secondary" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm capitalize tracking-widest">{p.name}</div>
                          
                          <div className="mt-1 flex items-center flex-wrap gap-2 text-[11px] text-muted-foreground">
                            {item.color && (
                              <div className="flex items-center gap-1">
                                <span className="h-2.5 w-2.5 rounded-full border border-hairline" style={{ backgroundColor: item.color }} />
                                <span>Color</span>
                              </div>
                            )}
                            
                            {(item as any).size && (
                              <div className="flex items-center gap-1 before:content-['·'] before:text-muted-foreground/60">
                                <span className="text-[10px] tracking-normal capitalize bg-secondary px-1.5 py-0.5 font-medium text-foreground">
                                  Size: {(item as any).size}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Render localized product pricing vector calculations directly into output element */}
                        <div className="shrink-0 text-sm tabular-nums font-roboto">{formatNaira(p.price * item.qty)}</div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-hairline">
                          <button type="button" className="grid h-8 w-8 place-items-center" onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                          <span className="w-8 text-center text-xs tabular-nums font-roboto">{item.qty}</span>
                          <button type="button" className="grid h-8 w-8 place-items-center" onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button type="button" onClick={() => removeFromCart(item.id)} aria-label="Remove" className="text-muted-foreground hover:text-foreground">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {displayCart.length > 0 && (
          <div className="border-t border-hairline p-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="uppercase tracking-normal">Subtotal</span>
              {/* Localized cart total metrics parsing layout pipeline */}
              <span className="tabular-nums font-roboto">{formatNaira(cartTotal)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full bg-foreground py-3 text-center text-xs capitalize tracking-widest text-background transition-transform hover:scale-[1.01]"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}