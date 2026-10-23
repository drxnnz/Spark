"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { PhotoGrid } from "./photo-grid";
import { BasicInfoFields, BioInterestsFields, PreferenceFields } from "./profile-fields";
import { useProfileSave } from "@/hooks/use-profile-save";
import { toFields, validateStep, type ProfileFields } from "@/lib/profile";
import { ageFromBirthday } from "@/lib/utils";
import type { Profile } from "@/types";

type SectionKey = "photos" | "about" | "prefs";
interface Notice { key: SectionKey; ok: boolean; text: string }

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { save, saving } = useProfileSave(profile.id);
  const [form, setForm] = useState<ProfileFields>(toFields(profile));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<SectionKey | null>(null);

  const patch = (p: Partial<ProfileFields>) => { setForm((f) => ({ ...f, ...p })); setNotice(null); };

  // ---- Save one section (validate first) ----
  async function saveSection(key: SectionKey, fields: Partial<ProfileFields>, invalid: string | null) {
    if (invalid) return setNotice({ key, ok: false, text: invalid });
    setBusy(key);
    const ok = await save(fields);
    setBusy(null);
    setNotice({ key, ok, text: ok ? "Saved" : "Couldn't save. Please try again." });
    if (ok) router.refresh();
  }

  // Photos auto-save as they change
  function onPhotos(photos: string[]) {
    patch({ photos });
    void saveSection("photos", { photos }, null);
  }

  const NoticeLine = ({ k }: { k: SectionKey }) =>
    notice?.key === k ? <p role={notice.ok ? "status" : "alert"} className={`text-sm ${notice.ok ? "text-moss" : "text-ember"}`}>{notice.text}</p> : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-ink/10">
          {profile.photos[0] && <Image src={profile.photos[0]} alt="" fill sizes="80px" className="object-cover" />}
        </div>
        <div>
          <h1 className="font-display text-3xl">{profile.name}{profile.birthday && `, ${ageFromBirthday(profile.birthday)}`}</h1>
          <p className="text-sm text-ink/60">This is how others see you.</p>
        </div>
      </div>

      <Section title="Photos" description="Changes save automatically.">
        <PhotoGrid userId={profile.id} photos={form.photos} onChange={onPhotos} />
        <NoticeLine k="photos" />
      </Section>

      <Section title="About you">
        <BasicInfoFields value={form} onChange={patch} />
        <BioInterestsFields value={form} onChange={patch} />
        <NoticeLine k="about" />
        <Button loading={saving && busy === "about"}
          onClick={() => saveSection("about",
            { name: form.name.trim(), birthday: form.birthday, gender: form.gender, bio: form.bio.trim(), interests: form.interests },
            validateStep(1, form) ?? validateStep(2, form))}>
          Save changes
        </Button>
      </Section>

      <Section title="Discovery preferences">
        <PreferenceFields value={form} onChange={patch} />
        <NoticeLine k="prefs" />
        <Button loading={saving && busy === "prefs"}
          onClick={() => saveSection("prefs",
            { pref_gender: form.pref_gender, pref_age_min: form.pref_age_min, pref_age_max: form.pref_age_max, pref_distance_km: form.pref_distance_km },
            validateStep(3, form))}>
          Save preferences
        </Button>
      </Section>
    </div>
  );
}
