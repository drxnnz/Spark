"use client";

import { MotionConfig } from "framer-motion";

/** Respect the user's "reduce motion" setting everywhere. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
