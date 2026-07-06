import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { findProduct as findStaticProduct } from "./products";
import { fetchAllProducts } from "@/api"; // Integrated global backend inventory fetch call
import { convertToSlug } from "@/lib/utils"; // Import slug generator utility
import { toast } from "sonner"; // Imported toast to handle the 3-second popup alert cleanly

type CartItem = { id: string; qty: number; color?: string };
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
  setUser: (u: StoreState["user"]) => void;
  logout: () => void;
  openCart: () => void; closeCart: () => void;
  openLogin: () => void; closeLogin: () => void;
  openSearch: () => void; closeSearch: () => void;
  clearCart: () => void;
  registerLiveProducts: (products: any[]) => void; 
  findProduct: (id: string) => any; // <-- CRUCIAL TYPE HOOKUP FIXED
  PRODUCTS: any[]; 
  cartTotal: number;
  cartCount: number;
};

const StoreContext = createContext<Ctx | null>(null);
const KEY = "glamora-store-v1";

function loadInitial(): Pick<StoreState, "cart" | "wishlist" | "recent" | "user"> {
  if (typeof window === "undefined") return { cart: [], wishlist: [], recent: [], user: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { cart: [], wishlist: [], recent: [], user: null };
    const parsed = JSON.parse(raw);
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      user: parsed.user ?? null,
    };
  } catch {
    return { cart: [], wishlist: [], recent: [], user: null };
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

  // Safely sync localStorage cache data ONLY once the client layout safely mounts
  useEffect(() => {
    const cachedData = loadInitial();
    setState((s) => ({
      ...s,
      ...cachedData,
    }));
  }, []);

  // Automatically pull backend inventory on application boot to prevent loss on hard reload
  useEffect(() => {
    const bootstrapLiveInventory = async () => {
      try {
        const response = await fetchAllProducts();
        const formatted = response.data.data.map((p: any) => ({
          ...p,
          id: convertToSlug(p.name), // Syncs url identifier matching directly into the global array
          databaseId: p._id,
          badge: p.tags && p.tags.length > 0 ? p.tags[0] : null,
          colors: p.colors && p.colors.length > 0 ? p.colors : ['#000000'],
          images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518'],
          rating: p.rating || 4.5,
          reviewCount: p.reviewCount || 0,
          category: p.category || "collection",
          sub: p.sub || "all"
        }));
        setLiveRegistry(formatted);
      } catch (err) {
        console.error("Global store failed to sync backend inventory:", err);
      }
    };

    bootstrapLiveInventory();
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

  useEffect(() => {
    // Avoid overwriting storage blocks with fallback values before mounting has completely finished
    if (typeof window !== "undefined" && (state.cart.length > 0 || state.wishlist.length > 0 || state.recent.length > 0 || state.user)) {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ cart: state.cart, wishlist: state.wishlist, recent: state.recent, user: state.user })
        );
      } catch { /* ignore */ }
    }
  }, [state.cart, state.wishlist, state.recent, state.user]);

  const addToCart = useCallback((id: string, color?: string, qty = 1, size = "M") => {
    const product = findProduct(id);
    const productName = product ? product.name : "Item";

    setState((s) => {
      // Check match including size
      const existing = s.cart.find((c) => c.id === id && c.color === color && (c as any).size === size);
      
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

  const setUser = useCallback((user: StoreState["user"]) => setState((s) => ({ ...s, user, loginOpen: false })), []);
  const logout = useCallback(() => setState((s) => ({ ...s, user: null })), []);

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

  const value: Ctx = {
    ...state,
    addToCart, removeFromCart, setQty, toggleWishlist, trackView,
    setUser, logout,
    openCart, closeCart, openLogin, closeLogin, openSearch, closeSearch,
    clearCart,
    registerLiveProducts,
    findProduct, // <-- FIXED: INJECTED NATIVE METHOD EXPORT TO CONTEXT PROVIDER VALUE
    PRODUCTS: liveRegistry,
    cartTotal, cartCount,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}