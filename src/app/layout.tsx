import type { Metadata } from "next";
import localFont from "next/font/local";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "MedDamn",
  description: "What you are seeking is seeking you.",
  icons: { icon: "/favicon.svg", }
};

// Load GeistVF (Variable Font)
const geistVF = localFont({
  src: [
    {
      path: "../assets/fonts/GeistVF.woff",
      weight: "100 900", // Variable font range
      style: "normal",
    },
  ],
  variable: "--font-geist", // Create a CSS variable
  display: "swap",
});

// Load GeistMonoVF (Variable Font)
const geistMonoVF = localFont({
  src: [
    {
      path: "../assets/fonts/GeistMonoVF.woff",
      weight: "100 900", // Variable font range
      style: "normal",
    },
  ],
  variable: "--font-geist-mono", // Create a CSS variable
  display: "swap",
});

// Landing page fonts
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistVF.variable} ${geistMonoVF.variable} ${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <main> {children}</main>
        <Toaster />
      </body>
    </html>
  );
}
