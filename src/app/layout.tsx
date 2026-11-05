import type { Metadata } from "next";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LumenOrbScene } from "@/components/canvas/LumenOrbScene";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumen — Intelligence That Moves With You",
  description:
    "Turn scattered telemetry and unstructured signals into decisions with autonomous AI agent workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-tier="high"
      className="dark"
    >
      <body className="bg-background text-foreground font-sans min-h-screen grain selection:bg-accent/30 selection:text-white">
        <SmoothScrollProvider>
          <LumenOrbScene />
          <main className="relative z-10">{children}</main>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
