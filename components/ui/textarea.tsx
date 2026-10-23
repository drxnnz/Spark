import { cn } from "@/lib/utils";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function Textarea({ label, hint, className, id, ...rest }: Props) {
  const areaId = id ?? rest.name;
  return (
    <label htmlFor={areaId} className="block space-y-1.5">
      <span className="flex justify-between text-sm font-medium">
        {label} {hint && <span className="font-normal text-ink/50">{hint}</span>}
      </span>
      <textarea
        id={areaId}
        className={cn(
          "min-h-28 w-full resize-none rounded-xl border border-ink/15 bg-white px-4 py-3 text-base outline-none md:text-sm",
          "focus:border-ember focus:ring-2 focus:ring-ember/20", className
        )}
        {...rest}
      />
    </label>
  );
}
