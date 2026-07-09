import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 hairline-t bg-secondary/40">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-8 px-4 py-16 md:grid-cols-4 md:px-8">
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-widest">General</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/help">How it Works</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-widest">Products</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop/$gender" params={{ gender: "men" }}>Men Fashion</Link></li>
            <li><Link to="/shop/$gender" params={{ gender: "women" }}>Women Fashion</Link></li>
            <li><Link to="/shop/$gender" params={{ gender: "kids" }}>Kids Fashion</Link></li>
            <li><Link to="/shop/$gender/$sub" params={{ gender: "women", sub: "hoodies" }}>Hoodies</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-widest">Customer Service</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/help">Help &amp; Support</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-widest">Social Media</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="⁠@https://www.instagram.com/moodclothings/">Instagram</a></li>
            <li><a href="#">TikTok</a></li>
            <li><a href="https://www.facebook.com/people/Mood-Clothings/100067132988739/#">Facebook</a></li>
            
          </ul>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="pointer-events-none select-none px-4 pb-4 text-center font-display text-[8vw] leading-none tracking-[0.05em] text-foreground/5 md:px-8">
          MOOD CLOTHINGS
        </div>
      </div>
    </footer>
  );
}
