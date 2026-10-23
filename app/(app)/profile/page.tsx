import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditor } from "@/components/features/profile/profile-editor";
import { ProfileSettings } from "@/components/features/profile/profile-settings";
import type { BlockedUser, Profile } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) redirect("/login");

  // Blocked users (two small queries; avoids FK-alias joins)
  const { data: blocks } = await supabase.from("blocks").select("blocked").eq("blocker", user.id);
  const ids = (blocks ?? []).map((b) => b.blocked as string);
  const { data: blocked } = ids.length
    ? await supabase.from("profiles").select("id, name, photos").in("id", ids)
    : { data: [] as BlockedUser[] };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <ProfileEditor profile={profile} />
      <ProfileSettings userId={user.id} blocked={(blocked ?? []) as BlockedUser[]} />
    </div>
  );
}
