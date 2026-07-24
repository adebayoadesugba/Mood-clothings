import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Heart, Star, Minus, Plus, Truck, RefreshCcw, ShieldCheck, Ruler, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { PRODUCTS as STATIC_PRODUCTS, related } from "@/lib/products";
import { convertToSlug } from "@/lib/utils";
import { useStore } from "@/lib/store";

const findProductBySlug = (idParam: string, registryProducts: any[] = []) => {
  const allAvailable = [...registryProducts, ...STATIC_PRODUCTS];
  const match = allAvailable.find((p) => p.id === idParam || p._id === idParam || p.databaseId === idParam || convertToSlug(p.name) === idParam);
  
  if (!match && registryProducts.length === 0 && idParam) {
    return { name: "Mood Clothings", description: "", images: [""], colors: ["#000000"], category: "collection", sub: "all", price: 0 };
  }
  return match;
};

const formatDeliveryWindow = (minDays: number, maxDays: number) => {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const start = new Date();
  start.setDate(start.getDate() + minDays);
  const end = new Date();
  end.setDate(end.getDate() + maxDays);
  return `${fmt(start)} – ${fmt(end)}`;
};

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const p = findProductBySlug(params.id);
    return {
      meta: p
        ? [
            { title: `${p.name} The Best Online Store` },
            { name: "description", content: p.description },
            { property: "og:title", content: `${p.name} Mood Clothings` },
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
  { name: "Richard E.", rating: 5, text: "Fit is impeccable and the fabric feels premium. Wearing it constantly." },
  { name: "Adebayo.", rating: 5, text: "Exactly the material I was hoping for and the shipping was quick." },
  { name: "Tochi.", rating: 4, text: "Beautiful piece, runs a touch large sized down and it's perfect." },
];

const SIZE_CHART = [
  { size: "S", chest: "36-38", length: "27" },
  { size: "M", chest: "39-41", length: "28" },
  { size: "L", chest: "42-44", length: "29" },
  { size: "XL", chest: "45-47", length: "30" },
  { size: "XXL", chest: "48-50", length: "31" },
];

// SKELETON LAYOUT: mirrors the real page's gallery + text structure, since almost every
// part of this specific page genuinely depends on product data (unlike Home/Collection,
// there's no meaningful "static shell" to show before we know which product this is).
function ProductPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
      <div className="skeleton-block h-3 w-64 rounded" />
      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-12 items-start">
        <div className="flex flex-col gap-3">
          <div className="skeleton-block aspect-[4/5] w-full rounded-sm md:max-h-[580px]" />
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-block h-24 w-20 max-md:h-16 max-md:w-12 rounded" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton-block h-8 w-3/4 rounded" />
          <div className="skeleton-block h-4 w-40 rounded" />
          <div className="skeleton-block h-9 w-32 rounded" />
          <div className="space-y-2 pt-2">
            <div className="skeleton-block h-3 w-full rounded" />
            <div className="skeleton-block h-3 w-5/6 rounded" />
          </div>
          <div className="flex gap-2 pt-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-block h-8 w-8 rounded-full" />)}
          </div>
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-block h-10 w-14 rounded" />)}
          </div>
          <div className="skeleton-block mt-6 h-11 w-full max-w-[300px] rounded" />
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const { addToCart, toggleWishlist, wishlist, trackView, user, PRODUCTS: liveRegistry, isLoading } = useStore();
  
  const product = findProductBySlug(id, liveRegistry);

  const [productReviewsMap, setProductReviewsMap] = useState<Record<string, typeof INITIAL_MOCK_REVIEWS>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(product ? product.colors[0] : "");
  const [size, setSize] = useState("M"); 
  const [qty, setQty] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setColor(product.colors[0]);
    }
    if (product && product.stockSizes && product.stockSizes.length > 0) {
      setSize(product.stockSizes[0]);
    }
  }, [product]);

  useEffect(() => { 
    if (product && product.id) {
      trackView(product.id); 
    }
  }, [product, trackView]);

  const formatNaira = (amount: number) => {
    return "₦" + Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

   const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goToNextImage = () => {
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };
  const goToPrevImage = () => {
    setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNextImage() : goToPrevImage();
    }
    setTouchStartX(null);
  };

  const currentReviews = useMemo(() => {
    if (!product || !product.id) return INITIAL_MOCK_REVIEWS;
    return productReviewsMap[product.id] || INITIAL_MOCK_REVIEWS;
  }, [product, productReviewsMap]);

  const { computedRating, totalReviewsCount } = useMemo(() => {
    const count = currentReviews.length;
    const rawAverage = currentReviews.reduce((sum, r) => sum + r.rating, 0) / (count || 1);
    const computed = count > 0 ? Math.max(4.0, rawAverage) : 4.7;
    return { computedRating: computed, totalReviewsCount: count };
  }, [currentReviews]);

  const randomizedCategoryProducts = useMemo(() => {
    if (!product || !product.category) return [];
    
    const pool = Array.isArray(liveRegistry) && liveRegistry.length > 0 ? liveRegistry : STATIC_PRODUCTS;
    
    const categoryMatches = pool.filter(
      (item) => item.category === product.category && item.id !== product.id
    );



    const finalPool = categoryMatches.length >= 5 
      ? categoryMatches 
      : pool.filter((item) => item.id !== product.id);

    return [...finalPool].sort(() => 0.6 - Math.random()).slice(0, 6);
  }, [product, liveRegistry]);

  const deliveryWindow = useMemo(() => formatDeliveryWindow(2, 3), []);

  // FIXED: while data is still loading, show a skeleton matching this page's real
  // layout instead of a generic spinner.
  if (isLoading) {
    return <ProductPageSkeleton />;
  }

   

  // FIXED: previously, if a product genuinely didn't exist (bad/stale link, deleted
  // product, typo'd URL), this fell into the same branch as "still loading" and showed
  // "Loading Product..." FOREVER, since isLoading had already finished by this point.
  // Now it shows a real, honest "not found" state instead of an infinite spinner.
  if (!product || product.name === "Mood Clothings" || !product.id) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Product not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This item may have been removed or the link may be incorrect.
        </p>
        <Link
          to="/collection"
          className="mt-8 inline-block bg-foreground px-8 py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.02]"
        >
          Browse the Collection
        </Link>
      </div>
    );
  }

  const wished = wishlist.includes(product.id);

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
    const phoneNumber = "2349065623779";
    const message = encodeURIComponent(`Hi Mood Clothings, I am interested in purchasing the "${product.name}" (Color: ${color}, Size: ${size}). Could you assist me with more details?`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const handleStylistWhatsApp = () => {
    const phoneNumber = "2349065623779";
    const message = encodeURIComponent(`Hi Mood Clothings, I'd like some styling advice on the "${product.name}".`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const sizeOptionsToRender = product.stockSizes && product.stockSizes.length > 0 
    ? product.stockSizes 
    : ["S", "M", "L", "XL"];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 text-lg max-md:text-sm">
      <div className="max-md:text-xs">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: product.category ? product.category[0].toUpperCase() + product.category.slice(1) : "Collection", to: "/shop/$gender", params: { gender: product.category || "women" } },
            { label: product.sub ? product.sub[0].toUpperCase() + product.sub.slice(1) : "All", to: "/shop/$gender/$sub", params: { gender: product.category || "women", sub: product.sub || "all" } },
            { label: product.name },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-12 items-start">
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden bg-secondary rounded-sm max-w-full md:max-h-[580px] flex items-center justify-center group">
           <div
  className="relative overflow-hidden bg-secondary rounded-sm max-w-full md:max-h-[580px] flex items-center justify-center group"
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
  <img
    src={product.images[activeImage]}
    alt={product.name}
    className="w-full h-full object-cover md:max-h-[580px] transition-transform duration-500 md:group-hover:scale-105"
    fetchPriority="high"
  />
  {product.images.length > 1 && (
    <>
      <button
        type="button"
        onClick={goToPrevImage}
        aria-label="Previous image"
        className="absolute left-2 top-1/2 -translate-y-1/2 grid h-9 w-9 max-md:h-8 max-md:w-8 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors"
      >
        <ChevronLeft className="h-5 w-5 max-md:h-4 max-md:w-4" />
      </button>
      <button
        type="button"
        onClick={goToNextImage}
        aria-label="Next image"
        className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 max-md:h-8 max-md:w-8 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors"
      >
        <ChevronRight className="h-5 w-5 max-md:h-4 max-md:w-4" />
      </button>
    </>
  )}
</div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImage(i)}
                className={`h-24 w-20 max-md:h-16 max-md:w-12 overflow-hidden border transition-all ${activeImage === i ? "border-foreground scale-[1.02]" : "border-hairline hover:border-foreground"}`}
                aria-label={`Image ${i + 1}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-display capitalize text-3xl md:text-4xl max-md:text-xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 max-md:h-3 max-md:w-3 ${i < Math.round(computedRating) ? "fill-foreground" : "text-hairline"}`} />
                ))}
              </div>
              <span className="text-lg text-muted-foreground max-md:text-xs underline underline-offset-2">{computedRating.toFixed(1)} · {totalReviewsCount} reviews</span>
            </button>

            <span className="flex items-center gap-1.5 text-xs max-md:text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
              In Stock
            </span>
          </div>
          
          <div className="mt-5 font-display text-4xl font-semibold text-foreground font-roboto max-md:text-2xl">{formatNaira(product.price)}</div>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-md:text-sm max-md:mt-4">{product.description}</p>

          <div className="mt-4 flex items-center gap-2 text-sm max-md:text-xs text-muted-foreground">
            <Truck className="h-4 w-4 text-foreground shrink-0" />
            Get it by <span className="text-foreground font-medium">{deliveryWindow}</span>
          </div>

          <div className="mt-8 max-md:mt-5">
            <div className="text-lg uppercase tracking-widest text-muted-foreground max-md:text-xs">Select Color</div>
            <div className="mt-2 flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={`h-8 w-8 max-md:h-5 max-md:w-5 rounded-full border-1 ${color === c ? "border-foreground" : "border-hairline"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 max-md:mt-4">
            <div className="flex items-center justify-between">
              <div className="text-lg uppercase tracking-widest text-muted-foreground max-md:text-xs">Select your size</div>
              <button
                type="button"
                onClick={() => setShowSizeGuide((v) => !v)}
                className="flex items-center gap-1 text-xs max-md:text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                <Ruler className="h-3.5 w-3.5" /> Size Guide
              </button>
            </div>

            {showSizeGuide && (
              <div className="mt-3 overflow-x-auto border border-hairline">
                <table className="w-full min-w-[320px] text-xs max-md:text-[11px]">
                  <thead className="bg-secondary uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Size</th>
                      <th className="px-3 py-2 text-left">Chest (in)</th>
                      <th className="px-3 py-2 text-left">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--hairline)]">
                    {SIZE_CHART.map((row) => (
                      <tr key={row.size}>
                        <td className="px-3 py-2 font-medium">{row.size}</td>
                        <td className="px-3 py-2">{row.chest}</td>
                        <td className="px-3 py-2">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {sizeOptionsToRender.map((sz: string) => {
                const isSelected = size === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    className={`min-w-10 h-10 max-md:min-w-9 max-md:h-8 border text-lg max-md:text-xs uppercase tracking-wider transition-colors px-3 ${
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

          <div className="mt-8 flex flex-col gap-3 max-md:mt-6">
            <div className="flex flex-wrap items-center gap-4 max-md:gap-2">
              <div className="flex items-center border border-hairline bg-background h-11 max-md:h-9 shrink-0">
                <button type="button" className="grid h-11 w-11 max-md:h-9 max-md:w-9 place-items-center" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4 max-md:h-3 max-md:w-3" /></button>
                <span className="w-10 text-center text-lg max-md:text-sm tabular-nums font-mono">{qty}</span>
                <button type="button" className="grid h-11 w-11 max-md:h-9 max-md:w-9 place-items-center" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4 max-md:h-3 max-md:w-3" /></button>
              </div>
              
              <button
                type="button"
                onClick={() => addToCart(product.id, color, qty, size)}
                className="flex-1 max-w-50 md:max-w-[300px] h-11 max-md:h-9 text-lg max-md:text-xs uppercase tracking-widest text-background bg-foreground transition-transform hover:scale-[1.01]"
              >
                Add to Cart
              </button>
              
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist"
                className="grid h-11 w-11 max-md:h-9 max-md:w-9 place-items-center border border-hairline hover:border-foreground bg-background shrink-0"
              >
                <Heart className={`h-4 w-4 max-md:h-3 w-3 ${wished ? "fill-foreground" : ""}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppRedirect}
              className="flex w-1/2 md:max-w-[200px] h-11 max-md:h-9 items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-lg max-md:text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]"
            >
              <svg className="h-5 w-5 fill-current max-md:h-4 max-md:w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.849.002-2.634-1.023-5.11-2.89-6.98-1.866-1.868-4.343-2.899-6.977-2.9-5.439 0-9.861 4.413-9.864 9.852-.001 1.698.452 3.354 1.309 4.811L1.99 22.067l4.657-1.913zm11.514-7.53c-.307-.154-1.815-.896-2.097-.999-.281-.103-.485-.154-.689.154-.204.307-.792.999-.971 1.203-.178.204-.357.226-.664.072-1.246-.623-2.115-1.096-2.966-2.556-.226-.388.226-.361.648-1.203.072-.144.036-.271-.018-.378-.054-.107-.485-1.171-.664-1.603-.175-.42-.354-.362-.485-.369-.125-.007-.269-.008-.413-.008-.144 0-.378.054-.576.271-.198.216-.755.739-.755 1.8 0 1.062.773 2.087.88 2.23 1.1 1.487 2.47 2.288 3.93 2.848.348.134.696.214 1.056.276.36.062.688.048.947.009.289-.044.896-.367 1.023-.721.127-.354.127-.658.089-.721-.037-.063-.143-.103-.45-.258z"/>
              </svg>
              WhatsApp
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-sm max-md:text-[10px] uppercase tracking-widest text-muted-foreground border-t border-hairline pt-6 max-md:pt-4 max-md:mt-4">
            <div className="flex flex-col items-start gap-2"><Truck className="h-5 w-5 max-md:h-4 max-md:w-4 text-foreground" /> Fast Delivery</div>
            <div className="flex flex-col items-start gap-2"><RefreshCcw className="h-5 w-5 max-md:h-4 max-md:w-4 text-foreground" /> 7-day returns</div>
            <div className="flex flex-col items-start gap-2"><ShieldCheck className="h-5 w-5 max-md:h-4 max-md:w-4 text-foreground" /> Secure checkout</div>
          </div>
        </div>
      </div>

      <section id="reviews-section" className="mt-20 max-md:mt-12">
        <h2 className="font-display text-2xl md:text-3xl max-md:text-base">Ratings &amp; Reviews</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr] max-md:gap-4">
          <div className="flex flex-col gap-4">
            <div className="border border-hairline p-6 max-md:p-4 text-center bg-background">
              <div className="font-display text-5xl max-md:text-3xl">{computedRating.toFixed(1)}</div>
              <div className="mt-2 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 max-md:h-3 max-md:w-3 ${i < Math.round(computedRating) ? "fill-foreground" : "text-hairline"}`} />
                ))}
              </div>
              <div className="mt-2 text-lg max-md:text-xs text-muted-foreground">{totalReviewsCount} verified reviews</div>
            </div>

            <div className="border border-hairline p-4 bg-background">
              <h3 className="text-lg max-md:text-xs uppercase tracking-widest text-foreground font-medium mb-3">Share your thoughts</h3>
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
                            className={`h-5 w-5 max-md:h-3.5 max-md:w-3.5 transition-colors ${
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
                    className="w-full border border-hairline p-2 text-lg max-md:text-xs bg-background placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-foreground text-background py-2 text-lg max-md:text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <p className="text-lg max-md:text-xs text-muted-foreground leading-relaxed">
                  Please log in to leave a product rating and review.
                </p>
              )}
            </div>
          </div>

          <ul className="divide-y divide-[color:var(--hairline)] bg-background border border-hairline px-6 max-md:px-4 max-h-[500px] overflow-y-auto">
            {currentReviews.map((r, index) => (
              <li key={`${r.name}-${index}`} className="py-5 first:pt-6 last:pb-6 max-md:py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-lg max-md:text-xs font-medium">{r.name}</span>
                  <span className="text-lg max-md:text-[10px] uppercase tracking-widest text-muted-foreground">Verified buyer</span>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 max-md:h-3 max-md:w-3 ${i < r.rating ? "fill-foreground" : "text-hairline"}`} />
                  ))}
                </div>
                <p className="mt-2 text-lg max-md:text-xs text-muted-foreground leading-normal">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20 max-md:mt-12">
        <h2 className="mb-6 font-display text-2xl md:text-3xl max-md:text-base max-md:mb-4">You may also like</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6">
          {randomizedCategoryProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-16 max-md:mt-10 rounded-lg bg-secondary p-8 max-md:p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Need A Hand?</p>
        <h3 className="mt-3 font-display text-2xl md:text-3xl max-md:text-xl">Not sure this is the right fit?</h3>
        <p className="mx-auto mt-2 max-w-md text-sm max-md:text-xs text-muted-foreground">
          Chat with our team for sizing advice, styling suggestions, or any questions before you buy.
        </p>
        <button
          type="button"
          onClick={handleStylistWhatsApp}
          className="mt-6 inline-flex items-center gap-2 bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.02]"
        >
          <MessageCircle className="h-4 w-4" /> Chat With Us
        </button>
      </section>

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}