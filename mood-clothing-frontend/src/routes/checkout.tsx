import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { findProduct } from "@/lib/products";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Glamora" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

function Checkout() {
  const { cart, cartTotal, user } = useStore();
  const [form, setForm] = useState({
    email: user?.email ?? "",
    name: user?.name ?? "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
  });

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 md:px-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Checkout" }]} />
        <div className="mt-16 text-center">
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <Link to="/" className="mt-6 inline-block border border-foreground px-6 py-3 text-xs uppercase tracking-widest">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Checkout" }]} />
      <h1 className="mt-6 font-display text-4xl md:text-5xl">Checkout</h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Order placed! (demo)"); }}
          className="space-y-8"
        >
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
        </form>

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
      </div>
    </div>
  );
}
