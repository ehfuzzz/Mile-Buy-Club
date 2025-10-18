import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const THEME_COLOR = "#0f172a";

export const metadata: Metadata = {
  title: {
    default: "Mile Buy Club",
    template: "%s | Mile Buy Club"
  },
  description: "Join the premier hub for monitoring award travel deals and mileage arbitrage.",
  themeColor: THEME_COLOR,
  icons: {
    icon: [
      { url: "/api/pwa-icon/192", sizes: "192x192" },
      { url: "/api/pwa-icon/512", sizes: "512x512" }
    ],
    apple: [{ url: "/api/pwa-icon/apple", sizes: "180x180" }]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content={THEME_COLOR} />
        <link rel="icon" href="/api/pwa-icon/192" sizes="192x192" />
        <link rel="icon" href="/api/pwa-icon/512" sizes="512x512" />
        <link rel="apple-touch-icon" href="/api/pwa-icon/apple" sizes="180x180" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
