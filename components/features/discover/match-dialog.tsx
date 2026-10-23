"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MatchResult } from "@/hooks/use-discover";

function Avatar({ src }: { src: string | null | undefined }) {
  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-paper bg-ink/10">
      {src && <Image src={src} alt="" fill sizes="96px" className="object-cover" />}
    </div>
  );
}

/** Shown right after a mutual like. */
export function MatchDialog({ match, myPhoto, onClose }: { match: MatchResult; myPhoto: string | null; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-6" role="dialog" aria-modal="true" aria-label="It's a match">
      <motion.div initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.25 }}
        className="w-full max-w-sm space-y-6 rounded-3xl bg-paper p-8 text-center">
        <div className="flex justify-center -space-x-5">
          <Avatar src={myPhoto} /><Avatar src={match.candidate.photos[0]} />
        </div>
        <div>
          <h2 className="font-display text-3xl">It&apos;s a match!</h2>
          <p className="mt-1 text-sm text-ink/60">You and {match.candidate.name} liked each other.</p>
        </div>
        <div className="space-y-2">
          <Link href={`/matches/${match.matchId}`} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-ember text-sm font-medium text-white">Send a message</Link>
          <Button variant="ghost" className="w-full" onClick={onClose}>Keep swiping</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
