import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BringID Validator 8004",
  description: "Verify your EIP-8004 agent's humanity via BringID",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased bg-gray-950 text-gray-100 min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
