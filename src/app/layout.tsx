import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CHEMLAB CC — Virtual Chemistry Laboratory | VIT Chennai",
  description:
    "Open-source virtual chemistry laboratory for VIT Chennai BCHY101P Engineering Chemistry (2026–27). Interactive demonstrations, hands-on simulations, observation tables, and automated tolerance grading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
