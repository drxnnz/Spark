"use client";

import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GENDER_OPTIONS, INTEREST_OPTIONS, MAX_AGE, MAX_BIO, MAX_INTERESTS, MIN_AGE, maxBirthday,
  type ProfileFields,
} from "@/lib/profile";
import type { Gender } from "@/types";

interface FieldProps {
  value: ProfileFields;
  onChange: (patch: Partial<ProfileFields>) => void;
}

const toggle = <T,>(list: T[], item: T) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

// ---- Name, birthday, gender ----
export function BasicInfoFields({ value, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <Input label="First name" name="name" maxLength={30} autoComplete="given-name"
        value={value.name} onChange={(e) => onChange({ name: e.target.value })} />
      <Input label="Birthday" name="birthday" type="date" max={maxBirthday()}
        value={value.birthday ?? ""} onChange={(e) => onChange({ birthday: e.target.value || null })} />
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Gender</span>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <Chip key={g.value} selected={value.gender === g.value} onClick={() => onChange({ gender: g.value })}>{g.label}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Bio + interests ----
export function BioInterestsFields({ value, onChange }: FieldProps) {
  const atLimit = value.interests.length >= MAX_INTERESTS;
  return (
    <div className="space-y-5">
      <Textarea label="Bio" name="bio" maxLength={MAX_BIO} hint={`${value.bio.length}/${MAX_BIO}`}
        placeholder="A few lines about you…" value={value.bio} onChange={(e) => onChange({ bio: e.target.value })} />
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Interests <span className="font-normal text-ink/50">({value.interests.length}/{MAX_INTERESTS})</span></span>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((tag) => {
            const selected = value.interests.includes(tag);
            return (
              <Chip key={tag} selected={selected} disabled={!selected && atLimit}
                onClick={() => onChange({ interests: toggle(value.interests, tag) })}>{tag}</Chip>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Discovery preferences ----
export function PreferenceFields({ value, onChange }: FieldProps) {
  const range = "w-full accent-ember";
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Show me</span>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <Chip key={g.value} selected={value.pref_gender.includes(g.value as Gender)}
              onClick={() => onChange({ pref_gender: toggle(value.pref_gender, g.value) })}>{g.label}</Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Age range: {value.pref_age_min} – {value.pref_age_max}</span>
        <input type="range" aria-label="Minimum age" className={range} min={MIN_AGE} max={MAX_AGE} value={value.pref_age_min}
          onChange={(e) => onChange({ pref_age_min: Math.min(Number(e.target.value), value.pref_age_max) })} />
        <input type="range" aria-label="Maximum age" className={range} min={MIN_AGE} max={MAX_AGE} value={value.pref_age_max}
          onChange={(e) => onChange({ pref_age_max: Math.max(Number(e.target.value), value.pref_age_min) })} />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Max distance: {value.pref_distance_km} km</span>
        <input type="range" aria-label="Maximum distance" className={range} min={1} max={200} step={1} value={value.pref_distance_km}
          onChange={(e) => onChange({ pref_distance_km: Number(e.target.value) })} />
      </div>
    </div>
  );
}
