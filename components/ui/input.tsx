import { cn } from "@/lib/utils";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> { label: string }

export function Input({ label, className, id, ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border border-ink/15 bg-white px-4 text-base outline-none md:text-sm",
          "focus:border-ember focus:ring-2 focus:ring-ember/20", className
        )}
        {...rest}
      />
    </label>
  );
}
