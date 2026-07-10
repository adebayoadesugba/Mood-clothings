import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/reset-password/$token")({
  head: () => ({ meta: [{ title: "Reset Password — Mood Clothings" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { setUser } = useStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const BASE_AUTH_URL = import.meta.env.VITE_API_URL + "/api/auth";

    try {
      const res = await fetch(`${BASE_AUTH_URL}/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "This reset link is invalid or has expired.");
      }

      // Log the user straight in, same as a normal sign-in, using the fresh token returned
      if (data.data && data.token) {
        setUser(data.data, data.token);
      }

      setDone(true);
      toast.success("Password reset successfully.");
    } catch (err: any) {
      console.error("Reset password failed:", err);
      toast.error(err.message || "Unable to reset password. Please request a new link.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle className="h-12 w-12 stroke-[1.5] text-foreground" />
        <h1 className="mt-6 font-display text-3xl">Password Reset</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Your password has been updated and you're now signed in.
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-8 inline-block bg-foreground px-8 py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.02]"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[70vh] max-w-md px-4 py-16">
      <h1 className="font-display text-3xl">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a new password for your Mood Clothings account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">New Password</label>
          <div className="relative flex items-center">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 pr-8 text-sm outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 text-muted-foreground hover:text-foreground mt-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Confirm New Password</label>
          <div className="relative flex items-center">
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 pr-8 text-sm outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-1 text-muted-foreground hover:text-foreground mt-1"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
