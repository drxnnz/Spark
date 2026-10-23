import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/features/onboarding/wizard";
import { toFields } from "@/lib/profile";
import type { Profile } from "@/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) redirect("/login");
  if (profile.onboarded) redirect("/discover");

  return <OnboardingWizard userId={user.id} initial={toFields(profile)} />;
}
