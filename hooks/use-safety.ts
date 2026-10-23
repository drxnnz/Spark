"use client";

import { useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReportReason } from "@/lib/safety";

export type ReportOutcome = "ok" | "duplicate" | "error";

/** Report and block actions. */
export function useSafety(userId: string) {
  const supabase = useMemo(() => createClient(), []);

  const report = useCallback(async (targetId: string, reason: ReportReason, note: string): Promise<ReportOutcome> => {
    const { error } = await supabase.from("reports")
      .insert({ reporter: userId, reported: targetId, reason, note: note.trim() || null });
    if (!error) return "ok";
    return error.code === "23505" ? "duplicate" : "error"; // unique (reporter, reported)
  }, [supabase, userId]);

  const block = useCallback(async (targetId: string): Promise<boolean> => {
    const { error } = await supabase.from("blocks")
      .upsert({ blocker: userId, blocked: targetId }, { onConflict: "blocker,blocked", ignoreDuplicates: true });
    return !error;
  }, [supabase, userId]);

  return { report, block };
}
