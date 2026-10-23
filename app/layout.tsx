import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "মাসের বাজার | আপনার বাজার, আমাদের দায়িত্ব",
  description: "রাজশাহীর অনলাইন গ্রোসারি স্টোর। দৈনন্দিন বাজার, তাজা খাবার ও প্রয়োজনীয় পণ্য এক জায়গায়।",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="antialiased">{children}</body>
    </html>
  );
}
