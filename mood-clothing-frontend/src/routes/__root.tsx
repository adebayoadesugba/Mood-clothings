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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mood Clothings — Modern Fashion, Timeless Style" },
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

// INLINE INITIALIZER WRAPPER: Handles global base64 payload decoding hooks cleanly inside context limits
function GoogleAuthInitializer({ children }: { children: ReactNode }) {
  const { setUser } = useStore();

  useEffect(() => {
    const googleClientId = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

    (window as any).handleGoogleCredentialResponse = (response: any) => {
      try {
        const jwtToken = response.credential;
        const base64Url = jwtToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(window.atob(base64));

        const googleUserProfile = {
          name: decodedPayload.name,
          email: decodedPayload.email,
          phone: "",
        };

        setUser(googleUserProfile, jwtToken);
        toast.success(`Successfully signed in via Google as ${googleUserProfile.name}`);
      } catch (err) {
        console.error("Google profile decoding mishap:", err);
        toast.error("Unable to parse Google authentication parameters.");
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
          <Header />
          <main className="min-h-screen">
            <Outlet />
          </main>
          <Footer />
          <SearchOverlay />
          <CartDrawer />
          <LoginModal />
          <WhatsAppButton />
          <Toaster position="bottom-left" />
        </GoogleAuthInitializer>
      </StoreProvider>
    </QueryClientProvider>
  );
}