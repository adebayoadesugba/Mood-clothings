import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useStore();
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

  const results = useMemo(() => {
    if (!debounced) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(debounced) ||
        p.sub.includes(debounced) ||
        p.category.includes(debounced),
    ).slice(0, 8);
  }, [debounced]);

  if (!searchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md"
      style={{ animation: "overlay-fade 200ms ease-out" }}
      onClick={closeSearch}
    >
      <div
        className="mx-auto flex h-full max-w-[1200px] flex-col px-4 pt-8 md:px-8"
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
        <div className="mt-8 overflow-y-auto">
          {!debounced && (
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Try &quot;jacket&quot;, &quot;linen&quot;, &quot;boots&quot;
            </div>
          )}
          {debounced && results.length === 0 && (
            <div className="text-sm text-muted-foreground">No results for &quot;{query}&quot;.</div>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$id"
                  params={{ id: p.id }}
                  onClick={closeSearch}
                  className="group block"
                >
                  <div className="overflow-hidden bg-secondary">
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="product-img transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs uppercase tracking-widest">{p.name}</span>
                    <span className="shrink-0 text-xs tabular-nums">${p.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
