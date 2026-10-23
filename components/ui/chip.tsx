import { cn } from "@/lib/utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> { selected: boolean }

/** Toggle pill used for gender and interests. */
export function Chip({ selected, className, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "h-9 rounded-full border px-4 text-sm transition-colors",
        selected ? "border-ember bg-ember-soft text-ember" : "border-ink/15 hover:bg-ink/5",
        className
      )}
      {...rest}
    />
  );
}
