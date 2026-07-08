import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

// Clean inline utility to force parameters into lowercase, singular router-compliant slugs
const cleanParamSlug = (text: string): string => {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/[\s_-]+/g, '-') 
    .replace(/^-+|-+$/g, '');

  // FIXED PLURAL STRIPPER: Automatically converts common plurals like 't-textbooks', 't-shirts' or 'jeans' back to match your active slugs
  if (slug === "t-shirts") slug = "t-shirt";
  if (slug === "jeans") slug = "jean";
  if (slug === "joggers") slug = "joggers"; // keeps as defined in type
  if (slug === "hoodies") slug = "hoodies"; // keeps as defined in type
  if (slug === "track suites" || slug === "tracksuits") slug = "tracksuit";

  return slug;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-4">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        
        // Safely process param tokens so router parameters never break via string case mismatches
        const normalizedParams = c.params
          ? Object.keys(c.params).reduce((acc, key) => {
              const val = c.params![key];
              acc[key] = val === "unisex" ? "men" : cleanParamSlug(val);
              return acc;
            }, {} as Record<string, string>)
          : undefined;

        return (
          <span key={i} className="flex items-center gap-2">
            {c.to && !last ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <Link to={c.to as any} params={normalizedParams as any} className="hover:text-foreground transition-colors font-medium">
                {c.label}
              </Link>
            ) : (
              <span className={last ? "text-foreground font-semibold" : ""}>{c.label}</span>
            )}
            {!last && <ChevronRight className="h-4 w-4 text-muted-foreground/60" />}
          </span>
        );
      })}
    </nav>
  );
}