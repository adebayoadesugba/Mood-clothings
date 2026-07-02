import { useStore } from "@/lib/store";
import { findProduct } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { recent } = useStore();
  const items = recent
    .filter((id) => id !== excludeId)
    .map(findProduct)
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 8);
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl md:text-3xl">Recently Viewed</h2>
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch]" style={{ willChange: "transform" }}>
        {items.map((p) => (
          <div key={p.id} className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-[28%] lg:w-[22%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
