import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const styles: Record<Variant, string> = {
  primary: "bg-ember text-white hover:bg-ember/90",
  outline: "border border-ink/15 hover:bg-ink/5",
  ghost: "hover:bg-ink/5",
};

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant], className
      )}
      {...rest}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
