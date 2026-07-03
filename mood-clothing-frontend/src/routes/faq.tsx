import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Mood Clothings" },
      { name: "description", content: "Answers to common questions about Mood Clothings orders, shipping, returns, sizing, custom design, and payments." },
      { property: "og:title", content: "FAQ — Mood Clothings" },
      { property: "og:description", content: "Frequently asked questions about Mood Clothings." },
    ],
  }),
  component: FaqPage,
});

const FAQS: { q: string; a: string }[] = [
  { q: "How long does shipping take?", a: "Domestic orders arrive within 2–4 business days. International orders take 5–10 business days depending on destination and customs clearance." },
  { q: "What is your returns policy?", a: "Unworn items with original tags can be returned within 14 days of delivery for a full refund. Sale items are final." },
  { q: "How do I choose the right size?", a: "Each product page includes a size guide with detailed measurements. If you're between sizes, we recommend sizing up for a relaxed fit." },
  { q: "Do you ship internationally?", a: "Yes — we ship to 40+ countries. Duties and taxes are calculated at checkout so there are no surprises on delivery." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe. Additional local methods may appear based on your region." },
  { q: "Can I request a custom design?", a: "Yes. Head to the Custom Design page to upload a brief and reference images. Our atelier team will respond within two business days with a quote and timeline." },
  { q: "How do I contact customer care?", a: "Email care@moodclothings.shop, call +234 807 845 7247, or tap the WhatsApp button at the bottom-right of any page." },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <header className="mt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Frequently Asked</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Questions & answers.</h1>
      </header>

      <div className="mt-10 hairline-t">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="hairline-b">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-display text-lg md:text-xl">{f.q}</span>
                <span className="text-2xl leading-none text-muted-foreground">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <p className="pb-6 pr-8 text-sm text-muted-foreground">{f.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
