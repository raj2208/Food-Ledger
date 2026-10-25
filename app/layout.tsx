import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Ledger",
  description: "Log food once, track calories forever.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">
              Food Ledger
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">
                Log
              </Link>
              <Link href="/foods" className="hover:underline">
                Foods
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
