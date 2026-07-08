import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Package, ShoppingBag, Users, LogOut, Plus, Trash2, Pencil, ChevronDown, ChevronRight, X, Upload, Palette, Download, Maximize2 } from "lucide-react";
import { PRODUCTS, CATEGORIES, SUBCATEGORIES, type Product, type Category, type SubCategory } from "@/lib/products";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Moon Clothings" },
      { name: "description", content: "Internal Moon Clothings operations console." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const ADMIN_KEY = "moon-clothings-admin-v1";
const DEMO_EMAIL = "admin@moon-clothings.com";
const DEMO_PASS = "admin123";

type AdminSession = { email: string; token: string } | null; 
type Tab = "products" | "orders" | "customers" | "designs";

type AdminProduct = Product & { _id?: string; tags: string[]; stockSizes: string[]; sold: number };

const TAG_OPTIONS = ["New Arrival", "Best Seller", "Out of Stock"];
const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

type Order = {
  id: string;
  _id?: string;
  customer: { name: string; email: string; phone: string; address: string; city?: string; zip?: string };
  items: { product: string; name: string; image: string; color: string; size: string; qty: number; price: number }[];
  total: number;
  status: "Pending Paid" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  tracking?: string;
  createdAt: string;
};

type UserDesign = {
  id: string;
  _id?: string;
  customerName: string;
  userEmail: string;
  notes: string;
  files: { name: string; url: string }[];
  status?: string;
  createdAt: string;
};

const STATUS_FLOW: Order["status"][] = ["Pending Paid", "Processing", "Shipped", "Delivered", "Cancelled"];

function seedProducts(): AdminProduct[] {
  return PRODUCTS.map((p, i) => ({
    ...p,
    _id: p.id,
    tags: [p.badge === "New" ? "New Arrival" : p.badge === "Best Seller" ? "Best Seller" : ""].filter(Boolean),
    stockSizes: ["S", "M", "L", "XL"],
    sold: 40 + ((i * 37) % 260),
  }));
}

function seedOrders(products: AdminProduct[]): Order[] {
  const names = ["Amara Okafor", "James Miller", "Sophie Laurent", "Kenji Tanaka", "Priya Shah", "Lucas Weber"];
  const cities = ["12 Bond St, London", "88 Rue de Rivoli, Paris", "45 Prince St, NYC", "9 Ginza, Tokyo", "22 MG Road, Mumbai", "3 Alexanderplatz, Berlin"];
  const statuses: Order["status"][] = ["Pending Paid", "Processing", "Shipped", "Delivered", "Processing", "Cancelled"];
  return names.map((n, i) => {
    const p = products[i % products.length];
    const p2 = products[(i + 3) % products.length];
    const items = [
      { product: p.id, name: p.name, image: p.images[0], color: p.colors[0], size: "M", qty: 1, price: p.price },
      { product: p2.id, name: p2.name, image: p2.images[0], color: p2.colors[0], size: "L", qty: 2, price: p2.price },
    ];
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    return {
      id: `GLA-${1000 + i}`,
      customer: { name: n, email: n.toLowerCase().replace(/\s+/g, ".") + "@mail.com", phone: `+1 555 010${i}${i}${i}`, address: cities[i] },
      items, total, status: statuses[i],
      tracking: statuses[i] === "Shipped" || statuses[i] === "Delivered" ? `TRK${800000 + i * 137}` : undefined,
      createdAt: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
    };
  });
}

function seedUserDesigns(): UserDesign[] {
  return [
    {
      id: "DSN-4001",
      customerName: "Tunde Bakare",
      userEmail: "tunde@bakaredigital.com",
      createdAt: "2026-07-04",
      notes: "I want this specific vintage wash denim block tailored with custom embroidery on the back panel. Please ensure the structural heavy canvas feels thick and matching industrial zippers are mounted along the seams.",
      files: [
        { name: "atelier-sketch-front.png", url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500" },
        { name: "fabric-texture-moodboard.jpg", url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=500" }
      ]
    },
    {
      id: "DSN-4002",
      customerName: "Chidi Collins",
      userEmail: "chidi.collins@creative.ng",
      createdAt: "2026-07-02",
      notes: "Oversized silhouette tracksuit drop mock style. Attach the custom logo patch on the left chest plate. Let the inner fleece matching layer stay soft cream white.",
      files: [
        { name: "sketch.png", url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500" },
        { name: "mockup.png", url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500" },
        { name: "blueprint.png", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" }
      ]
    }
  ];
}

function AdminPage() {
  const [session, setSession] = useState<AdminSession>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<AdminProduct[]>(() => seedProducts());
  const [orders, setOrders] = useState<Order[]>(() => seedOrders(seedProducts()));
  const [designs, setDesigns] = useState<UserDesign[]>(() => seedUserDesigns());

  const { refreshInventory } = useStore();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.email) {
          setSession(parsed);
        } else {
          setSession(null);
        }
      }
    } catch { 
      setSession(null);
    }
    setReady(true);
  }, []);

  const login = async (email: string, pass: string) => {
    const AUTH_API_URL = "http://localhost:5000/api/auth/login";
    
    try {
      const res = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pass })
      });

      const responseText = await res.text();
      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("The authentication server route layout path could not be found (404). Check your backend server URL routing.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Invalid administrative credentials.");
      }
      
      // Isolate the user values accurately matching data layout payloads
      const profileData = data.data || data.user || data;

      // FIXED: Validates based on your Mongoose schema string enum "role" definition directly
      if (profileData?.role !== "admin" && data.user?.role !== "admin" && data.data?.role !== "admin") {
        throw new Error("Access denied: This profile is not authorized as an administrative workspace controller.");
      }

      const sessionData = { 
        email: profileData.email, 
        token: data.token 
      };
      
      localStorage.setItem(ADMIN_KEY, JSON.stringify(sessionData));
      setSession(sessionData);
      toast.success("Authorized: Signed in securely to admin panel");
    } catch (err: any) {
      console.error("Authentication handshake failure:", err);
      toast.error(err.message || "Unable to verify administrative credentials.");
    }
  };

  const logout = () => { 
    localStorage.removeItem(ADMIN_KEY); 
    setSession(null); 
    toast.success("Administrative session closed safely.");
  };

  if (!ready) return <div className="min-h-screen bg-background" />;
  
  if (!session || !session.token) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground text-lg">
      <div className="flex h-full">
        <aside className="hidden h-full w-60 shrink-0 border-r border-hairline bg-background md:block relative">
          <div className="border-b border-hairline p-6">
            <Link to="/" className="font-display text-xl">Moon Clothings</Link>
            <p className="mt-1 text-lg uppercase tracking-widest text-muted-foreground">Admin Console</p>
          </div>
          <nav className="p-3">
            {[
              { id: "products", label: "Products", icon: Package },
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "customers", label: "Customers", icon: Users },
              { id: "designs", label: "User Designs", icon: Palette },
            ].map((it) => {
              const Icon = it.icon;
              const active = tab === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setTab(it.id as Tab)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-lg transition-colors ${active ? "bg-foreground text-background" : "hover:bg-secondary"}`}
                >
                  <Icon className="h-5 w-5" />
                  {it.label}
                </button>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-hairline p-4 bg-background">
            <p className="truncate text-lg text-muted-foreground">{session.email}</p>
            <button onClick={logout} className="mt-2 flex items-center gap-2 text-xs uppercase tracking-widest hover:underline">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="flex items-center justify-between border-b border-hairline bg-background px-6 py-4 md:py-6">
            <span className="font-display text-xl capitalize">{tab === "designs" ? "User Designs" : `${tab} Management`}</span>
            <select value={tab} onChange={(e) => setTab(e.target.value as Tab)} className="border border-hairline bg-background px-2 py-1 text-lg md:hidden">
              <option value="products">Products</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
              <option value="designs">User Designs</option>
            </select>
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {tab === "products" && <ProductsModule sessionToken={session.token} products={products} setProducts={setProducts} refreshInventory={refreshInventory} />}
            {tab === "orders" && <OrdersModule sessionToken={session.token} orders={orders} setOrders={setOrders} />}
            {tab === "customers" && <CustomersModule sessionToken={session.token} orders={orders} />}
            {tab === "designs" && <DesignsModule sessionToken={session.token} designs={designs} setDesigns={setDesigns} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (email: string, pass: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div className="grid min-h-screen place-items-center bg-secondary p-4 text-lg">
      <form
        onSubmit={(e) => { e.preventDefault(); onLogin(email, pass); }}
        className="w-full max-w-sm border border-hairline bg-background p-8"
      >
        <h1 className="font-display text-3xl">Admin Sign In</h1>
        <p className="mt-2 text-lg text-muted-foreground">Restricted area. Authorized personnel only.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-lg uppercase tracking-widest text-muted-foreground">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-lg outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="text-lg uppercase tracking-widest text-muted-foreground">Password</label>
            <input required type="password" value={pass} onChange={(e) => setPass(e.target.value)}
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-lg outline-none focus:border-foreground" />
          </div>
        </div>
        <button className="mt-8 w-full bg-foreground py-3 text-lg uppercase tracking-widest text-background">Sign in</button>
        <p className="mt-4 text-center text-lg text-muted-foreground">Secured🔒</p>
      </form>
    </div>
  );
}

function emptyProduct(): AdminProduct {
  return {
    id: "", name: "", price: 0, category: "men", sub: "shirt",
    colors: [], images: [],
    rating: 5, reviewCount: 0, description: "", tags: [], stockSizes: ["S", "M", "L"], sold: 0,
  };
}

function ProductsModule({ sessionToken, products, setProducts, refreshInventory }: { sessionToken: string; products: AdminProduct[]; setProducts: (p: AdminProduct[]) => void; refreshInventory: () => Promise<void> }) {
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const API_BASE_URL = "http://localhost:5000/api/products"; 

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionToken || ""}`
    };
  };

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await fetch(API_BASE_URL, {
          headers: { "Authorization": getAuthHeaders()["Authorization"] }
        });
        if (!res.ok) throw new Error("Network status validation error");
        const rawJson = await res.json();
        
        const verifiedArray = Array.isArray(rawJson) 
          ? rawJson 
          : Array.isArray(rawJson.data) 
            ? rawJson.data 
            : Array.isArray(rawJson.data?.data) 
              ? rawJson.data.data 
              : [];
              
        const standardized = verifiedArray.map((item: any) => ({
          ...item,
          id: item.id || item._id, 
          tags: Array.isArray(item.tags) && item.tags.length > 0 
            ? [item.tags[0] === "New" ? "New Arrival" : item.tags[0]]
            : [item.badge === "New" ? "New Arrival" : item.badge === "Best Seller" ? "Best Seller" : ""].filter(Boolean)
        }));
        setProducts(standardized);
      } catch (err) {
        console.error("Global store failed to sync backend inventory:", err);
        toast.error("Could not sync live catalog data.");
      }
    };
    fetchLiveProducts();
  }, [setProducts]);

  const save = async (p: AdminProduct) => {
    if (!p.name?.trim()) { toast.error("Product Title is missing!"); return; }
    if (!p.description?.trim()) { toast.error("Product Description Brief is missing!"); return; }
    if (!p.price || p.price <= 0) { toast.error("Base Price must be greater than $0!"); return; }
    if (!p.images || p.images.length === 0) { toast.error("At least one Product Image is required!"); return; }
    if (!p.colors || p.colors.length === 0) { toast.error("At least one Color Swatch is required!"); return; }
    if (!p.stockSizes || p.stockSizes.length === 0) { toast.error("At least one Available Size Parameter must be selected!"); return; }
    
    let mappedMongooseTag = "";
    if (p.tags?.includes("New Arrival")) {
      mappedMongooseTag = "New";
    } else if (p.tags?.includes("Best Seller")) {
      mappedMongooseTag = "Best Seller";
    } else if (p.tags?.includes("Out of Stock")) {
      mappedMongooseTag = "Out of Stock";
    }

    const clientSideSlugId = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const normalizedPayload = {
      id: p.id || clientSideSlugId, 
      name: p.name.trim(),
      description: p.description.trim(),
      price: Number(p.price),
      category: p.category || "men",
      sub: p.sub || "shirt",
      colors: p.colors,
      images: p.images,
      stockSizes: p.stockSizes,
      badge: mappedMongooseTag,
      tags: mappedMongooseTag ? [mappedMongooseTag] : [], 
      rating: p.rating || 5,         
      reviewCount: p.reviewCount || 0, 
      sold: p.sold || 0              
    };

    const targetId = p._id || p.id;
    const isNew = !targetId || targetId.length < 5; 
    
    try {
      if (isNew) {
        const res = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(normalizedPayload), 
        });
        
        if (!res.ok) throw new Error("Failed validation parameter creation pass");
        const json = await res.json();
        const savedItem = { ...json.data, id: json.data.id || json.data._id, _id: json.data._id, tags: p.tags };
        
        setProducts([savedItem, ...products]);
        toast.success("Product created successfully in database");
      } else {
        const res = await fetch(`${API_BASE_URL}/${targetId}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(normalizedPayload), 
        });
        
        if (!res.ok) throw new Error("Failed validation parameter mutation update pass");
        const json = await res.json();
        const updatedItem = { ...json.data, id: json.data.id || json.data._id, _id: json.data._id, tags: p.tags };
        
        const copy = [...products];
        const idx = products.findIndex((x) => (x._id === targetId || x.id === targetId));
        if (idx >= 0) copy[idx] = updatedItem;
        
        setProducts(copy);
        toast.success("Product properties updated in database");
      }
      
      if (refreshInventory) {
        await refreshInventory();
      }
      setEditing(null);
    } catch (err) {
      console.error("Failed executing dynamic asset payload synchronization script", err);
      toast.error("Unable to save changes. Please try again.");
    }
  };

  const remove = async (id: string) => {
    if (window.confirm("Are you certain you want to completely drop this item out of the active store inventory database?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
          headers: { "Authorization": getAuthHeaders()["Authorization"] }
        });
        
        if (!res.ok) throw new Error("Failed drop execution context deletion command");
        
        setProducts(products.filter((p) => p._id !== id && p.id !== id));
        toast.success("Product deleted successfully from database");
        
        if (refreshInventory) {
          await refreshInventory();
        }
      } catch (err) {
        console.error("Failed dropping product out of MongoDB cluster collections", err);
        toast.error("Could not remove catalog item reference.");
      }
    }
  };

  return (
    <div className="h-full flex flex-col text-lg">
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-lg text-muted-foreground">{products.length} items in catalog.</p>
        </div>
        <button onClick={() => setEditing(emptyProduct())} className="flex items-center gap-2 bg-foreground px-4 py-2.5 text-lg uppercase tracking-widest text-background">
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="flex-1 overflow-y-auto border border-hairline bg-background max-h-[calc(100vh-220px)]">
        <table className="w-full text-lg table-auto">
          <thead className="bg-secondary text-left text-lg uppercase tracking-widest text-muted-foreground sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] bg-secondary">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active Sizes</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {products.map((p) => {
              const displayId = p._id || p.id;
              return (
                <tr key={displayId} className="hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0] || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100"} alt={p.name} className="h-14 w-12 object-cover shrink-0" loading="lazy" />
                      <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-lg">{p.category} · {p.sub}</td>
                  <td className="px-4 py-3 font-medium">${p.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.stockSizes?.map((s) => (
                        <span key={s} className="bg-secondary px-2 py-1 text-lg font-bold border border-hairline">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditing(p)} className="flex items-center gap-1 border border-hairline px-3 py-1.5 text-lg hover:bg-secondary"><Pencil className="h-4 w-4" /> Edit</button>
                      <button onClick={() => remove(displayId)} className="flex items-center gap-1 border border-hairline px-3 py-1.5 text-lg text-destructive hover:bg-secondary"><Trash2 className="h-4 w-4" /> Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function ProductForm({ initial, onClose, onSave }: { initial: AdminProduct; onClose: () => void; onSave: (p: AdminProduct) => void }) {
  const [p, setP] = useState<AdminProduct>(initial);
  const [colorInput, setColorInput] = useState("#000000");
  const [imageUrlInput, setImageUrlInput] = useState("");

  const toggleTag = (t: string) => setP({ ...p, tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t] });
  const addColor = () => { if (!/^#[0-9a-fA-F]{6}$/.test(colorInput)) return; if (p.colors.includes(colorInput)) return; setP({ ...p, colors: [...p.colors, colorInput] }); };
  const removeColor = (c: string) => setP({ ...p, colors: p.colors.filter((x) => x !== c) });
  
  const toggleSizeSelection = (size: string) => {
    const nextSizes = p.stockSizes.includes(size)
      ? p.stockSizes.filter((s) => s !== size)
      : [...p.stockSizes, size];
    setP({ ...p, stockSizes: nextSizes });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const newImageUrls = filesArray.map((file) => URL.createObjectURL(file));
    setP((prev) => ({
      ...prev,
      images: [...prev.images, ...newImageUrls],
    }));
    toast.success(`Loaded ${filesArray.length} product gallery asset resources successfully.`);
  };

  const handleImageUrlAdd = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith("http://") && !imageUrlInput.startsWith("https://")) {
      toast.error("Please enter a valid absolute image image URL address path string (starting with http/https)");
      return;
    }
    setP((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    imageUrlInput;
    setImageUrlInput("");
    toast.success("Web graphic canvas link appended to item array.");
  };

  const removeImage = (indexToRemove: number) => {
    setP((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 p-4 text-lg" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="mx-auto mt-8 max-w-2xl bg-background p-8 border border-hairline shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl">{initial._id || initial.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-6 w-6" /></button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Product Title" className="col-span-2">
            <input 
              value={p.name} 
              onChange={(e) => setP({ ...p, name: e.target.value })} 
              className="w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background focus:border-foreground outline-none text-lg text-foreground mt-1 font-medium"
              placeholder="Enter product title here..." 
            />
          </Field>
          
          <Field label="Product Description Brief" className="col-span-2">
            <textarea 
              value={p.description} 
              onChange={(e) => setP({ ...p, description: e.target.value })} 
              rows={3} 
              placeholder="Describe the fabric silhouette details, tailoring, and specifications details..."
              className="mt-1 w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background text-lg outline-none focus:border-foreground resize-none text-foreground placeholder:text-muted-foreground" 
            />
          </Field>

          <Field label="Base Price ($)">
            <input type="number" min={0} value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} className="w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background text-lg outline-none focus:border-foreground mt-1" />
          </Field>
          <Field label="Category">
            <select value={p.category} onChange={(e) => setP({ ...p, category: e.target.value as Category })} className="w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background text-lg outline-none focus:border-foreground mt-1 h-[46px]">
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              <option value="unisex">Unisex</option>
            </select>
          </Field>
          <Field label="Subcategory" className="col-span-2 md:col-span-1">
            <select value={p.sub} onChange={(e) => setP({ ...p, sub: e.target.value as SubCategory })} className="w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background text-lg outline-none focus:border-foreground mt-1 h-[46px]">
              {SUBCATEGORIES.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <p className="text-lg uppercase tracking-widest text-muted-foreground mb-2">Product Image Gallery Manager</p>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-foreground/30 p-6 bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors h-36">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-lg text-muted-foreground font-medium uppercase tracking-wider">Upload Device File</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            
            <div className="flex flex-col justify-center border-2 border-dashed border-foreground/30 p-4 bg-secondary/20 h-36">
              <label className="text-lg text-muted-foreground font-medium uppercase tracking-wider mb-2 block">Or Add Image via URL Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={imageUrlInput} 
                  onChange={(e) => setImageUrlInput(e.target.value)} 
                  placeholder="https://example.com/image.jpg" 
                  className="flex-1 border-2 border-foreground/30 rounded px-2 py-1 bg-background text-lg outline-none focus:border-foreground"
                />
                <button type="button" onClick={handleImageUrlAdd} className="bg-foreground text-background px-3 py-1 text-lg uppercase tracking-wider font-semibold rounded hover:opacity-90">Add</button>
              </div>
            </div>
          </div>
          
          {p.images?.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {p.images.map((imgSrc, idx) => (
                <div key={idx} className="relative aspect-[4/5] bg-secondary border border-hairline group">
                  <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                  
                  {idx === 0 ? (
                    <span className="absolute top-1 left-1 bg-foreground text-background text-lg tracking-widest uppercase px-2 py-0.5 font-bold shadow-md">
                      Main Image
                    </span>
                  ) : (
                    <span className="absolute top-1 left-1 bg-background/80 text-foreground text-lg tracking-widest uppercase px-2 py-0.5 font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                      Gallery ({idx})
                    </span>
                  )}
                  
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)} 
                    className="absolute top-1 right-1 bg-background border border-hairline p-1 rounded-full shadow-md text-destructive hover:scale-105 transition-transform"
                    aria-label="Remove Image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-lg uppercase tracking-widest text-muted-foreground">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => {
              const on = p.tags.includes(t);
              return (
                <button type="button" key={t} onClick={() => toggleTag(t)} className={`border-2 px-3 py-1.5 text-lg ${on ? "border-foreground bg-foreground text-background" : "border-foreground/30 hover:bg-secondary"}`}>{t}</button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-lg uppercase tracking-widest text-muted-foreground">Color Swatches</p>
          <div className="mt-2 flex items-center gap-2">
            <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="h-11 w-14 border-2 border-foreground/30 rounded bg-background" />
            <input value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background text-lg outline-none focus:border-foreground flex-1" />
            <button type="button" onClick={addColor} className="border-2 border-foreground px-4 py-2 text-lg uppercase tracking-widest font-semibold hover:bg-foreground hover:text-background">Add</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.colors?.map((c) => (
              <button type="button" key={c} onClick={() => removeColor(c)} title={`Remove ${c}`} className="flex items-center gap-1 border border-hairline p-1 text-lg">
                <span className="inline-block h-6 w-6" style={{ background: c }} />
                <span className="px-1">{c}</span><X className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-lg uppercase tracking-widest text-muted-foreground mb-2">Available Size Parameters Matrix Selection</p>
          <div className="flex gap-3">
            {SIZE_OPTIONS.map((sizeOption) => {
              const isChecked = p.stockSizes?.includes(sizeOption);
              return (
                <button
                  type="button"
                  key={sizeOption}
                  onClick={() => toggleSizeSelection(sizeOption)}
                  className={`h-12 w-16 border-2 text-lg transition-all font-bold flex items-center justify-center ${
                    isChecked 
                      ? "border-foreground bg-foreground text-background scale-[1.03]" 
                      : "border-foreground/30 bg-transparent hover:border-foreground text-muted-foreground"
                  }`}
                >
                  {sizeOption}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="border-2 border-foreground/30 px-5 py-2.5 text-lg uppercase tracking-widest hover:bg-secondary">Cancel</button>
          <button type="button" onClick={() => onSave(p)} className="bg-foreground px-5 py-2.5 text-lg uppercase tracking-widest text-background font-semibold">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="text-lg uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function OrdersModule({ sessionToken, orders, setOrders }: { sessionToken: string; orders: Order[]; setOrders: (o: Order[]) => void }) {
  const [tab, setTab] = useState<"all" | "pending" | "settled">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const API_ORDERS_URL = "http://localhost:5000/api/orders";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${sessionToken}`
  });

  useEffect(() => {
    const fetchLiveOrders = async () => {
      try {
        const res = await fetch(API_ORDERS_URL, { headers: { "Authorization": `Bearer ${sessionToken}` } });
        if (!res.ok) throw new Error("Order parameters validation error");
        const json = await res.json();
        const payload = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
        
        const standardized = payload.map((o: any) => ({
          ...o,
          id: o.id || o._id,
          createdAt: o.createdAt ? o.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
        }));
        if (standardized.length > 0) setOrders(standardized);
      } catch (err) {
        console.error("Failed pulling logs from backend MongoDB databases cluster:", err);
      }
    };
    fetchLiveOrders();
  }, [setOrders, sessionToken]);

  const filtered = useMemo(() => {
    if (tab === "pending") return orders.filter((o) => o.status === "Pending Paid" || o.status === "Processing");
    if (tab === "settled") return orders.filter((o) => o.status === "Delivered");
    return orders;
  }, [orders, tab]);

  const update = async (id: string, patch: Partial<Order>) => {
    const targetId = orders.find(o => o.id === id)?._id || id;
    try {
      const res = await fetch(`${API_ORDERS_URL}/${targetId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(patch)
      });
      if (!res.ok) throw new Error("Modification write check rejected.");
      setOrders(orders.map((o) => (o.id === id ? { ...o, ...patch } : o)));
      toast.success("Order metrics tracking status mutation synchronized with database layers.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to alter pipeline parameters on backend MongoDB fields.");
    }
  };

  return (
    <div className="h-full flex flex-col text-lg">
      <div className="shrink-0">
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="mt-1 text-lg text-muted-foreground">{orders.length} total.</p>

        <div className="mt-6 flex gap-1 border-b border-hairline">
          {([["all", "All Orders"], ["pending", "Pending Fulfillment"], ["settled", "Settled"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-lg uppercase tracking-widest ${tab === id ? "border-b-2 border-foreground font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 border border-hairline max-h-[calc(100vh-250px)] divide-y divide-hairline bg-background">
        {filtered.map((o) => {
          const open = openId === o.id;
          return (
            <div key={o.id} className="border-hairline">
              <button onClick={() => setOpenId(open ? null : o.id)} className="grid w-full grid-cols-6 items-center gap-4 px-4 py-4 text-left text-lg hover:bg-secondary/30">
                {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <span className="font-medium tracking-wide truncate">{o.id}</span>
                <span className="truncate">{o.customer.name}</span>
                <span className="text-muted-foreground text-lg font-mono">{o.createdAt}</span>
                <span className="font-medium font-mono">${o.total}</span>
                <span className={`justify-self-end text-lg px-2 py-0.5 uppercase tracking-widest font-medium border ${o.status === "Cancelled" ? "border-destructive/40 text-destructive bg-destructive/5" : "border-hairline bg-secondary"}`}>{o.status}</span>
              </button>
              {open && (
                <div className="grid gap-6 border-t border-hairline bg-secondary/20 p-6 md:grid-cols-2">
                  <div>
                    <p className="text-lg uppercase tracking-widest text-muted-foreground font-medium">Customer Information</p>
                    <div className="mt-2 border border-hairline bg-background p-4 text-lg leading-relaxed">
                      <p className="font-medium text-xl">{o.customer.name}</p>
                      <p className="text-muted-foreground text-lg mt-1">{o.customer.address} {o.customer.city || ""} {o.customer.zip || ""}</p>
                      <p className="mt-3 text-lg border-t border-hairline/60 pt-2"><span className="text-muted-foreground">Email:</span> {o.customer.email}</p>
                      <p className="text-lg font-medium mt-1"><span className="text-lg text-muted-foreground font-normal">Phone:</span> {o.customer.phone}</p>
                      {o.customer.phone2 && <p className="text-lg font-medium mt-1"><span className="text-lg text-muted-foreground font-normal">Alt Phone:</span> {o.customer.phone2}</p>}
                    </div>
                    <div className="mt-4">
                      <label className="text-lg uppercase tracking-widest text-muted-foreground font-medium">Fulfillment Status Pipeline Route</label>
                      <select value={o.status} onChange={(e) => update(o.id, { status: e.target.value as Order["status"] })}
                        className="mt-1 w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background text-lg outline-none focus:border-foreground">
                        {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className="text-lg uppercase tracking-widest text-muted-foreground font-medium">Tracking Reference Parameter</label>
                      <input value={o.tracking || ""} onChange={(e) => update(o.id, { tracking: e.target.value })}
                        placeholder="e.g. TRK123456"
                        className="mt-1 w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background text-lg outline-none focus:border-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg uppercase tracking-widest text-muted-foreground font-medium">Itemization Grid Breakdown</p>
                    <div className="mt-2 space-y-3">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex gap-4 border border-hairline bg-background p-4">
                          <img src={it.image} alt={it.name} className="h-28 w-22 object-cover shrink-0 border border-hairline" loading="lazy" />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <p className="font-medium text-lg tracking-wide text-foreground truncate">{it.name}</p>
                              <div className="mt-2 flex items-center gap-3 text-lg">
                                <span className="text-lg text-muted-foreground flex items-center gap-1">
                                  Swatch: <span className="inline-block h-4 w-4 border border-hairline rounded-full" style={{ background: it.color }} />
                                </span>
                                <span className="font-bold text-foreground bg-secondary px-2 py-0.5 border border-hairline text-lg">
                                  Size: {it.size}
                                </span>
                                <span className="font-semibold text-foreground font-mono">
                                  Qty: {it.qty}
                                </span>
                              </div>
                            </div>
                            <p className="font-mono text-lg font-medium border-t border-hairline/50 pt-1.5 mt-2">${it.price * it.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomersModule({ orders }: { orders: Order[] }) {
  const map = new Map<string, { name: string; email: string; phone: string; orders: number; spent: number }>();
  for (const o of orders) {
    const c = map.get(o.customer.email) || { name: o.customer.name, email: o.customer.email, phone: o.customer.phone, orders: 0, spent: 0 };
    c.orders += 1; 
    c.spent += o.total;
    map.set(o.customer.email, c);
  }
  const list = Array.from(map.values());
  return (
    <div className="h-full flex flex-col text-lg">
      <div className="shrink-0 mb-6">
        <h1 className="font-display text-3xl">Customers</h1>
        <p className="mt-1 text-lg text-muted-foreground">{list.length} customers on file.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto border border-hairline bg-background max-h-[calc(100vh-220px)]">
        <table className="w-full text-lg table-auto">
          <thead className="bg-secondary text-left text-lg uppercase tracking-widest text-muted-foreground sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] bg-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {list.map((c) => (
              <tr key={c.email} className="hover:bg-secondary/20">
                <td className="px-4 py-3 font-medium text-lg">{c.name}</td>
                <td className="px-4 py-3 text-lg text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-lg tracking-wide">{c.phone}</td>
                <td className="px-4 py-3 font-mono">{c.orders}</td>
                <td className="px-4 py-3 font-medium font-mono text-foreground">${c.spent.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DesignsModule({ sessionToken, designs, setDesigns }: { sessionToken: string; designs: UserDesign[]; setDesigns: (d: UserDesign[]) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const API_DESIGNS_URL = "http://localhost:5000/api/custom-designs";

  useEffect(() => {
    const fetchLiveDesigns = async () => {
      try {
        const res = await fetch(API_DESIGNS_URL, { headers: { "Authorization": `Bearer ${sessionToken}` } });
        if (!res.ok) throw new Error("Designs loading network check rejected.");
        const json = await res.json();
        const payload = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
        
        const standardized = payload.map((d: any) => ({
          id: d.id || d._id,
          _id: d._id,
          customerName: d.customerName || "Bespoke Customer",
          userEmail: d.userEmail || d.email || "",
          notes: d.notes || d.note || "",
          files: Array.isArray(d.files) ? d.files : Array.isArray(d.images) ? d.images.map((img: string) => ({ name: "Asset Reference", url: img })) : [],
          status: d.status || "Received",
          createdAt: d.createdAt ? d.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
        }));
        if (standardized.length > 0) setDesigns(standardized);
      } catch (err) {
        console.error("Failed pulling logged Atelier briefs from MongoDB:", err);
      }
    };
    fetchLiveDesigns();
  }, [setDesigns, sessionToken]);

  const updateBriefStatus = async (id: string, newStatus: string) => {
    const targetId = designs.find(d => d.id === id)?._id || id;
    try {
      const res = await fetch(`${API_DESIGNS_URL}/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Atelier state mutation error.");
      setDesigns(designs.map(d => d.id === id ? { ...d, status: newStatus } : d));
      toast.success("Design brief process parameters updated across collections.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to alter Atelier process tracking markers.");
    }
  };

  const removeDesign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Drop this custom brief file permanently from active server databases?")) return;
    const targetId = designs.find(d => d.id === id)?._id || id;
    try {
      const res = await fetch(`${API_DESIGNS_URL}/${targetId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      if (!res.ok) throw new Error("Atelier drop call rejected.");
      setDesigns(designs.filter((d) => d.id !== id));
      toast.success("Design custom item record removed");
    } catch (err) {
      console.error(err);
      toast.error("Unable to prune selected document reference link.");
    }
  };

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `MoonClothing-DesignAsset-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloading full resolution project canvas asset");
  };

  return (
    <div className="h-full flex flex-col text-lg">
      <div className="shrink-0 mb-6">
        <h1 className="font-display text-3xl">User Designs</h1>
        <p className="mt-1 text-lg text-muted-foreground">{designs.length} submissions from the Atelier Custom suite.</p>
      </div>

      <div className="flex-1 overflow-y-auto border border-hairline divide-y divide-hairline bg-background max-h-[calc(100vh-220px)]">
        {designs.map((d) => {
          const open = openId === d.id;
          return (
            <div key={d.id} className="border-hairline">
              <div 
                onClick={() => setOpenId(open ? null : d.id)} 
                className="grid w-full grid-cols-5 items-center gap-4 px-4 py-4 text-left text-lg hover:bg-secondary/30 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <span className="font-medium tracking-wide truncate">{d.id}</span>
                </div>
                <span className="truncate font-medium">{d.customerName}</span>
                <span className="text-muted-foreground text-lg font-mono">{d.createdAt}</span>
                <div className="justify-self-end col-span-2 flex items-center gap-4">
                  <span className="text-lg text-muted-foreground bg-secondary px-2 py-0.5 border border-hairline font-mono">{d.files.length} Canvas Attachments</span>
                  <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 border border-hairline bg-background">{d.status || "Received"}</span>
                  <button onClick={(e) => removeDesign(d.id, e)} className="p-1 text-muted-foreground hover:text-destructive transition-colors z-10" aria-label="Delete entry"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              {open && (
                <div className="grid gap-6 border-t border-hairline bg-secondary/10 p-6 md:grid-cols-[1fr_320px]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg uppercase tracking-widest text-muted-foreground font-medium mb-2">Long Specifications Note</p>
                      <div className="bg-background border border-hairline p-4 text-lg leading-relaxed whitespace-pre-wrap font-sans text-foreground select-text max-h-60 overflow-y-auto">
                        {d.notes}
                      </div>
                    </div>

                    <div>
                      <p className="text-lg uppercase tracking-widest text-muted-foreground font-medium mb-2">Attached Image Files (Up to 6 Assets - Click to Expand &amp; Download)</p>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                        {d.files.map((fileObj, i) => (
                          <div key={i} className="relative aspect-square bg-secondary border border-hairline overflow-hidden group shadow-sm cursor-pointer" onClick={() => setLightboxImage(fileObj.url)}>
                            <img src={fileObj.url} alt={fileObj.name || `User Attachment ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                            <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="bg-background/90 text-foreground p-1.5 shadow-md border border-hairline rounded-full hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); setLightboxImage(fileObj.url); }}><Maximize2 className="h-4 w-4" /></span>
                              <span className="bg-background/90 text-foreground p-1.5 shadow-md border border-hairline rounded-full hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); downloadImage(fileObj.url); }}><Download className="h-4 w-4" /></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-lg uppercase tracking-widest text-muted-foreground font-medium">User Contact Signature</p>
                      <div className="mt-2 border border-hairline bg-background p-4 text-lg leading-relaxed">
                        <p className="font-semibold text-xl text-foreground">{d.customerName}</p>
                        <p className="text-muted-foreground text-lg mt-1 font-mono break-all">{d.userEmail}</p>
                        <div className="mt-4 border-t border-hairline/60 pt-3">
                          <button onClick={() => window.location.href = `mailto:${d.userEmail}?subject=Moon%20Clothings%20-%20Regarding%20Your%20Custom%20Design%20${d.id}`} className="w-full bg-foreground text-background text-lg uppercase tracking-widest py-2 text-center transition-opacity hover:opacity-90">Open Mail Dialog</button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-lg uppercase tracking-widest text-muted-foreground font-medium">Brief Workflow Matrix Status</label>
                      <select value={d.status || "Received"} onChange={(e) => updateBriefStatus(d.id, e.target.value)}
                        className="mt-1 w-full border-2 border-foreground/30 rounded px-3 py-2 bg-background text-lg outline-none focus:border-foreground">
                        <option value="Received">Received</option>
                        <option value="Under Atelier Review">Under Atelier Review</option>
                        <option value="Quote Issued">Quote Issued</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {designs.length === 0 && (
          <div className="p-8 text-center text-lg text-muted-foreground">No design commissions logged in workspace yet.</div>
        )}
      </div>

      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-foreground/95 backdrop-blur-md flex flex-col items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-4 right-4 bg-background text-foreground border border-hairline rounded-full p-2 hover:scale-105 transition-transform" onClick={() => setLightboxImage(null)} aria-label="Close Lightbox"><X className="h-6 w-6" /></button>
          <div className="relative max-w-4xl max-h-[80vh] bg-background border border-hairline shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt="Expanded Canvas Blueprint View" className="w-full max-h-[75vh] object-contain block bg-secondary" />
            <div className="border-t border-hairline p-3 flex justify-between items-center bg-background">
              <span className="text-lg text-muted-foreground font-mono">Blueprint Canvas Mode</span>
              <button onClick={() => downloadImage(lightboxImage)} className="flex items-center gap-1.5 bg-foreground text-background text-lg uppercase tracking-widest px-4 py-2 font-medium hover:opacity-90 transition-opacity"><Download className="h-4 w-4" /> Download High Res File</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}