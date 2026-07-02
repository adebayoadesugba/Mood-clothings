import { createFileRoute } from "@tanstack/react-router";
import { Upload, X, ImagePlus } from "lucide-react";
import { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { toast } from "sonner";

export const Route = createFileRoute("/custom-design")({
  head: () => ({
    meta: [
      { title: "Custom Design — Glamora" },
      { name: "description", content: "Upload your own design and let the Glamora atelier bring it to life." },
    ],
  }),
  component: CustomDesign,
});

function CustomDesign() {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState("");

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).slice(0, 6).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setFiles((prev) => [...prev, ...next].slice(0, 6));
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Custom Design" }]} />
      <div className="mt-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">The Atelier</p>
        <h1 className="mt-3 font-display text-4xl md:text-6xl">Bring your own design to life.</h1>
        <p className="mt-4 text-base text-muted-foreground">
          Upload sketches, moodboards, or photos. Our atelier will review and reach out within 48 hours with a bespoke quote.
        </p>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 text-center transition-colors ${dragging ? "border-foreground bg-secondary" : "border-hairline"}`}
          >
            <Upload className="h-8 w-8" />
            <div className="font-display text-xl">Drop your files here</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">or click to browse · PNG, JPG, PDF · up to 6 files</div>
            <input type="file" accept="image/*,application/pdf" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          </label>

          {files.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {files.map((f, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden bg-secondary">
                  {/\.(png|jpg|jpeg|gif|webp|avif)$/i.test(f.name) ? (
                    <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-muted-foreground"><ImagePlus className="h-6 w-6" /></div>
                  )}
                  <button
                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/90 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Design brief submitted — our atelier will be in touch."); setFiles([]); setNotes(""); }}
          className="space-y-4"
        >
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
            <input required className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
            <input required type="email" className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Tell us about the piece — silhouette, fabric, occasion, timeline."
              className="mt-1 w-full resize-none border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          <button type="submit" className="w-full bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01]">
            Submit Design Brief
          </button>
        </form>
      </div>
    </div>
  );
}
