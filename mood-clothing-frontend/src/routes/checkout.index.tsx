import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/")({
  head: () => ({ meta: [{ title: "Checkout  Mood Clothings" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

function Checkout() {
  const store = useStore();
  const { cart, cartTotal, user, openLogin, PRODUCTS: liveRegistry } = store;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: user?.email ?? "",
    name: user?.name ?? "",
    address: "",
    city: "",
    zip: "",
    country: "Nigeria",
    phone1: "",
    phone2: "",
  });

  const formatNaira = (amount: number) => {
    return "₦" + Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Shown to the customer for transparency BEFORE payment — the real, authoritative
  // amount is always recalculated server-side from the database when the payment is
  // initialized, so this is a preview, not the trusted source of truth.
  const totalPreview = cartTotal;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // DUPLICATE PHONE NUMBER GUARD: only enforced if they actually filled in an alternative number
    if (form.phone2.trim() && form.phone2.trim() === form.phone1.trim()) {
      toast.error("Please enter a different number for your alternative phone it can't match your primary number.");
      return;
    }

    setLoading(true);

    try {
      // Map cart items to real product references — no prices sent here at all;
      // the backend looks up current prices from the database itself.
      const formattedItems = cart.map((item) => {
        const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
        const p = allInventory.find(
          (product) => product.id === item.id || product._id === item.id || product.databaseId === item.id
        );

        if (!p) throw new Error(`Product metadata missing for entry ID: ${item.id}`);

        const mongoId = p.databaseId || p._id;
        if (!mongoId || !/^[0-9a-fA-F]{24}$/.test(mongoId)) {
          throw new Error(`"${p.name}" isn't available for checkout yet. Please remove it from your cart.`);
        }

        return {
          product: mongoId,
          color: item.color || "Default",
          size: item.size || "M",
          qty: item.qty,
        };
      });

      const token = localStorage.getItem("mood-clothings-auth-token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone1.trim(),
            phone2: form.phone2.trim() || undefined,
            address: form.address.trim(),
            city: form.city.trim(),
            zip: form.zip.trim(),
          },
          items: formattedItems,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        throw new Error(data.message || "Unable to start payment. Please try again.");
      }

      // Redirect to Paystack's own secure checkout page — card details are entered
      // entirely on Paystack's domain, never on ours.
      window.location.href = data.authorization_url;
    } catch (err: any) {
      console.error("Payment initialization failed:", err);
      toast.error(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  // Guard Check 1: Empty Cart View
  if (cart.length === 0) {
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
  if (!user) {
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

      {/* MOBILE-FIRST ORDER: on small screens the summary/aside appears FIRST (order-1),
          so users see what they're paying for before scrolling to the form and submit
          button. On large screens (lg:), it reverts to the original side-by-side layout
          with the form on the left and summary on the right. */}
      <form onSubmit={handlePlaceOrder} className="mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
        <aside className="order-1 lg:order-2 h-fit border border-hairline p-6 bg-background rounded-sm">
          <h3 className="text-lg uppercase tracking-widest">Order Summary</h3>
          <ul className="mt-4 divide-y divide-[color:var(--hairline)] max-h-[360px] overflow-y-auto pr-1">
            {cart.map((item) => {
              const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
              const p = allInventory.find(
                (product) => product.id === item.id || product._id === item.id || product.databaseId === item.id
              );
              if (!p) return null;
              return (
                <li key={item.id + (item.color ?? "") + (item.size ?? "")} className="flex gap-3 py-3">
                  <img src={p.images[0]} alt={p.name} className="h-16 w-14 object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm uppercase tracking-widest">{p.name}</div>
                    <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && (
                        <span className="flex items-center gap-1">
                          Color:
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-hairline"
                            style={{ backgroundColor: item.color }}
                            title={item.color}
                          />
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">Qty {item.qty}</div>
                  </div>
                  <div className="shrink-0 text-lg tabular-nums font-mono">{formatNaira(p.price * item.qty)}</div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 space-y-2 text-sm border-t border-hairline pt-4">
            <div className="flex justify-between border-t border-hairline pt-2 font-medium text-base lg:text-lg">
              <span>Total</span>
              <span className="tabular-nums font-mono font-semibold lg:font-bold lg:text-2xl">{formatNaira(totalPreview)}</span>
            </div>
          </div>

          {/* DELIVERY FEE NOTICE — professional, clear, sets expectations before payment */}
          <div className="mt-4 border border-hairline bg-secondary/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Delivery fee not included above.</span>{" "}
            A delivery fee of ₦1,000 – ₦5,000 (based on your location) is payable directly to our
            courier upon arrival — you'll know the exact fee before you accept delivery.
          </div>
        </aside>

        <div className="order-2 lg:order-1 space-y-8">
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

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Primary Phone</label>
                  <input required type="tel" placeholder="e.g. +234..." value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })}
                    className="w-full border-b border-hairline bg-transparent py-2.5 text-sm outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Alternative Phone</label>
                  <input type="tel" placeholder="e.g. +234... (different from above)" value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                    className="w-full border-b border-hairline bg-transparent py-2.5 text-sm outline-none focus:border-foreground" />
                </div>
              </div>
              <p className="text-[11px] italic text-muted-foreground">
                * Please provide two different numbers where possible — this helps our courier reach you if one line is unavailable.
              </p>
            </div>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Payment</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              You'll be securely redirected to Paystack to complete your payment by card, bank transfer, or USSD.
            </p>
          </section>

          <div className="w-full max-w-xs">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground py-4 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none font-mono"
            >
              {loading ? "Redirecting to secure payment..." : `Pay ${formatNaira(totalPreview)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}