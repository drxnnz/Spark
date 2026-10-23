"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { Compass, Heart, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SafetyDialog } from "@/components/features/safety/safety-dialog";
import { SwipeCard } from "./swipe-card";
import { MatchDialog } from "./match-dialog";
import { useDiscover } from "@/hooks/use-discover";
import { useProfileSave } from "@/hooks/use-profile-save";
import type { DiscoverCandidate } from "@/types";

interface Props {
  userId: string;
  myPhoto: string | null;
  hasLocation: boolean;
  prefs: { ageMin: number; ageMax: number; distanceKm: number };
}

export function DiscoverDeck({ userId, myPhoto, hasLocation, prefs }: Props) {
  const d = useDiscover(userId);
  const { save } = useProfileSave(userId);
  const [locState, setLocState] = useState<"idle" | "asking" | "denied" | "done">(hasLocation ? "done" : "idle");
  const [reporting, setReporting] = useState<DiscoverCandidate | null>(null);

  // ---- Location (needed for the distance filter) ----
  function requestLocation() {
    setLocState("asking");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const ok = await save({ lat: coords.latitude, lng: coords.longitude });
        setLocState(ok ? "done" : "denied");
        if (ok) d.reload();
      },
      () => setLocState("denied"),
      { timeout: 10000 }
    );
  }

  const firstLoad = d.loading && !d.current;

  return (
    <div className="space-y-4">
      {/* Filter summary */}
      <div className="flex items-center justify-between text-xs text-ink/60">
        <span>Ages {prefs.ageMin}–{prefs.ageMax} · within {prefs.distanceKm} km</span>
        <Link href="/profile" className="font-medium text-ember">Change</Link>
      </div>

      {locState !== "done" && (
        <div className="flex items-center gap-3 rounded-2xl bg-ember-soft p-3 text-sm">
          <MapPin size={18} className="shrink-0 text-ember" />
          <p className="flex-1">{locState === "denied" ? "Location unavailable. Distance filter is off." : "Turn on location to filter by distance."}</p>
          {locState !== "denied" && <Button className="h-9 px-4" loading={locState === "asking"} onClick={requestLocation}>Enable</Button>}
        </div>
      )}

      {/* Deck */}
      <div className="relative h-[60dvh] min-h-[380px] md:h-[68dvh]">
        {firstLoad && <div className="absolute inset-0 animate-pulse rounded-3xl bg-ink/10" aria-label="Loading people" />}

        {d.next?.photos[0] && (
          <div className="absolute inset-0 scale-95 overflow-hidden rounded-3xl bg-ink/10">
            <Image src={d.next.photos[0]} alt="" fill sizes="448px" className="object-cover" />
          </div>
        )}

        <AnimatePresence custom={d.exitDir}>
          {d.current && (
            <SwipeCard key={d.current.id} candidate={d.current} exitDir={d.exitDir} onSwipe={d.swipe}
              onReport={() => setReporting(d.current ?? null)} />
          )}
        </AnimatePresence>

        {/* Empty / error state */}
        {!d.loading && !d.current && (
          <div className="absolute inset-0 grid place-items-center rounded-3xl border border-dashed border-ink/20">
            <EmptyState icon={Compass}
              title={d.error ? "Couldn't load people" : "You're all caught up"}
              description={d.error ?? "No one new matches your filters right now. Widen your age or distance, or check back later."}>
              <Button variant="outline" onClick={d.reload}>Refresh</Button>
              <Link href="/profile" className="inline-flex h-11 items-center rounded-full bg-ember px-6 text-sm font-medium text-white">Edit filters</Link>
            </EmptyState>
          </div>
        )}
      </div>

      {/* Swipe error (card was restored) */}
      {d.error && d.current && <p role="alert" className="text-center text-sm text-ember">{d.error}</p>}

      {/* Actions */}
      <div className="flex justify-center gap-6">
        <button type="button" aria-label="Pass" disabled={!d.current} onClick={() => d.swipe(false)}
          className="grid h-16 w-16 place-items-center rounded-full border border-ink/15 bg-white text-ink/70 shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"><X size={28} /></button>
        <button type="button" aria-label="Like" disabled={!d.current} onClick={() => d.swipe(true)}
          className="grid h-16 w-16 place-items-center rounded-full bg-ember text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"><Heart size={28} /></button>
      </div>

      {d.match && <MatchDialog match={d.match} myPhoto={myPhoto} onClose={d.closeMatch} />}

      {/* Report: afterwards the card is passed so it never comes back */}
      {reporting && (
        <SafetyDialog mode="report" userId={userId} targetId={reporting.id} targetName={reporting.name}
          onClose={(r) => { setReporting(null); if (r.reported || r.blocked) void d.swipe(false); }} />
      )}
    </div>
  );
}
