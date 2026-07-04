import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Package, ShoppingBag, Users, LogOut, Plus, Trash2, Pencil, ChevronDown, ChevronRight, X, Upload } from "lucide-react";
import { PRODUCTS, CATEGORIES, SUBCATEGORIES, type Product, type Category, type SubCategory } from "@/lib/products";
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

type AdminSession = { email: string } | null;
type Tab = "products" | "orders" | "customers";

type AdminProduct = Product & { tags: string[]; stockSizes: string[]; sold: number };

const TAG_OPTIONS = ["New Arrival", "Best Seller", "Out of Stock"];
const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

type Order = {
  id: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: { id: string; name: string; image: string; color: string; size: string; qty: number; price: number }[];
  total: number;
  status: "Pending Paid" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  tracking?: string;
  createdAt: string;
};

const STATUS_FLOW: Order["status"][] = ["Pending Paid", "Processing", "Shipped", "Delivered", "Cancelled"];

function seedProducts(): AdminProduct[] {
  return PRODUCTS.map((p, i) => ({
    ...p,
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
      { id: p.id, name: p.name, image: p.images[0], color: p.colors[0], size: "M", qty: 1, price: p.price },
      { id: p2.id, name: p2.name, image: p2.images[0], color: p2.colors[0], size: "L", qty: 2, price: p2.price },
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

function AdminPage() {
  const [session, setSession] = useState<AdminSession>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<AdminProduct[]>(() => seedProducts());
  const [orders, setOrders] = useState<Order[]>(() => seedOrders(seedProducts()));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const login = (email: string, pass: string) => {
    if (email.trim().toLowerCase() === DEMO_EMAIL && pass === DEMO_PASS) {
      const s = { email: email.trim().toLowerCase() };
      localStorage.setItem(ADMIN_KEY, JSON.stringify(s));
      setSession(s);
      toast.success("Signed in to admin");
    } else {
      toast.error("Invalid credentials");
    }
  };
  const logout = () => { localStorage.removeItem(ADMIN_KEY); setSession(null); };

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!session) return <LoginScreen onLogin={login} />;

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full">
        <aside className="hidden h-full w-60 shrink-0 border-r border-hairline bg-background md:block relative">
          <div className="border-b border-hairline p-6">
            <Link to="/" className="font-display text-xl">Moon Clothings</Link>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Admin Console</p>
          </div>
          <nav className="p-3">
            {[
              { id: "products", label: "Products", icon: Package },
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "customers", label: "Customers", icon: Users },
            ].map((it) => {
              const Icon = it.icon;
              const active = tab === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setTab(it.id as Tab)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors ${active ? "bg-foreground text-background" : "hover:bg-secondary"}`}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </button>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-hairline p-4 bg-background">
            <p className="truncate text-xs text-muted-foreground">{session.email}</p>
            <button onClick={logout} className="mt-2 flex items-center gap-2 text-xs uppercase tracking-widest hover:underline">
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="flex items-center justify-between border-b border-hairline bg-background px-6 py-4 md:py-6">
            <span className="font-display text-xl capitalize">{tab} Management</span>
            <select value={tab} onChange={(e) => setTab(e.target.value as Tab)} className="border border-hairline bg-background px-2 py-1 text-sm md:hidden">
              <option value="products">Products</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
            </select>
          </header>
          
          <main className="flex-1 overflow-hidden p-6 md:p-10">
            {tab === "products" && <ProductsModule products={products} setProducts={setProducts} />}
            {tab === "orders" && <OrdersModule orders={orders} setOrders={setOrders} />}
            {tab === "customers" && <CustomersModule orders={orders} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (email: string, pass: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div className="grid min-h-screen place-items-center bg-secondary p-4">
      <form
        onSubmit={(e) => { e.preventDefault(); onLogin(email, pass); }}
        className="w-full max-w-sm border border-hairline bg-background p-8"
      >
        <h1 className="font-display text-3xl">Admin Sign In</h1>
        <p className="mt-2 text-xs text-muted-foreground">Restricted area. Authorized personnel only.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Password</label>
            <input required type="password" value={pass} onChange={(e) => setPass(e.target.value)}
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground" />
          </div>
        </div>
        <button className="mt-8 w-full bg-foreground py-3 text-xs uppercase tracking-widest text-background">Sign in</button>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">Secured🔒</p>
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

function ProductsModule({ products, setProducts }: { products: AdminProduct[]; setProducts: (p: AdminProduct[]) => void }) {
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  const save = (p: AdminProduct) => {
    if (!p.name || p.price <= 0) { toast.error("Name and price required"); return; }
    if (p.images.length === 0) { toast.error("At least one product image is required"); return; }
    const id = p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const next = { ...p, id };
    const idx = products.findIndex((x) => x.id === id);
    if (idx >= 0) {
      const copy = [...products]; copy[idx] = next; setProducts(copy);
      toast.success("Product updated");
    } else {
      setProducts([next, ...products]);
      toast.success("Product created");
    }
    setEditing(null);
  };
  const remove = (id: string) => { setProducts(products.filter((p) => p.id !== id)); toast.success("Product deleted"); };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} items in catalog.</p>
        </div>
        <button onClick={() => setEditing(emptyProduct())} className="flex items-center gap-2 bg-foreground px-4 py-2.5 text-xs uppercase tracking-widest text-background">
          <Plus className="h-3.5 w-3.5" /> New product
        </button>
      </div>

      <div className="flex-1 overflow-y-auto border border-hairline bg-background max-h-[calc(100vh-220px)]">
        <table className="w-full text-sm table-auto">
          <thead className="bg-secondary text-left text-[10px] uppercase tracking-widest text-muted-foreground sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] bg-secondary">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active Sizes</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0] || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100"} alt={p.name} className="h-12 w-10 object-cover shrink-0" loading="lazy" />
                    <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-xs">{p.category} · {p.sub}</td>
                <td className="px-4 py-3 font-medium">${p.price}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {p.stockSizes.map((s) => (
                      <span key={s} className="bg-secondary px-1.5 py-0.5 text-[10px] font-bold border border-hairline">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing(p)} className="flex items-center gap-1 border border-hairline px-3 py-1.5 text-xs hover:bg-secondary"><Pencil className="h-3 w-3" /> Edit</button>
                    <button onClick={() => remove(p.id)} className="flex items-center gap-1 border border-hairline px-3 py-1.5 text-xs text-destructive hover:bg-secondary"><Trash2 className="h-3 w-3" /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
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

  const toggleTag = (t: string) => setP({ ...p, tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t] });
  const addColor = () => { if (!/^#[0-9a-fA-F]{6}$/.test(colorInput)) return; if (p.colors.includes(colorInput)) return; setP({ ...p, colors: [...p.colors, colorInput] }); };
  const removeColor = (c: string) => setP({ ...p, colors: p.colors.filter((x) => x !== c) });
  
  const toggleSizeSelection = (size: string) => {
    const nextSizes = p.stockSizes.includes(size)
      ? p.stockSizes.filter((s) => s !== size)
      : [...p.stockSizes, size];
    setP({ ...p, stockSizes: nextSizes });
  };

  // NEW: Multi-image file manager processor.
  // The first image loaded or assigned will sit comfortably at index position 0 as the product main view.
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

  const removeImage = (indexToRemove: number) => {
    setP((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="mx-auto mt-8 max-w-2xl bg-background p-8 border border-hairline shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl">{initial.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Product Title" className="col-span-2">
            <input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className="input" />
          </Field>
          
          {/* NEW: Atelier Description Field Section Added */}
          <Field label="Product Description Brief" className="col-span-2">
            <textarea 
              value={p.description} 
              onChange={(e) => setP({ ...p, description: e.target.value })} 
              rows={3} 
              placeholder="Describe the fabric silhouette details, tailoring, and specifications details..."
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground resize-none text-foreground placeholder:text-muted-foreground" 
            />
          </Field>

          <Field label="Base Price ($)">
            <input type="number" min={0} value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Category">
            <select value={p.category} onChange={(e) => setP({ ...p, category: e.target.value as Category })} className="input">
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              <option value="unisex">Unisex</option>
            </select>
          </Field>
          <Field label="Subcategory" className="col-span-2 md:col-span-1">
            <select value={p.sub} onChange={(e) => setP({ ...p, sub: e.target.value as SubCategory })} className="input">
              {SUBCATEGORIES.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
            </select>
          </Field>
        </div>

        {/* NEW: Advanced Product Gallery File Manager Interface */}
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Product Image Gallery Manager</p>
          <label className="flex flex-col items-center justify-center border border-dashed border-hairline p-6 bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Select Files from Device</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          
          {p.images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {p.images.map((imgSrc, idx) => (
                <div key={idx} className="relative aspect-[4/5] bg-secondary border border-hairline group">
                  <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                  
                  {/* Pinned main indicator layout node */}
                  {idx === 0 ? (
                    <span className="absolute top-1 left-1 bg-foreground text-background text-[8px] tracking-widest uppercase px-1 py-0.5 font-bold shadow-md">
                      Main Image
                    </span>
                  ) : (
                    <span className="absolute top-1 left-1 bg-background/80 text-foreground text-[8px] tracking-widest uppercase px-1 py-0.5 font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                      Gallery ({idx})
                    </span>
                  )}
                  
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)} 
                    className="absolute top-1 right-1 bg-background border border-hairline p-1 rounded-full shadow-md text-destructive hover:scale-105 transition-transform"
                    aria-label="Remove Image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => {
              const on = p.tags.includes(t);
              return (
                <button type="button" key={t} onClick={() => toggleTag(t)} className={`border px-3 py-1.5 text-xs ${on ? "border-foreground bg-foreground text-background" : "border-hairline hover:bg-secondary"}`}>{t}</button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Color Swatches</p>
          <div className="mt-2 flex items-center gap-2">
            <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="h-9 w-12 border border-hairline" />
            <input value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="input flex-1" />
            <button type="button" onClick={addColor} className="border border-foreground px-3 py-2 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background">Add</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.colors.map((c) => (
              <button type="button" key={c} onClick={() => removeColor(c)} title={`Remove ${c}`} className="flex items-center gap-1 border border-hairline p-1 text-xs">
                <span className="inline-block h-5 w-5" style={{ background: c }} />
                <span className="px-1">{c}</span><X className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Available Size Parameters Matrix Selection</p>
          <div className="flex gap-3">
            {SIZE_OPTIONS.map((sizeOption) => {
              const isChecked = p.stockSizes.includes(sizeOption);
              return (
                <button
                  type="button"
                  key={sizeOption}
                  onClick={() => toggleSizeSelection(sizeOption)}
                  className={`h-11 w-14 border text-sm transition-all font-medium flex items-center justify-center ${
                    isChecked 
                      ? "border-foreground bg-foreground text-background scale-[1.03]" 
                      : "border-hairline bg-transparent hover:border-foreground text-muted-foreground"
                  }`}
                >
                  {sizeOption}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="border border-hairline px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-secondary">Cancel</button>
          <button type="button" onClick={() => onSave(p)} className="bg-foreground px-5 py-2.5 text-xs uppercase tracking-widest text-background">Save</button>
        </div>
      </div>
      <style>{`.input{width:100%;border-bottom:1px solid hsl(var(--hairline, 0 0% 88%));background:transparent;padding:0.5rem 0;font-size:0.875rem;outline:none}.input:focus{border-color:hsl(var(--foreground))}`}</style>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function OrdersModule({ orders, setOrders }: { orders: Order[]; setOrders: (o: Order[]) => void }) {
  const [tab, setTab] = useState<"all" | "pending" | "settled">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (tab === "pending") return orders.filter((o) => o.status === "Pending Paid" || o.status === "Processing");
    if (tab === "settled") return orders.filter((o) => o.status === "Delivered");
    return orders;
  }, [orders, tab]);

  const update = (id: string, patch: Partial<Order>) => setOrders(orders.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0">
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} total.</p>

        <div className="mt-6 flex gap-1 border-b border-hairline">
          {([["all", "All Orders"], ["pending", "Pending Fulfillment"], ["settled", "Settled"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-xs uppercase tracking-widest ${tab === id ? "border-b-2 border-foreground font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
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
              <button onClick={() => setOpenId(open ? null : o.id)} className="grid w-full grid-cols-6 items-center gap-4 px-4 py-4 text-left text-sm hover:bg-secondary/30">
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="font-medium tracking-wide">{o.id}</span>
                <span className="truncate">{o.customer.name}</span>
                <span className="text-muted-foreground text-xs font-mono">{o.createdAt}</span>
                <span className="font-medium font-mono">${o.total}</span>
                <span className={`justify-self-end text-[10px] px-2 py-0.5 uppercase tracking-widest font-medium border ${o.status === "Cancelled" ? "border-destructive/40 text-destructive bg-destructive/5" : "border-hairline bg-secondary"}`}>{o.status}</span>
              </button>
              {open && (
                <div className="grid gap-6 border-t border-hairline bg-secondary/20 p-6 md:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Customer Information</p>
                    <div className="mt-2 border border-hairline bg-background p-4 text-sm leading-relaxed">
                      <p className="font-medium text-base">{o.customer.name}</p>
                      <p className="text-muted-foreground text-xs mt-1">{o.customer.address}</p>
                      <p className="mt-3 text-xs border-t border-hairline/60 pt-2"><span className="text-muted-foreground">Email:</span> {o.customer.email}</p>
                      <p className="text-sm font-medium mt-1"><span className="text-xs text-muted-foreground font-normal">Phone:</span> {o.customer.phone}</p>
                    </div>
                    <div className="mt-4">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Fulfillment Status Pipeline Route</label>
                      <select value={o.status} onChange={(e) => update(o.id, { status: e.target.value as Order["status"] })}
                        className="mt-1 w-full border border-hairline bg-background px-3 py-2 text-sm outline-none focus:border-foreground">
                        {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Tracking Reference Parameter</label>
                      <input value={o.tracking || ""} onChange={(e) => update(o.id, { tracking: e.target.value })}
                        placeholder="e.g. TRK123456"
                        className="mt-1 w-full border border-hairline bg-background px-3 py-2 text-sm outline-none focus:border-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Itemization Grid Breakdown</p>
                    <div className="mt-2 space-y-3">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex gap-4 border border-hairline bg-background p-4">
                          <img src={it.image} alt={it.name} className="h-24 w-18 object-cover shrink-0 border border-hairline" loading="lazy" />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <p className="font-medium text-sm tracking-wide text-foreground truncate">{it.name}</p>
                              <div className="mt-2 flex items-center gap-3 text-sm">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  Swatch: <span className="inline-block h-3.5 w-3.5 border border-hairline rounded-full" style={{ background: it.color }} />
                                </span>
                                <span className="font-bold text-foreground bg-secondary px-2 py-0.5 border border-hairline text-xs">
                                  Size: {it.size}
                                </span>
                                <span className="font-semibold text-foreground font-mono">
                                  Qty: {it.qty}
                                </span>
                              </div>
                            </div>
                            <p className="font-mono text-sm font-medium border-t border-hairline/50 pt-1.5 mt-2">${it.price * it.qty}</p>
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
    c.orders += 1; c.spent += o.total;
    map.set(o.customer.email, c);
  }
  const list = Array.from(map.values());
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 mb-6">
        <h1 className="font-display text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">{list.length} customers on file.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto border border-hairline bg-background max-h-[calc(100vh-220px)]">
        <table className="w-full text-sm table-auto">
          <thead className="bg-secondary text-left text-[10px] uppercase tracking-widest text-muted-foreground sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] bg-secondary">
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
                <td className="px-4 py-3 font-medium text-sm">{c.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-xs tracking-wide">{c.phone}</td>
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