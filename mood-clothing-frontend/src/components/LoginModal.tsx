import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function LoginModal() {
  const { loginOpen, closeLogin, setUser, user, logout } = useStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    document.body.style.overflow = loginOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLogin(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [loginOpen, closeLogin]);

  if (!loginOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-foreground/40 p-4"
      style={{ animation: "overlay-fade 200ms ease-out" }}
      onClick={closeLogin}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-background p-8"
        style={{ animation: "overlay-slide 250ms ease-out" }}
      >
        <button onClick={closeLogin} aria-label="Close" className="absolute right-4 top-4"><X className="h-4 w-4" /></button>
        {user ? (
          <div>
            <h2 className="font-display text-2xl">Welcome back, {user.name.split(" ")[0]}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
            <button
              onClick={() => { logout(); toast.success("Signed out"); }}
              className="mt-8 w-full border border-foreground py-3 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name || !form.email || !form.phone) return;
              setUser(form);
              toast.success("Welcome to Glamora — check your inbox for our welcome note.");
            }}
          >
            <h2 className="font-display text-3xl">Join Glamora</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create your account to save wishlists and track orders.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground"
                />
              </div>
            </div>
            <button type="submit" className="mt-8 w-full bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01]">
              Create Account
            </button>
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              By continuing you agree to our Terms &amp; Privacy Policy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
