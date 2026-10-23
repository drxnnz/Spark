import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/layout/motion-provider";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Spark — meet someone real",
  description: "A calm, honest dating app.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#faf7f2" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans"><MotionProvider>{children}</MotionProvider></body>
    </html>
  );
}
