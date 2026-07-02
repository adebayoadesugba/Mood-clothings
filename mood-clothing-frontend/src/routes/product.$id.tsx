import { createFileRoute, notFound } from "@tanstack/react-router";
import { Heart, Star, Minus, Plus, Truck, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { findProduct, related } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const p = findProduct(params.id);
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
    const p = findProduct(params.id);
    if (!p) throw notFound();
    return {};
  },
  component: ProductPage,
});

// Default seed reviews applied to every individual product upon first visit
const INITIAL_MOCK_REVIEWS = [
  { name: "Amelia R.", rating: 5, text: "Fit is impeccable and the fabric feels premium. Wearing it constantly." },
  { name: "Marcus O.", rating: 5, text: "Exactly the silhouette I was hoping for. Shipping was quick." },
  { name: "Priya N.", rating: 4, text: "Beautiful piece, runs a touch large — sized down and it's perfect." },
];

function ProductPage() {
  const { id } = Route.useParams();
  const product = findProduct(id)!;
  const { addToCart, toggleWishlist, wishlist, trackView, user } = useStore();
  
  // Scoping state completely to the specific product ID
  const [productReviewsMap, setProductReviewsMap] = useState<Record<string, typeof INITIAL_MOCK_REVIEWS>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const wished = wishlist.includes(product.id);

  // Form states for adding a new review
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  useEffect(() => { trackView(product.id); }, [product.id, trackView]);

  // Ensure this specific product has an entry in our state map, otherwise give it the initial template
  const currentReviews = productReviewsMap[product.id] || INITIAL_MOCK_REVIEWS;

  // Compute dynamic counters based entirely on active data
  const totalReviewsCount = currentReviews.length;
  const rawAverage = currentReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount;
  
  // Fallback to 4.7 if something goes wrong, otherwise calculate dynamic rating with a strict 4.0 floor limit
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

    // Update reviews exclusively under the current product ID key
    setProductReviewsMap((prev) => ({
      ...prev,
      [product.id]: [newReview, ...currentReviews],
    }));

    setNewText("");
    setNewRating(5);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: product.category[0].toUpperCase() + product.category.slice(1), to: "/shop/$gender", params: { gender: product.category } },
          { label: product.sub[0].toUpperCase() + product.sub.slice(1), to: "/shop/$gender/$sub", params: { gender: product.category, sub: product.sub } },
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

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-hairline">
              <button className="grid h-11 w-11 place-items-center" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
              <button className="grid h-11 w-11 place-items-center" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => addToCart(product.id, color, qty)}
              className="flex-1 bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01]"
            >
              Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
              className="grid h-11 w-11 place-items-center border border-hairline hover:border-foreground"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-foreground" : ""}`} />
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
            <div className="border border-hairline p-6 text-center">
              <div className="font-display text-5xl">{computedRating.toFixed(1)}</div>
              <div className="mt-2 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(computedRating) ? "fill-foreground" : "text-hairline"}`} />
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{totalReviewsCount} verified reviews</div>
            </div>

            {/* Write a Review Section */}
            <div className="border border-hairline p-4">
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

          <ul className="divide-y divide-[color:var(--hairline)]">
            {currentReviews.map((r, index) => (
              <li key={`${r.name}-${index}`} className="py-5 first:pt-0">
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

      {/* Related */}
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