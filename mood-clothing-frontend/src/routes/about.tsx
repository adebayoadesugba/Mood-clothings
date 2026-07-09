import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Mood Clothings" },
      { name: "description", content: "Mood Clothings is a modern fashion house crafting timeless ready-to-wear for men, women, and kids. Learn our story, values, and craft." },
      { property: "og:title", content: "About Us — Mood Clothings" },
      { property: "og:description", content: "The story behind Mood Clothings — modern fashion, timeless style." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "About" }]} />
      <header className="mt-6 max-w-3xl">
        <p className="text-xl uppercase tracking-widest text-muted-foreground">Our Story</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.05] md:text-6xl">Crafted for the modern wardrobe.</h1>
        <p className="mt-6 text-base text-muted-foreground md:text-lg">
          Mood Clothings is a contemporary fashion house dedicated to editorial silhouettes and refined
          essentials. We design pieces that live beyond seasons considered, well-made, and
          effortless to wear.
        </p>
      </header>

      <section className="mt-16 grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="font-display text-2xl">Design</h2>
          <p className="mt-3 text-xl text-muted-foreground">
            Every collection begins with a mood, a fabric, and a silhouette. We favour clean lines,
            considered tailoring, and a monochrome palette that lets you play with texture and form.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl">Craft</h2>
          <p className="mt-3 text-xl text-muted-foreground">
            Our garments are produced in small batches with trusted ateliers. We use natural fibres
            where possible and finish each piece by hand, so what you receive feels made-to-last.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl">Community</h2>
          <p className="mt-3 text-xl text-muted-foreground">
            Mood Clothings is worn by a global community of creatives, professionals, and families. We build
            for real lives from studio to weekend with a warm, personal service to match.
          </p>
        </div>
      </section>

      <section className="mt-20 hairline-t pt-10">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { k: "2026", v: "Founded in Lagos" },
            { k: "All", v: "States Across Nigeria" },
            { k: "5k", v: "Wardrobe pieces crafted" },
            { k: "4.9", v: "Customer rating" },
          ].map((s) => (
            <div key={s.k}>
              <div className="font-display text-4xl">{s.k}</div>
              <div className="mt-1 text-xl uppercase tracking-widest text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
