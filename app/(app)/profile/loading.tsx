export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6" aria-label="Loading profile">
      <div className="flex items-center gap-4"><div className="h-20 w-20 animate-pulse rounded-full bg-ink/10" /><div className="h-8 w-48 animate-pulse rounded bg-ink/10" /></div>
      {[0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-ink/10" />)}
    </div>
  );
}
