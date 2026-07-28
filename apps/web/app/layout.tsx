import type { Metadata } from "next";
import Link from "next/link";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reba — the six weeks after birth",
  description:
    "A postpartum danger-sign companion for the family, covering the 42 days after discharge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>
          <header className="border-b">
            <nav
              aria-label="Main"
              className="mx-auto flex max-w-5xl items-baseline gap-6 px-6 py-4"
            >
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Reba
              </Link>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Kinyarwanda: <em>look</em>
              </p>
              <ul className="ml-auto flex items-center gap-5 text-sm">
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
          <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
          <footer className="mx-auto max-w-5xl px-6 py-10">
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
