import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatchList } from "@/components/features/matches/match-list";
import type { MatchSummary } from "@/types";

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("my_matches");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 font-display text-3xl">Matches</h1>
      {error
        ? <p role="alert" className="text-sm text-ember">Couldn&apos;t load your matches. Please refresh.</p>
        : <MatchList matches={(data ?? []) as MatchSummary[]} userId={user.id} />}
    </div>
  );
}
