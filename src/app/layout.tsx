import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartMenu from "@/components/CartMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IronEtch Laser Works | Dark Industrial Luxury",
  description: "High-end laser engraved products on slate and wood. Coasters, Cutting Boards, and Professional Training.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-slate-950 text-slate-50 min-h-screen">
        <Navbar />
        <main className="pt-24 min-h-screen">
          {children}
        </main>
        <CartMenu />
      </body>
    </html>
  );
}
