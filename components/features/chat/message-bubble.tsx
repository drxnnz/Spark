"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Reply } from "lucide-react";
import { REACTION_EMOJIS, formatClock } from "@/lib/chat";
import { cn } from "@/lib/utils";
import type { Message, Reaction } from "@/types";

interface Props {
  message: Message;
  mine: boolean;
  userId: string;
  quoted?: Message;
  reactions: Reaction[];
  showStatus: boolean;
  active: boolean;
  onToggle: () => void;
  onReply: () => void;
  onReact: (emoji: string) => void;
}

export function MessageBubble({ message, mine, userId, quoted, reactions, showStatus, active, onToggle, onReply, onReact }: Props) {
  // Group reactions by emoji
  const grouped = reactions.reduce<Record<string, { count: number; mine: boolean }>>((acc, r) => {
    const g = acc[r.emoji] ?? { count: 0, mine: false };
    acc[r.emoji] = { count: g.count + 1, mine: g.mine || r.user_id === userId };
    return acc;
  }, {});

  return (
    <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      {/* Bubble */}
      <button type="button" onClick={onToggle}
        className={cn("max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-left text-sm",
          mine ? "rounded-br-md bg-ember text-white" : "rounded-bl-md border border-ink/10 bg-white")}>
        {message.reply_to && (
          <span className={cn("mb-1.5 block line-clamp-2 rounded-lg border-l-2 px-2 py-1 text-xs",
            mine ? "border-white/70 bg-white/15" : "border-ember bg-ink/5")}>
            {quoted ? quoted.body : "Original message unavailable"}
          </span>
        )}
        {message.body}
      </button>

      {/* Reactions */}
      {Object.keys(grouped).length > 0 && (
        <div className="-mt-2.5 flex gap-1 px-2">
          {Object.entries(grouped).map(([emoji, g]) => (
            <button key={emoji} type="button" onClick={() => onReact(emoji)}
              className={cn("rounded-full border bg-white px-1.5 py-0.5 text-xs shadow-sm", g.mine ? "border-ember" : "border-ink/10")}>
              {emoji}{g.count > 1 && <span className="ml-0.5 text-ink/60">{g.count}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="flex items-center gap-0.5 rounded-full border border-ink/10 bg-white px-1.5 py-1 shadow-md">
            {REACTION_EMOJIS.map((e) => (
              <button key={e} type="button" aria-label={`React ${e}`} onClick={() => onReact(e)} className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-ink/5">{e}</button>
            ))}
            <button type="button" aria-label="Reply" onClick={onReply} className="ml-1 grid h-8 w-8 place-items-center rounded-full text-ink/70 hover:bg-ink/5"><Reply size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time + seen */}
      <span suppressHydrationWarning className="px-1 text-[10px] text-ink/45">
        {formatClock(message.created_at)}{showStatus && ` · ${message.seen_at ? "Seen" : "Sent"}`}
      </span>
    </div>
  );
}
