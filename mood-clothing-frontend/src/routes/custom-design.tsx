import { createFileRoute } from "@tanstack/react-router";
import { Upload, X, ImagePlus } from "lucide-react";
import { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/custom-design")({
  head: () => ({
    meta: [
      { title: "Custom Design — Mood Clothings" },
      { name: "description", content: "Upload your own design and let the Mood Clothings atelier bring it to life." },
    ],
  }),
  component: CustomDesign,
});

function CustomDesign() {
  const { user, openLogin } = useStore(); 
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // FIXED: Migrated local storage blob mapping hooks to secure asynchronous Cloudinary pipelines
  const addFiles = async (list: FileList | null) => {
    if (!user) {
      toast.error("Please sign in or create an account to upload design materials.");
      openLogin();
      return;
    }
    if (!list || list.length === 0) return;
    
    const filesArray = Array.from(list).slice(0, 6 - files.length);
    if (filesArray.length === 0) {
      toast.error("You can upload a maximum of 6 attachment files per design brief.");
      return;
    }

    toast.info(`Uploading ${filesArray.length} material attachment streams to the cloud...`);

    const CLOUD_NAME = "gam6ajgd"; 
    const UPLOAD_PRESET = "mood_clothings"; 

    try {
      const uploadedUrls = await Promise.all(
        filesArray.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error?.message || "Cloud bucket rejected file streams.");
          }

          const data = await res.json();
          return { name: file.name, url: data.secure_url }; // Returns permanent secure web link
        })
      );

      setFiles((prev) => [...prev, ...uploadedUrls].slice(0, 6));
      toast.success("Design materials safely secured on cloud infrastructure!");
    } catch (err: any) {
      console.error("Atelier upload handshake tracking error:", err);
      toast.error(err.message || "Failed to host file stream attachments on the cloud.");
    }
  };

  const handleSubmitBrief = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Authentication required to submit custom briefs.");
      openLogin();
      return;
    }

    setSubmitting(true);
    const targetForm = e.currentTarget as HTMLFormElement;
    const nameInput = targetForm.elements[0] as HTMLInputElement;
    const emailInput = targetForm.elements[1] as HTMLInputElement;

    try {
      const token = localStorage.getItem("mood-clothings-auth-token");
      
      const res = await fetch("http://localhost:5000/api/custom-designs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerName: nameInput.value.trim(),
          userEmail: emailInput.value.trim().toLowerCase(),
          files: files, // Sending files object structure tracking reference items
          notes: notes.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "The Atelier server rejected this custom design structure request.");
      }

      toast.success("Design brief submitted — our atelier will be in touch.");
      setFiles([]);
      setNotes("");
    } catch (err: any) {
      console.error("Atelier brief error track:", err);
      toast.error(err.message || "Failed to deliver design brief parameters to database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
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
                  {/\.(png|jpg|jpeg|gif|webp|avif)$/i.test(f.name) || f.url.startsWith("http") ? (
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

        <form onSubmit={handleSubmitBrief} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
            <input required defaultValue={user?.name ?? ""} className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
            <input required type="email" defaultValue={user?.email ?? ""} className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-sm outline-none focus:border-foreground" />
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
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-foreground py-3 text-xs uppercase tracking-widest text-background transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {submitting ? "Delivering Brief..." : "Submit Design Brief"}
          </button>
        </form>
      </div>
    </div>
  );
}