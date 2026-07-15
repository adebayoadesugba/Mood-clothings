import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { findProduct as findStaticProduct } from "./products";
import { fetchAllProducts } from "@/api"; // Integrated global backend inventory fetch call
import { convertToSlug } from "@/lib/utils"; // Import slug generator utility
import { toast } from "sonner"; // Imported toast to handle the 3-second popup alert cleanly

type CartItem = { id: string; qty: number; color?: string; size?: string };
type StoreState = {
  cart: CartItem[];
  wishlist: string[];
  recent: string[];
  user: { name: string; email: string; phone: string } | null;
  cartOpen: boolean;
  loginOpen: boolean;
  searchOpen: boolean;
};

// EXPLICITLY TYPE EXPOSE FINDPRODUCT IN THE CONTEXT OBJECT INTERFACE
type Ctx = StoreState & {
  addToCart: (id: string, color?: string, qty?: number, size?: string) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  trackView: (id: string) => void;
  setUser: (u: StoreState["user"], token?: string) => void; // <-- UPDATED METHOD TO CAPTURE JWT PASSES
  logout: () => void;
  openCart: () => void; closeCart: () => void;
  openLogin: () => void; closeLogin: () => void;
  openSearch: () => void; closeSearch: () => void;
  clearCart: () => void;
  registerLiveProducts: (products: any[]) => void; 
  findProduct: (id: string) => any; // <-- CRUCIAL TYPE HOOKUP FIXED
  refreshInventory: () => Promise<void>; // <-- NEW: EXPOSED METHOD TYPE FOR ADMIN RE-SYNCING
  PRODUCTS: any[]; 
  isLoading: boolean; // <-- NEW: EXPOSED LOADING TRACKER PARAMETER INTERFACE TYPING
  cartTotal: number;
  cartCount: number;
};

const StoreContext = createContext<Ctx | null>(null);

