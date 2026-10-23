"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { formatListTime } from "@/lib/chat";
import { cn } from "@/lib/utils";
import type { MatchSummary } from "@/types";

export function MatchList({ matches, userId }: { matches: MatchSummary[]; userId: string }) {
  const router = useRouter();

  // ---- Live refresh on new messages / matches ----
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("matches-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => router.refresh())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "matches" }, () => router.refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [router]);

  // ---- Empty state ----
  if (matches.length === 0) {
    return (
      <EmptyState icon={Heart} title="No matches yet" description="Keep swiping. When you both like each other, they show up here.">
        <Link href="/discover" className="inline-flex h-11 items-center rounded-full bg-ember px-6 text-sm font-medium text-white">Go to Discover</Link>
      </EmptyState>
    );
  }

  return (
    <ul className="divide-y divide-ink/10">
      {matches.map((m) => {
        const unread = m.unread > 0;
        const preview = m.last_body ? `${m.last_sender === userId ? "You: " : ""}${m.last_body}` : "New match — say hi!";
        return (
          <li key={m.match_id}>
            <Link href={`/matches/${m.match_id}`} className="flex items-center gap-3 py-3 transition-colors hover:bg-ink/[0.03]">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-ink/10">
                {m.photo && <Image src={m.photo} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate", unread ? "font-semibold" : "font-medium")}>{m.name}</p>
                <p className={cn("truncate text-sm", unread ? "font-medium text-ink" : "text-ink/55")}>{preview}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span suppressHydrationWarning className="text-xs text-ink/50">{formatListTime(m.last_at ?? m.created_at)}</span>
                {unread && <span aria-label={`${m.unread} unread`} className="grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1.5 text-[11px] font-semibold text-white">{m.unread}</span>}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
