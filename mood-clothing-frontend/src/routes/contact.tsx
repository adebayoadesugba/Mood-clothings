import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Mood Clothings" },
      { name: "description", content: "Get in touch with Mood Clothings. Reach our client care team via email, phone, or WhatsApp — we respond within one business day." },
      { property: "og:title", content: "Contact Us — Mood Clothings" },
      { property: "og:description", content: "We're here to help reach the Mood Clothings team." },
    ],
  }),
  component: ContactPage,
});

// Your Formspree endpoint — messages submitted here land in the inbox linked to your Formspree account
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgogvevn";

function ContactPage() {
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          // Tells Formspree to reply with JSON instead of redirecting to their own page
          Accept: "application/json",
        },
      });

      if (res.ok) {
        form.reset();
        toast.success("Message sent. We'll be in touch within one business day.");
      } else {
        const data = await res.json().catch(() => null);
        throw new Error(data?.errors?.[0]?.message || "Failed to send message. Please try again.");
      }
    } catch (err: any) {
      console.error("Contact form submission failed:", err);
      toast.error(err.message || "Unable to send message. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <header className="mt-6 max-w-2xl">
        <p className="text-lg uppercase tracking-widest text-muted-foreground">Client Care</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">We're here to help.</h1>
        <p className="mt-4 text-muted-foreground">
          Questions about sizing, orders, or a custom design? Our team responds within one business day.
        </p>
      </header>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <aside className="space-y-6 text-lg">
          <div>
            <div className="text-lg uppercase tracking-widest text-muted-foreground">Email</div>
            <a href="mailto:info@moodclothings.com" className="mt-1 block">info@moodclothings.com</a>
          </div>
          <div>
            <a href="mailto:sales@moodclothings.com" className="mt-1 block">sales@moodclothings.com</a>
          </div>
          <div>
            <div className="text-lg uppercase tracking-widest text-muted-foreground">Phone</div>
            <a href="tel:+2349065623779" className="mt-1 block">+234 906 562 3779</a>
          </div>
          <div>
            <div className="text-lg uppercase tracking-widest text-muted-foreground">WhatsApp</div>
            <a href="https://wa.me/2349065623779" target="_blank" rel="noreferrer" className="mt-1 block">
              Chat with us
            </a>
          </div>
          <div>
            <div className="text-lg uppercase tracking-widest text-muted-foreground">Location</div>
            <p className="mt-1">48 Ogunlana Drive,<br /> Surulere, Lagos 100242<br />Nigeria</p>
          </div>
          <div>
            <div className="text-lg uppercase tracking-widest text-muted-foreground">Hours</div>
            <p className="mt-1">Mon–Fri · 8:00–18:00 WAT<br />Sat-Sun · 10:00–18:00 WAT</p>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* HONEYPOT FIELD: invisible to real people, but bots that auto-fill every field will
              fill this one too — Formspree silently discards submissions where it's non-empty.
              Do not remove this, and do not give it a visible label or styling. */}
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-lg uppercase tracking-widest text-muted-foreground">Name</span>
              <input required name="name" className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground" />
            </label>
            <label className="block">
              <span className="text-lg uppercase tracking-widest text-muted-foreground">Email</span>
              <input required type="email" name="email" className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground" />
            </label>
          </div>
          <label className="block">
            <span className="text-lg uppercase tracking-widest text-muted-foreground">Subject</span>
            <input name="subject" className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground" />
          </label>
          <label className="block">
            <span className="text-lg uppercase tracking-widest text-muted-foreground">Message</span>
            <textarea required name="message" rows={6} className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground" />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="bg-foreground px-8 py-3 text-xs uppercase tracking-widest text-background disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}