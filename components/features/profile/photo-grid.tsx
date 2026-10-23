"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MAX_PHOTOS } from "@/lib/profile";

const BUCKET = "photos";
const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  userId: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  /** Photos that must remain (delete is disabled below this). */
  min?: number;
}

export function PhotoGrid({ userId, photos, onChange, min = 1 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Upload ----
  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const added: string[] = [];

    for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
      if (!file.type.startsWith("image/")) { setError("Only image files are allowed."); continue; }
      if (file.size > MAX_BYTES) { setError("Each photo must be under 5 MB."); continue; }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (upErr) { setError("Upload failed. Please try again."); continue; }
      added.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }

    if (added.length) onChange([...photos, ...added]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  // ---- Delete ----
  async function remove(url: string) {
    const path = url.split(`/${BUCKET}/`)[1];
    onChange(photos.filter((p) => p !== url));
    if (path) await createClient().storage.from(BUCKET).remove([path]);
  }

  // ---- Reorder (first photo is the main one) ----
  function move(index: number, dir: -1 | 1) {
    const next = [...photos];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    onChange(next);
  }

  const btn = "grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-white disabled:opacity-30";

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <li key={url} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ink/5">
            <Image src={url} alt={`Photo ${i + 1}`} fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium">Main</span>}
            <button type="button" aria-label="Delete photo" disabled={photos.length <= min} onClick={() => remove(url)}
              className={`${btn} absolute right-1.5 top-1.5`}><X size={14} /></button>
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
              <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => move(i, -1)} className={btn}><ArrowLeft size={14} /></button>
              <button type="button" aria-label="Move right" disabled={i === photos.length - 1} onClick={() => move(i, 1)} className={btn}><ArrowRight size={14} /></button>
            </div>
          </li>
        ))}
        {photos.length < MAX_PHOTOS && (
          <li>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className="grid aspect-[3/4] w-full place-items-center rounded-xl border-2 border-dashed border-ink/20 text-ink/50 transition-colors hover:border-ember hover:text-ember disabled:opacity-60">
              {uploading ? <Loader2 className="animate-spin" /> : <Plus />}
            </button>
          </li>
        )}
      </ul>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      <p className="text-xs text-ink/55">{photos.length}/{MAX_PHOTOS} photos · first photo is your main one · max 5 MB each</p>
      {error && <p role="alert" className="text-sm text-ember">{error}</p>}
    </div>
  );
}
