import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { z } from "zod"; // If you use Zod for schema validation

// 1. Define the search parameters schema so TanStack Router recognizes them
const callbackSearchSchema = z.object({
  reference: z.string().optional(),
  trxref: z.string().optional(),
});

export const Route = createFileRoute("/checkout/callback")({
  // Validate the search parameters so TanStack Router loads this route instead of falling back
  validateSearch: (search) => callbackSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Confirming Payment — Mood Clothings" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutCallback,
});

type VerifyState = "verifying" | "success" | "failed";

function CheckoutCallback() {
  const { clearCart, closeCart } = useStore();
  const [state, setState] = useState<VerifyState>("verifying");
  const [message, setMessage] = useState("");

  // 2. Safely read validated parameters using TanStack's built-in hook
  const { reference, trxref } = Route.useSearch();

  useEffect(() => {
    // Fallback to query reference from search schema
    const paymentRef = reference || trxref;

    if (!paymentRef) {
      setState("failed");
      setMessage("No payment reference was found. If you completed a payment, please contact support.");
      return;
    }

    const verify = async () => {
      try {
        const token = localStorage.getItem("mood-clothings-auth-token");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/verify/${paymentRef}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setState("success");
          
          // Clear and close cart safely
          if (typeof closeCart === "function") closeCart();
          if (typeof clearCart === "function") clearCart();
        } else {
          console.error("Verification failed on server:", data);
          setState("failed");
          setMessage(data.message || "We couldn't confirm your payment. Please contact support if you were charged.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setState("failed");
        setMessage("Something went wrong confirming your payment. Please contact support if you were charged.");
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, trxref]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <div className="mt-16 flex min-h-[40vh] w-full flex-col items-center justify-center text-center">
        <div className="max-w-md">
          {state === "verifying" && (
            <>
              <div className="mx-auto h-12 w-12 border-[3px] border-hairline border-t-foreground rounded-full animate-spin" />
              <h1 className="mt-6 font-display text-2xl uppercase tracking-wider">Confirming your payment...</h1>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Please don't close this page — this will only take a moment.
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-foreground stroke-[1.5]" />
              <h1 className="mt-6 font-display text-3xl uppercase tracking-wider md:text-4xl">Thank You</h1>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Your payment has been confirmed and your order is being prepared. A confirmation email with your order details has been sent.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="mt-10 inline-block bg-foreground text-background px-8 py-3 text-xs uppercase tracking-widest transition-transform hover:scale-[1.02]"
              >
                Continue Shopping
              </button>
            </>
          )}

          {state === "failed" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive stroke-[1.5]" />
              <h1 className="mt-6 font-display text-3xl uppercase tracking-wider md:text-4xl">Payment Not Confirmed</h1>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{message}</p>
              <button
                onClick={() => (window.location.href = "/checkout")}
                className="mt-10 inline-block bg-foreground text-background px-8 py-3 text-xs uppercase tracking-widest transition-transform hover:scale-[1.02]"
              >
                Return to Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}