import type { Metadata, Viewport } from "next";
import { Cinzel, Almendra } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const almendra = Almendra({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#4a1942",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "WizTrack - Wizard Card Game Tracker",
  description: "Track scores, bids, and tricks for Wizard card games with your friends. Multiple players supported with automatic scoring.",
  keywords: ["wizard", "card game", "tracker", "scores", "bidding"],
  authors: [{ name: "WizTrack" }],
  openGraph: {
    title: "WizTrack",
    description: "Wizard Card Game Tracker - Track your game scores",
    url: "https://wiztrack.8011704.xyz",
    siteName: "WizTrack",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "WizTrack - Wizard Card Game Tracker",
    description: "Track scores for Wizard card games",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${almendra.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}