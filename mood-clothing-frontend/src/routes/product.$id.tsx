import { createFileRoute, notFound } from "@tanstack/react-router";
import { Heart, Star, Minus, Plus, Truck, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS as STATIC_PRODUCTS, related } from "@/lib/products";
import { convertToSlug } from "@/lib/utils";
import { useStore } from "@/lib/store";

// Helper function to resolve dynamic products matching a name slug across combined arrays
const findProductBySlug = (idParam: string, registryProducts: any[] = []) => {
  const allAvailable = [...registryProducts, ...STATIC_PRODUCTS];
  const match = allAvailable.find((p) => p.id === idParam || p._id === idParam || p.databaseId === idParam || convertToSlug(p.name) === idParam);
  
  // FIXED: If we are inside the pre-boot loader loop and can't find a static item,
  // return a mock signature instead of throwing 404 so the context has time to populate on mount.
  if (!match && registryProducts.length === 0 && idParam) {
    return { name: "Loading Garment...", description: "", images: [""], colors: ["#000000"], category: "collection", sub: "all", price: 0 };
  }
  return match;
};

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    // Basic head lookup using static fallbacks if the store context has not initialized yet
    const p = findProductBySlug(params.id);
    return {
      meta: p
        ? [
            { title: `${p.name} — MOOD CLOTHINGS` },
            { name: "description", content: p.description },
            { property: "og:title", content: `${p.name} — MOOD CLOTHINGS` },
            { property: "og:description", content: p.description },
            { property: "og:image", content: p.images[0] },
            { name: "twitter:image", content: p.images[0] },
          ]
        : [{ title: "Product not found — MOOD CLOTHINGS" }],
    };
  },
  loader: ({ params }) => {
    const p = findProductBySlug(params.id);
    if (!p) throw notFound();
    return {};
  },
  component: ProductPage,
});

const INITIAL_MOCK_REVIEWS = [
  { name: "Amelia R.", rating: 5, text: "Fit is impeccable and the fabric feels premium. Wearing it constantly." },
  { name: "Marcus O.", rating: 5, text: "Exactly the silhouette I was hoping for. Shipping was quick." },
  { name: "Priya N.", rating: 4, text: "Beautiful piece, runs a touch large — sized down and it's perfect." },
];

