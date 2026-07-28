import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

// Self-hosted by next/font, so no external request at runtime.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reba — the six weeks after birth",
  description:
    "A postpartum danger-sign companion for the family, covering the 42 days after discharge.",
};

// The family uses this on a phone, often one-handed and in a hurry. Zoom stays enabled.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (screen recorders, colour pickers, password managers) stamp attributes
    // onto <html> and <body> before React hydrates, which reads as a mismatch. Both elements need
    // this, and it is scoped to them alone — nothing we render inside is affected.
    // scroll-pt keeps anchored content clear of the sticky header.
    <html
      lang="en"
      className={`${inter.variable} scroll-pt-20`}
      suppressHydrationWarning
    >
      <body
        className="min-h-dvh bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
            <nav
              aria-label="Main"
              className="mx-auto flex max-w-5xl items-baseline gap-4 px-4 py-4 sm:gap-6 sm:px-6"
            >
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Reba
              </Link>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Kinyarwanda: <em>look</em>
              </p>
              <ul className="ml-auto flex items-center gap-4 text-sm sm:gap-5">
                <li>
                  <Link href="/" className="hover:underline">
                    Watch board
                  </Link>
                </li>
                <li>
                  <Link href="/eval" className="hover:underline">
                    Evaluation
                  </Link>
                </li>
              </ul>
            </nav>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <p className="text-xs text-muted-foreground">
              Reba is a triage prompt built on the WHO postnatal danger-sign protocol. It is not a
              diagnosis and never replaces a health worker.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
