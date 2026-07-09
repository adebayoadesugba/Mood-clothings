import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/products";

const BASE_URL = "https://moodclothings.com";
const API_URL = process.env.VITE_API_URL || "https://mood-clothings-backend.onrender.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { path: string; changefreq?: string; priority?: string }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/custom-design", changefreq: "monthly", priority: "0.6" },
          { path: "/wishlist", changefreq: "monthly", priority: "0.3" },
        ];

        for (const c of CATEGORIES) {
          entries.push({ path: `/shop/${c.slug}`, changefreq: "weekly", priority: "0.8" });
          for (const s of SUBCATEGORIES) entries.push({ path: `/shop/${c.slug}/${s.slug}`, changefreq: "weekly", priority: "0.6" });
        }

        // Fetch live products from MongoDB instead of the static file
        try {
          const res = await fetch(`${API_URL}/api/products`);
          const json = await res.json();
          const products = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
          for (const p of products) {
            const id = p.id || p._id;
            entries.push({ path: `/product/${id}`, changefreq: "weekly", priority: "0.7" });
          }
        } catch (err) {
          console.error("Sitemap: failed to fetch live products", err);
        }

        const urls = entries.map((e) =>
          [`  <url>`, `    <loc>${BASE_URL}${e.path}</loc>`, e.changefreq && `    <changefreq>${e.changefreq}</changefreq>`, e.priority && `    <priority>${e.priority}</priority>`, `  </url>`]
            .filter(Boolean).join("\n"),
        );
        const xml = [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`, ...urls, `</urlset>`].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});