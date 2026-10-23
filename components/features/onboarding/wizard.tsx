"use client";

import { ERRORS } from "@/lib/errors";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PhotoGrid } from "@/components/features/profile/photo-grid";
import { BasicInfoFields, BioInterestsFields, PreferenceFields } from "@/components/features/profile/profile-fields";
import { useProfileSave } from "@/hooks/use-profile-save";
import { validateStep, type ProfileFields } from "@/lib/profile";

// ---- Step config ----
const STEPS = [
  { title: "Add your photos", subtitle: "Show your best self. At least one, up to six." },
  { title: "About you", subtitle: "The basics people see first." },
  { title: "Bio & interests", subtitle: "Give people something to talk about." },
  { title: "Who do you want to meet?", subtitle: "You can change this anytime." },
] as const;

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

export function OnboardingWizard({ userId, initial }: { userId: string; initial: ProfileFields }) {
  const router = useRouter();
  const { save, saving } = useProfileSave(userId);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<ProfileFields>(initial);
  const [error, setError] = useState<string | null>(null);

  const isLast = step === STEPS.length - 1;
  const patch = (p: Partial<ProfileFields>) => { setForm((f) => ({ ...f, ...p })); setError(null); };

  // ---- Navigation ----
  async function next() {
    const invalid = validateStep(step, form);
    if (invalid) return setError(invalid);

    // Persist progress each step; finish flips `onboarded`
    const ok = await save({ ...form, name: form.name.trim(), bio: form.bio.trim(), ...(isLast && { onboarded: true }) });
    if (!ok) return setError(ERRORS.save);

    if (isLast) { router.replace("/discover"); router.refresh(); return; }
    setDir(1); setStep((s) => s + 1);
  }

  function back() { setDir(-1); setStep((s) => s - 1); setError(null); }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-8">
      {/* Progress */}
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/55">Step {step + 1} of {STEPS.length}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
          <motion.div className="h-full rounded-full bg-ember" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-6">
            <div>
              <h1 className="font-display text-3xl">{STEPS[step].title}</h1>
              <p className="mt-1 text-sm text-ink/60">{STEPS[step].subtitle}</p>
            </div>
            {step === 0 && <PhotoGrid userId={userId} photos={form.photos} onChange={(photos) => patch({ photos })} />}
            {step === 1 && <BasicInfoFields value={form} onChange={patch} />}
            {step === 2 && <BioInterestsFields value={form} onChange={patch} />}
            {step === 3 && <PreferenceFields value={form} onChange={patch} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-8 space-y-3">
        {error && <p role="alert" className="text-sm text-ember">{error}</p>}
        <div className="flex gap-3">
          {step > 0 && <Button variant="outline" onClick={back} disabled={saving}>Back</Button>}
          <Button className="flex-1" onClick={next} loading={saving}>{isLast ? "Finish" : "Continue"}</Button>
        </div>
      </div>
    </div>
  );
}
