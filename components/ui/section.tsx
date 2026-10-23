export function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5">
      <div>
        <h2 className="font-display text-xl">{title}</h2>
        {description && <p className="text-sm text-ink/60">{description}</p>}
      </div>
      {children}
    </section>
  );
}
