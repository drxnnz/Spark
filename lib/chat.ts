export const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "👍", "🔥"] as const;

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Time today, otherwise short date. */
export function formatListTime(iso: string): string {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString()
    ? formatClock(iso)
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}
