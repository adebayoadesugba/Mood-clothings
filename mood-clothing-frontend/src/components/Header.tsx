import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/products";
import { cn } from "@/lib/utils";
import Logo from "../../public/images/logo.svg";

export function Header() {
  const { openSearch, openCart, openLogin, cartCount, user, wishlist } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur hairline-b">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2 md:px-8">
          <div className="flex items-center gap-6">
            <button
              className="grid h-9 w-9 place-items-center md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="hidden items-center gap-6 text-xs uppercase tracking-widest md:flex">
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
                  <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 min-w-[180px] -translate-x-1/2 border border-hairline bg-background p-2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                    {SUBCATEGORIES.map((s) => (
                      <Link
                        key={s.slug}
                        to="/shop/$gender/$sub"
                        params={{ gender: c.slug, sub: s.slug }}
                        className="block px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-secondary"
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
            <img src="images/MOOD CLOTH.png" alt="Mood Clothing" className="h-10 w-30 md:h-10" />
          </Link>
          <div className="flex items-center gap-1">
            <button aria-label="Search" onClick={openSearch} className="grid h-9 w-5 place-items-center hover:bg-secondary">
              <Search className="h-4 w-4" />
            </button>
            <Link 
                to="/wishlist" 
                aria-label="Wishlist" 
                className="hidden md:grid relative h-9 w-9 place-items-center hover:bg-secondary"
              >
                <Heart className="h-4 w-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] text-background tabular-nums">
                    {wishlist.length}
                  </span>
                )}
        </Link>
            <button aria-label={user ? user.name : "Account"} onClick={openLogin} className="grid h-9 w-5 place-items-center hover:bg-secondary">
              <User className="h-4 w-4" />
            </button>
            <button aria-label="Cart" onClick={openCart} className="relative grid h-9 w-5 place-items-center hover:bg-secondary">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] text-background tabular-nums">
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
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
          </div>
          <nav className="p-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block py-3 text-sm uppercase tracking-widest hairline-b">Home</Link>
            {CATEGORIES.map((c) => (
              <details key={c.slug} className="group hairline-b">
                <summary className="flex cursor-pointer items-center justify-between py-3 text-sm uppercase tracking-widest">
                  {c.label}
                  <span className="text-xs">+</span>
                </summary>
                <div className="pb-3 pl-3">
                  {SUBCATEGORIES.map((s) => (
                    <Link
                      key={s.slug}
                      to="/shop/$gender/$sub"
                      params={{ gender: c.slug, sub: s.slug }}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2 text-xs uppercase tracking-widest text-muted-foreground"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link to="/custom-design" onClick={() => setMobileOpen(false)} className="block py-3 text-sm uppercase tracking-widest hairline-b">Custom Design</Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-3 text-sm uppercase tracking-widest hairline-b">Wishlist</Link>
            
            {/* MOBILE ONLY LINK ADDITIONS */}
            <Link to="/about" onClick={() => setMobileOpen(false)} className="block py-3 text-sm uppercase tracking-widest hairline-b text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-3 text-sm uppercase tracking-widest hairline-b text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/help" onClick={() => setMobileOpen(false)} className="block py-3 text-sm uppercase tracking-widest hairline-b text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
            <Link to="/faq" onClick={() => setMobileOpen(false)} className="block py-3 text-sm uppercase tracking-widest hairline-b text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}