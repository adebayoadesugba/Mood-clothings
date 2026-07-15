import { useEffect, useState } from "react";

const CONSENT_KEY = "mood-clothings-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch { /* ignore private write issues */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[75] flex flex-col items-center gap-3 border-t border-hairline bg-background p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:flex-row md:justify-between md:px-8"
      style={{ animation: "slide-up-in 300ms ease-out" }}
    >
      <p className="text-center text-xs text-muted-foreground md:text-left">
        We use cookies to keep your cart, wishlist, and sign-in working smoothly across the site.
      </p>
      <div className="flex shrink-0 gap-3">
        <button
          onClick={accept}
          className="bg-foreground px-6 py-2.5 text-[11px] uppercase tracking-widest text-background transition-transform hover:scale-[1.02]"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
