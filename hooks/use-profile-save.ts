"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

/** Saves a partial profile update. Returns true on success. */
export function useProfileSave(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (patch: Partial<Profile>): Promise<boolean> => {
      setSaving(true);
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      setSaving(false);
      return !error;
    },
    [supabase, userId]
  );

  return { save, saving };
}
