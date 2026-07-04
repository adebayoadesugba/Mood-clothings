import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { findProduct } from "@/lib/products";
import { useStore } from "@/lib/store";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Mood Clothings" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

function Checkout() {
  const store = useStore();
  const { cart, cartTotal, user, openLogin, clearCart, closeCart } = store;
  
  const [isOrdered, setIsOrdered] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [form, setForm] = useState({
    email: user?.email ?? "",
    name: user?.name ?? "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOrdered) {
      timer = setTimeout(() => {
        setShowContinueButton(true);
      }, 5000); // Changed back to 5000ms as per your original requirement
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOrdered]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Swap visual container presentation state instantly
    setIsOrdered(true);
    
    // 2. Clear out local state caching layers immediately matching your store's key
    localStorage.removeItem("moon clothings-store-v1");
    localStorage.removeItem("cart");
    localStorage.removeItem("mood clothings-cart");
    localStorage.removeItem("mood-cart");

    const storeKeys = Object.keys(localStorage);
    storeKeys.forEach((key) => {
      if (key.includes("store") || key.includes("cart") || key.includes("shop")) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || "{}");
          if (parsed?.state) {
            parsed.state.cart = [];
            parsed.state.cartTotal = 0;
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        } catch (err) {}
      }
    });

    // 3. Force-close the drawer and manually mutate global store arrays
    try {
      if (typeof closeCart === "function") closeCart();
      if (typeof clearCart === "function") clearCart();
    } catch (err) {
      console.warn("Global clean step fallback sequence activated");
    }
  };

  // Guard Check 1: Empty Cart View
  if (cart.length === 0 && !isOrdered) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Checkout" }]} />
        <h1 className="mt-6 font-display text-4xl md:text-5xl">Checkout</h1>
        <div className="mt-16 text-center">
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <button onClick={() => window.location.href = "/"} className="mt-6 inline-block border border-foreground px-6 py-3 text-xs uppercase tracking-widest">
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  // Guard Check 2: Login Guard Screen for Unauthenticated Users
  if (!user && !isOrdered) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Checkout" }]} />
        <h1 className="mt-6 font-display text-4xl md:text-5xl">Checkout</h1>
        <div className="mt-16 text-center max-w-sm mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please log in or create an account to complete your secure checkout process.
          </p>
          <button
            onClick={openLogin}
            className="mt-6 inline-block w-full bg-foreground text-background py-3 text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Checkout" }]} />
      <h1 className="mt-6 font-display text-4xl md:text-5xl">Checkout</h1>

      {isOrdered ? (
        <div className="mt-16 flex min-h-[40vh] w-full flex-col items-center justify-center text-center animate-fade-in">
          <div className="max-w-md">
            <CheckCircle className="mx-auto h-12 w-12 text-foreground stroke-[1.5]" />
            <h1 className="mt-6 font-display text-3xl uppercase tracking-wider md:text-4xl">
              Thank You
            </h1>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Your order has been successfully placed. A confirmation email with your tracking details has been sent.
            </p>

            <div className={`mt-10 transition-all duration-500 ease-in-out ${
              showContinueButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}>
              <button
                onClick={() => window.location.href = "/"}
                className="inline-block bg-foreground text-background px-8 py-3 text-xs uppercase tracking-widest transition-transform hover:scale-[1.02]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Contact</h2>
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-3 w-full border-b border-hairline bg-transparent py-3 text-sm outline-none focus:border-foreground" />
            </section>
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Shipping</h2>
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-b border-hairline bg-transparent py-3 text-sm outline-none focus:border-foreground" />
              <input required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border-b border-hairline bg-transparent py-3 text-sm outline-none focus:border-foreground" />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border-b border-hairline bg-transparent py-3 text-sm outline-none focus:border-foreground" />
                <input required placeholder="ZIP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  className="w-full border-b border-hairline bg-transparent py-3 text-sm outline-none focus:border-foreground" />
              </div>
            </section>
            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Payment</h2>
              <p className="mt-3 text-sm text-muted-foreground">Secure card processing appears here. This demo does not charge your card.</p>
              <div className="mt-4 grid gap-3">
                <div className="border border-hairline p-4 text-sm">Card ending •••• 4242 (demo)</div>
              </div>
            </section>
            <button type="submit" className="w-full bg-foreground py-4 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01]">
              Place Order · ${cartTotal}
            </button>
          </div>

          <aside className="h-fit border border-hairline p-6">
            <h3 className="text-xs uppercase tracking-widest">Order Summary</h3>
            <ul className="mt-4 divide-y divide-[color:var(--hairline)]">
              {cart.map((item) => {
                const p = findProduct(item.id);
                if (!p) return null;
                return (
                  <li key={item.id + (item.color ?? "")} className="flex gap-3 py-3">
                    <img src={p.images[0]} alt={p.name} className="h-16 w-14 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs uppercase tracking-widest">{p.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Qty {item.qty}</div>
                    </div>
                    <div className="shrink-0 text-sm tabular-nums">${p.price * item.qty}</div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">${cartTotal}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Free</span></div>
              <div className="flex justify-between border-t border-hairline pt-2 font-medium"><span>Total</span><span className="tabular-nums">${cartTotal}</span></div>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}