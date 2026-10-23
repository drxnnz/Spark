"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Flag, MapPin } from "lucide-react";
import { ageFromBirthday } from "@/lib/utils";
import type { DiscoverCandidate } from "@/types";

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 600;

interface Props {
  candidate: DiscoverCandidate;
  exitDir: 1 | -1;
  onSwipe: (liked: boolean) => void;
  onReport: () => void;
}

export function SwipeCard({ candidate, exitDir, onSwipe, onReport }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // ---- Drag feedback ----
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-7, 7]);
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -20], [1, 0]);

  const { photos } = candidate;
  const age = candidate.birthday ? ageFromBirthday(candidate.birthday) : null;

  return (
    <motion.div
      ref={ref}
      custom={exitDir}
      style={{ x, rotate }}
      drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.7}
      onDragEnd={(_, { offset, velocity }) => {
        if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) onSwipe(true);
        else if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) onSwipe(false);
      }}
      // Tap left / right half to flip photos
      onTap={(event, info) => {
        if ((event.target as HTMLElement).closest("[data-no-flip]")) return; // report button
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const right = info.point.x - rect.left > rect.width / 2;
        setPhotoIndex((i) => Math.min(Math.max(i + (right ? 1 : -1), 0), photos.length - 1));
      }}
      initial={{ scale: 0.97, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={(dir: number) => ({ x: dir * 420, rotate: dir * 10, opacity: 0, transition: { duration: 0.22 } })}
      className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-3xl bg-ink/10 shadow-lg active:cursor-grabbing"
    >
      {photos[photoIndex] && (
        <Image src={photos[photoIndex]} alt={candidate.name} fill priority sizes="(max-width: 448px) 100vw, 448px" className="pointer-events-none select-none object-cover" />
      )}

      {/* Photo indicator */}
      {photos.length > 1 && (
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {photos.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i === photoIndex ? "bg-white" : "bg-white/40"}`} />)}
        </div>
      )}

      {/* Report */}
      <button type="button" data-no-flip aria-label={`Report ${candidate.name}`} onClick={onReport}
        className="absolute right-3 top-8 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/50"><Flag size={16} /></button>

      {/* Like / Pass stamps */}
      <motion.span style={{ opacity: likeOpacity }} className="absolute left-5 top-20 -rotate-12 rounded-lg border-2 border-white px-3 py-1 text-lg font-bold tracking-wide text-white">LIKE</motion.span>
      <motion.span style={{ opacity: passOpacity }} className="absolute right-5 top-20 rotate-12 rounded-lg border-2 border-white px-3 py-1 text-lg font-bold tracking-wide text-white">PASS</motion.span>

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5 pt-16 text-white">
        <h2 className="font-display text-3xl">{candidate.name}{age !== null && <span className="font-sans text-2xl font-normal">, {age}</span>}</h2>
        {candidate.distance_km !== null && (
          <p className="flex items-center gap-1 text-xs text-white/80"><MapPin size={12} /> {candidate.distance_km} km away</p>
        )}
        {candidate.bio && <p className="line-clamp-2 text-sm text-white/90">{candidate.bio}</p>}
        <div className="flex flex-wrap gap-1.5">
          {candidate.interests.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs backdrop-blur">{tag}</span>)}
        </div>
      </div>
    </motion.div>
  );
}
