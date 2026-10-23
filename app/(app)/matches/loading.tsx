export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6" aria-label="Loading matches">
      <div className="h-8 w-40 animate-pulse rounded bg-ink/10" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-14 w-14 animate-pulse rounded-full bg-ink/10" />
          <div className="flex-1 space-y-2"><div className="h-4 w-1/3 animate-pulse rounded bg-ink/10" /><div className="h-3 w-2/3 animate-pulse rounded bg-ink/10" /></div>
        </div>
      ))}
    </div>
  );
}
