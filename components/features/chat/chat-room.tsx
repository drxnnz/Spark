"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, Flag, MessageCircle, MoreVertical, Send, Video, X } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SafetyDialog, type SafetyResult } from "@/components/features/safety/safety-dialog";
import { MessageBubble } from "./message-bubble";
import { useChat } from "@/hooks/use-chat";
import type { Message, ProfilePreview, Reaction } from "@/types";

interface Props {
  matchId: string;
  userId: string;
  peer: ProfilePreview;
  initialMessages: Message[];
  initialReactions: Reaction[];
}

const menuItem = "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-ink/5";

export function ChatRoom({ matchId, userId, peer, initialMessages, initialReactions }: Props) {
  const router = useRouter();
  const chat = useChat(matchId, userId, initialMessages, initialReactions);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"report" | "block" | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);

  // ---- Derived data ----
  const byId = useMemo(() => new Map(chat.messages.map((m) => [m.id, m])), [chat.messages]);
  const reactionsByMessage = useMemo(() => {
    const map = new Map<string, Reaction[]>();
    chat.reactions.forEach((r) => map.set(r.message_id, [...(map.get(r.message_id) ?? []), r]));
    return map;
  }, [chat.reactions]);
  const lastMineId = useMemo(() => [...chat.messages].reverse().find((m) => m.sender === userId)?.id, [chat.messages, userId]);

  // ---- Keep newest message in view ----
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: firstScroll.current ? "auto" : "smooth" });
    firstScroll.current = false;
  }, [chat.messages.length]);

  // ---- Submit ----
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || chat.sending) return;
    if (await chat.send(body, replyTo?.id ?? null)) { setDraft(""); setReplyTo(null); }
  }

  // ---- After report / block: leave the chat if blocked ----
  function onSafetyClose(result: SafetyResult) {
    setDialog(null);
    if (result.blocked) { router.replace("/matches"); router.refresh(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper md:static md:z-auto md:h-dvh">
      {/* Header */}
      <header className="relative flex items-center gap-3 border-b border-ink/10 px-4 py-3">
        <Link href="/matches" aria-label="Back to matches" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"><ArrowLeft size={20} /></Link>
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-ink/10">
          {peer.photos[0] && <Image src={peer.photos[0]} alt="" fill sizes="40px" className="object-cover" />}
        </div>
        <h1 className="flex-1 truncate font-medium">{peer.name}</h1>
        <button type="button" disabled title="Video call — coming soon" aria-label="Video call, coming soon"
          className="flex h-9 items-center gap-1.5 rounded-full border border-ink/15 px-3 text-xs text-ink/50 disabled:cursor-not-allowed">
          <Video size={15} /> Soon
        </button>
        <button type="button" aria-label="More options" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"><MoreVertical size={20} /></button>

        {menuOpen && (
          <>
            <button type="button" tabIndex={-1} aria-hidden className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
            <div role="menu" className="absolute right-4 top-14 z-20 w-44 overflow-hidden rounded-xl border border-ink/10 bg-white py-1 shadow-lg">
              <button role="menuitem" className={menuItem} onClick={() => { setMenuOpen(false); setDialog("report"); }}><Flag size={16} /> Report</button>
              <button role="menuitem" className={`${menuItem} text-ember`} onClick={() => { setMenuOpen(false); setDialog("block"); }}><Ban size={16} /> Block</button>
            </div>
          </>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" onClick={(e) => { if (e.target === e.currentTarget) setActiveId(null); }}>
        {chat.messages.length === 0 ? (
          <div className="grid h-full place-items-center">
            <EmptyState icon={MessageCircle} title={`Say hi to ${peer.name}`} description="You matched! A simple hello or a question about their bio is a great start." />
          </div>
        ) : chat.messages.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.sender === userId} userId={userId}
            quoted={m.reply_to ? byId.get(m.reply_to) : undefined}
            reactions={reactionsByMessage.get(m.id) ?? []}
            showStatus={m.id === lastMineId}
            active={activeId === m.id}
            onToggle={() => setActiveId((id) => (id === m.id ? null : m.id))}
            onReply={() => { setReplyTo(m); setActiveId(null); }}
            onReact={(emoji) => { void chat.react(m.id, emoji); setActiveId(null); }} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-ink/10 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        {chat.error && <p role="alert" className="mb-2 text-sm text-ember">{chat.error}</p>}
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-ember bg-ink/5 px-3 py-2 text-xs">
            <p className="line-clamp-1 flex-1 text-ink/70">Replying to: {replyTo.body}</p>
            <button type="button" aria-label="Cancel reply" onClick={() => setReplyTo(null)}><X size={14} /></button>
          </div>
        )}
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} placeholder="Message…" aria-label="Message"
            className="h-11 flex-1 rounded-full border border-ink/15 bg-white px-4 text-base outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 md:text-sm" />
          <button type="submit" aria-label="Send" disabled={!draft.trim() || chat.sending}
            className="grid h-11 w-11 place-items-center rounded-full bg-ember text-white transition-transform active:scale-95 disabled:opacity-40"><Send size={18} /></button>
        </form>
      </div>

      {dialog && <SafetyDialog mode={dialog} userId={userId} targetId={peer.id} targetName={peer.name} onClose={onSafetyClose} />}
    </div>
  );
}
