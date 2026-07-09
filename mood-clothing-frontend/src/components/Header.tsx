import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X, Heart } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CATEGORIES, SUBCATEGORIES, PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { cn } from "@/lib/utils";
import Logo from "../../public/images/logo.svg";

export function Header() {
  const { openSearch, openCart, openLogin, cartCount, user, wishlist, PRODUCTS: liveProducts, isLoading } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync mounting flag on component load to ensure perfect SSR/Client layout balancing
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // FIXED COUNT VISIBILITY MATRIX: Sanitizes stored local IDs against valid live catalog items dynamically
  const verifiedWishlistCount = useMemo(() => {
    if (!wishlist || wishlist.length === 0) return 0;
    const combinedInventory = [...(liveProducts || []), ...STATIC_PRODUCTS];
    
    // Only count local storage IDs that actually exist inside our active collections
    const activeValidItems = wishlist.filter((id) => 
      combinedInventory.some((p) => p.id === id || p._id === id || p.databaseId === id)
    );
    
    return activeValidItems.length;
  }, [wishlist, liveProducts]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur hairline-b">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:px-8 lg:py-1">
          <div className="flex items-center gap-6">
            <button
              className="grid h-10 w-10 place-items-center md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="hidden items-center gap-6 text-sm uppercase tracking-widest md:flex">
              <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "font-medium" }}>
                Home
              </Link>
              {CATEGORIES.map((c) => (
                <div key={c.slug} className="group relative">
                  <Link
                    to="/shop/$gender"
                    params={{ gender: c.slug }}
                    className="inline-flex items-center py-2"
                  >
                    {c.label}
                  </Link>
                  <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 min-w-[200px] -translate-x-1/2 border border-hairline bg-background p-2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                    {SUBCATEGORIES.map((s) => (
                      <Link
                        key={s.slug}
                        to="/shop/$gender/$sub"
                        params={{ gender: c.slug, sub: s.slug }}
                        className="block px-4 py-2 text-sm uppercase tracking-widest hover:bg-secondary"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link to="/custom-design" className="hover:opacity-70">Custom</Link>
            </nav>
          </div>
          <Link to="/" className="justify-self-center font-display text-2xl tracking-[0.2em] md:text-3xl">
            <img src="/images/MOOD CLOTH.png" alt="Mood Clothing" className="h-10 w-30 md:h-11" />
          </Link>
          <div className="flex items-center gap-2">
            <button aria-label="Search" onClick={openSearch} className="grid h-10 w-6 place-items-center hover:bg-secondary">
              <Search className="h-5 w-5" />
            </button>
            <Link 
                to="/wishlist" 
                aria-label="Wishlist" 
                className="hidden md:grid relative h-10 w-10 place-items-center hover:bg-secondary"
              >
                <Heart className="h-5 w-5" />
                {/* FIXED: Swapped raw wishlist.length with sanitized verifiedWishlistCount parameters */}
                {mounted && !isLoading && verifiedWishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background tabular-nums">
                    {verifiedWishlistCount}
                  </span>
                )}
            </Link>
            <button aria-label={user ? user.name : "Account"} onClick={openLogin} className="grid h-10 w-6 place-items-center hover:bg-secondary">
              <User className="h-5 w-5" />
            </button>
            <button aria-label="Cart" onClick={openCart} className="relative grid h-10 w-6 place-items-center hover:bg-secondary">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-foreground/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ willChange: "transform" }}
        >
          <div className="flex items-center justify-between p-4 hairline-b">
            <span className="font-display text-xl tracking-[0.2em]">MOOD CLOTHINGS</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="h-6 w-6" /></button>
          </div>
          <nav className="p-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block py-3.5 text-base uppercase tracking-widest hairline-b">Home</Link>
            {CATEGORIES.map((c) => (
              <details key={c.slug} className="group hairline-b">
                <summary className="flex cursor-pointer items-center justify-between py-3.5 text-base uppercase tracking-widest">
                  {c.label}
                  <span className="text-sm">+</span>
                </summary>
                <div className="pb-3 pl-3">
                  {SUBCATEGORIES.map((s) => (
                    <Link
                      key={s.slug}
                      to="/shop/$gender/$sub"
                      params={{ gender: c.slug, sub: s.slug }}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 text-sm uppercase tracking-widest text-muted-foreground"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link to="/custom-design" onClick={() => setMobileOpen(false)} className="block py-3.5 text-base uppercase tracking-widest hairline-b">Custom Design</Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-3.5 text-base uppercase tracking-widest hairline-b">Wishlist</Link>
            
            <Link to="/about" onClick={() => setMobileOpen(false)} className="block py-3.5 text-base uppercase tracking-widest hairline-b text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-3.5 text-base uppercase tracking-widest hairline-b text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/help" onClick={() => setMobileOpen(false)} className="block py-3.5 text-base uppercase tracking-widest hairline-b text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
            <Link to="/faq" onClick={() => setMobileOpen(false)} className="block py-3.5 text-base uppercase tracking-widest hairline-b text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}