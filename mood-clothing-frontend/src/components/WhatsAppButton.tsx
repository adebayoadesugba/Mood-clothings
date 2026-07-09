import { MessageCircle } from "lucide-react";

const WA_NUMBER = "2349065623779"; // Nigeria +234
const WA_MSG = encodeURIComponent("Hi Mood Clothings, I have a question about your collection.");

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-foreground text-background shadow-lg transition-transform duration-200 hover:scale-110"
      style={{ willChange: "transform" }}
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
