"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import type { BlockedUser } from "@/types";

export function ProfileSettings({ userId, blocked }: { userId: string; blocked: BlockedUser[] }) {
  const router = useRouter();
  const [list, setList] = useState(blocked);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // ---- Unblock ----
  async function unblock(id: string) {
    setPending(id); setError(null);
    const { error } = await createClient().from("blocks").delete().eq("blocker", userId).eq("blocked", id);
    setPending(null);
    if (error) return setError("Couldn't unblock. Please try again.");
    setList((l) => l.filter((u) => u.id !== id));
  }

  // ---- Logout ----
  async function logout() {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Section title="Settings">
      {/* Blocked users */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Blocked users</h3>
        {list.length === 0 ? (
          <p className="text-sm text-ink/55">You haven&apos;t blocked anyone.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {list.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-ink/10">
                  {u.photos[0] && <Image src={u.photos[0]} alt="" fill sizes="40px" className="object-cover" />}
                </div>
                <span className="flex-1 truncate text-sm">{u.name || "Unknown"}</span>
                <Button variant="outline" className="h-9 px-4" loading={pending === u.id} onClick={() => unblock(u.id)}>Unblock</Button>
              </li>
            ))}
          </ul>
        )}
        {error && <p role="alert" className="text-sm text-ember">{error}</p>}
      </div>

      {/* Video call placeholder */}
      <Button variant="outline" disabled className="w-full gap-2"><Video size={16} /> Video call · Coming soon</Button>

      {/* Logout */}
      <Button variant="ghost" className="w-full gap-2 text-ember" loading={loggingOut} onClick={logout}><LogOut size={16} /> Log out</Button>
    </Section>
  );
}
