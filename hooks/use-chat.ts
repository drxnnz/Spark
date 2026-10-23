"use client";

import { ERRORS } from "@/lib/errors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message, Reaction } from "@/types";

const sameReaction = (a: Reaction, b: Pick<Reaction, "message_id" | "user_id">) =>
  a.message_id === b.message_id && a.user_id === b.user_id;

/** Messages, reactions, seen status and realtime sync for one chat. */
export function useChat(matchId: string, userId: string, initialMessages: Message[], initialReactions: Reaction[]) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState(initialMessages);
  const [reactions, setReactions] = useState(initialReactions);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageIds = useRef(new Set<string>());

  useEffect(() => { messageIds.current = new Set(messages.map((m) => m.id)); }, [messages]);

  // ---- Add message (dedupe + keep order) ----
  const addMessage = useCallback((m: Message) => {
    setMessages((prev) => prev.some((x) => x.id === m.id) ? prev
      : [...prev, m].sort((a, b) => a.created_at.localeCompare(b.created_at)));
  }, []);

  // ---- Realtime ----
  useEffect(() => {
    const channel = supabase.channel(`chat:${matchId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (p) => addMessage(p.new as Message))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (p) => { const m = p.new as Message; setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x))); })
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions" }, (p) => {
        if (p.eventType === "DELETE") {
          const old = p.old as Pick<Reaction, "message_id" | "user_id">;
          setReactions((rs) => rs.filter((r) => !sameReaction(r, old)));
          return;
        }
        const r = p.new as Reaction;
        if (!messageIds.current.has(r.message_id)) return;
        setReactions((rs) => [...rs.filter((x) => !sameReaction(x, r)), r]);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase, matchId, addMessage]);

  // ---- Seen: mark incoming messages as seen while chat is open ----
  useEffect(() => {
    if (!messages.some((m) => m.sender !== userId && !m.seen_at)) return;
    void supabase.from("messages").update({ seen_at: new Date().toISOString() })
      .eq("match_id", matchId).neq("sender", userId).is("seen_at", null);
  }, [messages, supabase, matchId, userId]);

  // ---- Send ----
  const send = useCallback(async (body: string, replyTo: string | null): Promise<boolean> => {
    setSending(true); setError(null);
    const { data, error } = await supabase.from("messages")
      .insert({ match_id: matchId, sender: userId, body, reply_to: replyTo }).select().single<Message>();
    setSending(false);
    if (error || !data) { setError(ERRORS.send); return false; }
    addMessage(data);
    return true;
  }, [supabase, matchId, userId, addMessage]);

  // ---- React (same emoji again removes it) ----
  const react = useCallback(async (messageId: string, emoji: string) => {
    const key = { message_id: messageId, user_id: userId };
    const existing = reactions.find((r) => sameReaction(r, key));
    setError(null);

    if (existing?.emoji === emoji) {
      setReactions((rs) => rs.filter((r) => !sameReaction(r, key)));
      const { error } = await supabase.from("reactions").delete().match(key);
      if (error) setError(ERRORS.generic);
    } else {
      const row: Reaction = { ...key, emoji };
      setReactions((rs) => [...rs.filter((r) => !sameReaction(r, key)), row]);
      const { error } = await supabase.from("reactions").upsert(row);
      if (error) setError(ERRORS.generic);
    }
  }, [reactions, supabase, userId]);

  return { messages, reactions, sending, error, send, react };
}
