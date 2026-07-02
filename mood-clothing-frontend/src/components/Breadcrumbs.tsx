import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {c.to && !last ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <Link to={c.to as any} params={c.params as any} className="hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className={last ? "text-foreground" : ""}>{c.label}</span>
            )}
            {!last && <ChevronRight className="h-3 w-3" />}
          </span>
        );
      })}
    </nav>
  );
}
