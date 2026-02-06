import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BringID x 8004 — Verify Your Agent",
  description:
    "Prove there's a real human behind your EIP-8004 agent. Multi-credential. Privacy-preserving. On-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${mono.variable} font-sans antialiased bg-surface text-white min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
