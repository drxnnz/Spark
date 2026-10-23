import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatRoom } from "@/components/features/chat/chat-room";
import type { Message, ProfilePreview, Reaction } from "@/types";

export default async function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS guarantees only participants can read the match
  const { data: match } = await supabase.from("matches").select("id, user_a, user_b").eq("id", matchId).maybeSingle();
  if (!match) notFound();
  const peerId = match.user_a === user.id ? match.user_b : match.user_a;

  const { data: peer } = await supabase.from("profiles").select("id, name, photos").eq("id", peerId).single<ProfilePreview>();
  if (!peer) notFound();

  // Latest 200 messages, oldest first
  const { data: recent } = await supabase.from("messages").select("*").eq("match_id", matchId)
    .order("created_at", { ascending: false }).limit(200);
  const messages = ((recent ?? []) as Message[]).reverse();

  const ids = messages.map((m) => m.id);
  const { data: reactions } = ids.length
    ? await supabase.from("reactions").select("*").in("message_id", ids)
    : { data: [] as Reaction[] };

  return <ChatRoom matchId={matchId} userId={user.id} peer={peer} initialMessages={messages} initialReactions={(reactions ?? []) as Reaction[]} />;
}
