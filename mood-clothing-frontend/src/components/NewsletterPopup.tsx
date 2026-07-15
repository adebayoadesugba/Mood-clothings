import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

// Reuses the same Formspree endpoint as the contact page. Submissions include a hidden
// "form_type" field so you can tell newsletter signups apart from contact messages in your inbox.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgogvevn";
const SESSION_FLAG = "mood-clothings-newsletter-shown";
const SHOW_DELAY_MS = 6000;

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_FLAG)) return; // already shown this session

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(SESSION_FLAG, "1");
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const close = () => setVisible(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), form_type: "newsletter-signup" }),
      });

      if (!res.ok) throw new Error("Failed to subscribe. Please try again.");

      setSubmitted(true);
      toast.success("You're subscribed! Welcome to the list.");
      setTimeout(close, 2500);
    } catch (err: any) {
      toast.error(err.message || "Unable to subscribe right now.");
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-foreground/40 p-4"
      style={{ animation: "overlay-fade 200ms ease-out" }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-background p-8 text-center"
        style={{ animation: "slide-up-in 300ms ease-out" }}
      >
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4">
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-6">
            <p className="font-display text-2xl">Welcome to the list.</p>
            <p className="mt-2 text-sm text-muted-foreground">Watch your inbox for new arrivals and offers.</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Join the list</p>
            <h2 className="mt-2 font-display text-3xl">Get 10% off your first order</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign up for early access to new arrivals, edits, and offers.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                required
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-hairline bg-transparent py-2 text-center text-sm outline-none focus:border-foreground"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                {sending ? "Subscribing..." : "Subscribe"}
              </button>
              <button
                type="button"
                onClick={close}
                className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                No thanks
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