// USER SCOPING SEED LOGIC: Dynamically generates cache keys based on current user session context with Incognito catch blocks
function loadScopedData(email?: string): Pick<StoreState, "cart" | "wishlist" | "recent"> {
  if (typeof window === "undefined") return { cart: [], wishlist: [], recent: [] };
  try {
    const storageKey = email ? `mood-clothings-${email.trim().toLowerCase()}` : "mood-clothings-guest";
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { cart: [], wishlist: [], recent: [] };
    const parsed = JSON.parse(raw);
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
    };
  } catch (err) {
    // INCOGNITO FALLBACK: Returns empty memory profiles cleanly if browser sandboxing rejects reader privileges
    console.warn("Storage access restricted by browser isolation policies. Falling back to runtime memory layers.");
    return { cart: [], wishlist: [], recent: [] };
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // SSR Protection: Initialize with clean empty sets to guarantee initial hydration match
  const [state, setState] = useState<StoreState>({
    cart: [],
    wishlist: [],
    recent: [],
    user: null,
    cartOpen: false,
    loginOpen: false,
    searchOpen: false,
  });

  // Holds dynamic backend items fetched from MongoDB across the application instance lifecycle
  const [liveRegistry, setLiveRegistry] = useState<any[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false); // <-- CRUCIAL FIX: Session verification guard state

  // PRODUCT CACHE: lets returning visitors see products instantly instead of staring at a
  // blocking spinner on every page load — especially important while Render's free tier
  // backend is cold-starting. Cached data is shown immediately; a fresh copy is still
  // fetched quietly in the background to keep things up to date.
  const PRODUCT_CACHE_KEY = "mood-clothings-product-cache";
  const PRODUCT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const loadCachedProducts = (): any[] | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(PRODUCT_CACHE_KEY);
      if (!raw) return null;
      const { data, cachedAt } = JSON.parse(raw);
      if (!Array.isArray(data) || !cachedAt) return null;
      if (Date.now() - cachedAt > PRODUCT_CACHE_TTL) return null; // stale, ignore it
      return data;
    } catch {
      return null;
    }
  };

  const saveCachedProducts = (data: any[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }));
    } catch { /* ignore private write issues */ }
  };

  // Initialize: Load core session tokens first, then fetch the correct scoped storage profile
  useEffect(() => {
    try {
      const savedUserRaw = localStorage.getItem("mood-clothings-active-user");
      const activeUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;
      
      const scopedCache = loadScopedData(activeUser?.email);
      
      setState((s) => ({
        ...s,
        user: activeUser,
        ...scopedCache,
      }));
    } catch (err) {
      console.error("Failed initializing isolated user state environments:", err);
    } finally {
      setIsHydrated(true); // <-- System validation setup completes securely here
    }
  }, []);

  // FIXED REUSABLE INVENTORY SYNC PIPELINE: Pulls directly from MongoDB architecture.
  // `isBackground = true` means "refetch quietly without showing the loading spinner" —
  // used when we already have cached data on screen and are just refreshing it silently.
  const refreshInventory = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsInventoryLoading(true);
    try {
      const response = await fetchAllProducts();
      const dataPayload = response?.data?.data || response?.data || [];
      const arrayToMap = Array.isArray(dataPayload) ? dataPayload : [];
      
      const formatted = arrayToMap.map((p: any) => ({
        ...p,
        id: p.id || convertToSlug(p.name), // Syncs url identifier matching directly into the global array
        databaseId: p._id,
        // FIXED BADGE INTERCEPTOR: Prioritizes valid long tags array entries, otherwise safely reads p.badge text parameters
        badge: p.tags && p.tags.length > 0 && p.tags[0] !== "" ? p.tags[0] : (p.badge || null),
        colors: p.colors && p.colors.length > 0 ? p.colors : ['#000000'],
        images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518'],
        rating: p.rating || 4.5,
        reviewCount: p.reviewCount || 0,
        category: p.category || "collection",
        sub: p.sub || "all"
      }));
      setLiveRegistry(formatted);
      saveCachedProducts(formatted);
    } catch (err) {
      console.error("Global store failed to sync backend inventory:", err);
    } finally {
      if (!isBackground) setIsInventoryLoading(false);
    }
  }, []);

  // Automatically pull backend inventory on application boot to prevent loss on hard reload.
  // If a valid cached copy exists, show it immediately (no spinner) and refresh quietly
  // behind the scenes. Otherwise, fall back to the normal blocking fetch.
  useEffect(() => {
    const cached = loadCachedProducts();
    if (cached && cached.length > 0) {
      setLiveRegistry(cached);
      setIsInventoryLoading(false);
      refreshInventory(true); // silent background refresh to keep data current
    } else {
      refreshInventory(false);
    }
  }, [refreshInventory]);

  // SCOPED SYNCHRONIZATION SIDE-EFFECT: Saves records exclusively under the user's specific email key block
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return; // Avoid overwriting profiles early
    try {
      const storageKey = state.user ? `mood-clothings-${state.user.email.trim().toLowerCase()}` : "mood-clothings-guest";
      localStorage.setItem(
        storageKey,
        JSON.stringify({ cart: state.cart, wishlist: state.wishlist, recent: state.recent })
      );
    } catch { 
      console.debug("Runtime state updated in-memory (Storage writing restricted).");
    }
  }, [state.cart, state.wishlist, state.recent, state.user, isHydrated]);

  // Handles traditional backend login/register success token passes securely
  const setUser = useCallback((userProfile: StoreState["user"], token?: string) => {
    if (userProfile) {
      try {
        localStorage.setItem("mood-clothings-active-user", JSON.stringify(userProfile));
        if (token) localStorage.setItem("mood-clothings-auth-token", token);
      } catch { /* ignore private write issues */ }
      
      const userCachedData = loadScopedData(userProfile.email);
      
      setState((s) => ({
        ...s,
        user: userProfile,
        cart: userCachedData.cart,
        wishlist: userCachedData.wishlist,
        recent: userCachedData.recent,
        loginOpen: false,
      }));
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("mood-clothings-active-user");
      localStorage.removeItem("mood-clothings-auth-token");
    } catch { /* ignore private write issues */ }
    
    const guestCachedData = loadScopedData();
    setState((s) => ({
      ...s,
      user: null,
      cart: guestCachedData.cart,
      wishlist: guestCachedData.wishlist,
      recent: guestCachedData.recent,
    }));
    toast.success("Logged out safely from active session context");
  }, []);

  // Kept for backward compatibility if specific routes pass items manually
  const registerLiveProducts = useCallback((products: any[]) => {
    setLiveRegistry((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const uniqueNew = products.filter((p) => !existingIds.has(p.id));
      return [...prev, ...uniqueNew];
    });
  }, []);

  // Universal look-up pipeline that checks live registry entries (by slug or original hex ID) and static items
  const findProduct = useCallback((id: string) => {
    if (!id) return null;
    const cleanId = id.toString();
    const liveMatch = liveRegistry.find((p) => p.id === cleanId || p._id === cleanId || p.databaseId === cleanId);
    if (liveMatch) return liveMatch;
    return findStaticProduct(cleanId);
  }, [liveRegistry]);

  const addToCart = useCallback((id: string, color?: string, qty = 1, size = "M") => {
    const product = findProduct(id);
    const productName = product ? product.name : "Item";

    setState((s) => {
      const existing = s.cart.find((c) => c.id === id && c.color === color && c.size === size);
      const cart = existing
        ? s.cart.map((c) => (c === existing ? { ...c, qty: c.qty + qty } : c))
        : [...s.cart, { id, qty, color, size }];
      return { ...s, cart };
    });

    toast.success(`${productName} (Size: ${size}) has been added to cart`, {
      duration: 3000,
    });
  }, [findProduct]);

  const removeFromCart = useCallback((id: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((c) => c.id !== id) }));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setState((s) => ({
      ...s,
      cart: qty <= 0 ? s.cart.filter((c) => c.id !== id) : s.cart.map((c) => (c.id === id ? { ...c, qty } : c)),
    }));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      wishlist: s.wishlist.includes(id) ? s.wishlist.filter((x) => x !== id) : [...s.wishlist, id],
    }));
  }, []);

  const trackView = useCallback((id: string) => {
    setState((s) => ({ ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12) }));
  }, []);

  const openCart = useCallback(() => setState((s) => ({ ...s, cartOpen: true })), []);
  const closeCart = useCallback(() => setState((s) => ({ ...s, cartOpen: false })), []);
  const openLogin = useCallback(() => setState((s) => ({ ...s, loginOpen: true })), []);
  const closeLogin = useCallback(() => setState((s) => ({ ...s, loginOpen: false })), []);
  const openSearch = useCallback(() => setState((s) => ({ ...s, searchOpen: true })), []);
  const closeSearch = useCallback(() => setState((s) => ({ ...s, searchOpen: false })), []);

  const clearCart = useCallback(() => {
    setState((s) => ({ ...s, cart: [], cartOpen: false }));
  }, []);

  const { cartTotal, cartCount } = useMemo(() => {
    let total = 0, count = 0;
    for (const item of state.cart) {
      const p = findProduct(item.id);
      if (!p) continue;
      total += p.price * item.qty;
      count += item.qty;
    }
    return { cartTotal: total, cartCount: count };
  }, [state.cart, findProduct]);

  // Combined Loading Tracker Parameters: Wait until backend query AND storage reading finish together!
  const isLoadingCombined = !isHydrated || isInventoryLoading;

  const value: Ctx = {
    ...state,
    addToCart, removeFromCart, setQty, toggleWishlist, trackView,
    setUser, logout,
    openCart, closeCart, openLogin, closeLogin, openSearch, closeSearch,
    clearCart,
    registerLiveProducts,
    findProduct, 
    refreshInventory, 
    PRODUCTS: liveRegistry,
    isLoading: isLoadingCombined, // <-- NOW INCLUDES SESSION HYDRATION STATUS ACCURATELY
    cartTotal, cartCount,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}