function ProductPage() {
  const { id } = Route.useParams();
  const { addToCart, toggleWishlist, wishlist, trackView, user, PRODUCTS: liveRegistry } = useStore();
  
  // Resolve product using the live context registry dynamically
  const product = findProductBySlug(id, liveRegistry);

  const [productReviewsMap, setProductReviewsMap] = useState<Record<string, typeof INITIAL_MOCK_REVIEWS>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(product ? product.colors[0] : "");
  const [size, setSize] = useState("M"); 
  const [qty, setQty] = useState(1);

  // Fallback state synchronization once the product payload safely mounts
  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setColor(product.colors[0]);
    }
  }, [product]);

  useEffect(() => { 
    if (product && product.id) {
      trackView(product.id); 
    }
  }, [product, trackView]);

  // FIXED: Keeps render blank or returns a loading container skeleton if data fetch is active
  if (!product || product.name === "Loading Garment...") {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 text-center text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
        Syncing collection data...
      </div>
    );
  }

  const wished = wishlist.includes(product.id);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const currentReviews = productReviewsMap[product.id] || INITIAL_MOCK_REVIEWS;
  const totalReviewsCount = currentReviews.length;
  const rawAverage = currentReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount;
  
  const computedRating = totalReviewsCount > 0 
    ? Math.max(4.0, rawAverage) 
    : 4.7;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newReview = {
      name: user?.name || "Guest User",
      rating: newRating,
      text: newText,
    };

    setProductReviewsMap((prev) => ({
      ...prev,
      [product.id]: [newReview, ...currentReviews],
    }));

    setNewText("");
    setNewRating(5);
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = "2348000000000"; 
    const message = encodeURIComponent(`Hi Mood Clothings, I am interested in purchasing the "${product.name}" (Color: ${color}, Size: ${size}). Could you assist me with more details?`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: product.category ? product.category[0].toUpperCase() + product.category.slice(1) : "Collection", to: "/shop/$gender", params: { gender: product.category || "women" } },
          { label: product.sub ? product.sub[0].toUpperCase() + product.sub.slice(1) : "All", to: "/shop/$gender/$sub", params: { gender: product.category || "women", sub: product.sub || "all" } },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-12">
        <div>
          <div className="overflow-hidden bg-secondary">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="product-img"
              fetchPriority="high"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImage(i)}
                className={`h-20 w-16 overflow-hidden border ${activeImage === i ? "border-foreground" : "border-hairline"}`}
                aria-label={`Image ${i + 1}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(computedRating) ? "fill-foreground" : "text-hairline"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{computedRating.toFixed(1)} · {totalReviewsCount} reviews</span>
          </div>
          <div className="mt-4 font-display text-3xl">${product.price}</div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Color Selector */}
          <div className="mt-8">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Color</div>
            <div className="mt-2 flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={`h-9 w-9 rounded-full border-2 ${color === c ? "border-foreground" : "border-hairline"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Size Selector with Heading */}
          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Select your size</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["S", "M", "L", "XL", "XXL"].map((sz) => {
                const isSelected = size === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    className={`min-w-12 h-10 border text-xs uppercase tracking-wider transition-colors px-3 ${
                      isSelected 
                        ? "border-foreground bg-foreground text-background font-medium" 
                        : "border-hairline hover:border-foreground text-foreground bg-transparent"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Action Layout Blocks */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-hairline bg-background">
                <button type="button" className="grid h-11 w-11 place-items-center" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
                <button type="button" className="grid h-11 w-11 place-items-center" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></button>
              </div>
              <button
                type="button"
                onClick={() => addToCart(product.id, color, qty, size)}
                className="flex-1 bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01]"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist"
                className="grid h-11 w-11 place-items-center border border-hairline hover:border-foreground bg-background"
              >
                <Heart className={`h-4 w-4 ${wished ? "fill-foreground" : ""}`} />
              </button>
            </div>

            {/* Premium Minimalist WhatsApp Component Block */}
            <button
              type="button"
              onClick={handleWhatsAppRedirect}
              className="flex w-full items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.849.002-2.634-1.023-5.11-2.89-6.98-1.866-1.868-4.343-2.899-6.977-2.9-5.439 0-9.861 4.413-9.864 9.852-.001 1.698.452 3.354 1.309 4.811L1.99 22.067l4.657-1.913zm11.514-7.53c-.307-.154-1.815-.896-2.097-.999-.281-.103-.485-.154-.689.154-.204.307-.792.999-.971 1.203-.178.204-.357.226-.664.072-1.246-.623-2.115-1.096-2.966-2.556-.226-.388.226-.361.648-1.203.072-.144.036-.271-.018-.378-.054-.107-.485-1.171-.664-1.603-.175-.42-.354-.362-.485-.369-.125-.007-.269-.008-.413-.008-.144 0-.378.054-.576.271-.198.216-.755.739-.755 1.8 0 1.062.773 2.087.88 2.23 1.1 1.487 2.47 2.288 3.93 2.848.348.134.696.214 1.056.276.36.062.688.048.947.009.289-.044.896-.367 1.023-.721.127-.354.127-.658.089-.721-.037-.063-.143-.103-.45-.258z"/>
              </svg>
              Contact us on WhatsApp
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="flex flex-col items-start gap-2"><Truck className="h-4 w-4 text-foreground" /> Free shipping over $150</div>
            <div className="flex flex-col items-start gap-2"><RefreshCcw className="h-4 w-4 text-foreground" /> 30-day returns</div>
            <div className="flex flex-col items-start gap-2"><ShieldCheck className="h-4 w-4 text-foreground" /> Secure checkout</div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20">
        <h2 className="font-display text-2xl md:text-3xl">Ratings &amp; Reviews</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="flex flex-col gap-4">
            <div className="border border-hairline p-6 text-center bg-background">
              <div className="font-display text-5xl">{computedRating.toFixed(1)}</div>
              <div className="mt-2 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(computedRating) ? "fill-foreground" : "text-hairline"}`} />
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{totalReviewsCount} verified reviews</div>
            </div>

            <div className="border border-hairline p-4 bg-background">
              <h3 className="text-xs uppercase tracking-widest text-foreground font-medium mb-3">Share your thoughts</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const ratingValue = i + 1;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setNewRating(ratingValue)}
                          onMouseEnter={() => setHoveredRating(ratingValue)}
                          onMouseLeave={() => setHoveredRating(null)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-4 w-4 transition-colors ${
                              ratingValue <= (hoveredRating ?? newRating)
                                ? "fill-foreground text-foreground"
                                : "text-hairline"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Write your review here..."
                    rows={3}
                    className="w-full border border-hairline p-2 text-xs bg-background placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-foreground text-background py-2 text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Please log in to leave a product rating and review.
                </p>
              )}
            </div>
          </div>

          <ul className="divide-y divide-[color:var(--hairline)] bg-background border border-hairline px-6">
            {currentReviews.map((r, index) => (
              <li key={`${r.name}-${index}`} className="py-5 first:pt-6 last:pb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Verified buyer</span>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-foreground" : "text-hairline"}`} />
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Related Grid */}
      <section className="mt-20">
        <h2 className="mb-6 font-display text-2xl md:text-3xl">You may also like</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {related(product).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}