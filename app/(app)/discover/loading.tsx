export default function Loading() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-4 md:py-8" aria-label="Loading">
      <div className="h-4 w-2/3 animate-pulse rounded bg-ink/10" />
      <div className="h-[60dvh] min-h-[380px] animate-pulse rounded-3xl bg-ink/10 md:h-[68dvh]" />
      <div className="flex justify-center gap-6"><div className="h-16 w-16 animate-pulse rounded-full bg-ink/10" /><div className="h-16 w-16 animate-pulse rounded-full bg-ink/10" /></div>
    </div>
  );
}
