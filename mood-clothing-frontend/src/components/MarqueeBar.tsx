// PROMOTIONAL MARQUEE: edit the strings below any time — nothing else needs to change.
// They scroll continuously left, loop seamlessly, and pause on hover (desktop only).
const MARQUEE_ITEMS = [
  "FREE SHIPPING ON ORDERS OVER ₦1,500",
  "NEW ARRIVALS EVERY WEEK",
  "7-DAY EASY RETURNS",
  "SECURE CHECKOUT · CUSTOM DESIGN AVAILABLE",
];

export function MarqueeBar() {
  const track = MARQUEE_ITEMS.join("   ✦   ");

  return (
    <div className="w-full overflow-hidden bg-foreground text-background">
      <div className="marquee-track flex w-max whitespace-nowrap py-2">
        <span className="pr-16 text-[10px] uppercase tracking-[0.25em] md:text-[11px]">
          {track}
        </span>
        {/* Duplicate copy, hidden from screen readers, makes the loop seamless */}
        <span className="pr-16 text-[10px] uppercase tracking-[0.25em] md:text-[11px]" aria-hidden="true">
          {track}
        </span>
      </div>
    </div>
  );
}
