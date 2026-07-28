import type { Metadata, Viewport } from "next";
import Link from "next/link";

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
    // Browser extensions (screen recorders, password managers) stamp attributes onto <html> before
    // React hydrates, which reads as a mismatch. Scoped to this element only — it does not suppress
    // warnings for anything we render inside.
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>
          <header className="border-b">
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
