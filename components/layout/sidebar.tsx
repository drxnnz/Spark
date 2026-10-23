"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

/** Desktop left sidebar. */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 p-6 md:flex">
      <span className="mb-10 font-display text-2xl">Spark</span>
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-ember-soft text-ember" : "text-ink/70 hover:bg-ink/5")}>
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
