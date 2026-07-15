import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider, useStore } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchOverlay } from "@/components/SearchOverlay";
import { CartDrawer } from "@/components/CartDrawer";
import { LoginModal } from "@/components/LoginModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MarqueeBar } from "@/components/MarqueeBar";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { PromoBanner } from "@/components/PromoBanner";
import { toast } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 font-display text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background"
          >
            Try again
          </button>
          <a href="/" className="border border-foreground px-6 py-3 text-xs uppercase tracking-widest">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
      { title: "Mood Clothings Modern Fashion, Timeless Style" },
      { name: "description", content: "Shop the latest ready-to-wear collections for men, women, and kids. Editorial fashion, refined essentials, and accessories curated by Mood Clothings." },
      { property: "og:title", content: "Mood Clothings — Modern Fashion, Timeless Style" },
      { property: "og:description", content: "Shop the latest ready-to-wear collections for men, women, and kids." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap" },
      { rel: "icon", href: "/images/MOOD icon.png", type: "image/x-icon" },
    ],
    scripts: [
      { src: "https://accounts.google.com/gsi/client", async: true, defer: true }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// INLINE INITIALIZER WRAPPER: Sends the Google credential to our own backend for verification
// and account creation/lookup, instead of trusting/decoding the JWT purely client-side.
function GoogleAuthInitializer({ children }: { children: ReactNode }) {
  const { setUser } = useStore();

  useEffect(() => {
    const googleClientId = "415841049802-13ifh320j8llp0djj4t87udtfk2d95cu.apps.googleusercontent.com";

    (window as any).handleGoogleCredentialResponse = async (response: any) => {
      try {
        const jwtToken = response.credential;

        const BASE_AUTH_URL = import.meta.env.VITE_API_URL + "/api/auth";
        const res = await fetch(`${BASE_AUTH_URL}/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: jwtToken }),
        });

        const data = await res.json();

        if (!res.ok || !data.data) {
          throw new Error(data.message || "Google sign-in verification failed.");
        }

        setUser(data.data, data.token);
        toast.success(`Successfully signed in via Google as ${data.data.name}`);
      } catch (err: any) {
        console.error("Google sign-in failed:", err);
        toast.error(err.message || "Unable to complete Google sign-in.");
      }
    };

    // FIXED SINGLETON INITIALIZER: Guards the initialization method block to prevent re-execution warnings
    const initGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        if ((window as any).__googleInitialized) return true; // Stop here if already done!

        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (window as any).handleGoogleCredentialResponse,
        });
        
        (window as any).__googleInitialized = true;
        return true;
      }
      return false;
    };

    if (!initGoogle()) {
      const interval = setInterval(() => {
        if (initGoogle()) {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [setUser]);

  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <GoogleAuthInitializer>
          <MarqueeBar />
          <Header />
          <main className="min-h-screen">
            <Outlet />
          </main>
          <Footer />
          <SearchOverlay />
          <CartDrawer />
          <LoginModal />
          <WhatsAppButton />
          <NewsletterPopup />
          <PromoBanner />
          <CookieConsentBanner />
          <Toaster position="bottom-left" />
        </GoogleAuthInitializer>
      </StoreProvider>
    </QueryClientProvider>
  );
}