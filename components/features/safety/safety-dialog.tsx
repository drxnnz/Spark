"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Textarea } from "@/components/ui/textarea";
import { useSafety } from "@/hooks/use-safety";
import { ERRORS } from "@/lib/errors";
import { MAX_NOTE, REPORT_REASONS, type ReportReason } from "@/lib/safety";

export interface SafetyResult { reported: boolean; blocked: boolean }
type View = "form" | "confirm" | "offer" | "blocked";

interface Props {
  userId: string;
  targetId: string;
  targetName: string;
  mode: "report" | "block";
  onClose: (result: SafetyResult) => void;
}

/** Bottom sheet on mobile, centered dialog on desktop. */
export function SafetyDialog({ userId, targetId, targetName, mode, onClose }: Props) {
  const { report, block } = useSafety(userId);
  const [view, setView] = useState<View>(mode === "report" ? "form" : "confirm");
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const result = useRef<SafetyResult>({ reported: false, blocked: false });

  const close = () => onClose(result.current);

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(result.current); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ---- Submit report ----
  async function submitReport() {
    if (!reason) return setError("Choose a reason first.");
    setBusy(true); setError(null);
    const outcome = await report(targetId, reason, note);
    setBusy(false);
    if (outcome === "error") return setError(ERRORS.generic);
    result.current.reported = true;
    setNotice(outcome === "duplicate" ? "You've already reported this person. We're on it." : "Thanks. We'll review your report.");
    setView("offer");
  }

  // ---- Block ----
  async function confirmBlock() {
    setBusy(true); setError(null);
    const ok = await block(targetId);
    setBusy(false);
    if (!ok) return setError(ERRORS.generic);
    result.current.blocked = true;
    setView("blocked");
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={close}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 md:items-center md:p-6" role="dialog" aria-modal="true">
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-5 rounded-t-3xl bg-paper p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:rounded-3xl">

        {view === "form" && (
          <>
            <div>
              <h2 className="font-display text-2xl">Report {targetName}</h2>
              <p className="text-sm text-ink/60">Your report is private. They won&apos;t be told.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {REPORT_REASONS.map((r) => (
                <Chip key={r.value} selected={reason === r.value} onClick={() => { setReason(r.value); setError(null); }}>{r.label}</Chip>
              ))}
            </div>
            <Textarea label="Add a note (optional)" name="note" maxLength={MAX_NOTE} hint={`${note.length}/${MAX_NOTE}`}
              className="min-h-20" value={note} onChange={(e) => setNote(e.target.value)} />
            {error && <p role="alert" className="text-sm text-ember">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" onClick={close} disabled={busy}>Cancel</Button>
              <Button className="flex-1" loading={busy} onClick={submitReport}>Submit report</Button>
            </div>
          </>
        )}

        {view === "offer" && (
          <>
            <div className="space-y-2 text-center">
              <CheckCircle2 className="mx-auto text-moss" size={36} />
              <h2 className="font-display text-2xl">Report sent</h2>
              <p className="text-sm text-ink/60">{notice}</p>
              <p className="text-sm text-ink/60">Want to block {targetName} too? You won&apos;t see each other anymore.</p>
            </div>
            {error && <p role="alert" className="text-center text-sm text-ember">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={close} disabled={busy}>Not now</Button>
              <Button className="flex-1" loading={busy} onClick={confirmBlock}>Block {targetName}</Button>
            </div>
          </>
        )}

        {view === "confirm" && (
          <>
            <div>
              <h2 className="font-display text-2xl">Block {targetName}?</h2>
              <p className="text-sm text-ink/60">You won&apos;t see each other in Discover and your chat will be hidden. You can undo this in Profile → Settings.</p>
            </div>
            {error && <p role="alert" className="text-sm text-ember">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" onClick={close} disabled={busy}>Cancel</Button>
              <Button className="flex-1" loading={busy} onClick={confirmBlock}>Block</Button>
            </div>
          </>
        )}

        {view === "blocked" && (
          <>
            <div className="space-y-2 text-center">
              <CheckCircle2 className="mx-auto text-moss" size={36} />
              <h2 className="font-display text-2xl">{targetName} is blocked</h2>
              <p className="text-sm text-ink/60">You can unblock anytime in Profile → Settings.</p>
            </div>
            <Button className="w-full" onClick={close}>Done</Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
