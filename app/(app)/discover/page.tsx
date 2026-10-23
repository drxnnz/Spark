import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiscoverDeck } from "@/components/features/discover/discover-deck";
import type { Profile } from "@/types";

type Me = Pick<Profile, "photos" | "lat" | "pref_age_min" | "pref_age_max" | "pref_distance_km">;

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles")
    .select("photos, lat, pref_age_min, pref_age_max, pref_distance_km").eq("id", user.id).single<Me>();
  if (!me) redirect("/login");

  return (
    <div className="mx-auto max-w-md px-4 py-4 md:py-8">
      <DiscoverDeck
        userId={user.id}
        myPhoto={me.photos[0] ?? null}
        hasLocation={me.lat !== null}
        prefs={{ ageMin: me.pref_age_min, ageMax: me.pref_age_max, distanceKm: me.pref_distance_km }}
      />
    </div>
  );
}
