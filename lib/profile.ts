import type { Gender, Profile } from "@/types";
import { ageFromBirthday } from "@/lib/utils";

// ---- Constants ----
export const MAX_PHOTOS = 6;
export const MAX_BIO = 300;
export const MAX_INTERESTS = 8;
export const MIN_AGE = 18;
export const MAX_AGE = 99;

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "nonbinary", label: "Non-binary" },
];

export const INTEREST_OPTIONS = [
  "Hiking", "Coffee", "Travel", "Cooking", "Gaming", "Photography", "Reading", "Music",
  "Movies", "Fitness", "Art", "Dancing", "Pets", "Anime", "Basketball", "Beach",
];

// ---- Editable fields (kept in sync with Profile) ----
export type ProfileFields = Pick<
  Profile,
  | "name" | "birthday" | "gender" | "bio" | "interests" | "photos"
  | "pref_gender" | "pref_age_min" | "pref_age_max" | "pref_distance_km"
>;

export function toFields(p: Profile): ProfileFields {
  return {
    name: p.name, birthday: p.birthday, gender: p.gender, bio: p.bio,
    interests: p.interests, photos: p.photos, pref_gender: p.pref_gender,
    pref_age_min: p.pref_age_min, pref_age_max: p.pref_age_max,
    pref_distance_km: p.pref_distance_km,
  };
}

/** Latest allowed birthday (user must be 18+). */
export function maxBirthday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE);
  return d.toISOString().slice(0, 10);
}

// ---- Validation: 0 photos, 1 basics, 2 bio+interests, 3 preferences ----
export function validateStep(step: number, f: ProfileFields): string | null {
  switch (step) {
    case 0:
      return f.photos.length < 1 ? "Add at least one photo." : null;
    case 1:
      if (f.name.trim().length < 2) return "Enter your name.";
      if (!f.birthday) return "Enter your birthday.";
      if (ageFromBirthday(f.birthday) < MIN_AGE) return "You must be 18 or older.";
      if (!f.gender) return "Select your gender.";
      return null;
    case 2:
      if (f.bio.length > MAX_BIO) return `Bio must be ${MAX_BIO} characters or fewer.`;
      if (f.interests.length < 1) return "Pick at least one interest.";
      return null;
    case 3:
      return f.pref_gender.length < 1 ? "Choose who you want to see." : null;
    default:
      return null;
  }
}
