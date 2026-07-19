// Mirrors ProductCard's exact shape (border, rounded corners, image area, two text lines)
// so the page doesn't visually "jump" when real cards swap in — same size, same position.
export function SkeletonProductCard() {
  return (
    <div className="border border-hairline/60 rounded-lg p-2 bg-background">
      <div className="skeleton-block rounded-sm aspect-[4/5] w-full" />
      <div className="mt-4 flex items-start justify-between gap-3 px-1 pb-1">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton-block h-3 w-3/4 rounded" />
          <div className="flex gap-1.5">
            <div className="skeleton-block h-2.5 w-2.5 rounded-full" />
            <div className="skeleton-block h-2.5 w-2.5 rounded-full" />
            <div className="skeleton-block h-2.5 w-2.5 rounded-full" />
          </div>
        </div>
        <div className="skeleton-block h-3 w-12 rounded shrink-0" />
      </div>
    </div>
  );
}
