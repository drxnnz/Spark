"use client";

import { ERRORS } from "@/lib/errors";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DiscoverCandidate } from "@/types";

export interface MatchResult { candidate: DiscoverCandidate; matchId: string }

/** Candidate queue, swipe recording and match detection. */
export function useDiscover(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const [queue, setQueue] = useState<DiscoverCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exitDir, setExitDir] = useState<1 | -1>(1);
  const [match, setMatch] = useState<MatchResult | null>(null);

  // ---- Load a batch ----
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.rpc("discover_candidates", { lim: 20 });
    if (error) { setError(ERRORS.load); setExhausted(true); }
    else { const rows = (data ?? []) as DiscoverCandidate[]; setQueue(rows); setExhausted(rows.length === 0); }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  // Refill when the queue runs dry (never while a swipe is saving)
  useEffect(() => {
    if (!loading && !swiping && !exhausted && queue.length === 0) void load();
  }, [loading, swiping, exhausted, queue.length, load]);

  // ---- Swipe ----
  const swipe = useCallback(async (liked: boolean) => {
    const top = queue[0];
    if (!top) return;
    setExitDir(liked ? 1 : -1);
    setQueue((q) => q.slice(1));
    setSwiping(true); setError(null);

    const { error } = await supabase.from("swipes").insert({ swiper: userId, target: top.id, liked });
    if (error) {
      setError(ERRORS.save);
      setQueue((q) => [top, ...q]);
    } else if (liked) {
      // DB trigger creates the match on mutual like; look it up
      const { data } = await supabase.from("matches").select("id")
        .or(`and(user_a.eq.${userId},user_b.eq.${top.id}),and(user_a.eq.${top.id},user_b.eq.${userId})`)
        .maybeSingle();
      if (data) setMatch({ candidate: top, matchId: data.id as string });
    }
    setSwiping(false);
  }, [queue, supabase, userId]);

  const reload = useCallback(() => { setExhausted(false); void load(); }, [load]);

  return {
    current: queue[0], next: queue[1], loading, exhausted, error, exitDir,
    match, closeMatch: () => setMatch(null), swipe, reload,
  };
}
