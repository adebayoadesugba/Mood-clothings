import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function LoginModal() {
  const { loginOpen, closeLogin, setUser, user, logout } = useStore();
  
  const [isSignUp, setIsSignUp] = useState(false); 
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  
  // PASSWORD VISIBILITY TOGGLERS
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // FORGOT PASSWORD FLOW STATE: toggles a separate mini-form in place of the sign in/up form
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    document.body.style.overflow = loginOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLogin(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [loginOpen, closeLogin]);

  // RESET EFFECT: Clears inputs when a user successfully signs in
  useEffect(() => {
    if (user) {
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [user]);

  // RESET FORGOT-PASSWORD MINI-FORM whenever the modal closes or the user leaves that view
  useEffect(() => {
    if (!loginOpen) {
      setForgotMode(false);
      setForgotEmail("");
      setForgotSent(false);
    }
  }, [loginOpen]);

  const handleGoogleSignIn = () => {
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      toast.error("Google authentication client is initializing. Please try again.");
    }
  };

  // FORGOT PASSWORD SUBMIT HANDLER: tells the user clearly if no account exists vs. email sent
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setForgotLoading(true);
    const BASE_AUTH_URL = import.meta.env.VITE_API_URL + "/api/auth";

    try {
      const res = await fetch(`${BASE_AUTH_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend returns a 404 with this exact message when no account exists for the email
        if (res.status === 404) {
          toast.error(data.message || "No account found with this email. Please sign up instead.");
          // Send them straight into the sign-up form so they can act on it immediately
          setForgotMode(false);
          setIsSignUp(true);
          setForm((f) => ({ ...f, email: forgotEmail.trim().toLowerCase() }));
          return;
        }
        throw new Error(data.message || "Unable to send reset email. Please try again.");
      }

      setForgotSent(true);
      toast.success("Check your inbox for a password reset link.");
    } catch (err: any) {
      console.error("Forgot password request failed:", err);
      toast.error(err.message || "Unable to complete request. Please verify server connection.");
    } finally {
      setForgotLoading(false);
    }
  };

  // CONNECTED BACKEND SYSTEM HANDLER PIPELINE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const BASE_AUTH_URL = import.meta.env.VITE_API_URL + "/api/auth";

    try {
      if (isSignUp) {
        // 1. SIGN UP ROUTE HANDLER
        if (!form.name || !form.email || !form.password || !form.confirmPassword) {
          throw new Error("Please fill out all fields required to register.");
        }

        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match. Please verify your choices.");
        }
        
        const res = await fetch(`${BASE_AUTH_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.message?.toLowerCase().includes("already") || res.status === 409) {
            throw new Error("This email has already been used. Please log in instead.");
          }
          throw new Error(data.message || "Registration parameters rejected by backend database layer.");
        }

        // FIX: backend returns the user profile under `data.data`, not `data.user`
        if (!data.data) {
          throw new Error("Registration succeeded but no user data was returned by the server.");
        }

        setUser(data.data, data.token);
        toast.success("Welcome to Mood Clothings — check your inbox for our welcome note.");
        closeLogin();
      } else {
        // 2. SIGN IN ROUTE HANDLER
        if (!form.email || !form.password) {
          throw new Error("Please provide your email address and password.");
        }

        const res = await fetch(`${BASE_AUTH_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            password: form.password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Invalid email or password.");
        }

        // FIX: backend returns the user profile under `data.data`, not `data.user`
        if (!data.data) {
          throw new Error("Sign in succeeded but no user data was returned by the server.");
        }

        setUser(data.data, data.token);
        toast.success("Signed in successfully.");
        closeLogin();
      }
    } catch (err: any) {
      console.error("Authentication submission barrier:", err);
      toast.error(err.message || "Unable to complete request. Please verify server connection.");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-center py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Active Session</p>
            <h2 className="font-display text-3xl">Welcome back, {user.name.split(" ")[0]}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            
            <div className="mt-8 space-y-3">
              <button
                onClick={() => { logout(); toast.success("Signed out"); }}
                className="w-full bg-foreground text-background py-3 text-xs uppercase tracking-widest transition-colors border border-foreground hover:bg-transparent hover:text-foreground"
              >
                Sign out
              </button>
              
              <button
                onClick={() => { 
                  logout(); 
                  setIsSignUp(false); 
                  toast.success("Session closed. Please authenticate your alternate profile credentials.");
                }}
                className="w-full border border-hairline py-3 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Sign in to another account
              </button>
            </div>
          </div>
        ) : forgotMode ? (
          /* ───────────────── FORGOT PASSWORD MINI-FORM ───────────────── */
          <div>
            <h2 className="font-display text-3xl">Reset your password</h2>

            {forgotSent ? (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If an account exists for <span className="text-foreground">{forgotEmail}</span>, a password reset link has been sent.
                  Check your inbox (and spam folder) — the link expires in 30 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
                  className="mt-6 w-full border border-hairline py-3 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter the email linked to your account and we'll send you a reset link.
                </p>
                <form onSubmit={handleForgotPasswordSubmit} className="mt-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <input
                      required
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="mt-6 w-full bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="mt-3 w-full py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    Back to sign in
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Segmented Auth Mode Tabs */}
            <div className="mb-6 flex border-b border-hairline text-xs uppercase tracking-widest">
              <button 
                type="button" 
                onClick={() => setIsSignUp(true)}
                className={`flex-1 pb-3 text-center transition-colors font-medium ${isSignUp ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign Up
              </button>
              <button 
                type="button" 
                onClick={() => setIsSignUp(false)}
                className={`flex-1 pb-3 text-center transition-colors font-medium ${!isSignUp ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <h2 className="font-display text-3xl">{isSignUp ? "Join Mood Clothings" : "Welcome Back"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isSignUp 
                  ? "Create your account to save wishlists and track orders." 
                  : "Access your saved profile, persistent checkout logs, and past transactions."}
              </p>
              
              <div className="mt-6 space-y-4">
                {/* Sign Up Fields Only */}
                {isSignUp && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground"
                    />
                  </div>
                )}
                
                {/* Always Show Email Field */}
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

                {/* Always Show Password Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => { setForgotMode(true); setForgotEmail(form.email); }}
                        className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-2"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
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

                {/* Confirm Password Field (Sign Up Only) */}
                {isSignUp && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Confirm Password</label>
                    <div className="relative flex items-center">
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="mt-6 w-full bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? "Processing transaction..." : isSignUp ? "Create Account" : "Sign In"}
              </button>

              {/* Minimalist Divider Line */}
              <div className="my-5 flex items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="h-[1px] flex-1 bg-hairline" />
                <span>Or Continue With</span>
                <span className="h-[1px] flex-1 bg-hairline" />
              </div>

              {/* Google Auth Integration */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-3 border border-hairline bg-background py-3 text-xs uppercase tracking-widest text-foreground transition-colors hover:border-foreground active:scale-[0.99]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <p className="mt-6 text-center text-[11px] text-muted-foreground">
                By continuing you agree to our Terms &amp; Privacy Policy.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}