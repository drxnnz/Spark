export type Gender = "man" | "woman" | "nonbinary";

export interface Profile {
  id: string;
  name: string;
  bio: string;
  birthday: string | null;
  gender: Gender | null;
  interests: string[];
  photos: string[];
  lat: number | null;
  lng: number | null;
  pref_gender: Gender[];
  pref_age_min: number;
  pref_age_max: number;
  pref_distance_km: number;
  onboarded: boolean;
}

export interface Message {
  id: string;
  match_id: string;
  sender: string;
  body: string;
  reply_to: string | null;
  seen_at: string | null;
  created_at: string;
}

/** Minimal profile shape for the blocked-users list. */
export type BlockedUser = Pick<Profile, "id" | "name" | "photos">;

export type ProfilePreview = BlockedUser;

export interface Reaction { message_id: string; user_id: string; emoji: string }

/** Row returned by the `discover_candidates` RPC. */
export interface DiscoverCandidate {
  id: string; name: string; bio: string; birthday: string | null;
  interests: string[]; photos: string[]; distance_km: number | null;
}

/** Row returned by the `my_matches` RPC. */
export interface MatchSummary {
  match_id: string; other_id: string; name: string; photo: string | null;
  last_body: string | null; last_sender: string | null; last_at: string | null;
  unread: number; created_at: string;
}
