import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Architecture Principle: Metadata as the Presentation Layer's entry point
export const metadata: Metadata = {
  title: "ReviewQuest | The Academic Boss Battle",
  description: "Transform your study materials into interactive RPG encounters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/* Engineering Standards Applied:
        1. justify-center/items-center: Locks the 'Home' content to the screen center immediately.
        2. relative/overflow-x-hidden: Prevents modal popups from shifting the layout or creating scrollbars.
        3. selection: Custom brand-colored text selection for that "premium" feel.
      */}
      <body className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}