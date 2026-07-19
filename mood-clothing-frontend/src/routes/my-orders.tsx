import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useStore } from "@/lib/store";
import { ChevronDown, ChevronRight, PackageSearch } from "lucide-react";

export const Route = createFileRoute("/my-orders")({
  head: () => ({ meta: [{ title: "My Orders — Mood Clothings" }, { name: "robots", content: "noindex" }] }),
  component: MyOrdersPage,
});

type OrderItem = {
  product: string;
  name: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  price: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  total: number;
  status: "Pending Paid" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  tracking?: string;
  createdAt: string;
};

const formatNaira = (amount: number) =>
  "₦" + Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// Quiet, non-alarming color coding — reads as informative, not urgent/red for anything
// except a genuinely cancelled order.
const statusStyles: Record<Order["status"], string> = {
  "Pending Paid": "border-hairline bg-secondary text-foreground",
  "Processing": "border-hairline bg-secondary text-foreground",
  "Shipped": "border-foreground bg-foreground text-background",
  "Delivered": "border-green-700/40 bg-green-700/10 text-green-800",
  "Cancelled": "border-destructive/40 bg-destructive/5 text-destructive",
};

function OrderSkeleton() {
  return (
    <div className="border border-hairline p-4">
      <div className="flex items-center justify-between">
        <div className="skeleton-block h-3 w-32 rounded" />
        <div className="skeleton-block h-3 w-20 rounded" />
      </div>
      <div className="mt-4 flex gap-3">
        <div className="skeleton-block h-16 w-14 rounded" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-block h-3 w-2/3 rounded" />
          <div className="skeleton-block h-3 w-1/3 rounded" />
        </div>
      </div>
    </div>
  );
}

function MyOrdersPage() {
  const { user, openLogin } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("mood-clothings-auth-token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Unable to load your orders right now.");
        const json = await res.json();
        setOrders(Array.isArray(json.data) ? json.data : []);
      } catch (err: any) {
        setError(err.message || "Something went wrong loading your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Orders" }]} />
      <h1 className="mt-6 font-display text-4xl md:text-5xl">My Orders</h1>

      {!user ? (
        <div className="mt-16 text-center max-w-sm mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please log in to view your order history.
          </p>
          <button
            onClick={openLogin}
            className="mt-6 inline-block w-full bg-foreground text-background py-3 text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]"
          >
            Sign In / Register
          </button>
        </div>
      ) : loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground stroke-[1.5]" />
          <p className="mt-4 text-sm text-muted-foreground">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const open = openId === order._id;
            return (
              <div key={order._id} className="border border-hairline">
                <button
                  onClick={() => setOpenId(open ? null : order._id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{formatDate(order.createdAt)}</p>
                      <p className="mt-0.5 truncate text-sm">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatNaira(order.total)}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 border px-2.5 py-1 text-[11px] uppercase tracking-widest font-medium ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-hairline bg-secondary/10 p-4">
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <img src={item.image} alt={item.name} className="h-16 w-14 shrink-0 object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm uppercase tracking-widest">{item.name}</p>
                            <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                              <span>Size: {item.size}</span>
                              <span className="flex items-center gap-1">
                                Color:
                                <span
                                  className="inline-block h-3 w-3 rounded-full border border-hairline"
                                  style={{ backgroundColor: item.color }}
                                />
                              </span>
                              <span>Qty: {item.qty}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-sm tabular-nums">{formatNaira(item.price * item.qty)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between border-t border-hairline pt-3 text-sm font-medium">
                      <span>Total</span>
                      <span className="tabular-nums">{formatNaira(order.total)}</span>
                    </div>

                    {order.tracking && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Tracking number: <span className="text-foreground font-medium">{order.tracking}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
