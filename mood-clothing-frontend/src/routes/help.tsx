import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — Mood Clothings" },
      { name: "description", content: "Get help with orders, shipping, returns, sizing, payments, and your Mood Clothings account." },
      { property: "og:title", content: "Help & Support — Mood Clothings" },
      { property: "og:description", content: "Support topics and ways to reach Mood Clothings client care." },
    ],
  }),
  component: HelpPage,
});

const TOPICS = [
  { title: "Orders & Tracking", body: "Check order status, edit or cancel a recent order, and understand shipping timelines." },
  { title: "Shipping & Delivery", body: "Domestic and international rates, transit times, duties, and delivery partners." },
  { title: "Returns & Refunds", body: "Start a return within 14 days of delivery. Refunds are processed to the original payment method within 5 business days." },
  { title: "Sizing & Fit", body: "Product-level size guides, fit notes, and personal styling recommendations." },
  { title: "Payments & Billing", body: "Accepted cards, secure Stripe checkout, invoices, and failed-payment troubleshooting." },
  { title: "Account & Wishlist", body: "Manage your profile, saved addresses, wishlist, and recently viewed items." },
  { title: "Custom Design", body: "Submit a brief, reference images, timelines, and pricing for made-to-order pieces." },
  { title: "Product Care", body: "Wash and storage guidance to keep your Mood Clothings pieces looking their best." },
];

function HelpPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Help & Support" }]} />
      <header className="mt-6 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Support</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">How can we help?</h1>
        <p className="mt-4 text-muted-foreground">
          Browse a topic below, or reach our client care team directly — we respond within one business day.
        </p>
      </header>

      <section className="mt-12 grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t) => (
          <div key={t.title} className="bg-background p-6">
            <h2 className="font-display text-xl">{t.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 hairline-t pt-10 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-3xl">Still need a hand?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Reach the Mood Clothings   team through your preferred channel.</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
          <Link to="/contact" className="bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background">
            Contact us
          </Link>
          <Link to="/faq" className="border border-foreground px-6 py-3 text-xs uppercase tracking-widest">
            Read FAQ
          </Link>
          <a href="https://wa.me/2348078457247" target="_blank" rel="noreferrer" className="border border-foreground px-6 py-3 text-xs uppercase tracking-widest">
            WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
