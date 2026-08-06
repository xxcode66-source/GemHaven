import type { Metadata } from "next";
import { Providers } from "@/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "GemHaven - Confidential Mining Grid",
  description: "ZINC/ORE style confidential mining on Base with Inco Lightning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-950 text-dark-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}