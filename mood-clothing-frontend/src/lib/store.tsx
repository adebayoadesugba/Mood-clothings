import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { findProduct } from "./products";

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

type Ctx = StoreState & {
  addToCart: (id: string, color?: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  trackView: (id: string) => void;
  setUser: (u: StoreState["user"]) => void;
  logout: () => void;
  openCart: () => void; closeCart: () => void;
  openLogin: () => void; closeLogin: () => void;
  openSearch: () => void; closeSearch: () => void;
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
  const [state, setState] = useState<StoreState>(() => ({
    ...loadInitial(),
    cartOpen: false,
    loginOpen: false,
    searchOpen: false,
  }));

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ cart: state.cart, wishlist: state.wishlist, recent: state.recent, user: state.user })
      );
    } catch { /* ignore */ }
  }, [state.cart, state.wishlist, state.recent, state.user]);

  const addToCart = useCallback((id: string, color?: string, qty = 1) => {
    setState((s) => {
      const existing = s.cart.find((c) => c.id === id && c.color === color);
      const cart = existing
        ? s.cart.map((c) => (c === existing ? { ...c, qty: c.qty + qty } : c))
        : [...s.cart, { id, qty, color }];
      return { ...s, cart, cartOpen: true };
    });
  }, []);

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

  const { cartTotal, cartCount } = useMemo(() => {
    let total = 0, count = 0;
    for (const item of state.cart) {
      const p = findProduct(item.id);
      if (!p) continue;
      total += p.price * item.qty;
      count += item.qty;
    }
    return { cartTotal: total, cartCount: count };
  }, [state.cart]);

  const value: Ctx = {
    ...state,
    addToCart, removeFromCart, setQty, toggleWishlist, trackView,
    setUser, logout,
    openCart, closeCart, openLogin, closeLogin, openSearch, closeSearch,
    cartTotal, cartCount,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
