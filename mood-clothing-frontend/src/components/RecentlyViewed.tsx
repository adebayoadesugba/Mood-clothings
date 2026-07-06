import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  // FIXED: Destructured PRODUCTS from global state context to track live registry items cleanly
  const { recent, PRODUCTS: liveRegistry } = useStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  // UNIFIED ITEM LOOKUP: Combines backend database documents and static products before filtering
  const items = recent
    .filter((id) => id !== excludeId)
    .map((id) => {
      const allInventory = [...(liveRegistry || []), ...STATIC_PRODUCTS];
      return allInventory.find(
        (p) => p.id === id || p._id === id || p.databaseId === id
      );
    })
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 8);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      // Smoothly scroll roughly half the visible width of the carousel viewport
      const scrollAmount = carouselRef.current.clientWidth / 2;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 relative">
      {/* Header with Heading & Navigation Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl md:text-3xl">Recently Viewed</h2>
        
        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button 
            onClick={() => scroll("left")}
            className="grid h-10 w-10 place-items-center border border-hairline bg-background text-foreground transition-colors hover:border-foreground active:scale-95"
            aria-label="Previous items"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="grid h-10 w-10 place-items-center border border-hairline bg-background text-foreground transition-colors hover:border-foreground active:scale-95"
            aria-label="Next items"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Touch-Scrollable track with hidden native scrollbars */}
      <div 
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" 
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((p) => (
          <div 
            key={p.id} 
            className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-[28%] lg:w-[22%] will-change-transform"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}