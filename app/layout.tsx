import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Tech Lane Challenge | DeboisTech",
  description: "Take the challenge. Discover your tech lane. A DeboisTech experience for GDG Nashik DevFest 2026.",
};

export const viewport: Viewport = { themeColor: "#070b09", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-black">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
