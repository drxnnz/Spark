import type { LucideIcon } from "lucide-react";

interface Props { icon: LucideIcon; title: string; description: string; children?: React.ReactNode }

export function EmptyState({ icon: Icon, title, description, children }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-ember-soft text-ember"><Icon size={26} /></span>
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="max-w-xs text-sm text-ink/60">{description}</p>
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
