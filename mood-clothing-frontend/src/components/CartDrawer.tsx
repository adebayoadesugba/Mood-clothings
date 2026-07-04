import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { findProduct } from "@/lib/products";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { cartOpen, closeCart, cart, cartTotal, setQty, removeFromCart } = useStore();

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  // SAFEGUARD: If someone manually cleared local caches during checkout checkout,
  // ensure this drawer layout handles the empty state seamlessly.
  const displayCart = cart || [];

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
          <button onClick={closeCart} aria-label="Close cart"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {displayCart.length === 0 ? (
            <div className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
              Your cart is empty.
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--hairline)]">
              {displayCart.map((item) => {
                const p = findProduct(item.id);
                if (!p) return null;
                return (
                  <li key={item.id + (item.color ?? "") + ((item as any).size ?? "")} className="flex gap-4 p-5">
                    <img src={p.images[0]} alt={p.name} className="h-24 w-20 object-cover" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs uppercase tracking-widest">{p.name}</div>
                          
                          {/* META PROPERTIES BLOCK - COLOR AND SIZE */}
                          <div className="mt-1 flex items-center flex-wrap gap-2 text-[11px] text-muted-foreground">
                            {item.color && (
                              <div className="flex items-center gap-1">
                                <span className="h-2.5 w-2.5 rounded-full border border-hairline" style={{ backgroundColor: item.color }} />
                                <span>Color</span>
                              </div>
                            )}
                            
                            {/* NEW: Size metadata chip label container block rendered cleanly inline */}
                           {/* NEW: Size layout updated with custom string concatenation */}
                            {(item as any).size && (
                              <div className="flex items-center gap-1 before:content-['·'] before:text-muted-foreground/60">
                                <span className="text-[10px] tracking-wider uppercase bg-secondary px-1.5 py-0.5 font-medium text-foreground">
                                  Size: {(item as any).size}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-sm tabular-nums">${p.price * item.qty}</div>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-hairline">
                          <button type="button" className="grid h-8 w-8 place-items-center" onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                          <span className="w-8 text-center text-xs tabular-nums">{item.qty}</span>
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
              <span className="uppercase tracking-widest">Subtotal</span>
              <span className="tabular-nums">${cartTotal}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full bg-foreground py-3 text-center text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01]"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}