import type { Metadata } from "next";
import { Audiowide } from "next/font/google";
import "./globals.css";

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "高専祭予約システム",
  description: "高専祭の出し物予約システム",
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "高専祭予約",
    "application-name": "高専祭予約",
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${audiowide.variable} font-audiowide antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
