"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // ---- Submit ----
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setNotice(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else { router.replace("/discover"); router.refresh(); }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else if (!data.session) setNotice("Check your email to confirm your account.");
      else { router.replace("/onboarding"); router.refresh(); }
    }
    setLoading(false);
  }

  const isLogin = mode === "login";
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full max-w-sm space-y-5"
    >
      <div>
        <h1 className="font-display text-3xl">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-ink/60">{isLogin ? "Pick up where you left off." : "It takes about a minute."}</p>
      </div>
      <Input label="Email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Password" name="password" type="password" required minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p role="alert" className="text-sm text-ember">{error}</p>}
      {notice && <p className="text-sm text-moss">{notice}</p>}
      <Button type="submit" loading={loading} className="w-full">{isLogin ? "Log in" : "Sign up"}</Button>
      <p className="text-center text-sm text-ink/60">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-ember">{isLogin ? "Sign up" : "Log in"}</Link>
      </p>
    </motion.form>
  );
}
