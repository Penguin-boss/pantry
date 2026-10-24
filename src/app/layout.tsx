import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pantry — Track food, waste less",
  description: "Track what's in your fridge, see what expires next, discover recipes from ingredients you already have, and understand how much food and money you save.",
  openGraph: {
    title: "Pantry — Track food, waste less",
    description: "Track your fridge, discover recipes, and waste less food.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#FFFBF2] text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
