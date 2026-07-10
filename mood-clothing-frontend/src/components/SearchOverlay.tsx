import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { cn } from "@/lib/utils";

export function SearchOverlay() {
  // FIXED: Destructured PRODUCTS directly out of the dynamic global store context alongside your actions
  const { searchOpen, closeSearch, PRODUCTS: liveRegistry, wishlist, toggleWishlist } = useStore();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) { setQuery(""); setDebounced(""); return; }
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [query]);

  // Clean localized currency formatting generator mapping utility hook
  const formatNaira = (amount: number) => {
    return "₦" + Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const results = useMemo(() => {
    if (!debounced) return [];
    
    // COMBINED INVENTORY PIPELINE: Merges backend live products and static fallback entries safely
    const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];

    return allInventory.filter(
      (p) =>
        p.name?.toLowerCase().includes(debounced) ||
        p.sub?.toLowerCase().includes(debounced) ||
        p.category?.toLowerCase().includes(debounced),
    ).slice(0, 12); // Expanded pool margin boundaries slightly to nicely fill out a 6-column matrix layout row
  }, [debounced, liveRegistry]);

  if (!searchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md"
      style={{ animation: "overlay-fade 200ms ease-out" }}
      onClick={closeSearch}
    >
      <div
        className="mx-auto flex h-full max-w-[1440px] flex-col px-4 pt-8 md:px-8"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "overlay-slide 250ms ease-out" }}
      >
        <div className="flex items-center gap-3 hairline-b pb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for jackets, jeans, accessories…"
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground md:text-2xl"
          />
          <button onClick={closeSearch} aria-label="Close" className="grid h-9 w-9 place-items-center hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-8 overflow-y-auto pb-10">
          {!debounced && (
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Try &quot;jacket&quot;, &quot;linen&quot;, &quot;boots&quot;
            </div>
          )}
          {debounced && results.length === 0 && (
            <div className="text-sm text-muted-foreground">No results for &quot;{query}&quot;.</div>
          )}
          {results.length > 0 && (
            // FIXED GRID LAYOUT: Adjusted classes to match grid-cols-2 (mobile), grid-cols-4 (tablet), and grid-cols-6 (large screen viewport architectures)
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {results.map((p) => {
                const wished = wishlist.includes(p.id);
                return (
                  // FIXED: Added border, thin rounded frame layer, background panel card, and precise internal padding
                  <div key={p.id} className="group relative block border border-hairline/60 rounded-md p-2 bg-background shadow-2xs">
                    <Link
                      to="/product/$id"
                      params={{ id: p.id }}
                      onClick={closeSearch}
                      className="block"
                      aria-label={p.name}
                    >
                      {/* Rounded-sm inner image container asset clips cleanly */}
                      <div className="relative overflow-hidden bg-secondary rounded-sm">
                        <img src={p.images[0]} alt={p.name} loading="lazy" className="product-img transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    </Link>
                    
                    {/* FIXED WISHLIST ACCESS: Embedded localized standalone dynamic wish-toggle element panel overlay shortcut */}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }}
                      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                      className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/90 backdrop-blur shadow-sm transition-transform hover:scale-110"
                    >
                      <Heart className={cn("h-3.5 w-3.5 text-foreground transition-colors", wished && "fill-foreground")} />
                    </button>

                    <div className="mt-2.5 flex items-baseline justify-between gap-2 px-1 pb-0.5">
                      <span className="truncate text-xs uppercase tracking-widest text-foreground font-medium">{p.name}</span>
                      {/* Swapped token strings to output format mapping calculations with standard font mono alignments */}
                      <span className="shrink-0 text-xs tabular-nums font-mono font-semibold text-foreground">{formatNaira(p.price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}