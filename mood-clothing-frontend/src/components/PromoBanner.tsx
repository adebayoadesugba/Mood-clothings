import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

// PROMO BANNER TEXT/LINK — edit any time, nothing else needs to change.
const PROMO_TEXT = "Limited time: free shipping on every order this week.";
const PROMO_LINK = "/collection";
const PROMO_LINK_LABEL = "Shop Now";

const SESSION_FLAG = "mood-clothings-promo-shown";
const SHOW_DELAY_MS = 12000;

export function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_FLAG)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(SESSION_FLAG, "1");
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[70] mx-auto flex max-w-sm items-center justify-between gap-3 border border-hairline bg-background p-4 shadow-lg md:left-auto md:right-6 md:bottom-6"
      style={{ animation: "slide-up-in 300ms ease-out" }}
    >
      <div className="min-w-0">
        <p className="text-sm leading-snug text-foreground">{PROMO_TEXT}</p>
        <Link
          to={PROMO_LINK}
          onClick={() => setVisible(false)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest underline underline-offset-2 hover:opacity-70"
        >
          {PROMO_LINK_LABEL} <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
