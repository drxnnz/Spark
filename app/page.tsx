import Link from "next/link";

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <span className="font-display text-2xl">Spark</span>
        <Link href="/login" className="text-sm font-medium">Log in</Link>
      </header>
      <section className="flex flex-1 flex-col justify-center gap-6 py-16 md:max-w-xl">
        <h1 className="font-display text-5xl leading-[1.05] md:text-6xl">Slow down. Meet someone worth talking to.</h1>
        <p className="text-lg text-ink/65">No gimmicks, no subscriptions. Just real profiles and real conversations.</p>
        <Link href="/signup" className="inline-flex h-12 w-fit items-center rounded-full bg-ember px-8 font-medium text-white">
          Get started — it&apos;s free
        </Link>
      </section>
    </main>
  );
}
