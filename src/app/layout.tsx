import type { Metadata, Viewport } from "next";
import { Cinzel, Almendra } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const almendra = Almendra({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4a1942",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wiztrack.8011704.xyz"),
  title: "WizTrack - Wizard Card Game Tracker",
  description: "Track scores, bids, and tricks for Wizard card games with your friends. Multiple players supported with automatic scoring.",
  keywords: ["wizard", "card game", "tracker", "scores", "bidding", "multiplayer"],
  authors: [{ name: "WizTrack" }],
  creator: "WizTrack",
  publisher: "WizTrack",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "WizTrack - Wizard Card Game Tracker",
    description: "Track scores for Wizard card games",
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
    icon: "/favicon.ico",
    apple: "/icon.svg",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${almendra.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
