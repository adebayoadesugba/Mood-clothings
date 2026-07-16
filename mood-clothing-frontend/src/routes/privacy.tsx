import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Mood Clothings" },
      { name: "description", content: "How Mood Clothings collects, uses, and protects your personal information when you shop with us." },
      { property: "og:title", content: "Privacy Policy — Mood Clothings" },
      { property: "og:description", content: "Mood Clothings' commitment to your privacy." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <header className="mt-6">
        <p className="text-lg uppercase tracking-widest text-muted-foreground">Legal</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Privacy Policy</h1>
        <p className="mt-3 text-lg text-muted-foreground">Last updated: July 2, 2026</p>
      </header>

      <article className="prose prose-neutral mt-10 max-w-none text-lg leading-7 text-foreground/90">
        <p>
          Mood Clothings ("we", "us", "our") respects your privacy. This policy explains what information we
          collect, how we use it, and the choices you have. By using Mood Clothings.shop you agree to the
          practices described here.
        </p>

        <h2 className="mt-10 font-display text-2xl">1. Information we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong>Account data:</strong> name, email, phone number, shipping and billing addresses.</li>
          <li><strong>Order data:</strong> items purchased, order value, delivery preferences.</li>
          <li><strong>Payment data:</strong> processed securely by Paystack we never store your full card number.</li>
          <li><strong>Usage data:</strong> pages viewed, products browsed, device and browser information.</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl">2. How we use your information</h2>
        <p className="mt-3">We use your information to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Process orders, deliveries, returns, and refunds.</li>
          <li>Provide customer support and respond to enquiries.</li>
          <li>Personalise your shopping experience and product recommendations.</li>
          <li>Send transactional and, with your consent, marketing communications.</li>
          <li>Detect and prevent fraud, and comply with legal obligations.</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl">3. Sharing your information</h2>
        <p className="mt-3">
          We only share personal data with service providers who help us run the store payment
          processors, shipping carriers, email tools, and analytics providers under strict
          confidentiality agreements. We do not sell your personal data.
        </p>

        <h2 className="mt-10 font-display text-2xl">4. Cookies</h2>
        <p className="mt-3">
          We use essential cookies to power core site features (cart, wishlist, session) and optional
          analytics cookies to improve the experience. You can manage cookies through your browser
          settings.
        </p>

        <h2 className="mt-10 font-display text-2xl">5. Data retention</h2>
        <p className="mt-3">
          We retain your data for as long as your account is active or as needed to provide services,
          comply with legal obligations, resolve disputes, and enforce our agreements.
        </p>

        <h2 className="mt-10 font-display text-2xl">6. Your rights</h2>
        <p className="mt-3">
          You may request access, correction, or deletion of your personal data, or object to certain
          processing. Contact us at <a href="mailto:info@moodclothings.com">info@moodclothings.com</a>.
        </p>

        <h2 className="mt-10 font-display text-2xl">7. Security</h2>
        <p className="mt-3">
          We use industry-standard safeguards including TLS encryption, tokenised payments, and access
          controls. No system is completely secure please use a strong, unique password for your account.
        </p>

        <h2 className="mt-10 font-display text-2xl">8. Changes to this policy</h2>
        <p className="mt-3">
          We may update this policy from time to time. Material changes will be posted here with a new
          "Last updated" date.
        </p>

        <h2 className="mt-10 font-display text-2xl">9. Contact</h2>
        <p className="mt-3">
          Questions? Email <a href="mailto:info@moodclothings.com">info@moodclothings.com</a> or write to
          Mood Clothings, 48 Ogunlana Drive, Surulere, Lagos, Nigeria.
        </p>
      </article>
    </div>
  );
}
